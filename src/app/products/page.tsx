'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Filter,
    ShoppingCart,
    Package,
    ChevronLeft,
    ChevronRight,
    X,
    SlidersHorizontal
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';

interface Product {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    price: number;
    compareAtPrice: number | null;
    unit: string;
    stock: number;
    category: { id: string; name: string };
}

interface Category {
    id: string;
    name: string;
    banner: string | null;
    _count: { products: number };
}

function ProductsContent() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState(searchParam || '');
    const [selectedCategory, setSelectedCategory] = useState(categoryParam || '');
    const [showFilters, setShowFilters] = useState(false);

    // Cart from Context
    const { items: cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);

    const router = useRouter();

    const handleAddToCart = (product: Product) => {
        addToCart(product);
        setIsCartOpen(true);
    };



    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                ...(searchParam ? { search: searchParam } : {}), // Use URL param
                ...(selectedCategory ? { category: selectedCategory } : {}),
            });

            const res = await fetch(`/api/products?${params}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Sync input with URL
    useEffect(() => {
        if (searchParam !== null) {
            setSearch(searchParam);
        } else {
            setSearch('');
        }
    }, [searchParam]);

    // Fetch on params change
    useEffect(() => {
        fetchProducts();
    }, [page, selectedCategory, searchParam]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        // Push to URL
        const params = new URLSearchParams(searchParams.toString());
        if (search) {
            params.set('search', search);
        } else {
            params.delete('search');
        }
        router.push(`/products?${params.toString()}`);
    };

    const selectedCategoryData = categories.find(c => c.id === selectedCategory);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header onCartClick={() => setIsCartOpen(true)} />

            <main className="container mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-primary">الرئيسية</Link>
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-secondary-800 font-medium">المنتجات</span>
                    {selectedCategoryData && (
                        <>
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-primary font-medium">{selectedCategoryData.name}</span>
                        </>
                    )}
                </div>

                {/* Category Banner */}
                {selectedCategoryData?.banner && (
                    <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 relative shadow-lg">
                        <Image
                            src={selectedCategoryData.banner}
                            alt={selectedCategoryData.name}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                            <h2 className="text-3xl font-bold text-white mb-2">{selectedCategoryData.name}</h2>
                        </div>
                    </div>
                )}

                <div className="flex gap-6">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="card p-4 sticky top-24">
                            <h3 className="font-bold text-secondary-800 mb-4">المتاجر</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => { setSelectedCategory(''); setPage(1); }}
                                    className={cn(
                                        "w-full text-right px-3 py-2 rounded-lg transition-colors",
                                        !selectedCategory ? "bg-primary text-secondary font-medium" : "hover:bg-gray-100"
                                    )}
                                >
                                    جميع المنتجات
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                                        className={cn(
                                            "w-full text-right px-3 py-2 rounded-lg transition-colors flex items-center justify-between",
                                            selectedCategory === cat.id ? "bg-primary text-secondary font-medium" : "hover:bg-gray-100"
                                        )}
                                    >
                                        <span>{cat.name}</span>
                                        <span className="text-xs opacity-70">{cat._count?.products || 0}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Filter Bar - Mobile Only */}
                        <div className="card p-4 mb-6 lg:hidden">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="btn btn-outline w-full"
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                                فلترة حسب المتجر
                            </button>

                            {/* Mobile Filters */}
                            {showFilters && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => { setSelectedCategory(''); setShowFilters(false); }}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-sm transition-colors",
                                                !selectedCategory ? "bg-primary text-secondary" : "bg-gray-100"
                                            )}
                                        >
                                            الكل
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => { setSelectedCategory(cat.id); setShowFilters(false); }}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-full text-sm transition-colors",
                                                    selectedCategory === cat.id ? "bg-primary text-secondary" : "bg-gray-100"
                                                )}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="spinner mx-auto mb-4"></div>
                                <p className="text-gray-500">جاري التحميل...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="card p-12 text-center">
                                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">لا توجد منتجات</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            onAddToCart={addToCart}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-8">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="btn btn-sm bg-white border border-gray-200 disabled:opacity-50"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                        <span className="px-4 py-2 text-sm">
                                            {page} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="btn btn-sm bg-white border border-gray-200 disabled:opacity-50"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">جاري التحميل...</p>
                </div>
            </div>
        }>
            <ProductsContent />
        </Suspense>
    );
}
