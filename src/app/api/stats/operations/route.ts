import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/stats/operations - Get operations statistics
export async function GET(request: NextRequest) {
    try {
        const user = await getSession();

        if (!user || !['ADMIN', 'OPERATIONS'].includes(user.role)) {
            return NextResponse.json(
                { message: 'غير مصرح لك بهذا الإجراء' },
                { status: 403 }
            );
        }

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [
            pendingOrders,
            preparingOrders,
            outForDeliveryOrders,
            lowStockProducts,
            todayOrders,
            todayRevenueResult,
        ] = await Promise.all([
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.count({ where: { status: { in: ['CONFIRMED', 'PREPARING', 'READY'] } } }),
            prisma.order.count({ where: { status: 'OUT_FOR_DELIVERY' } }),
            prisma.product.count({
                where: {
                    isActive: true,
                    trackStock: true,
                    stock: { lte: 10 }, // Default threshold
                },
            }),
            prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
            prisma.order.aggregate({
                where: {
                    createdAt: { gte: startOfToday },
                    status: 'DELIVERED',
                },
                _sum: { total: true },
            }),
        ]);

        return NextResponse.json({
            stats: {
                pendingOrders,
                preparingOrders,
                outForDeliveryOrders,
                lowStockProducts,
                todayOrders,
                todayRevenue: Number(todayRevenueResult._sum.total || 0),
            },
        });
    } catch (error) {
        console.error('Get operations stats error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب الإحصائيات' },
            { status: 500 }
        );
    }
}
