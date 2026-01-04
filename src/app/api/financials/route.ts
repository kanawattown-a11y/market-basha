import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/financials - Get comprehensive financial statistics
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
        const period = searchParams.get('period') || 'month'; // day, week, month, year

        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - now.getDay());
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'month':
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
        }

        // Get all delivered orders in period with full details
        const orders = await prisma.order.findMany({
            where: {
                status: 'DELIVERED',
                deliveredAt: { gte: startDate },
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                costPrice: true,
                                price: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        // Calculate financial metrics
        let totalRevenue = 0;
        let totalProductCost = 0;
        let totalDeliveryRevenue = 0;
        let totalDriverDeliveryCost = 0;
        let productCount = 0;

        const productStats: Record<string, {
            name: string;
            quantity: number;
            revenue: number;
            cost: number;
            profit: number;
        }> = {};

        for (const order of orders) {
            // Product calculations
            for (const item of order.items) {
                const itemRevenue = Number(item.total);
                const itemCost = Number(item.product.costPrice || 0) * item.quantity;

                totalRevenue += itemRevenue;
                totalProductCost += itemCost;
                productCount += item.quantity;

                // Per-product statistics
                const productId = item.productId;
                if (!productStats[productId]) {
                    productStats[productId] = {
                        name: item.product.name,
                        quantity: 0,
                        revenue: 0,
                        cost: 0,
                        profit: 0,
                    };
                }
                productStats[productId].quantity += item.quantity;
                productStats[productId].revenue += itemRevenue;
                productStats[productId].cost += itemCost;
                productStats[productId].profit += (itemRevenue - itemCost);
            }

            // Delivery calculations
            totalDeliveryRevenue += Number(order.deliveryFee);
            totalDriverDeliveryCost += Number(order.driverDeliveryCost || 0);
        }

        // Calculate profits
        const productProfit = totalRevenue - totalProductCost;
        const deliveryProfit = totalDeliveryRevenue - totalDriverDeliveryCost;
        const grossProfit = productProfit + deliveryProfit;

        // Calculate margins
        const productMargin = totalRevenue > 0 ? (productProfit / totalRevenue) * 100 : 0;
        const deliveryMargin = totalDeliveryRevenue > 0 ? (deliveryProfit / totalDeliveryRevenue) * 100 : 0;
        const overallMargin = (totalRevenue + totalDeliveryRevenue) > 0
            ? (grossProfit / (totalRevenue + totalDeliveryRevenue)) * 100
            : 0;

        // Top products by profit
        const topProductsByProfit = Object.values(productStats)
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 10);

        return NextResponse.json({
            period,
            summary: {
                totalOrders: orders.length,
                totalProductsSold: productCount,

                // Product financials
                productRevenue: totalRevenue,
                productCost: totalProductCost,
                productProfit,
                productMargin,

                // Delivery financials
                deliveryRevenue: totalDeliveryRevenue,
                driverCost: totalDriverDeliveryCost,
                deliveryProfit,
                deliveryMargin,

                // Overall
                grossProfit,
                overallMargin,
                totalRevenue: totalRevenue + totalDeliveryRevenue,
            },
            topProducts: topProductsByProfit,
        });
    } catch (error) {
        console.error('Get financials error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب البيانات المالية' },
            { status: 500 }
        );
    }
}
