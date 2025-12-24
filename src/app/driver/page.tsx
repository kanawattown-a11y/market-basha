'use client';

import { useState, useEffect } from 'react';
import { Package, Truck, Clock, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    customer: { name: string; phone: string };
    address: { area: string; fullAddress: string };
    _count: { items: number };
}

export default function DriverOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders?status=READY,OUT_FOR_DELIVERY&forDriver=true');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Poll every 5 seconds
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="spinner mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-secondary-800">الطلبات الجاهزة للتوصيل</h1>
                <p className="text-gray-500">طلبات جاهزة تحتاج توصيل</p>
            </div>

            {orders.length === 0 ? (
                <div className="card p-12 text-center">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">لا توجد طلبات جاهزة حالياً</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/driver/orders/${order.id}`}
                            className="card p-4 block hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <span className="font-bold text-secondary-800 text-lg">#{order.orderNumber}</span>
                                    <span className={`badge mr-2 ${order.status === 'OUT_FOR_DELIVERY'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-green-100 text-green-700'
                                        }`}>
                                        {order.status === 'OUT_FOR_DELIVERY' ? 'في الطريق' : 'جاهز'}
                                    </span>
                                </div>
                                <span className="text-lg font-bold text-primary">
                                    {formatCurrency(Number(order.total))}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Truck className="w-4 h-4 text-gray-400" />
                                    <span>{order.customer.name}</span>
                                    <a
                                        href={`tel:${order.customer.phone}`}
                                        className="text-primary hover:underline flex items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Phone className="w-3 h-3" />
                                        {order.customer.phone}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span>{order.address.area} - {order.address.fullAddress}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatRelativeTime(order.createdAt)}</span>
                                    <span>•</span>
                                    <span>{order._count.items} منتجات</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
