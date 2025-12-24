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
    Printer
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
    customer: { id: string; name: string; phone: string; email: string | null };
    address: { fullAddress: string; area: string; building: string | null; floor: string | null; notes: string | null };
    driver: { id: string; name: string; phone: string } | null;
    items: { id: string; quantity: number; price: number; product: { name: string; image: string | null; sku: string } }[];
}

export default function AdminOrderDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);

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

    const fetchDrivers = async () => {
        try {
            const res = await fetch('/api/users?role=DRIVER&status=APPROVED');
            if (res.ok) {
                const data = await res.json();
                setDrivers(data.users);
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    useEffect(() => {
        fetchOrder();
        fetchDrivers();
    }, [id]);

    const updateOrder = async (data: { status?: string; driverId?: string }) => {
        setUpdating(true);
        try {
            await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            fetchOrder();
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
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="text-gray-400 hover:text-gray-600">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-secondary-800">#{order.orderNumber}</h1>
                        <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`badge text-lg px-4 py-2 ${getOrderStatusColor(order.status)}`}>
                        {translateOrderStatus(order.status)}
                    </span>
                    <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
                        <Printer className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="card p-6">
                        <h3 className="font-bold text-secondary-800 mb-4">المنتجات</h3>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>المنتج</th>
                                        <th>SKU</th>
                                        <th>الكمية</th>
                                        <th>السعر</th>
                                        <th>الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
                                                        {item.product.image ? (
                                                            <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="w-5 h-5 text-gray-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {item.product.name}
                                                </div>
                                            </td>
                                            <td className="font-mono text-sm text-gray-500">{item.product.sku}</td>
                                            <td>{item.quantity}</td>
                                            <td>{formatCurrency(Number(item.price))}</td>
                                            <td className="font-bold">{formatCurrency(Number(item.price) * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 pt-4 border-t space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">المجموع الفرعي</span>
                                <span>{formatCurrency(Number(order.subtotal))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">التوصيل</span>
                                <span>{formatCurrency(Number(order.deliveryFee))}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>الخصم</span>
                                    <span>-{formatCurrency(Number(order.discount))}</span>
                                </div>
                            )}
                            <hr />
                            <div className="flex justify-between font-bold text-lg">
                                <span>الإجمالي</span>
                                <span className="text-primary">{formatCurrency(Number(order.total))}</span>
                            </div>
                        </div>
                    </div>

                    {order.notes && (
                        <div className="card p-4 bg-yellow-50 border-yellow-200">
                            <p className="text-sm font-medium text-yellow-800">ملاحظات:</p>
                            <p className="text-yellow-700">{order.notes}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Customer */}
                    <div className="card p-6">
                        <h3 className="font-bold text-secondary-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            العميل
                        </h3>
                        <p className="font-medium">{order.customer.name}</p>
                        <a href={`tel:${order.customer.phone}`} className="text-primary text-sm flex items-center gap-1 mt-1">
                            <Phone className="w-4 h-4" />
                            {order.customer.phone}
                        </a>
                    </div>

                    {/* Address */}
                    <div className="card p-6">
                        <h3 className="font-bold text-secondary-800 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            العنوان
                        </h3>
                        <p className="text-gray-700">{order.address.fullAddress}</p>
                        <p className="text-sm text-gray-500">{order.address.area}</p>
                    </div>

                    {/* Driver */}
                    <div className="card p-6">
                        <h3 className="font-bold text-secondary-800 mb-4 flex items-center gap-2">
                            <Truck className="w-5 h-5" />
                            السائق
                        </h3>
                        <select
                            value={order.driver?.id || ''}
                            onChange={(e) => updateOrder({ driverId: e.target.value })}
                            className="input"
                            disabled={updating}
                        >
                            <option value="">اختر سائق</option>
                            {drivers.map((driver) => (
                                <option key={driver.id} value={driver.id}>{driver.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="card p-6 space-y-3">
                        <h3 className="font-bold text-secondary-800 mb-4">تغيير الحالة</h3>
                        <select
                            value={order.status}
                            onChange={(e) => updateOrder({ status: e.target.value })}
                            className="input"
                            disabled={updating}
                        >
                            <option value="PENDING">معلق</option>
                            <option value="CONFIRMED">مؤكد</option>
                            <option value="PREPARING">قيد التجهيز</option>
                            <option value="READY">جاهز</option>
                            <option value="OUT_FOR_DELIVERY">في الطريق</option>
                            <option value="DELIVERED">تم التوصيل</option>
                            <option value="CANCELLED">ملغي</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
