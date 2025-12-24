'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ChevronLeft,
    Phone,
    MapPin,
    Package,
    User,
    Clock,
    CheckCircle,
    CreditCard,
    Truck
} from 'lucide-react';
import { formatCurrency, formatDateTime, translateOrderStatus, getOrderStatusColor } from '@/lib/utils';

interface OrderDetail {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    paymentMethod: string;
    notes: string | null;
    createdAt: string;
    confirmedAt: string | null;
    deliveredAt: string | null;
    address: { fullAddress: string; area: string; building: string | null };
    driver: { name: string; phone: string } | null;
    items: { id: string; quantity: number; price: number; product: { name: string; image: string | null } }[];
}

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
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

        // Poll for updates
        const interval = setInterval(fetchOrder, 30000);
        return () => clearInterval(interval);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">الطلب غير موجود</p>
                    <Link href="/account/orders" className="btn btn-primary mt-4">
                        العودة لطلباتي
                    </Link>
                </div>
            </div>
        );
    }

    const statusSteps = [
        { key: 'PENDING', label: 'تم الاستلام', icon: Clock },
        { key: 'CONFIRMED', label: 'تم التأكيد', icon: CheckCircle },
        { key: 'PREPARING', label: 'قيد التجهيز', icon: Package },
        { key: 'READY', label: 'جاهز للتوصيل', icon: Package },
        { key: 'OUT_FOR_DELIVERY', label: 'في الطريق', icon: Truck },
        { key: 'DELIVERED', label: 'تم التوصيل', icon: CheckCircle },
    ];

    const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 max-w-2xl">
                    <div className="flex items-center gap-4">
                        <Link href="/account/orders" className="text-gray-400 hover:text-gray-600">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-secondary-800">تتبع الطلب #{order.orderNumber}</h1>
                            <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
                {/* Status */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-secondary-800">حالة الطلب</h3>
                        <span className={`badge ${getOrderStatusColor(order.status)}`}>
                            {translateOrderStatus(order.status)}
                        </span>
                    </div>

                    {order.status !== 'CANCELLED' && (
                        <div className="relative">
                            <div className="absolute top-4 right-4 h-[calc(100%-32px)] w-0.5 bg-gray-200"></div>
                            <div className="space-y-6">
                                {statusSteps.slice(0, order.status === 'DELIVERED' ? 6 : 5).map((step, index) => {
                                    const isCompleted = index <= currentStepIndex;
                                    const isCurrent = index === currentStepIndex;
                                    return (
                                        <div key={step.key} className="relative flex items-center gap-4 pr-4">
                                            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-primary text-secondary' : 'bg-gray-200 text-gray-400'
                                                } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                                                <step.icon className="w-4 h-4" />
                                            </div>
                                            <span className={isCompleted ? 'font-medium text-secondary-800' : 'text-gray-400'}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Driver */}
                {order.driver && (
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

                {/* Address */}
                <div className="card p-4">
                    <h3 className="font-bold text-secondary-800 mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        عنوان التوصيل
                    </h3>
                    <p className="text-gray-700">{order.address.fullAddress}</p>
                    <p className="text-sm text-gray-500">{order.address.area}</p>
                </div>

                {/* Items */}
                <div className="card p-4">
                    <h3 className="font-bold text-secondary-800 mb-3">المنتجات ({order.items.length})</h3>
                    <div className="space-y-3">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
                                    {item.product.image ? (
                                        <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-6 h-6 text-gray-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-secondary-800 text-sm">{item.product.name}</p>
                                    <p className="text-xs text-gray-500">{item.quantity} × {formatCurrency(Number(item.price))}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <hr className="my-4" />

                    <div className="flex justify-between items-center font-bold">
                        <span>الإجمالي</span>
                        <span className="text-primary text-lg">{formatCurrency(Number(order.total))}</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
