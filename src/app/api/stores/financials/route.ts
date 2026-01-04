import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/stores/financials - Get financial reports for all stores/categories
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
        const categoryId = searchParams.get('categoryId'); // اختياري: تقرير لمتجر واحد فقط

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

        // Get all delivered orders in period
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
                                id: true,
                                name: true,
                                price: true,
                                costPrice: true,
                                categoryId: true,
                                category: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // Group by category and calculate stats
        const categoryStats: Record<string, {
            categoryId: string;
            categoryName: string;
            categoryImage: string | null;
            totalRevenue: number;      // إجمالي المبيعات (للعميل)
            totalCost: number;          // رأس المال (للمتجر)
            totalProfit: number;        // صافي الربح (للتطبيق)
            productsSold: number;       // عدد المنتجات المباعة
            ordersCount: number;        // عدد الطلبات
            profitMargin: number;       // هامش الربح %
        }> = {};

        for (const order of orders) {
            for (const item of order.items) {
                const categoryId = item.product.categoryId;
                const categoryName = item.product.category.name;
                const categoryImage = item.product.category.image;

                if (!categoryStats[categoryId]) {
                    categoryStats[categoryId] = {
                        categoryId,
                        categoryName,
                        categoryImage,
                        totalRevenue: 0,
                        totalCost: 0,
                        totalProfit: 0,
                        productsSold: 0,
                        ordersCount: 0,
                        profitMargin: 0,
                    };
                }

                const itemRevenue = Number(item.total); // سعر البيع × الكمية
                const itemCost = Number(item.product.costPrice || 0) * item.quantity; // رأس المال × الكمية
                const itemProfit = itemRevenue - itemCost; // الربح

                categoryStats[categoryId].totalRevenue += itemRevenue;
                categoryStats[categoryId].totalCost += itemCost;
                categoryStats[categoryId].totalProfit += itemProfit;
                categoryStats[categoryId].productsSold += item.quantity;
            }
        }

        // Count unique orders per category
        const orderCountByCategory: Record<string, Set<string>> = {};
        for (const order of orders) {
            for (const item of order.items) {
                const catId = item.product.categoryId;
                if (!orderCountByCategory[catId]) {
                    orderCountByCategory[catId] = new Set();
                }
                orderCountByCategory[catId].add(order.id);
            }
        }

        // Update orders count and calculate profit margin
        for (const catId in categoryStats) {
            categoryStats[catId].ordersCount = orderCountByCategory[catId]?.size || 0;

            if (categoryStats[catId].totalRevenue > 0) {
                categoryStats[catId].profitMargin =
                    (categoryStats[catId].totalProfit / categoryStats[catId].totalRevenue) * 100;
            }
        }

        // Convert to array and sort by profit (highest first)
        const storesReport = Object.values(categoryStats)
            .sort((a, b) => b.totalProfit - a.totalProfit);

        // Calculate totals
        const totals = storesReport.reduce((acc, store) => ({
            totalRevenue: acc.totalRevenue + store.totalRevenue,
            totalCost: acc.totalCost + store.totalCost,
            totalProfit: acc.totalProfit + store.totalProfit,
            productsSold: acc.productsSold + store.productsSold,
            ordersCount: acc.ordersCount + store.ordersCount,
        }), {
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
            productsSold: 0,
            ordersCount: 0,
        });

        const overallMargin = totals.totalRevenue > 0
            ? (totals.totalProfit / totals.totalRevenue) * 100
            : 0;

        return NextResponse.json({
            period,
            startDate,
            endDate: now,
            stores: storesReport,
            totals: {
                ...totals,
                profitMargin: overallMargin,
            },
        });
    } catch (error) {
        console.error('Get store financials error:', error);
        return NextResponse.json(
            { message: 'حدث خطأ في جلب التقارير المالية' },
            { status: 500 }
        );
    }
}
