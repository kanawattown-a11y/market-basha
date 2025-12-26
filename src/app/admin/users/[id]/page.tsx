'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    ChevronLeft,
    Edit,
    User,
    Phone,
    Mail,
    Calendar,
    Package,
    Truck,
    Check,
    X,
    AlertCircle
} from 'lucide-react';
import { formatDateTime, translateRole, translateUserStatus, getUserStatusColor, formatCurrency } from '@/lib/utils';

interface UserData {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    role: string;
    status: string;
    avatar: string | null;
    vehicleType: string | null;
    vehiclePlate: string | null;
    isAvailable: boolean;
    createdAt: string;
    lastLoginAt: string | null;
    _count: {
        orders: number;
        driverOrders: number;
        tickets: number;
    };
}

export default function AdminUserViewPage() {
    const params = useParams();
    const id = params.id as string;

    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

    const fetchUser = async () => {
        try {
            const res = await fetch(`/api/users/${id}`);
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setError('المستخدم غير موجود');
            }
        } catch (err) {
            setError('حدث خطأ في جلب البيانات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchUser();
        }
    }, [id]);

    const updateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                fetchUser();
            } else {
                const data = await res.json();
                setError(data.message || 'حدث خطأ');
            }
        } catch (err) {
            setError('حدث خطأ في الاتصال');
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

    if (error || !user) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 mx-auto text-red-300 mb-4" />
                <p className="text-gray-500">{error || 'المستخدم غير موجود'}</p>
                <Link href="/admin/users" className="btn btn-primary mt-4">
                    العودة للمستخدمين
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/users" className="text-gray-400 hover:text-gray-600">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold text-secondary-800">تفاصيل المستخدم</h1>
                </div>
                <Link href={`/admin/users/${id}/edit`} className="btn btn-primary">
                    <Edit className="w-5 h-5" />
                    تعديل
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Info Card */}
                <div className="lg:col-span-2 card p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <span className="text-primary font-bold text-2xl">{user.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-secondary-800">{user.name}</h2>
                            <span className={`badge ${getUserStatusColor(user.status)}`}>
                                {translateUserStatus(user.status)}
                            </span>
                            <span className="badge bg-gray-100 text-gray-700 mr-2">
                                {translateRole(user.role)}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-400">رقم الهاتف</p>
                                <p className="font-medium text-secondary-800" dir="ltr">{user.phone}</p>
                            </div>
                        </div>

                        {user.email && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-400">البريد الإلكتروني</p>
                                    <p className="font-medium text-secondary-800">{user.email}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-400">تاريخ التسجيل</p>
                                <p className="font-medium text-secondary-800">{formatDateTime(user.createdAt)}</p>
                            </div>
                        </div>

                        {user.lastLoginAt && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <User className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-400">آخر دخول</p>
                                    <p className="font-medium text-secondary-800">{formatDateTime(user.lastLoginAt)}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Driver Info */}
                    {user.role === 'DRIVER' && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h3 className="font-bold text-secondary-800 mb-4">معلومات السائق</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <Truck className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">نوع المركبة</p>
                                        <p className="font-medium text-secondary-800">{user.vehicleType || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <Truck className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">رقم اللوحة</p>
                                        <p className="font-medium text-secondary-800">{user.vehiclePlate || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats & Actions */}
                <div className="space-y-4">
                    <div className="card p-4">
                        <h3 className="font-bold text-secondary-800 mb-4">الإحصائيات</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Package className="w-4 h-4" />
                                    <span>الطلبات</span>
                                </div>
                                <span className="font-bold text-secondary-800">{user._count.orders}</span>
                            </div>
                            {user.role === 'DRIVER' && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Truck className="w-4 h-4" />
                                            <span>التوصيلات</span>
                                        </div>
                                        <span className="font-bold text-secondary-800">{user._count.driverOrders}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs">💰</span>
                                                <span>الإيرادات</span>
                                            </div>
                                        </div>
                                        <span className="font-bold text-green-600">
                                            {/* @ts-ignore */}
                                            {formatCurrency(user.driverStats?.totalRevenue || 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Package className="w-4 h-4" />
                                            <span>حالة التوفر</span>
                                        </div>
                                        <span className={`badge ${user.isAvailable ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {user.isAvailable ? 'متاح' : 'مشغول'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    {user.status === 'PENDING' && (
                        <div className="card p-4">
                            <h3 className="font-bold text-secondary-800 mb-4">إجراءات سريعة</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => updateStatus('APPROVED')}
                                    disabled={updating}
                                    className="btn btn-primary w-full"
                                >
                                    {updating ? <div className="spinner"></div> : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            تفعيل الحساب
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => updateStatus('REJECTED')}
                                    disabled={updating}
                                    className="btn btn-outline w-full text-red-500 border-red-200 hover:bg-red-50"
                                >
                                    <X className="w-5 h-5" />
                                    رفض الطلب
                                </button>
                            </div>
                        </div>
                    )}

                    {user.status === 'APPROVED' && (
                        <div className="card p-4">
                            <h3 className="font-bold text-secondary-800 mb-4">إجراءات</h3>
                            <button
                                onClick={() => updateStatus('SUSPENDED')}
                                disabled={updating}
                                className="btn btn-outline w-full text-orange-500 border-orange-200 hover:bg-orange-50"
                            >
                                تعليق الحساب
                            </button>
                        </div>
                    )}

                    {user.status === 'SUSPENDED' && (
                        <div className="card p-4">
                            <h3 className="font-bold text-secondary-800 mb-4">إجراءات</h3>
                            <button
                                onClick={() => updateStatus('APPROVED')}
                                disabled={updating}
                                className="btn btn-primary w-full"
                            >
                                إعادة تفعيل الحساب
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
