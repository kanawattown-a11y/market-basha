'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Package } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard, { Product } from '@/components/ProductCard';
import CartSidebar from '@/components/CartSidebar';
import { useCart } from '@/contexts/CartContext';

export default function FavoritesPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Use Cart Context
    const { items: cartItems, addToCart, updateQuantity, removeFromCart } = useCart();

    const handleAddToCart = (product: Product) => {
        addToCart(product);
        setIsCartOpen(true);
    };

    // Fetch Favorites
    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            try {
                const favIds = JSON.parse(localStorage.getItem('favorites') || '[]');

                if (favIds.length === 0) {
                    setProducts([]);
                    setLoading(false);
                    return;
                }

                const params = new URLSearchParams({
                    ids: favIds.join(','),
                    limit: '100' // Fetch all favorites
                });

                const res = await fetch(`/api/products?${params}`);
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.products);
                }
            } catch (error) {
                console.error('Error fetching favorites:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();

        // Listen for storage changes (if favs updated in another tab or component)
        const handleStorage = () => {
            // Ideally re-fetch or just update list if we have all data.
            // For simplicity, we re-fetch if storage event implies favorites changed?
            // Actually, storage event fires on other tabs, not same tab for localStorage.setItem.
            // But we dispatch 'storage' manually in ProductCard.
            // So we should re-fetch.
            fetchFavorites();
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header onCartClick={() => setIsCartOpen(true)} />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-500">
                        <Heart className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-secondary-900">المفضلة</h1>
                        <p className="text-gray-500 text-sm">المنتجات التي قمت بحفظها</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="spinner"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-10 h-10 text-gray-300" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">لا توجد منتجات في المفضلة</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            قم بالضغط على رمز القلب بجانب المنتجات لإضافتها هنا والرجوع إليها لاحقاً
                        </p>
                        <Link href="/products" className="btn btn-primary shadow-lg shadow-primary/20">
                            تصفح المنتجات
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />

            <CartSidebar
                items={cartItems}
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
            />
        </div>
    );
}
