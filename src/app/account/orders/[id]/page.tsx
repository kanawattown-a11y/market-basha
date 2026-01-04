'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
    ChevronLeft,
    Package,
    Clock,
    CheckCircle,
    Truck,
    MapPin,
    Phone,
    Star,
    MessageSquare
} from 'lucide-react';
import { formatCurrency, formatDateTime, translateOrderStatus, getOrderStatusColor } from '@/lib/utils';
import ReviewModal from '@/components/ReviewModal';

interface Review {
    id: string;
    productRating: number;
    driverRating: number | null;
    comment: string | null;
    createdAt: string;
}

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
    review?: Review | null;
}

export default function AccountOrderDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);

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

    useEffect(() => {
        if (!id) return;
        fetchOrder();
    }, [id]);

    const handleReviewSuccess = () => {
        setShowReviewModal(false);
        fetchOrder(); // Refresh to show review
    };

    const renderStars = (rating: number) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
            ))}
        </div>
    );

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

            {/* Review Button - Show only for delivered orders without review */}
            {order.status === 'DELIVERED' && !order.review && (
                <button
                    onClick={() => setShowReviewModal(true)}
                    className="card p-4 w-full flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-dashed border-yellow-300 hover:border-yellow-400 transition-colors group"
                >
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Star className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-secondary-800">قيّم طلبك</p>
                        <p className="text-sm text-gray-500">شاركنا رأيك في المنتجات والخدمة</p>
                    </div>
                </button>
            )}

            {/* Existing Review */}
            {order.review && (
                <div className="card p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                    <h3 className="font-bold text-secondary-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        تقييمك لهذا الطلب
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">تقييم المنتجات</span>
                            {renderStars(order.review.productRating)}
                        </div>
                        {order.review.driverRating && (
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">تقييم السائق</span>
                                {renderStars(order.review.driverRating)}
                            </div>
                        )}
                        {order.review.comment && (
                            <div className="bg-white/50 p-3 rounded-lg mt-2">
                                <div className="flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <p className="text-gray-700 text-sm">{order.review.comment}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Driver - Only show during delivery */}
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
                    {order.items?.map((item) => (
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

            {/* Review Modal */}
            {showReviewModal && (
                <ReviewModal
                    orderId={order.id}
                    hasDriver={!!order.driver}
                    onClose={() => setShowReviewModal(false)}
                    onSuccess={handleReviewSuccess}
                />
            )}
        </div>
    );
}
