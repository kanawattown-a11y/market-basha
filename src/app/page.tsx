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
    Check,
    Sparkles
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
    isFeatured?: boolean;
    description?: string | null;
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
                            {/* Clean White Background with Pattern */}
                            <div className="absolute inset-0 bg-white">
                                {/* Pattern Overlay */}
                                <div
                                    className="absolute inset-0 opacity-5"
                                    style={{
                                        backgroundImage: 'url(/hero-pattern.png)',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                />
                                {offer.image && (
                                    <Image
                                        src={offer.image}
                                        alt={offer.title}
                                        fill
                                        className="object-cover opacity-10"
                                        priority
                                    />
                                )}
                            </div>

                            {/* Yellow Border */}
                            <div className="absolute inset-0 border-8 border-primary rounded-3xl pointer-events-none"></div>

                            {/* Content */}
                            <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
                                <div className="max-w-2xl">
                                    {/* Premium Discount Badge */}
                                    <div className="inline-flex items-center gap-3 mb-6 group/badge">
                                        <div className="relative">
                                            {/* Glow Effect */}
                                            <div className="absolute inset-0 bg-primary blur-xl opacity-60 animate-pulse"></div>

                                            {/* Badge */}
                                            <div className="relative bg-gradient-to-br from-primary via-yellow-400 to-yellow-600 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2">
                                                <Tag className="w-5 h-5 text-secondary-900 animate-pulse" />
                                                <span className="text-2xl font-black text-secondary-900">
                                                    {offer.discountType.toLowerCase() === 'percentage'
                                                        ? `خصم ${offer.discountValue}%`
                                                        : `خصم ${offer.discountValue} ل.س`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-5xl md:text-7xl font-black text-secondary-900 mb-4 leading-tight">
                                        {offer.title}
                                    </h2>

                                    {/* Description */}
                                    {offer.description && (
                                        <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed max-w-xl font-medium">
                                            {offer.description}
                                        </p>
                                    )}

                                    {/* Yellow CTA Button */}
                                    <Link
                                        href={`/offers/${offer.id}`}
                                        className="inline-flex items-center gap-3 bg-primary hover:bg-yellow-500 text-secondary-900 px-10 py-5 rounded-2xl font-black text-xl transition-all duration-300 shadow-2xl border-4 border-yellow-600 hover:scale-105"
                                    >
                                        <span>استكشف العرض</span>
                                        <ArrowLeft className="w-6 h-6" />
                                    </Link>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="w-full h-full relative overflow-hidden">
                    {/* Default Hero - Premium */}
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900"></div>

                    <div className="absolute inset-0 flex items-center justify-between text-right z-10 p-8 md:p-16 container mx-auto">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-6 py-2 rounded-full mb-6 border border-primary/30">
                                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                                <span className="text-primary font-bold text-sm">تسوق أذكى، مش أصعب</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
                                كل طلبات البيت <span className="text-primary">واصلة لعندك</span>
                            </h1>
                            <p className="text-white/80 text-lg md:text-xl mb-8 max-w-lg leading-relaxed drop-shadow-lg">
                                أفضل المنتجات بأفضل الأسعار، توصيل سريع ودفع عند الاستلام.
                            </p>
                            <Link href="/products" className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-yellow-500 text-secondary-900 px-8 py-4 rounded-2xl font-bold text-lg hover:from-yellow-400 hover:to-yellow-600 transition-all duration-300 shadow-xl">
                                <span>تسوق الآن</span>
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </div>
                        {/* Logo */}
                        <div className="hidden lg:block w-80 h-80 relative opacity-90">
                            <Image src="/logo.svg" alt="Market Basha" fill className="object-contain drop-shadow-2xl" />
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
                </div>
            )}

            {offers.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-primary hover:text-secondary-900 hover:border-primary transition-all z-30 shadow-xl"
                    >
                        <ChevronLeft className="w-7 h-7" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-primary hover:text-secondary-900 hover:border-primary transition-all z-30 shadow-xl"
                    >
                        <ChevronRight className="w-7 h-7" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                        {offers.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                    ? 'w-8 bg-primary'
                                    : 'w-2 bg-white/40 hover:bg-white/60'
                                    }`}
                            />
                        ))}
                    </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                            {/* Horizontal Scrollable Carousel */}
                            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                                <div className="flex gap-4 pb-4">
                                    {featuredProducts.map(product => (
                                        <div key={product.id} className="flex-shrink-0 w-[280px] sm:w-[320px]">
                                            <ProductCard
                                                product={product}
                                                onAddToCart={addToCart}
                                            />
                                        </div>
                                    ))}
                                </div>
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
