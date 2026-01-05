'use client';

import { useState, useEffect } from 'react';
import { Trash2, RotateCcw, Trash, User, Package, Gift, Store, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

interface DeletedItem {
    id: string;
    deletedAt: Date;
    [key: string]: unknown;
}

interface TrashData {
    users: DeletedItem[];
    products: DeletedItem[];
    offers: DeletedItem[];
    categories: DeletedItem[];
}

export default function TrashPage() {
    const toast = useToast();
    const [data, setData] = useState<TrashData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'products' | 'offers' | 'categories'>('products');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [restoreConfirm, setRestoreConfirm] = useState<{ type: string; id: string } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string } | null>(null);

    const fetchTrash = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/trash');
            if (res.ok) {
                const trash = await res.json();
                setData(trash);
            }
        } catch (error) {
            console.error('Error fetching trash:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    const handleRestore = async (type: string, id: string) => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/trash/${type}/${id}/restore`, {
                method: 'POST',
            });

            if (res.ok) {
                await fetchTrash();
                toast.success('تم الاسترجاع بنجاح');
            } else {
                const data = await res.json();
                toast.error(data.message || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error restoring:', error);
            toast.error('حدث خطأ في الاسترجاع');
        } finally {
            setActionLoading(null);
            setRestoreConfirm(null);
        }
    };

    const handlePermanentDelete = async (type: string, id: string) => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/trash/${type}/${id}/permanent`, {
                method: 'DELETE',
            });

            if (res.ok) {
                await fetchTrash();
                toast.success('تم الحذف النهائي');
            } else {
                const data = await res.json();
                toast.error(data.message || 'حدث خطأ');
            }
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('حدث خطأ في الحذف');
        } finally {
            setActionLoading(null);
            setDeleteConfirm(null);
        }
    };

    if (loading || !data) {
        return (
            <div className="text-center py-12">
                <div className="spinner mx-auto"></div>
            </div>
        );
    }

    const tabs = [
        { key: 'products', label: 'المنتجات', icon: Package, count: data.products.length },
        { key: 'users', label: 'المستخدمين', icon: User, count: data.users.length },
        { key: 'categories', label: 'المتاجر', icon: Store, count: data.categories.length },
        { key: 'offers', label: 'العروض', icon: Gift, count: data.offers.length },
    ] as const;

    const currentItems = data[activeTab];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Trash2 className="w-8 h-8 text-red-600" />
                <div>
                    <h1 className="text-2xl font-bold text-secondary-800">سلة المهملات</h1>
                    <p className="text-gray-500">استرجع أو احذف العناصر المحذوفة نهائياً</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.key
                                ? 'border-primary text-primary font-medium'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {tab.label}
                            {tab.count > 0 && (
                                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {currentItems.length === 0 ? (
                <div className="card p-12 text-center">
                    <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد عناصر محذوفة</p>
                </div>
            ) : (
                <div className="card">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>العنصر</th>
                                    <th>تاريخ الحذف</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((item: any) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {activeTab === 'products' && item.image && (
                                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}
                                                {activeTab === 'categories' && item.image && (
                                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">
                                                        {item.name || item.title || item.email}
                                                    </p>
                                                    {activeTab === 'products' && (
                                                        <p className="text-sm text-gray-500">
                                                            {formatCurrency(Number(item.price))} - {item.category?.name}
                                                        </p>
                                                    )}
                                                    {activeTab === 'offers' && (
                                                        <p className="text-sm text-gray-500">
                                                            {item.discountType === 'percentage' ? `${item.discountValue}%` : formatCurrency(Number(item.discountValue))}
                                                        </p>
                                                    )}
                                                    {activeTab === 'users' && (
                                                        <p className="text-sm text-gray-500">
                                                            {item.phone} - {item.role}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-gray-500">
                                            {new Date(item.deletedAt).toLocaleString('ar-SY')}
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setRestoreConfirm({ type: activeTab, id: item.id })}
                                                    disabled={actionLoading === item.id}
                                                    className="btn btn-sm btn-outline text-green-600 hover:bg-green-50 border-green-300"
                                                >
                                                    {actionLoading === item.id ? (
                                                        <div className="spinner"></div>
                                                    ) : (
                                                        <>
                                                            <RotateCcw className="w-4 h-4" />
                                                            استرجاع
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm({ type: activeTab, id: item.id })}
                                                    disabled={actionLoading === item.id}
                                                    className="btn btn-sm btn-outline text-red-600 hover:bg-red-50 border-red-300"
                                                >
                                                    {actionLoading === item.id ? (
                                                        <div className="spinner"></div>
                                                    ) : (
                                                        <>
                                                            <Trash className="w-4 h-4" />
                                                            حذف نهائي
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">تحذير:</p>
                    <p>الحذف النهائي لا يمكن التراجع عنه. تأكد من أنك لا تحتاج لهذه العناصر قبل الحذف النهائي.</p>
                </div>
            </div>

            {/* Restore Confirmation Modal */}
            {restoreConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <RotateCcw className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-secondary-900 mb-2">
                            استرجاع العنصر
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            هل تريد استرجاع هذا العنصر؟
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setRestoreConfirm(null)}
                                className="btn btn-outline flex-1"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={() => handleRestore(restoreConfirm.type, restoreConfirm.id)}
                                className="btn bg-green-500 hover:bg-green-600 text-white flex-1"
                            >
                                استرجاع
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-secondary-900 mb-2">
                            ⚠️ حذف نهائي
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            هذا الإجراء لا يمكن التراجع عنه!<br />
                            هل أنت متأكد من الحذف النهائي؟
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="btn btn-outline flex-1"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={() => handlePermanentDelete(deleteConfirm.type, deleteConfirm.id)}
                                className="btn bg-red-500 hover:bg-red-600 text-white flex-1"
                            >
                                حذف نهائياً
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
