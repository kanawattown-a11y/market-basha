'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    ChevronRight,
    ChevronLeft,
    Package
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    isActive: boolean;
    isFeatured: boolean;
    category: { name: string };
    image: string | null;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(search && { search }),
            });

            const res = await fetch(`/api/products?${params}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products);
                setTotalPages(data.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, search]);

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchProducts();
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const toggleActive = async (id: string, isActive: boolean) => {
        try {
            await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !isActive }),
            });
            fetchProducts();
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-secondary-800">المنتجات</h1>
                    <p className="text-sm text-gray-500">إدارة منتجات المتجر</p>
                </div>
                <Link href="/operations/products/new" className="btn btn-primary w-full sm:w-auto">
                    <Plus className="w-5 h-5" />
                    إضافة منتج
                </Link>
            </div>

            <div className="card p-4">
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="بحث عن منتج..."
                        className="input pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
            </div>

            <div className="card">
                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-6 text-center">
                            <div className="spinner mx-auto"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">لا توجد منتجات</div>
                    ) : (
                        products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/operations/products/${product.id}/edit`}
                                className="flex items-center gap-3 p-4 hover:bg-gray-50"
                            >
                                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-secondary-800 truncate">{product.name}</p>
                                        {product.isFeatured && (
                                            <span className="badge bg-primary/10 text-primary text-xs shrink-0">مميز</span>
                                        )}
                                    </div>
                                    <p className="text-primary font-bold">{formatCurrency(Number(product.price))}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500">{product.category.name}</span>
                                        <span className={`text-xs ${product.stock <= 10 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                            المخزون: {product.stock}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <span className={`badge text-xs ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {product.isActive ? 'نشط' : 'معطل'}
                                    </span>
                                    <Edit className="w-4 h-4 text-gray-400" />
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>SKU</th>
                                <th>القسم</th>
                                <th>السعر</th>
                                <th>المخزون</th>
                                <th>الحالة</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8">
                                        <div className="spinner mx-auto"></div>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                        لا توجد منتجات
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-secondary-800">{product.name}</p>
                                                    {product.isFeatured && (
                                                        <span className="text-xs text-primary">مميز</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-gray-500 font-mono text-sm">{product.sku}</td>
                                        <td>{product.category.name}</td>
                                        <td className="font-bold text-primary">{formatCurrency(Number(product.price))}</td>
                                        <td>
                                            <span className={product.stock <= 10 ? 'text-red-500 font-bold' : ''}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => toggleActive(product.id, product.isActive)}
                                                className={`badge cursor-pointer ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                            >
                                                {product.isActive ? 'نشط' : 'معطل'}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <Link href={`/operations/products/${product.id}/edit`} className="btn btn-ghost btn-sm">
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="btn btn-ghost btn-sm text-red-500"
                                                >
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

                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-100">
                        <span className="text-sm text-gray-500">صفحة {page} من {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn btn-sm bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="btn btn-sm bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
