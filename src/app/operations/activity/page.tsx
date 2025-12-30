'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Activity,
    ChevronLeft,
    ChevronRight,
    Search,
    User,
    Package,
    ShoppingCart,
    Settings,
    Clock,
    RefreshCw
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    oldData: Record<string, unknown> | null;
    newData: Record<string, unknown> | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
    user: {
        id: string;
        name: string;
        role: string;
    } | null;
}

const actionLabels: Record<string, string> = {
    CREATE: 'إنشاء',
    UPDATE: 'تعديل',
    DELETE: 'حذف',
    STATUS_CHANGE: 'تغيير حالة',
    LOGIN: 'تسجيل دخول',
    LOGOUT: 'تسجيل خروج',
};

const entityLabels: Record<string, string> = {
    User: 'مستخدم',
    Product: 'منتج',
    Order: 'طلب',
    Category: 'متجر',
    ServiceArea: 'منطقة',
    Ticket: 'تذكرة',
    Offer: 'عرض',
};

const entityIcons: Record<string, typeof User> = {
    User: User,
    Product: Package,
    Order: ShoppingCart,
    Category: Settings,
    ServiceArea: Settings,
    Ticket: Activity,
    Offer: Settings,
};

export default function OperationsActivityLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [entityFilter, setEntityFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(search && { search }),
                ...(entityFilter && { entity: entityFilter }),
                ...(actionFilter && { action: actionFilter }),
            });

            const res = await fetch(`/api/audit-logs?${params}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs || []);
                setTotalPages(data.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, entityFilter, actionFilter]);

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'bg-green-100 text-green-700';
            case 'DELETE': return 'bg-red-100 text-red-700';
            case 'UPDATE':
            case 'STATUS_CHANGE': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'مدير';
            case 'OPERATIONS': return 'عمليات';
            case 'DRIVER': return 'سائق';
            case 'USER': return 'مستخدم';
            default: return role;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/operations" className="text-gray-400 hover:text-gray-600">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-secondary-800 flex items-center gap-2">
                            <Activity className="w-6 h-6" />
                            سجل النشاطات
                        </h1>
                        <p className="text-gray-500">عرض جميع العمليات في النظام</p>
                    </div>
                </div>
                <button onClick={fetchLogs} className="btn btn-outline btn-sm" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4 flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-64">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
                        placeholder="بحث..."
                        className="input pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <select
                    value={entityFilter}
                    onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                    className="input w-auto"
                >
                    <option value="">كل الكيانات</option>
                    <option value="User">المستخدمين</option>
                    <option value="Product">المنتجات</option>
                    <option value="Order">الطلبات</option>
                    <option value="Category">المتاجر</option>
                    <option value="Ticket">التذاكر</option>
                </select>
                <select
                    value={actionFilter}
                    onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                    className="input w-auto"
                >
                    <option value="">كل العمليات</option>
                    <option value="CREATE">إنشاء</option>
                    <option value="UPDATE">تعديل</option>
                    <option value="DELETE">حذف</option>
                    <option value="STATUS_CHANGE">تغيير حالة</option>
                </select>
            </div>

            {/* Logs List */}
            <div className="card">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="spinner mx-auto"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Activity className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p>لا توجد سجلات</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {logs.map((log) => {
                            const EntityIcon = entityIcons[log.entity] || Activity;
                            return (
                                <div key={log.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                            <EntityIcon className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`badge ${getActionColor(log.action)}`}>
                                                    {actionLabels[log.action] || log.action}
                                                </span>
                                                <span className="font-medium text-secondary-800">
                                                    {entityLabels[log.entity] || log.entity}
                                                </span>
                                                {log.entityId && (
                                                    <span className="text-xs text-gray-400 font-mono">
                                                        #{log.entityId.slice(0, 8)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                                {log.user && (
                                                    <>
                                                        <span>{log.user.name}</span>
                                                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                                            {getRoleLabel(log.user.role)}
                                                        </span>
                                                        <span>•</span>
                                                    </>
                                                )}
                                                <Clock className="w-3 h-3" />
                                                <span>{formatDateTime(log.createdAt)}</span>
                                            </div>
                                            {log.newData && Object.keys(log.newData).length > 0 && (
                                                <div className="mt-2 text-xs text-gray-400 bg-gray-50 p-2 rounded">
                                                    {Object.entries(log.newData).slice(0, 3).map(([key, value]) => (
                                                        <span key={key} className="mr-3">
                                                            {key}: <span className="text-gray-600">{String(value).slice(0, 30)}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
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
