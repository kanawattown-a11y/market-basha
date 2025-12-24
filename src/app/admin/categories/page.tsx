'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, GripVertical } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    image: string | null;
    sortOrder: number;
    isActive: boolean;
    _count: { products: number };
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', sortOrder: 0, isActive: true });

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories?all=true');
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
            const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchCategories();
                setShowForm(false);
                setEditingId(null);
                setFormData({ name: '', sortOrder: 0, isActive: true });
            }
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleEdit = (cat: Category) => {
        setFormData({ name: cat.name, sortOrder: cat.sortOrder, isActive: cat.isActive });
        setEditingId(cat.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;

        try {
            await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-secondary-800">إدارة الأقسام</h1>
                    <p className="text-sm text-gray-500">إضافة وتعديل أقسام المنتجات</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', sortOrder: 0, isActive: true }); }}
                    className="btn btn-primary w-full sm:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    إضافة قسم
                </button>
            </div>

            {showForm && (
                <div className="card p-4 md:p-6">
                    <h3 className="font-bold text-secondary-800 mb-4">
                        {editingId ? 'تعديل القسم' : 'إضافة قسم جديد'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">اسم القسم</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ترتيب العرض</label>
                                <input
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                                    className="input"
                                />
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <span className="text-sm text-gray-700">نشط</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button type="submit" className="btn btn-primary w-full sm:w-auto">حفظ</button>
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setEditingId(null); }}
                                className="btn btn-outline w-full sm:w-auto"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-6 text-center">
                            <div className="spinner mx-auto"></div>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">لا توجد أقسام</div>
                    ) : (
                        categories.map((cat) => (
                            <div key={cat.id} className="flex items-center gap-3 p-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                    <Tag className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-secondary-800 truncate">{cat.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500">{cat._count?.products || 0} منتج</span>
                                        <span className={`badge text-xs ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {cat.isActive ? 'نشط' : 'غير نشط'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => handleEdit(cat)} className="p-2 hover:bg-gray-100 rounded-lg">
                                        <Edit className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-red-50 rounded-lg">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>القسم</th>
                                <th>عدد المنتجات</th>
                                <th>الترتيب</th>
                                <th>الحالة</th>
                                <th>إجراءات</th>
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
                                        <td className="w-10">
                                            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                    <Tag className="w-5 h-5 text-primary" />
                                                </div>
                                                <span className="font-medium text-secondary-800">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td>{cat._count?.products || 0}</td>
                                        <td>{cat.sortOrder}</td>
                                        <td>
                                            <span className={`badge ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {cat.isActive ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEdit(cat)} className="btn btn-ghost btn-sm">
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
        </div>
    );
}
