'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Search,
    Eye,
    Truck,
    User,
    ChevronRight,
    ChevronLeft,
    UserPlus
} from 'lucide-react';
import { formatCurrency, formatDateTime, translateOrderStatus, getOrderStatusColor } from '@/lib/utils';
import DriverAssignmentModal from '@/components/admin/DriverAssignmentModal';

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    customer: { name: string; phone: string };
    driver: { id: string; name: string } | null;
    address: { area: string };
    _count: { items: number };
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');

    // Driver Assignment State
    const [driverModalOpen, setDriverModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(statusFilter && { status: statusFilter }),
                ...(search && { search }),
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
    }, [page, statusFilter, search]);

    const openDriverModal = (order: Order) => {
        setSelectedOrder(order);
        setDriverModalOpen(true);
    };

    const handleAssignDriver = async (driverId: string) => {
        if (!selectedOrder) return;

        try {
            const res = await fetch(`/api/orders/${selectedOrder.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ driverId }),
            });

            if (res.ok) {
                // Refresh orders
                fetchOrders();
                setDriverModalOpen(false); // Close modal on success
                // Optionally show success message
            } else {
                console.error('Failed to assign driver:', await res.json());
            }
        } catch (error) {
            console.error('Error assigning driver:', error);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-secondary-800">إدارة الطلبات</h1>
                <p className="text-sm text-gray-500">عرض وإدارة جميع الطلبات</p>
            </div>

            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="بحث برقم الطلب..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
                            className="input pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="input w-auto"
                    >
                        <option value="">كل الحالات</option>
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

            <div className="card">
                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-6 text-center">
                            <div className="spinner mx-auto"></div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">لا توجد طلبات</div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="p-4 hover:bg-gray-50">
                                <Link href={`/admin/orders/${order.id}`} className="block">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-secondary-800">#{order.orderNumber}</span>
                                        <span className={`badge ${getOrderStatusColor(order.status)}`}>
                                            {translateOrderStatus(order.status)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                        <User className="w-4 h-4" />
                                        <span>{order.customer.name}</span>
                                        <span className="text-gray-400">•</span>
                                        <span>{order.address.area}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-primary font-bold">{formatCurrency(Number(order.total))}</span>
                                        <span className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</span>
                                    </div>
                                </Link>
                                <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
                                    {order.driver ? (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Truck className="w-4 h-4" />
                                            <span>{order.driver.name}</span>
                                            <button
                                                onClick={() => openDriverModal(order)}
                                                className="text-xs text-primary hover:underline mr-1"
                                            >
                                                (تغيير)
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => openDriverModal(order)}
                                            className="flex items-center gap-1 text-sm text-primary hover:bg-primary/5 px-2 py-1 rounded-lg transition-colors"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            تعيين سائق
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>رقم الطلب</th>
                                <th>العميل</th>
                                <th>المنطقة</th>
                                <th>المنتجات</th>
                                <th>الإجمالي</th>
                                <th>الحالة</th>
                                <th>السائق</th>
                                <th>التاريخ</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-8">
                                        <div className="spinner mx-auto"></div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-8 text-gray-500">
                                        لا توجد طلبات
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="font-bold text-secondary-800">#{order.orderNumber}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                {order.customer.name}
                                            </div>
                                        </td>
                                        <td>{order.address.area}</td>
                                        <td>{order._count?.items || '-'}</td>
                                        <td className="font-bold text-primary">{formatCurrency(Number(order.total))}</td>
                                        <td>
                                            <span className={`badge ${getOrderStatusColor(order.status)}`}>
                                                {translateOrderStatus(order.status)}
                                            </span>
                                        </td>
                                        <td>
                                            {order.driver ? (
                                                <div className="flex items-center gap-2 group relative">
                                                    <Truck className="w-4 h-4 text-gray-400" />
                                                    <span>{order.driver.name}</span>
                                                    <button
                                                        onClick={() => openDriverModal(order)}
                                                        className="invisible group-hover:visible absolute right-full mr-2 bg-white shadow-md border rounded px-2 py-1 text-xs text-primary whitespace-nowrap z-10"
                                                    >
                                                        تغيير السائق
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => openDriverModal(order)}
                                                    className="flex items-center gap-1 text-xs text-primary hover:bg-primary/5 px-2 py-1 rounded-lg transition-colors"
                                                >
                                                    <UserPlus className="w-3 h-3" />
                                                    تعيين
                                                </button>
                                            )}
                                        </td>
                                        <td className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</td>
                                        <td>
                                            <Link href={`/admin/orders/${order.id}`} className="btn btn-ghost btn-sm">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-100">
                        <span className="text-sm text-gray-500">صفحة {page} من {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn btn-sm bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="btn btn-sm bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {selectedOrder && (
                <DriverAssignmentModal
                    isOpen={driverModalOpen}
                    onClose={() => setDriverModalOpen(false)}
                    onAssign={handleAssignDriver}
                    currentDriverId={selectedOrder.driver?.id}
                    orderId={selectedOrder.id}
                />
            )}
        </div>
    );
}
