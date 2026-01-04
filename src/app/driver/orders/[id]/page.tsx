'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    ChevronLeft,
    Phone,
    MapPin,
    Package,
    Clock,
    CheckCircle,
    Truck
} from 'lucide-react';
import { formatCurrency, formatDateTime, translateOrderStatus, getOrderStatusColor } from '@/lib/utils';

interface OrderDetail {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    deliveryFee: number;
    notes: string | null;
    createdAt: string;
    customer: { name: string; phone: string };
    address: { fullAddress: string; area: string; building: string | null; floor: string | null; notes: string | null };
    items: { id: string; quantity: number; price: number; product: { name: string } }[];
}

export default function DriverOrderDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchOrder = async () => {
        if (!id) return;
        try {
            const res = await fetch(`/api/orders/${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data.order);
            }
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
        const interval = setInterval(fetchOrder, 5000);
        return () => clearInterval(interval);
    }, [id]);

    const updateStatus = async (status: string) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                fetchOrder();
            }
        } catch (error) {
            console.error('Error updating order:', error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="spinner mx-auto"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">الطلب غير موجود</p>
                <Link href="/driver" className="btn btn-primary mt-4">
                    العودة
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Link href="/driver" className="text-gray-400 hover:text-gray-600">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-secondary-800">#{order.orderNumber}</h1>
                    <span className={`badge text-xs ${getOrderStatusColor(order.status)}`}>
                        {translateOrderStatus(order.status)}
                    </span>
                </div>
            </div>

            {/* Customer Info */}
            <div className="card p-4">
                <h3 className="font-bold text-secondary-800 mb-3">معلومات العميل</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">{order.customer.name}</span>
                        <a href={`tel:${order.customer.phone}`} className="btn btn-primary btn-sm">
                            <Phone className="w-4 h-4" />
                            اتصال
                        </a>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                        <MapPin className="w-5 h-5 shrink-0 text-primary mt-0.5" />
                        <div>
                            <p>{order.address.fullAddress}</p>
                            <p className="text-sm text-gray-400">{order.address.area}</p>
                            {order.address.building && <p className="text-sm">بناء: {order.address.building}</p>}
                            {order.address.floor && <p className="text-sm">طابق: {order.address.floor}</p>}
                            {order.address.notes && (
                                <p className="text-sm text-primary mt-1">ملاحظة: {order.address.notes}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="card p-4">
                <h3 className="font-bold text-secondary-800 mb-3">المنتجات ({order.items?.length || 0})</h3>
                <div className="space-y-2">
                    {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                                <p className="font-medium text-secondary-800">{item.product.name}</p>
                                <p className="text-sm text-gray-400">{item.quantity} × {formatCurrency(Number(item.price))}</p>
                            </div>
                            <span className="font-bold text-primary">
                                {formatCurrency(Number(item.price) * item.quantity)}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <span className="font-bold text-gray-600">الإجمالي</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(Number(order.total))}</span>
                </div>
            </div>

            {/* Notes */}
            {order.notes && (
                <div className="card p-4 bg-yellow-50 border-yellow-200">
                    <p className="text-sm font-medium text-yellow-800">ملاحظات العميل:</p>
                    <p className="text-yellow-700">{order.notes}</p>
                </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
                {order.status === 'OUT_FOR_DELIVERY' && (
                    <button
                        onClick={() => updateStatus('DELIVERED')}
                        disabled={updating}
                        className="btn btn-primary w-full btn-lg"
                    >
                        {updating ? (
                            <div className="spinner"></div>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                تم توصيل الطلب
                            </>
                        )}
                    </button>
                )}

                {order.status === 'READY' && (
                    <button
                        onClick={() => updateStatus('OUT_FOR_DELIVERY')}
                        disabled={updating}
                        className="btn btn-primary w-full btn-lg"
                    >
                        {updating ? (
                            <div className="spinner"></div>
                        ) : (
                            <>
                                <Truck className="w-5 h-5" />
                                بدء التوصيل
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
