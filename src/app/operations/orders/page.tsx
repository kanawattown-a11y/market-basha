'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Eye,
    Truck,
    User,
    ChevronRight,
    ChevronLeft,
    RefreshCw
} from 'lucide-react';
import { formatCurrency, formatRelativeTime, translateOrderStatus, getOrderStatusColor } from '@/lib/utils';

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    customer: { name: string; phone: string };
    driver: { name: string } | null;
    address: { area: string };
}

export default function OperationsOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(statusFilter && { status: statusFilter }),
            });

            const res = await fetch(`/api/orders?${params}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders);
                setTotalPages(data.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, [page, statusFilter]);

    const updateOrderStatus = async (orderId: string, status: string) => {
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-800">إدارة الطلبات</h1>
                    <p className="text-gray-500">معالجة وتجهيز الطلبات</p>
                </div>
                <button onClick={fetchOrders} className="btn btn-outline btn-sm" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    تحديث
                </button>
            </div>

            <div className="card p-4">
                <div className="flex flex-wrap gap-2">
                    {['', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setPage(1); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                                    ? 'bg-primary text-secondary'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status ? translateOrderStatus(status) : 'الكل'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="spinner mx-auto"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="card p-12 text-center text-gray-500">
                    لا توجد طلبات
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="card p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-bold text-secondary-800 text-lg">#{order.orderNumber}</span>
                                        <span className={`badge ${getOrderStatusColor(order.status)}`}>
                                            {translateOrderStatus(order.status)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">العميل: </span>
                                            <span className="text-secondary-800">{order.customer.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">المنطقة: </span>
                                            <span className="text-secondary-800">{order.address.area}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">الإجمالي: </span>
                                            <span className="text-primary font-bold">{formatCurrency(Number(order.total))}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">{formatRelativeTime(order.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {order.status === 'PENDING' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                                            className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
                                        >
                                            تأكيد
                                        </button>
                                    )}
                                    {order.status === 'CONFIRMED' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                                            className="btn btn-sm bg-orange-500 text-white hover:bg-orange-600"
                                        >
                                            بدء التجهيز
                                        </button>
                                    )}
                                    {order.status === 'PREPARING' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'READY')}
                                            className="btn btn-sm bg-cyan-500 text-white hover:bg-cyan-600"
                                        >
                                            جاهز
                                        </button>
                                    )}
                                    <Link href={`/operations/orders/${order.id}`} className="btn btn-outline btn-sm">
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn btn-sm bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            <span className="px-4 text-sm text-gray-500">{page} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="btn btn-sm bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
