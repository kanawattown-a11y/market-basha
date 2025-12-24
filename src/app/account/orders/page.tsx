import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { formatCurrency, formatDateTime, translateOrderStatus, getOrderStatusColor } from '@/lib/utils';
import { ShoppingBag, Eye } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const orders = await prisma.order.findMany({
        where: { customerId: session.id },
        include: {
            items: {
                include: {
                    product: { select: { name: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-secondary-800">طلباتي</h1>

            {orders.length === 0 ? (
                <div className="card p-12 text-center">
                    <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">لم تقم بأي طلبات بعد</p>
                    <Link href="/products" className="btn btn-primary">
                        تصفح المنتجات
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="card">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-secondary-800">#{order.orderNumber}</p>
                                    <p className="text-sm text-gray-500">{formatDateTime(order.createdAt.toISOString())}</p>
                                </div>
                                <span className={`badge ${getOrderStatusColor(order.status)}`}>
                                    {translateOrderStatus(order.status)}
                                </span>
                            </div>

                            <div className="p-4">
                                <div className="text-sm text-gray-600 mb-3">
                                    {order.items.slice(0, 3).map((item, index) => (
                                        <span key={item.id}>
                                            {item.product.name} ({item.quantity})
                                            {index < Math.min(order.items.length, 3) - 1 && '، '}
                                        </span>
                                    ))}
                                    {order.items.length > 3 && (
                                        <span className="text-gray-400"> و{order.items.length - 3} منتجات أخرى</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="font-bold text-primary text-lg">
                                        {formatCurrency(Number(order.total))}
                                    </p>
                                    <Link href={`/orders/${order.id}`} className="btn btn-outline btn-sm">
                                        <Eye className="w-4 h-4" />
                                        تتبع الطلب
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
