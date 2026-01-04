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
            weeklyRevenue,

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

            // Top selling products
            topProducts,
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
                _sum: { total: true, subtotal: true, deliveryFee: true },
            }),
            // Today's revenue
            prisma.order.aggregate({
                where: {
                    createdAt: { gte: startOfToday },
                    status: 'DELIVERED',
                },
                _sum: { total: true, subtotal: true, deliveryFee: true },
            }),
            // Weekly revenue
            prisma.order.aggregate({
                where: {
                    createdAt: { gte: startOfWeek },
                    status: 'DELIVERED',
                },
                _sum: { total: true, subtotal: true, deliveryFee: true },
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

            // Top selling products (by quantity sold)
            prisma.orderItem.groupBy({
                by: ['productId'],
                where: {
                    order: {
                        status: 'DELIVERED',
                    },
                },
                _sum: {
                    quantity: true,
                    total: true,
                },
                orderBy: {
                    _sum: {
                        total: 'desc',
                    },
                },
                take: 10,
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

        // Get product details for top selling products
        const productIds = topProducts.map(p => p.productId);
        const productDetails = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, image: true, price: true },
        });

        const topSellingProducts = topProducts.map(p => {
            const product = productDetails.find(pd => pd.id === p.productId);
            return {
                id: p.productId,
                name: product?.name || 'منتج محذوف',
                image: product?.image || null,
                price: Number(product?.price || 0),
                quantitySold: p._sum.quantity || 0,
                totalRevenue: Number(p._sum.total || 0),
            };
        });

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
                // Revenue breakdown
                monthlyRevenue: Number(monthlyRevenue._sum.total || 0),
                monthlyProductRevenue: Number(monthlyRevenue._sum.subtotal || 0),
                monthlyDeliveryRevenue: Number(monthlyRevenue._sum.deliveryFee || 0),
                weeklyRevenue: Number(weeklyRevenue._sum.total || 0),
                weeklyProductRevenue: Number(weeklyRevenue._sum.subtotal || 0),
                weeklyDeliveryRevenue: Number(weeklyRevenue._sum.deliveryFee || 0),
                todayRevenue: Number(todayRevenue._sum.total || 0),
                todayProductRevenue: Number(todayRevenue._sum.subtotal || 0),
                todayDeliveryRevenue: Number(todayRevenue._sum.deliveryFee || 0),
                openTickets,
            },
            drivers: {
                total: totalDrivers,
                available: availableDrivers,
                busy: busyDrivers,
            },
            ordersByStatus: statusBreakdown,
            areaStats,
            topSellingProducts,
        });
    } catch (error) {
        console.error('Get stats error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب الإحصائيات' },
            { status: 500 }
        );
    }
}
