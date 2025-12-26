import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/stats - Get comprehensive statistics
export async function GET(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user || !['ADMIN', 'OPERATIONS'].includes(user.role)) {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const serviceAreaId = searchParams.get('serviceAreaId');

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());

        // Base filter for service area
        const areaFilter = serviceAreaId ? { serviceAreaId } : {};

        const [
            // General stats
            totalUsers,
            pendingUsers,
            totalProducts,
            lowStockProducts,
            totalOrders,
            todayOrders,
            weekOrders,
            pendingOrders,
            monthlyRevenue,
            todayRevenue,

            // Driver stats
            totalDrivers,
            availableDrivers,
            busyDrivers,

            // Service areas with stats
            serviceAreas,

            // Open tickets
            openTickets,

            // Order status breakdown
            ordersByStatus,
        ] = await Promise.all([
            // Total users
            prisma.user.count({ where: { role: 'USER', ...areaFilter } }),
            // Pending users
            prisma.user.count({ where: { status: 'PENDING' } }),
            // Total products
            prisma.product.count({ where: { isActive: true } }),
            // Low stock products
            prisma.product.count({
                where: {
                    isActive: true,
                    trackStock: true,
                    stock: { lte: prisma.product.fields.lowStockThreshold },
                },
            }),
            // Total orders
            prisma.order.count(),
            // Today's orders
            prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
            // This week's orders
            prisma.order.count({ where: { createdAt: { gte: startOfWeek } } }),
            // Pending orders
            prisma.order.count({ where: { status: 'PENDING' } }),
            // Monthly revenue
            prisma.order.aggregate({
                where: {
                    createdAt: { gte: startOfMonth },
                    status: 'DELIVERED',
                },
                _sum: { total: true },
            }),
            // Today's revenue
            prisma.order.aggregate({
                where: {
                    createdAt: { gte: startOfToday },
                    status: 'DELIVERED',
                },
                _sum: { total: true },
            }),

            // Driver stats
            prisma.user.count({ where: { role: 'DRIVER', status: 'APPROVED' } }),
            prisma.user.count({ where: { role: 'DRIVER', status: 'APPROVED', isAvailable: true } }),
            prisma.user.count({ where: { role: 'DRIVER', status: 'APPROVED', isAvailable: false } }),

            // Service areas with order counts
            prisma.serviceArea.findMany({
                where: { isActive: true },
                include: {
                    _count: {
                        select: { users: true },
                    },
                },
            }),

            // Open tickets
            prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),

            // Orders grouped by status
            prisma.order.groupBy({
                by: ['status'],
                _count: { id: true },
            }),
        ]);

        // Get per-area statistics
        const areaStats = await Promise.all(
            serviceAreas.map(async (area) => {
                const [areaOrders, areaRevenue] = await Promise.all([
                    prisma.order.count({
                        where: {
                            address: {
                                area: area.name,
                            },
                        },
                    }),
                    prisma.order.aggregate({
                        where: {
                            address: {
                                area: area.name,
                            },
                            status: 'DELIVERED',
                        },
                        _sum: { total: true },
                    }),
                ]);

                return {
                    id: area.id,
                    name: area.name,
                    users: area._count.users,
                    orders: areaOrders,
                    revenue: Number(areaRevenue._sum.total || 0),
                };
            })
        );

        // Format order status breakdown
        const statusBreakdown = ordersByStatus.reduce((acc, item) => {
            acc[item.status] = item._count.id;
            return acc;
        }, {} as Record<string, number>);

        return NextResponse.json({
            general: {
                totalUsers,
                pendingUsers,
                totalProducts,
                lowStockProducts,
                totalOrders,
                todayOrders,
                weekOrders,
                pendingOrders,
                monthlyRevenue: Number(monthlyRevenue._sum.total || 0),
                todayRevenue: Number(todayRevenue._sum.total || 0),
                openTickets,
            },
            drivers: {
                total: totalDrivers,
                available: availableDrivers,
                busy: busyDrivers,
            },
            ordersByStatus: statusBreakdown,
            areaStats,
        });
    } catch (error) {
        console.error('Get stats error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب الإحصائيات' },
            { status: 500 }
        );
    }
}
