'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, AlertCircle, Truck, Loader2 } from 'lucide-react';

interface Driver {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    status: string;
    vehicleType: string | null;
    vehiclePlate: string | null;
    isAvailable: boolean;
}

export default function EditDriverPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        status: 'APPROVED',
        vehicleType: '',
        vehiclePlate: '',
        isAvailable: true,
    });

    useEffect(() => {
        const fetchDriver = async () => {
            try {
                const res = await fetch(`/api/users/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    const driver: Driver = data.user;
                    setFormData({
                        name: driver.name || '',
                        phone: driver.phone || '',
                        email: driver.email || '',
                        status: driver.status || 'APPROVED',
                        vehicleType: driver.vehicleType || '',
                        vehiclePlate: driver.vehiclePlate || '',
                        isAvailable: driver.isAvailable ?? true,
                    });
                }
            } catch (error) {
                console.error('Error fetching driver:', error);
                setError('حدث خطأ في جلب بيانات السائق');
            } finally {
                setLoading(false);
            }
        };
        fetchDriver();
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

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'حدث خطأ');
                return;
            }

            router.push('/operations/drivers');
        } catch {
            setError('حدث خطأ في الاتصال');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف هذا السائق؟')) return;

        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                router.push('/operations/drivers');
            }
        } catch (error) {
            console.error('Error deleting driver:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/operations/drivers" className="text-gray-400 hover:text-gray-600">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Truck className="w-5 h-5 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-secondary-800">تعديل بيانات السائق</h1>
                    </div>
                </div>
                <button onClick={handleDelete} className="btn btn-outline text-red-500 border-red-300">
                    حذف السائق
                </button>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
                <div className="card p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الاسم *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف *</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="input"
                            dir="ltr"
                            required
                        />
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
                </div>

                <div className="card p-6 space-y-4">
                    <h3 className="font-bold text-secondary-800 flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        معلومات المركبة والحالة
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نوع المركبة</label>
                        <select
                            value={formData.vehicleType}
                            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                            className="input"
                        >
                            <option value="">اختر نوع المركبة</option>
                            <option value="دراجة نارية">دراجة نارية</option>
                            <option value="سيارة صغيرة">سيارة صغيرة</option>
                            <option value="سيارة كبيرة">سيارة كبيرة</option>
                            <option value="فان">فان</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم اللوحة</label>
                        <input
                            type="text"
                            value={formData.vehiclePlate}
                            onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                            className="input"
                            dir="ltr"
                        />
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
                            <option value="SUSPENDED">موقوف</option>
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isAvailable}
                                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="font-medium text-gray-700">متاح للتوصيل</span>
                        </label>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary"
                    >
                        {saving ? <div className="spinner"></div> : <><Save className="w-5 h-5" /> حفظ التعديلات</>}
                    </button>
                    <Link href="/operations/drivers" className="btn btn-outline">
                        إلغاء
                    </Link>
                </div>
            </form>
        </div>
    );
}
