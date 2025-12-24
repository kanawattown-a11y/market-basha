'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
    ChevronLeft,
    Phone,
    MapPin,
    Package,
    User,
    Truck,
    CheckCircle,
    XCircle,
    UserPlus
} from 'lucide-react';
import { formatCurrency, formatDateTime, translateOrderStatus, getOrderStatusColor } from '@/lib/utils';
import DriverAssignmentModal from '@/components/admin/DriverAssignmentModal';

interface OrderDetail {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    notes: string | null;
    createdAt: string;
    customer: { name: string; phone: string };
    address: { fullAddress: string; area: string; building: string | null; floor: string | null; notes: string | null };
    driver: { id: string; name: string; phone: string } | null;
    items: { id: string; quantity: number; price: number; product: { name: string; image: string | null } }[];
}

export default function OperationsOrderDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [driverModalOpen, setDriverModalOpen] = useState(false);

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
            await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            fetchOrder();
        } catch (error) {
            console.error('Error updating order:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleAssignDriver = async (driverId: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ driverId }),
            });

            if (res.ok) {
                fetchOrder();
            }
        } catch (error) {
            console.error('Error assigning driver:', error);
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
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/operations/orders" className="text-gray-400 hover:text-gray-600">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-secondary-800">#{order.orderNumber}</h1>
                        <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
                    </div>
                </div>
                <span className={`badge text-lg px-4 py-2 ${getOrderStatusColor(order.status)}`}>
                    {translateOrderStatus(order.status)}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="card p-6">
                        <h3 className="font-bold text-secondary-800 mb-4">المنتجات ({order.items.length})</h3>
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
                                        {item.product.image ? (
                                            <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-8 h-8 text-gray-300" />
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
                                <span className="text-gray-500">المجموع الفرعي</span>
                                <span>{formatCurrency(Number(order.subtotal))}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">رسوم التوصيل</span>
                                <span>{formatCurrency(Number(order.deliveryFee))}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>الخصم</span>
                                    <span>-{formatCurrency(Number(order.discount))}</span>
                                </div>
                            )}
                            <hr className="my-2" />
                            <div className="flex justify-between text-lg font-bold">
                                <span>الإجمالي</span>
                                <span className="text-primary">{formatCurrency(Number(order.total))}</span>
                            </div>
                        </div>
                    </div>

                    {order.notes && (
                        <div className="card p-4 bg-yellow-50 border-yellow-200">
                            <p className="text-sm font-medium text-yellow-800">ملاحظات العميل:</p>
                            <p className="text-yellow-700">{order.notes}</p>
                        </div>
                    )}

                    {/* Driver - Moved here or can check below */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-secondary-800 flex items-center gap-2">
                                <Truck className="w-5 h-5" />
                                السائق
                            </h3>
                            <button
                                onClick={() => setDriverModalOpen(true)}
                                className="text-sm text-primary hover:underline font-medium"
                            >
                                {order.driver ? 'تغيير السائق' : 'تعيين سائق'}
                            </button>
                        </div>

                        {order.driver ? (
                            <div>
                                <p className="font-medium text-secondary-800">{order.driver.name}</p>
                                <a href={`tel:${order.driver.phone}`} className="text-primary hover:underline text-sm flex items-center gap-1 mt-1">
                                    <Phone className="w-4 h-4" />
                                    {order.driver.phone}
                                </a>
                            </div>
                        ) : (
                            <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500 text-sm mb-2">لم يتم تعيين سائق بعد</p>
                                <button
                                    onClick={() => setDriverModalOpen(true)}
                                    className="btn btn-primary btn-sm"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    تعيين سائق الآن
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Customer */}
                    <div className="card p-6">
                        <h3 className="font-bold text-secondary-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            العميل
                        </h3>
                        <p className="font-medium text-secondary-800">{order.customer.name}</p>
                        <a href={`tel:${order.customer.phone}`} className="text-primary hover:underline text-sm flex items-center gap-1 mt-1">
                            <Phone className="w-4 h-4" />
                            {order.customer.phone}
                        </a>
                    </div>

                    {/* Address */}
                    <div className="card p-6">
                        <h3 className="font-bold text-secondary-800 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            عنوان التوصيل
                        </h3>
                        <p className="text-gray-700">{order.address.fullAddress}</p>
                        <p className="text-sm text-gray-500 mt-1">{order.address.area}</p>
                        {order.address.building && <p className="text-sm text-gray-500">بناء: {order.address.building}</p>}
                        {order.address.floor && <p className="text-sm text-gray-500">طابق: {order.address.floor}</p>}
                        {order.address.notes && <p className="text-sm text-primary mt-2">ملاحظة: {order.address.notes}</p>}
                    </div>

                    {/* Actions */}
                    <div className="card p-6 space-y-3">
                        <h3 className="font-bold text-secondary-800 mb-4">الإجراءات</h3>

                        {order.status === 'PENDING' && (
                            <>
                                <button
                                    onClick={() => updateStatus('CONFIRMED')}
                                    disabled={updating}
                                    className="btn btn-primary w-full"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    تأكيد الطلب
                                </button>
                                <button
                                    onClick={() => updateStatus('CANCELLED')}
                                    disabled={updating}
                                    className="btn btn-outline text-red-500 border-red-300 hover:bg-red-50 w-full"
                                >
                                    <XCircle className="w-5 h-5" />
                                    إلغاء الطلب
                                </button>
                            </>
                        )}

                        {order.status === 'CONFIRMED' && (
                            <button
                                onClick={() => updateStatus('PREPARING')}
                                disabled={updating}
                                className="btn btn-primary w-full"
                            >
                                <Package className="w-5 h-5" />
                                بدء التجهيز
                            </button>
                        )}

                        {order.status === 'PREPARING' && (
                            <button
                                onClick={() => updateStatus('READY')}
                                disabled={updating}
                                className="btn btn-primary w-full"
                            >
                                <Truck className="w-5 h-5" />
                                جاهز للتوصيل
                            </button>
                        )}

                        {order.status === 'READY' && (
                            <button
                                onClick={() => updateStatus('OUT_FOR_DELIVERY')}
                                disabled={updating || !order.driver}
                                className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                title={!order.driver ? 'يجب تعيين سائق أولاً' : ''}
                            >
                                <Truck className="w-5 h-5" />
                                بدء التوصيل
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <DriverAssignmentModal
                isOpen={driverModalOpen}
                onClose={() => setDriverModalOpen(false)}
                onAssign={handleAssignDriver}
                currentDriverId={order.driver?.id}
                orderId={order.id}
            />
        </div>
    );
}
