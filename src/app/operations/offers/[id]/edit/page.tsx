'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, AlertCircle } from 'lucide-react';

export default function EditOfferPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 0,
        startDate: '',
        endDate: '',
        isActive: true,
    });

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const res = await fetch(`/api/offers/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        title: data.offer.title,
                        description: data.offer.description || '',
                        discountType: data.offer.discountType,
                        discountValue: Number(data.offer.discountValue),
                        minOrderAmount: Number(data.offer.minOrderAmount) || 0,
                        startDate: new Date(data.offer.startDate).toISOString().split('T')[0],
                        endDate: new Date(data.offer.endDate).toISOString().split('T')[0],
                        isActive: data.offer.isActive,
                    });
                }
            } catch (error) {
                console.error('Error fetching offer:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOffer();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const res = await fetch(`/api/offers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    startDate: new Date(formData.startDate).toISOString(),
                    endDate: new Date(formData.endDate).toISOString(),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || 'حدث خطأ');
                return;
            }

            router.push('/operations/offers');
        } catch {
            setError('حدث خطأ في الاتصال');
        } finally {
            setSaving(false);
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
            <div className="flex items-center gap-4">
                <Link href="/operations/offers" className="text-gray-400 hover:text-gray-600">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-secondary-800">تعديل العرض</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان العرض</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="input"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input min-h-20"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">قيمة الخصم</label>
                            <input
                                type="number"
                                value={formData.discountValue}
                                onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) })}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية</label>
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
                            <span className="text-sm">عرض نشط</span>
                        </label>
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
                    <Link href="/operations/offers" className="btn btn-outline">إلغاء</Link>
                </div>
            </form>
        </div>
    );
}
