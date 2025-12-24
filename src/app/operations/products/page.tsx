'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Search, AlertTriangle, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    lowStockThreshold: number;
    isActive: boolean;
    category: { name: string };
    image: string | null;
}

export default function OperationsProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showLowStock, setShowLowStock] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    ...(search && { search }),
                    ...(showLowStock && { lowStock: 'true' }),
                });
                const res = await fetch(`/api/products?${params}`);
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.products);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [search, showLowStock]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-800">المنتجات</h1>
                    <p className="text-gray-500">مراقبة المخزون والمنتجات</p>
                </div>
                <Link href="/operations/products/new" className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    إضافة منتج
                </Link>
            </div>

            <div className="card p-4 flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-64">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="بحث عن منتج..."
                        className="input pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <button
                    onClick={() => setShowLowStock(!showLowStock)}
                    className={`btn ${showLowStock ? 'btn-primary' : 'btn-outline'}`}
                >
                    <AlertTriangle className="w-4 h-4" />
                    نفاذ المخزون
                </button>
            </div>

            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>القسم</th>
                                <th>السعر</th>
                                <th>المخزون</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8">
                                        <div className="spinner mx-auto"></div>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">
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
                                                    <p className="text-xs text-gray-400 font-mono">{product.sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{product.category.name}</td>
                                        <td className="font-bold text-primary">{formatCurrency(Number(product.price))}</td>
                                        <td>
                                            <span className={product.stock <= product.lowStockThreshold ? 'text-red-500 font-bold' : ''}>
                                                {product.stock}
                                                {product.stock <= product.lowStockThreshold && (
                                                    <AlertTriangle className="w-4 h-4 inline mr-1 text-red-500" />
                                                )}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {product.isActive ? 'نشط' : 'معطل'}
                                            </span>
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
