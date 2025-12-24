'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, AlertCircle, Trash2 } from 'lucide-react';

export default function EditUserPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        role: 'USER',
        status: 'APPROVED',
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/users/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        name: data.user.name,
                        phone: data.user.phone,
                        email: data.user.email || '',
                        role: data.user.role,
                        status: data.user.status,
                    });
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || 'حدث خطأ');
                return;
            }

            router.push('/admin/users');
        } catch {
            setError('حدث خطأ في الاتصال');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                router.push('/admin/users');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="spinner mx-auto"></div>
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
                    <h1 className="text-2xl font-bold text-secondary-800">تعديل المستخدم</h1>
                </div>
                <button onClick={handleDelete} className="btn btn-outline text-red-500 border-red-300">
                    <Trash2 className="w-5 h-5" />
                    حذف
                </button>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
                <div className="card p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            className="input bg-gray-100"
                            disabled
                        />
                        <p className="text-xs text-gray-400 mt-1">لا يمكن تغيير رقم الهاتف</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="input"
                        >
                            <option value="USER">مستخدم</option>
                            <option value="DRIVER">سائق</option>
                            <option value="OPERATIONS">عمليات</option>
                            <option value="ADMIN">مدير</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="input"
                        >
                            <option value="APPROVED">مفعل</option>
                            <option value="PENDING">قيد المراجعة</option>
                            <option value="REJECTED">مرفوض</option>
                            <option value="SUSPENDED">موقوف</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    <button type="submit" disabled={saving} className="btn btn-primary">
                        {saving ? <div className="spinner"></div> : <><Save className="w-5 h-5" /> حفظ التغييرات</>}
                    </button>
                    <Link href="/admin/users" className="btn btn-outline">إلغاء</Link>
                </div>
            </form>
        </div>
    );
}
