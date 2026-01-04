'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, MapPin, Save, AlertCircle, Loader2 } from 'lucide-react';

interface ServiceArea {
    name: string;
    deliveryFee: number;
}

export default async function EditAddressPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return <EditAddressClient id={id} />;
}

function EditAddressClient({ id }: { id: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [areas, setAreas] = useState<ServiceArea[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        fullAddress: '',
        area: '',
        building: '',
        floor: '',
        notes: '',
        isDefault: false,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch service areas
                const areasRes = await fetch('/api/service-areas');
                if (areasRes.ok) {
                    const areasData = await areasRes.json();
                    setAreas(areasData.areas);
                }

                // Fetch address data
                const addressRes = await fetch(`/api/addresses/${id}`);
                if (addressRes.ok) {
                    const addressData = await addressRes.json();
                    const address = addressData.address;
                    setFormData({
                        title: address.title || '',
                        fullAddress: address.fullAddress || '',
                        area: address.area || '',
                        building: address.building || '',
                        floor: address.floor || '',
                        notes: address.notes || '',
                        isDefault: address.isDefault || false,
                    });
                } else {
                    setError('العنوان غير موجود');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('حدث خطأ في جلب البيانات');
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/addresses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'حدث خطأ');
                return;
            }

            router.push('/account/addresses');
        } catch {
            setError('حدث خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="text-center py-12">
                <div className="spinner mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/account/addresses" className="text-gray-400 hover:text-gray-600">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-secondary-800">تعديل العنوان</h1>
            </div>

            <div className="card p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                اسم العنوان
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="input"
                                placeholder="مثال: المنزل، العمل"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                المنطقة
                            </label>
                            <select
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                className="input"
                                required
                            >
                                <option value="">اختر المنطقة</option>
                                {areas.map((area) => (
                                    <option key={area.name} value={area.name}>
                                        {area.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            العنوان الكامل
                        </label>
                        <input
                            type="text"
                            value={formData.fullAddress}
                            onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                            className="input"
                            placeholder="الشارع، الحي، علامات مميزة"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                رقم البناء
                            </label>
                            <input
                                type="text"
                                value={formData.building}
                                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                                className="input"
                                placeholder="اختياري"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                الطابق
                            </label>
                            <input
                                type="text"
                                value={formData.floor}
                                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                className="input"
                                placeholder="اختياري"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ملاحظات للسائق
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="input min-h-20"
                            placeholder="اختياري - أي تعليمات إضافية للسائق"
                        />
                    </div>

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        />
                        <span className="text-sm text-gray-700">تعيين كعنوان افتراضي</span>
                    </label>

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
                            {loading ? <div className="spinner"></div> : <><Save className="w-5 h-5" /> حفظ التعديلات</>}
                        </button>
                        <Link href="/account/addresses" className="btn btn-outline">
                            إلغاء
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
