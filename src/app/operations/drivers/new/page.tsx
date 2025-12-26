'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, AlertCircle, Truck } from 'lucide-react';

export default function NewDriverPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        role: 'DRIVER',
        status: 'APPROVED',
        vehicleType: '',
        vehiclePlate: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
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
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/operations/drivers" className="text-gray-400 hover:text-gray-600">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-secondary-800">إضافة سائق جديد</h1>
                </div>
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
                            placeholder="+971"
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور *</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="input"
                            minLength={8}
                            required
                        />
                    </div>
                </div>

                <div className="card p-6 space-y-4">
                    <h3 className="font-bold text-secondary-800 flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        معلومات المركبة
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
                            placeholder="ABC 1234"
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
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? <div className="spinner"></div> : <><Save className="w-5 h-5" /> حفظ السائق</>}
                    </button>
                    <Link href="/operations/drivers" className="btn btn-outline">
                        إلغاء
                    </Link>
                </div>
            </form>
        </div>
    );
}
