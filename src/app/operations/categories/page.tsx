'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    description: string | null;
    banner: string | null;
    sortOrder: number;
    isActive: boolean;
    _count: { products: number };
}

export default function OperationsCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', banner: '', sortOrder: 0, isActive: true });

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editCategory ? `/api/categories/${editCategory.id}` : '/api/categories';
            const method = editCategory ? 'PUT' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            setShowModal(false);
            setEditCategory(null);
            setFormData({ name: '', description: '', banner: '', sortOrder: 0, isActive: true });
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
        try {
            await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const openEdit = (category: Category) => {
        setEditCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            banner: category.banner || '',
            sortOrder: category.sortOrder,
            isActive: category.isActive,
        });
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-800">الأقسام</h1>
                    <p className="text-gray-500">إدارة أقسام المنتجات</p>
                </div>
                <button
                    onClick={() => { setEditCategory(null); setFormData({ name: '', description: '', banner: '', sortOrder: 0, isActive: true }); setShowModal(true); }}
                    className="btn btn-primary"
                >
                    <Plus className="w-5 h-5" />
                    إضافة قسم
                </button>
            </div>

            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>القسم</th>
                                <th>الوصف</th>
                                <th>الترتيب</th>
                                <th>المنتجات</th>
                                <th>الحالة</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8">
                                        <div className="spinner mx-auto"></div>
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        لا توجد أقسام
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                    <Tag className="w-5 h-5 text-primary" />
                                                </div>
                                                <span className="font-medium text-secondary-800">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-gray-500">{cat.description || '-'}</td>
                                        <td>{cat.sortOrder}</td>
                                        <td>{cat._count.products}</td>
                                        <td>
                                            <span className={`badge ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {cat.isActive ? 'نشط' : 'معطل'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openEdit(cat)} className="btn btn-ghost btn-sm">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(cat.id)} className="btn btn-ghost btn-sm text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-secondary-800 mb-4">
                            {editCategory ? 'تعديل القسم' : 'إضافة قسم جديد'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">اسم القسم</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">رابط البانر</label>
                                <input
                                    type="url"
                                    value={formData.banner}
                                    onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                                    className="input"
                                    placeholder="https://"
                                />
                            </div>
                            <div>
                                <label className="label">الوصف</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="label">الترتيب</label>
                                <input
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                                    className="input"
                                />
                            </div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <span className="text-sm">قسم نشط</span>
                            </label>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="btn btn-primary flex-1">
                                    {editCategory ? 'تحديث' : 'إضافة'}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline flex-1">
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
