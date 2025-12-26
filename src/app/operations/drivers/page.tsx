'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    ChevronRight,
    ChevronLeft,
    Truck,
    Phone,
    Check,
    X,
    RefreshCw
} from 'lucide-react';
import { formatDateTime, translateUserStatus, getUserStatusColor } from '@/lib/utils';

interface Driver {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    status: string;
    vehicleType: string | null;
    vehiclePlate: string | null;
    isAvailable: boolean;
    createdAt: string;
    _count: { driverOrders: number };
}

export default function OperationsDriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                role: 'DRIVER',
                ...(search && { search }),
                ...(statusFilter && { status: statusFilter }),
            });

            const res = await fetch(`/api/users?${params}`);
            if (res.ok) {
                const data = await res.json();
                setDrivers(data.users);
                setTotalPages(data.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, [page, search, statusFilter]);

    const updateStatus = async (id: string, status: string) => {
        try {
            await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            fetchDrivers();
        } catch (error) {
            console.error('Error updating driver:', error);
        }
    };

    const toggleAvailability = async (id: string, isAvailable: boolean) => {
        try {
            await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable }),
            });
            fetchDrivers();
        } catch (error) {
            console.error('Error updating driver availability:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-800">السائقون</h1>
                    <p className="text-gray-500">عرض سائقي التوصيل</p>
                </div>
                <button onClick={fetchDrivers} className="btn btn-outline btn-sm" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="card p-4 flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-64">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="بحث باسم أو رقم الهاتف..."
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
                    <option value="APPROVED">مفعل</option>
                    <option value="PENDING">قيد المراجعة</option>
                    <option value="SUSPENDED">موقوف</option>
                </select>
            </div>

            <div className="card">
                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-6 text-center">
                            <div className="spinner mx-auto"></div>
                        </div>
                    ) : drivers.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">لا يوجد سائقون</div>
                    ) : (
                        drivers.map((driver) => (
                            <div key={driver.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                        <Truck className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-secondary-800 truncate">{driver.name}</p>
                                            <span className={`badge ${getUserStatusColor(driver.status)} shrink-0`}>
                                                {translateUserStatus(driver.status)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500" dir="ltr">{driver.phone}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`badge text-xs ${driver.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {driver.isAvailable ? 'متاح' : 'غير متاح'}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {driver._count.driverOrders} توصيلة
                                            </span>
                                        </div>
                                    </div>
                                    {driver.status === 'PENDING' && (
                                        <div className="flex gap-1 shrink-0">
                                            <button
                                                onClick={() => updateStatus(driver.id, 'APPROVED')}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(driver.id, 'REJECTED')}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
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
                                <th>السائق</th>
                                <th>الهاتف</th>
                                <th>المركبة</th>
                                <th>الحالة</th>
                                <th>التوفر</th>
                                <th>التوصيلات</th>
                                <th>التسجيل</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8">
                                        <div className="spinner mx-auto"></div>
                                    </td>
                                </tr>
                            ) : drivers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-500">
                                        لا يوجد سائقون
                                    </td>
                                </tr>
                            ) : (
                                drivers.map((driver) => (
                                    <tr key={driver.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Truck className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-secondary-800">{driver.name}</p>
                                                    {driver.email && <p className="text-xs text-gray-400">{driver.email}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="font-mono text-sm" dir="ltr">{driver.phone}</td>
                                        <td>
                                            {driver.vehicleType ? (
                                                <div className="text-sm">
                                                    <p className="font-medium">{driver.vehicleType}</p>
                                                    {driver.vehiclePlate && <p className="text-gray-400 text-xs" dir="ltr">{driver.vehiclePlate}</p>}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${getUserStatusColor(driver.status)}`}>
                                                {translateUserStatus(driver.status)}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => toggleAvailability(driver.id, !driver.isAvailable)}
                                                className={`badge cursor-pointer transition-colors ${driver.isAvailable ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                            >
                                                {driver.isAvailable ? 'متاح' : 'غير متاح'}
                                            </button>
                                        </td>
                                        <td>{driver._count.driverOrders}</td>
                                        <td className="text-sm text-gray-500">{formatDateTime(driver.createdAt)}</td>
                                        <td>
                                            {driver.status === 'PENDING' && (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => updateStatus(driver.id, 'APPROVED')}
                                                        className="btn btn-ghost btn-sm text-green-500"
                                                        title="قبول"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(driver.id, 'REJECTED')}
                                                        className="btn btn-ghost btn-sm text-red-500"
                                                        title="رفض"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
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
        </div>
    );
}

