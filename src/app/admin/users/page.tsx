'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    ChevronRight,
    ChevronLeft,
    User,
    Phone,
    Check,
    X
} from 'lucide-react';
import { formatDateTime, translateRole, translateUserStatus, getUserStatusColor } from '@/lib/utils';

interface UserItem {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    role: string;
    status: string;
    createdAt: string;
    _count: { orders: number };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(search && { search }),
                ...(roleFilter && { role: roleFilter }),
            });

            const res = await fetch(`/api/users?${params}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
                setTotalPages(data.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, search, roleFilter]);

    const updateStatus = async (id: string, status: string) => {
        try {
            await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

        try {
            await fetch(`/api/users/${id}`, { method: 'DELETE' });
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-800">المستخدمون</h1>
                    <p className="text-gray-500">إدارة مستخدمي النظام</p>
                </div>
                <Link href="/admin/users/new" className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    إضافة مستخدم
                </Link>
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
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    className="input w-auto"
                >
                    <option value="">كل الأدوار</option>
                    <option value="USER">مستخدم</option>
                    <option value="DRIVER">سائق</option>
                    <option value="OPERATIONS">عمليات</option>
                    <option value="ADMIN">مدير</option>
                </select>
            </div>

            <div className="card">
                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-6 text-center">
                            <div className="spinner mx-auto"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">لا يوجد مستخدمون</div>
                    ) : (
                        users.map((user) => (
                            <Link
                                key={user.id}
                                href={`/admin/users/${user.id}`}
                                className="flex items-center gap-3 p-4 hover:bg-gray-50"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-primary font-bold text-lg">{user.name.charAt(0)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-secondary-800 truncate">{user.name}</p>
                                        <span className={`badge ${getUserStatusColor(user.status)} shrink-0`}>
                                            {translateUserStatus(user.status)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500" dir="ltr">{user.phone}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="badge bg-gray-100 text-gray-600 text-xs">
                                            {translateRole(user.role)}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {user._count.orders} طلب
                                        </span>
                                    </div>
                                </div>
                                {user.status === 'PENDING' && (
                                    <div className="flex gap-1 shrink-0">
                                        <button
                                            onClick={(e) => { e.preventDefault(); updateStatus(user.id, 'APPROVED'); }}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); updateStatus(user.id, 'REJECTED'); }}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </Link>
                        ))
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>المستخدم</th>
                                <th>الهاتف</th>
                                <th>الدور</th>
                                <th>الحالة</th>
                                <th>الطلبات</th>
                                <th>التسجيل</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8">
                                        <div className="spinner mx-auto"></div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                        لا يوجد مستخدمون
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <span className="text-primary font-bold">{user.name.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-secondary-800">{user.name}</p>
                                                    {user.email && <p className="text-xs text-gray-400">{user.email}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="font-mono text-sm" dir="ltr">{user.phone}</td>
                                        <td>
                                            <span className="badge bg-gray-100 text-gray-700">
                                                {translateRole(user.role)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getUserStatusColor(user.status)}`}>
                                                {translateUserStatus(user.status)}
                                            </span>
                                        </td>
                                        <td>{user._count.orders}</td>
                                        <td className="text-sm text-gray-500">{formatDateTime(user.createdAt)}</td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                {user.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(user.id, 'APPROVED')}
                                                            className="btn btn-ghost btn-sm text-green-500"
                                                            title="قبول"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(user.id, 'REJECTED')}
                                                            className="btn btn-ghost btn-sm text-red-500"
                                                            title="رفض"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <Link href={`/admin/users/${user.id}/edit`} className="btn btn-ghost btn-sm">
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="btn btn-ghost btn-sm text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
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
