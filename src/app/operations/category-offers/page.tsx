'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, Calendar, Tag, Package, X, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

interface Category {
    id: string;
    name: string;
    image: string | null;
}

interface CategoryOffer {
    id: string;
    title: string;
    description: string | null;
    image: string | null;
    discountType: string;
    discountValue: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    categories: {
        id: string;
        category: Category;
    }[];
}

export default function OperationsCategoryOffersPage() {
    const [offers, setOffers] = useState<CategoryOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState<CategoryOffer | null>(null);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const { showToast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        titleEn: '',
        description: '',
        image: '',
        discountType: 'percentage',
        discountValue: '',
        startDate: '',
        endDate: '',
        isActive: true,
        categoryIds: [] as string[],
    });

    useEffect(() => {
        fetchOffers();
        fetchCategories();
    }, []);

    const fetchOffers = async () => {
        try {
            const res = await fetch('/api/category-offers');
            if (res.ok) {
                const data = await res.json();
                setOffers(data.offers);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
            showToast('حدث خطأ في جلب العروض', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setAllCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.discountValue || !formData.startDate || !formData.endDate || formData.categoryIds.length === 0) {
            showToast('الرجاء ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        try {
            const url = editingOffer
                ? `/api/category-offers/${editingOffer.id}`
                : '/api/category-offers';
            const method = editingOffer ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    discountValue: parseFloat(formData.discountValue),
                }),
            });

            if (res.ok) {
                showToast(editingOffer ? 'تم تحديث العرض بنجاح' : 'تم إنشاء العرض بنجاح', 'success');
                setShowModal(false);
                resetForm();
                fetchOffers();
            } else {
                const data = await res.json();
                showToast(data.message || 'حدث خطأ', 'error');
            }
        } catch (error) {
            console.error('Error saving offer:', error);
            showToast('حدث خطأ في حفظ العرض', 'error');
        }
    };

    const handleEdit = (offer: CategoryOffer) => {
        setEditingOffer(offer);
        setFormData({
            title: offer.title,
            titleEn: '',
            description: offer.description || '',
            image: offer.image || '',
            discountType: offer.discountType,
            discountValue: offer.discountValue.toString(),
            startDate: offer.startDate.split('T')[0],
            endDate: offer.endDate.split('T')[0],
            isActive: offer.isActive,
            categoryIds: offer.categories.map((c) => c.category.id),
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;

        try {
            const res = await fetch(`/api/category-offers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('تم حذف العرض بنجاح', 'success');
                fetchOffers();
            } else {
                const data = await res.json();
                showToast(data.message || 'حدث خطأ', 'error');
            }
        } catch (error) {
            console.error('Error deleting offer:', error);
            showToast('حدث خطأ في حذف العرض', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            titleEn: '',
            description: '',
            image: '',
            discountType: 'percentage',
            discountValue: '',
            startDate: '',
            endDate: '',
            isActive: true,
            categoryIds: [],
        });
        setEditingOffer(null);
    };

    const toggleCategory = (categoryId: string) => {
        setFormData(prev => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(categoryId)
                ? prev.categoryIds.filter(id => id !== categoryId)
                : [...prev.categoryIds, categoryId]
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-secondary-900">عروض المتاجر</h1>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    إنشاء عرض جديد
                </button>
            </div>

            {/* Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((offer) => (
                    <div key={offer.id} className="card">
                        <div className="relative h-48 bg-gray-100">
                            {offer.image ? (
                                <Image src={offer.image} alt={offer.title} fill className="object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Tag className="w-16 h-16 text-gray-300" />
                                </div>
                            )}
                            <div className="absolute top-3 right-3 bg-primary px-3 py-1 rounded-full font-bold text-secondary-900">
                                {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `${offer.discountValue} ل.س`}
                            </div>
                            {!offer.isActive && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <span className="text-white font-bold">غير نشط</span>
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-2">{offer.title}</h3>
                            {offer.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{offer.description}</p>
                            )}

                            {/* Categories */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {offer.categories.map((cat) => (
                                    <span key={cat.id} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                        {cat.category.name}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                <Calendar className="w-4 h-4" />
                                {new Date(offer.startDate).toLocaleDateString('ar-SY')} - {new Date(offer.endDate).toLocaleDateString('ar-SY')}
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(offer)} className="btn btn-sm btn-secondary flex-1">
                                    <Edit className="w-4 h-4" />
                                    تعديل
                                </button>
                                <button onClick={() => handleDelete(offer.id)} className="btn btn-sm btn-danger flex-1">
                                    <Trash2 className="w-4 h-4" />
                                    حذف
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {offers.length === 0 && (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">لا توجد عروض حالياً</p>
                </div>
            )}

            {/* Modal - Same as admin */}
            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="card-header flex items-center justify-between">
                            <h2 className="text-xl font-bold">{editingOffer ? 'تعديل العرض' : 'إنشاء عرض جديد'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="card-body space-y-4">
                            <div>
                                <label className="label">العنوان *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">الوصف</label>
                                <textarea
                                    className="input"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">نوع الخصم *</label>
                                    <select
                                        className="input"
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    >
                                        <option value="percentage">نسبة مئوية %</option>
                                        <option value="fixed">مبلغ ثابت</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">قيمة الخصم *</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">تاريخ البدء *</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">تاريخ الانتهاء *</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">رابط الصورة</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>

                            {/* Category Selection */}
                            <div>
                                <label className="label">المتاجر * (اختر واحد أو أكثر)</label>
                                <div className="border-2 border-gray-200 rounded-xl p-4 max-h-60 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-2">
                                        {allCategories.map((category) => (
                                            <label
                                                key={category.id}
                                                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${formData.categoryIds.includes(category.id)
                                                        ? 'bg-primary/20 border-2 border-primary'
                                                        : 'bg-gray-50 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.categoryIds.includes(category.id)}
                                                    onChange={() => toggleCategory(category.id)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm">{category.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    المتاجر المختارة: {formData.categoryIds.length}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="isActive" className="text-sm cursor-pointer">تفعيل العرض</label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="btn btn-primary flex-1">
                                    {editingOffer ? 'حفظ التعديلات' : 'إنشاء العرض'}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
