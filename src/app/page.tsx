'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import CartSidebar from '@/components/CartSidebar';
import {
    ShoppingCart,
    Search,
    User,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Star,
    Heart,
    Plus,
    Minus,
    Trash2,
    MapPin,
    Phone,
    Mail,
    Truck,
    Shield,
    Clock,
    ArrowLeft,
    Package,
    Tag,
    Filter,
    ChevronDown,
    LogOut,
    Check
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

// Types
interface Product {
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number | null;
    image: string | null;
    stock: number;
    unit: string;
    category: { name: string };
    isFeatured: boolean;
}

interface Category {
    id: string;
    name: string;
    image: string | null;
    banner: string | null;
    _count: { products: number };
}

interface Offer {
    id: string;
    title: string;
    description: string | null;
    image: string | null;
    discountType: string;
    discountValue: number;
}

interface CartItem extends Product {
    quantity: number;
}

// Hero Carousel
function HeroCarousel({ offers }: { offers: Offer[] }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % (offers.length || 1));
    }, [offers.length]);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + (offers.length || 1)) % (offers.length || 1));
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [nextSlide]);

    return (
        <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden group shadow-2xl">
            {offers.length > 0 ? (
                <div
                    className="flex h-full transition-transform duration-700 ease-out"
                    style={{ transform: `translateX(${currentSlide * 100}%)` }}
                >
                    {offers.map((offer) => (
                        <div
                            key={offer.id}
                            className="min-w-full h-full relative"
                        >
                            {/* Clean Background - No Gradient */}
                            <div className="absolute inset-0 bg-gray-50">
                                {offer.image && (
                                    <>
                                        <Image
                                            src={offer.image}
                                            alt={offer.title}
                                            fill
                                            className="object-cover opacity-20"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/70"></div>
                                    </>
                                )}
                            </div>

                            {/* Clean Content - Minimal */}
                            <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
                                <div className="max-w-2xl">
                                    {/* Discount Badge - Refined */}
                                    <div className="inline-flex items-center gap-2 bg-white border-2 border-secondary-900 px-6 py-3 rounded-2xl mb-6 shadow-lg">
                                        <Tag className="w-5 h-5 text-secondary-900" />
                                        <span className="text-2xl font-black text-secondary-900">
                                            {offer.discountType.toLowerCase() === 'percentage'
                                                ? `خصم ${offer.discountValue}%`
                                                : `خصم ${offer.discountValue} ل.س`}
                                        </span>
                                    </div>

                                    {/* Title - Professional */}
                                    <h2 className="text-4xl md:text-6xl font-black text-secondary-900 mb-4 leading-tight">
                                        {offer.title}
                                    </h2>

                                    {/* Description - Clean */}
                                    {offer.description && (
                                        <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed max-w-xl">
                                            {offer.description}
                                        </p>
                                    )}

                                    {/* CTA - Simple */}
                                    <Link
                                        href={`/offers/${offer.id}`}
                                        className="inline-flex items-center gap-3 bg-secondary-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-secondary-800 transition-all hover:scale-105 shadow-xl"
                                    >
                                        <span>استكشف العرض</span>
                                        <ArrowLeft className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="w-full h-full relative overflow-hidden">
                    <Image
                        src="/hero-pattern.png"
                        alt="Hero Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-between text-right z-10 p-8 md:p-16 container mx-auto">
                        <div className="animate-float max-w-2xl">
                            <span className="inline-block bg-primary text-secondary-900 px-4 py-1.5 rounded-full text-sm font-bold mb-6 shadow-lg">
                                تسوق أذكى، مش أصعب
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-lg">
                                كل طلبات البيت <span className="text-primary">واصلة لعندك</span>
                            </h1>
                            <p className="text-gray-200 text-lg md:text-xl mb-8 max-w-lg leading-relaxed">
                                أفضل المنتجات بأفضل الأسعار، توصيل سريع ودفع عند الاستلام.
                            </p>
                            <Link href="/products" className="btn btn-primary btn-lg shadow-xl hover:scale-105 transition-transform">
                                تسوق الآن
                                <ArrowLeft className="w-5 h-5 mr-2" />
                            </Link>
                        </div>
                        {/* Hero Logo - Visible on all screens, small on mobile */}
                        <div className="w-24 h-24 lg:w-96 lg:h-96 relative animate-float delay-100 opacity-90 flex-shrink-0 ml-4">
                            <Image src="/logo.svg" alt="Market Basha" fill className="object-contain drop-shadow-2xl" />
                        </div>
                    </div>
                </div>
            )}

            {offers.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-secondary-900 transition-all z-30"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-secondary-900 transition-all z-30"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}
        </div>
    );
}

// Product Card
// Moved to src/components/ProductCard.tsx

// Category Card
function CategoryCard({ category }: { category: Category }) {
    return (
        <Link
            href={`/products?category=${category.id}`}
            className="card p-4 text-center group hover:border-primary hover:shadow-lg transition-all"
        >
            <div className="relative w-20 h-20 mx-auto mb-3 rounded-full bg-primary/5 p-2 group-hover:scale-110 transition-transform duration-300">
                <div className="w-full h-full relative rounded-full overflow-hidden">
                    {(category.banner || category.image) ? (
                        <Image
                            src={category.banner || category.image || ''}
                            alt={category.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary">
                            <Tag className="w-8 h-8" />
                        </div>
                    )}
                </div>
            </div>
            <h3 className="font-bold text-secondary-900">{category.name}</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-2 inline-block">{category._count.products} منتج</span>
        </Link>
    );
}

// Cart Sidebar
// Moved to src/components/CartSidebar.tsx

import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Features Section
function FeaturesSection() {
    const features = [
        { icon: Truck, title: 'توصيل سريع', description: 'توصيل لباب منزلك' },
        { icon: Shield, title: 'دفع آمن', description: 'الدفع عند الاستلام' },
        { icon: Clock, title: 'خدمة 24/7', description: 'دعم على مدار الساعة' },
        { icon: Star, title: 'منتجات مميزة', description: 'أفضل الأسعار' },
    ];

    return (
        <section className="py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {features.map((feature, index) => (
                        <div key={index} className="card p-4 text-center">
                            <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-xl flex items-center justify-center">
                                <feature.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-secondary-800">{feature.title}</h3>
                            <p className="text-sm text-gray-500">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Main Home Page Component
export default function HomePage() {
    const { items: cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
    const [cartOpen, setCartOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Request notification permission
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes, offersRes] = await Promise.all([
                    fetch('/api/products?limit=12'),
                    fetch('/api/categories'),
                    fetch('/api/offers?active=true')
                ]);

                if (productsRes.ok) {
                    const data = await productsRes.json();
                    setProducts(data.products || []);
                    setFeaturedProducts((data.products || []).filter((p: Product) => p.isFeatured));
                }

                if (categoriesRes.ok) {
                    const data = await categoriesRes.json();
                    setCategories(data.categories || []);
                }

                if (offersRes.ok) {
                    const data = await offersRes.json();
                    setOffers(data.offers || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAddToCart = (product: Product) => {
        addToCart(product);
        setCartOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-gray-500">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header onCartClick={() => setCartOpen(true)} />

            <main className="flex-1">
                <div className="container mx-auto px-4 py-6">
                    {/* Hero Carousel */}
                    <HeroCarousel offers={offers} />

                    {/* Features */}
                    <FeaturesSection />

                    {/* Categories */}
                    {categories.length > 0 && (
                        <section className="py-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-secondary-800">تصفح المتاجر</h2>
                                <Link href="/categories" className="text-primary hover:underline flex items-center gap-1">
                                    عرض الكل
                                    <ArrowLeft className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                {categories.slice(0, 8).map(category => (
                                    <CategoryCard key={category.id} category={category} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Featured Products */}
                    {featuredProducts.length > 0 && (
                        <section className="py-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-secondary-800">منتجات مميزة</h2>
                                <Link href="/products?featured=true" className="text-primary hover:underline flex items-center gap-1">
                                    عرض الكل
                                    <ArrowLeft className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="product-grid">
                                {featuredProducts.slice(0, 5).map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={addToCart}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* All Products */}
                    <section className="py-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-secondary-800">جميع المنتجات</h2>
                            <Link href="/products" className="text-primary hover:underline flex items-center gap-1">
                                عرض الكل
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="product-grid">
                            {products.slice(0, 10).map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />

            <CartSidebar
                items={cartItems}
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
            />
        </div>
    );
}
