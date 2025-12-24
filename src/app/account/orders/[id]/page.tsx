'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ChevronLeft,
    Package,
    Clock,
    CheckCircle,
    Truck,
    MapPin,
    Phone
} from 'lucide-react';
import { formatCurrency, formatDateTime, translateOrderStatus, getOrderStatusColor } from '@/lib/utils';

interface OrderDetail {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    deliveryFee: number;
    createdAt: string;
    deliveredAt: string | null;
    address: { fullAddress: string; area: string };
    driver: { name: string; phone: string } | null;
    items: { id: string; quantity: number; price: number; product: { name: string; image: string | null } }[];
}

export default function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
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
        fetchOrder();
    }, [id]);

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
                <Link href="/account/orders" className="btn btn-primary mt-4">
                    العودة لطلباتي
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/account/orders" className="text-gray-400 hover:text-gray-600">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-secondary-800">طلب #{order.orderNumber}</h1>
                    <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
                </div>
            </div>

            {/* Status */}
            <div className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {order.status === 'DELIVERED' ? (
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : order.status === 'OUT_FOR_DELIVERY' ? (
                        <Truck className="w-8 h-8 text-blue-500" />
                    ) : (
                        <Clock className="w-8 h-8 text-yellow-500" />
                    )}
                    <div>
                        <span className={`badge ${getOrderStatusColor(order.status)}`}>
                            {translateOrderStatus(order.status)}
                        </span>
                        {order.deliveredAt && (
                            <p className="text-xs text-gray-400 mt-1">تم التوصيل: {formatDateTime(order.deliveredAt)}</p>
                        )}
                    </div>
                </div>
                {['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(order.status) && (
                    <Link href={`/orders/${order.id}`} className="btn btn-primary btn-sm">
                        تتبع الطلب
                    </Link>
                )}
            </div>

            {/* Driver */}
            {order.driver && order.status === 'OUT_FOR_DELIVERY' && (
                <div className="card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Truck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-secondary-800">{order.driver.name}</p>
                            <p className="text-sm text-gray-500">السائق</p>
                        </div>
                    </div>
                    <a href={`tel:${order.driver.phone}`} className="btn btn-primary btn-sm">
                        <Phone className="w-4 h-4" />
                        اتصال
                    </a>
                </div>
            )}

            {/* Items */}
            <div className="card p-4">
                <h3 className="font-bold text-secondary-800 mb-4">المنتجات</h3>
                <div className="space-y-3">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
                                {item.product.image ? (
                                    <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-6 h-6 text-gray-300" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-secondary-800">{item.product.name}</p>
                                <p className="text-sm text-gray-500">{item.quantity} × {formatCurrency(Number(item.price))}</p>
                            </div>
                            <span className="font-bold text-primary">{formatCurrency(Number(item.price) * item.quantity)}</span>
                        </div>
                    ))}
                </div>

                <hr className="my-4" />

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">التوصيل</span>
                        <span>{formatCurrency(Number(order.deliveryFee))}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>الإجمالي</span>
                        <span className="text-primary">{formatCurrency(Number(order.total))}</span>
                    </div>
                </div>
            </div>

            {/* Address */}
            <div className="card p-4">
                <h3 className="font-bold text-secondary-800 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    عنوان التوصيل
                </h3>
                <p className="text-gray-700">{order.address.fullAddress}</p>
                <p className="text-sm text-gray-500">{order.address.area}</p>
            </div>
        </div>
    );
}
