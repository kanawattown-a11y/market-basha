import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Package, ClipboardList, Truck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function OperationsDashboard() {
    const session = await getSession();

    const [pendingOrders, preparingOrders, readyOrders, lowStockProducts] = await Promise.all([
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.count({ where: { status: 'PREPARING' } }),
        prisma.order.count({ where: { status: 'READY' } }),
        prisma.product.count({ where: { trackStock: true, stock: { lte: prisma.product.fields.lowStockThreshold } } }),
    ]);

    const recentOrders = await prisma.order.findMany({
        where: { status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] } },
        include: {
            customer: { select: { name: true } },
            address: { select: { area: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
    });

    const stats = [
        { label: 'طلبات معلقة', value: pendingOrders, icon: ClipboardList, color: 'bg-yellow-100 text-yellow-700' },
        { label: 'قيد التجهيز', value: preparingOrders, icon: Package, color: 'bg-blue-100 text-blue-700' },
        { label: 'جاهزة للتوصيل', value: readyOrders, icon: Truck, color: 'bg-green-100 text-green-700' },
        { label: 'نفاذ مخزون', value: lowStockProducts, icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-secondary-800">مرحباً {session?.name}</h1>
                <p className="text-gray-500">نظرة عامة على العمليات</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="card p-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-bold text-secondary-800">{stat.value}</p>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="card">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-secondary-800">الطلبات النشطة</h3>
                    <Link href="/operations/orders" className="text-primary text-sm hover:underline">
                        عرض الكل
                    </Link>
                </div>
                <div className="divide-y divide-gray-100">
                    {recentOrders.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            لا توجد طلبات نشطة
                        </div>
                    ) : (
                        recentOrders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/operations/orders/${order.id}`}
                                className="block p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-bold text-secondary-800">#{order.orderNumber}</span>
                                        <span className="text-gray-400 mx-2">•</span>
                                        <span className="text-gray-600">{order.customer.name}</span>
                                    </div>
                                    <span className="text-primary font-bold">{formatCurrency(Number(order.total))}</span>
                                </div>
                                <div className="flex items-center justify-between mt-1 text-sm">
                                    <span className="text-gray-500">{order.address.area}</span>
                                    <span className="text-gray-400">{formatRelativeTime(order.createdAt.toISOString())}</span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
