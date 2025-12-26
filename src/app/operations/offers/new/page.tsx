'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, AlertCircle } from 'lucide-react';

export default function NewOfferPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    startDate: new Date(formData.startDate).toISOString(),
                    endDate: new Date(formData.endDate).toISOString(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'حدث خطأ');
                return;
            }

            router.push('/operations/offers');
        } catch {
            setError('حدث خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/operations/offers" className="text-gray-400 hover:text-gray-600">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-secondary-800">إضافة عرض جديد</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card p-6">
                    <h3 className="font-bold text-secondary-800 mb-4">معلومات العرض</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان العرض *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="input"
                                placeholder="مثال: خصم 20% على المشتريات"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input min-h-20"
                                placeholder="وصف تفصيلي للعرض"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">نوع الخصم</label>
                            <select
                                value={formData.discountType}
                                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                className="input"
                            >
                                <option value="PERCENTAGE">نسبة مئوية (%)</option>
                                <option value="FIXED">مبلغ ثابت (ل.س)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                قيمة الخصم {formData.discountType === 'PERCENTAGE' ? '(%)' : '(ل.س)'}
                            </label>
                            <input
                                type="number"
                                value={formData.discountValue}
                                onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) })}
                                className="input"
                                min="0"
                                max={formData.discountType === 'PERCENTAGE' ? 100 : undefined}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأدنى للطلب (ل.س)</label>
                            <input
                                type="number"
                                value={formData.minOrderAmount}
                                onChange={(e) => setFormData({ ...formData, minOrderAmount: parseInt(e.target.value) })}
                                className="input"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <h3 className="font-bold text-secondary-800 mb-4">فترة العرض</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية *</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية *</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="input"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            <span className="text-sm text-gray-700">عرض نشط (ظاهر للعملاء)</span>
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
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? <div className="spinner"></div> : <><Save className="w-5 h-5" /> حفظ العرض</>}
                    </button>
                    <Link href="/operations/offers" className="btn btn-outline">
                        إلغاء
                    </Link>
                </div>
            </form>
        </div>
    );
}
