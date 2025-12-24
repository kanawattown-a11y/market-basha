'use client';

import { useState, useEffect } from 'react';
import { Truck, Clock, MapPin, Phone, Package } from 'lucide-react';
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
}

export default function DriverActiveOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders?status=OUT_FOR_DELIVERY&myDeliveries=true');
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
                <h1 className="text-2xl font-bold text-secondary-800">التوصيلات النشطة</h1>
                <p className="text-gray-500">الطلبات التي تقوم بتوصيلها حالياً</p>
            </div>

            {orders.length === 0 ? (
                <div className="card p-12 text-center">
                    <Truck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">لا توجد توصيلات نشطة</p>
                    <Link href="/driver" className="btn btn-primary mt-4">
                        عرض الطلبات الجاهزة
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/driver/orders/${order.id}`}
                            className="card p-4 block hover:shadow-lg transition-shadow border-r-4 border-blue-500"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <span className="font-bold text-secondary-800 text-lg">#{order.orderNumber}</span>
                                    <span className="badge mr-2 bg-blue-100 text-blue-700">في الطريق</span>
                                </div>
                                <span className="text-lg font-bold text-primary">
                                    {formatCurrency(Number(order.total))}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Truck className="w-4 h-4 text-gray-400" />
                                    <span>{order.customer.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span>{order.address.area} - {order.address.fullAddress}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
