'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, MapPin, Package } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface Order {
    id: string;
    orderNumber: string;
    total: number;
    deliveredAt: string;
    customer: { name: string };
    address: { area: string };
}

export default function DriverCompletedOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders?status=DELIVERED&myDeliveries=true');
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
        fetchOrders();
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
                <h1 className="text-2xl font-bold text-secondary-800">الطلبات المكتملة</h1>
                <p className="text-gray-500">سجل التوصيلات التي أكملتها</p>
            </div>

            {orders.length === 0 ? (
                <div className="card p-12 text-center">
                    <CheckCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">لا توجد طلبات مكتملة بعد</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/driver/orders/${order.id}`}
                            className="card p-4 block hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-secondary-800">#{order.orderNumber}</span>
                                        <p className="text-sm text-gray-500">{order.customer.name} • {order.address.area}</p>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <span className="font-bold text-primary block">
                                        {formatCurrency(Number(order.total))}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {order.deliveredAt ? formatDateTime(order.deliveredAt) : ''}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
