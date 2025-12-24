'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ServiceArea {
    id: string;
    name: string;
    deliveryFee: number;
    minOrderAmount: number;
    isActive: boolean;
}

export default function AdminAreasPage() {
    const [areas, setAreas] = useState<ServiceArea[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', deliveryFee: 5000, minOrderAmount: 0, isActive: true });

    const fetchAreas = async () => {
        try {
            const res = await fetch('/api/service-areas?active=false');
            if (res.ok) {
                const data = await res.json();
                setAreas(data.areas);
            }
        } catch (error) {
            console.error('Error fetching areas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAreas();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingId ? `/api/service-areas/${editingId}` : '/api/service-areas';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchAreas();
                setShowForm(false);
                setEditingId(null);
                setFormData({ name: '', deliveryFee: 5000, minOrderAmount: 0, isActive: true });
            }
        } catch (error) {
            console.error('Error saving area:', error);
        }
    };

    const handleEdit = (area: ServiceArea) => {
        setFormData({
            name: area.name,
            deliveryFee: Number(area.deliveryFee),
            minOrderAmount: Number(area.minOrderAmount),
            isActive: area.isActive,
        });
        setEditingId(area.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;

        try {
            await fetch(`/api/service-areas/${id}`, { method: 'DELETE' });
            fetchAreas();
        } catch (error) {
            console.error('Error deleting area:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-800">مناطق التخديم</h1>
                    <p className="text-gray-500">إدارة مناطق التوصيل ورسوم التوصيل</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setEditingId(null); }}
                    className="btn btn-primary"
                >
                    <Plus className="w-5 h-5" />
                    إضافة منطقة
                </button>
            </div>

            {showForm && (
                <div className="card p-6">
                    <h3 className="font-bold text-secondary-800 mb-4">
                        {editingId ? 'تعديل المنطقة' : 'إضافة منطقة جديدة'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنطقة</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">رسوم التوصيل (ل.س)</label>
                                <input
                                    type="number"
                                    value={formData.deliveryFee}
                                    onChange={(e) => setFormData({ ...formData, deliveryFee: parseInt(e.target.value) })}
                                    className="input"
                                    min="0"
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
                            <div className="flex items-end">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <span className="text-sm text-gray-700">نشطة</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="btn btn-primary">حفظ</button>
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setEditingId(null); }}
                                className="btn btn-outline"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full text-center py-12">
                        <div className="spinner mx-auto"></div>
                    </div>
                ) : areas.length === 0 ? (
                    <div className="col-span-full card p-12 text-center">
                        <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">لا توجد مناطق</p>
                    </div>
                ) : (
                    areas.map((area) => (
                        <div key={area.id} className="card p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-secondary-800">{area.name}</h3>
                                        <span className={`text-xs ${area.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                            {area.isActive ? 'نشطة' : 'غير نشطة'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(area)} className="btn btn-ghost btn-sm">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(area.id)} className="btn btn-ghost btn-sm text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-gray-50 p-2 rounded-lg">
                                    <p className="text-gray-500">رسوم التوصيل</p>
                                    <p className="font-bold text-primary">{formatCurrency(Number(area.deliveryFee))}</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-lg">
                                    <p className="text-gray-500">الحد الأدنى</p>
                                    <p className="font-bold text-secondary-800">{formatCurrency(Number(area.minOrderAmount))}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
