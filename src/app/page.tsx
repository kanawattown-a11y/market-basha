'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-400 to-secondary-800/80 z-10 opacity-90" />
                            {offer.image && (
                                <Image
                                    src={offer.image}
                                    alt={offer.title}
                                    fill
                                    className="object-cover animate-pan-image"
                                    priority
                                />
                            )}
                            <div className="absolute inset-0 z-20 flex items-center p-8 md:p-16">
                                <div className="max-w-2xl animate-float">
                                    <span className="inline-block bg-white text-secondary-900 px-4 py-1.5 rounded-full text-sm font-bold mb-6 shadow-lg">
                                        {offer.discountType === 'percentage' ? `🔥 خصم ${offer.discountValue}%` : `🔥 خصم ${formatCurrency(Number(offer.discountValue))}`}
                                    </span>
                                    <h2 className="text-4xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-lg">
                                        {offer.title}
                                    </h2>
                                    {offer.description && (
                                        <p className="text-white/90 text-lg md:text-xl mb-8 font-medium max-w-lg leading-relaxed">{offer.description}</p>
                                    )}
                                    <Link href={`/offers/${offer.id}`} className="btn bg-white text-secondary-900 hover:bg-gray-100 hover:scale-105 btn-lg border-0 shadow-xl">
                                        تسوق العرض
                                        <ArrowLeft className="w-5 h-5 mr-2" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="w-full h-full relative overflow-hidden bg-primary">
                    <div className="absolute inset-0 bg-[url('/logo.svg')] bg-center bg-no-repeat opacity-10 scale-150 animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-500 to-secondary-900/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-center z-10 p-4">
                        <div className="animate-float">
                            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-xl">ماركت باشا</h1>
                            <p className="text-2xl md:text-3xl text-white/90 font-medium">تسوق بذكاء .. تسوق باشا 👑</p>
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
function ProductCard({
    product,
    onAddToCart
}: {
    product: Product;
    onAddToCart: (product: Product) => void;
}) {
    const discount = product.compareAtPrice
        ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
        : 0;

    const [isFav, setIsFav] = useState(false);

    useEffect(() => {
        const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFav(favs.includes(product.id));
    }, [product.id]);

    const toggleFav = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
        let newFavs;
        if (favs.includes(product.id)) {
            newFavs = favs.filter((id: string) => id !== product.id);
        } else {
            newFavs = [...favs, product.id];
        }
        localStorage.setItem('favorites', JSON.stringify(newFavs));
        setIsFav(!isFav);

        // Dispatch event for other components
        window.dispatchEvent(new Event('storage'));
    };

    return (
        <div className="card group relative">
            <Link href={`/products/${product.id}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-t-2xl">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-12 h-12" />
                        </div>
                    )}

                    {discount > 0 && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm z-10">
                            -{discount}%
                        </span>
                    )}

                    {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold shadow-lg">
                                نفذت الكمية
                            </span>
                        </div>
                    )}
                </div>
            </Link>

            <button
                onClick={toggleFav}
                className={cn(
                    "absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center transition-all z-20 shadow-sm",
                    isFav ? "bg-red-50 text-red-500" : "bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white"
                )}
            >
                <Heart className={cn("w-5 h-5", isFav && "fill-current")} />
            </button>

            <div className="p-4">
                <span className="text-xs text-primary-600 font-bold tracking-wide">{product.category.name}</span>
                <Link href={`/products/${product.id}`}>
                    <h3 className="font-bold text-secondary-900 mt-1 line-clamp-2 h-12 hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-primary">{formatCurrency(Number(product.price))}</span>
                    {product.compareAtPrice && (
                        <span className="text-sm text-gray-400 line-through">
                            {formatCurrency(Number(product.compareAtPrice))}
                        </span>
                    )}
                </div>

                <span className="text-xs text-gray-500 block mt-1">/ {product.unit}</span>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onAddToCart(product);
                    }}
                    disabled={product.stock <= 0}
                    className="w-full btn btn-primary btn-sm mt-4 font-bold shadow-sm"
                >
                    <ShoppingCart className="w-4 h-4" />
                    أضف للسلة
                </button>
            </div>
        </div>
    );
}

// Category Card
function CategoryCard({ category }: { category: Category }) {
    return (
        <Link
            href={`/products?category=${category.id}`}
            className="card p-4 text-center group hover:border-primary hover:shadow-lg transition-all"
        >
            <div className="relative w-20 h-20 mx-auto mb-3 rounded-full bg-primary/5 p-2 group-hover:scale-110 transition-transform duration-300">
                <div className="w-full h-full relative rounded-full overflow-hidden">
                    {category.image ? (
                        <Image
                            src={category.image}
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
function CartSidebar({
    items,
    isOpen,
    onClose,
    onUpdateQuantity,
    onRemove
}: {
    items: CartItem[];
    isOpen: boolean;
    onClose: () => void;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemove: (id: string) => void;
}) {
    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            )}
            <div className={cn(
                "fixed top-0 left-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 shadow-2xl flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold text-secondary-800">سلة التسوق</h2>
                        <span className="bg-primary/20 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">{items.length} عنصر</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <ShoppingCart className="w-10 h-10 text-gray-300 opacity-50" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">سلتك فارغة</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">تصفح المنتجات وأضف ما يعجبك إلى السلة!</p>
                            <button onClick={onClose} className="btn btn-primary mt-6">تصفح المنتجات</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-2xl hover:border-primary/20 hover:shadow-sm transition-all">
                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                        {item.image ? (
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Package className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-secondary-900 line-clamp-1 mb-1">{item.name}</h4>
                                        <p className="text-primary font-bold text-lg mb-2">{formatCurrency(Number(item.price))}</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center border border-gray-200 rounded-lg h-8">
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="w-8 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.stock}
                                                    className="w-8 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => onRemove(item.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors ml-auto p-1"
                                                title="حذف"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between items-center mb-6 text-lg">
                            <span className="text-gray-600 font-medium">المجموع الكلي:</span>
                            <span className="text-2xl font-black text-primary">{formatCurrency(total)}</span>
                        </div>
                        <Link href="/checkout" className="btn btn-primary w-full btn-lg font-bold shadow-lg shadow-primary/20" onClick={onClose}>
                            أكمل الطلب الآن
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}

// Header
function Header({
    cartCount,
    onCartClick,
    user
}: {
    cartCount: number;
    onCartClick: () => void;
    user: { name: string; role: string } | null;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
    };

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 md:h-20 gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0 group">
                        <div className="w-12 h-12 relative transition-transform duration-300 group-hover:scale-105">
                            <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xl font-black text-secondary-900 hidden sm:block tracking-tight group-hover:text-primary transition-colors">ماركت باشا</span>
                    </Link>

                    {/* Search - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-8">
                        <div className="relative w-full group">
                            <input
                                type="text"
                                placeholder="ابحث عن منتجك المفضل..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="w-full px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-xl shadow-sm group-focus-within:text-primary text-gray-400 transition-colors">
                                <Search className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCartClick}
                            className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all group"
                        >
                            <ShoppingCart className="w-6 h-6 text-secondary-600 group-hover:text-primary transition-colors" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-secondary-900 text-xs font-bold rounded-full flex items-center justify-center shadow-sm animate-bounce-in">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </button>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 p-1.5 pr-3 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-full transition-all"
                                >
                                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-600 rounded-full flex items-center justify-center shadow-sm text-white font-bold text-sm">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className="hidden sm:block text-sm font-bold text-secondary-700">{user.name}</span>
                                    <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                                </button>

                                {showUserMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                        <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                                            <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                                                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.name}</p>
                                            </div>
                                            <div className="p-2">
                                                <Link href={user.role === 'USER' ? '/account' : `/${user.role.toLowerCase()}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors">
                                                    <User className="w-4 h-4" />
                                                    ملفي الشخصي
                                                </Link>
                                                <Link href="/favorites" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors">
                                                    <Heart className="w-4 h-4" />
                                                    المفضلة
                                                </Link>
                                                <Link href="/account/orders" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors">
                                                    <Package className="w-4 h-4" />
                                                    طلباتي
                                                </Link>
                                                <hr className="my-1 border-gray-100" />
                                                <button onClick={handleLogout} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                                                    <LogOut className="w-4 h-4" />
                                                    تسجيل الخروج
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="btn btn-primary btn-sm px-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40">
                                تسجيل الدخول
                            </Link>
                        )}

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 hover:bg-gray-100 rounded-xl"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Search - Mobile */}
                <div className="md:hidden pb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="ابحث عن منتجات..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-[120px] bg-black/50 z-40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
                    <div className="bg-white p-4 space-y-2 shadow-xl border-t border-gray-100" onClick={e => e.stopPropagation()}>
                        <Link href="/" className="sidebar-link" onClick={() => setMobileMenuOpen(false)}>
                            الرئيسية
                        </Link>
                        <Link href="/products" className="sidebar-link" onClick={() => setMobileMenuOpen(false)}>
                            المنتجات
                        </Link>
                        <Link href="/categories" className="sidebar-link" onClick={() => setMobileMenuOpen(false)}>
                            الأقسام
                        </Link>
                        <Link href="/offers" className="sidebar-link" onClick={() => setMobileMenuOpen(false)}>
                            العروض
                        </Link>
                        <Link href="/favorites" className="sidebar-link" onClick={() => setMobileMenuOpen(false)}>
                            المفضلة
                        </Link>
                        <Link href="/support" className="sidebar-link" onClick={() => setMobileMenuOpen(false)}>
                            الدعم
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}

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
        </section>
    );
}

// Footer
function Footer() {
    return (
        <footer className="bg-secondary-800 text-white py-12 mt-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                <span className="text-secondary font-bold text-xl">م</span>
                            </div>
                            <span className="text-xl font-bold">ماركت باشا</span>
                        </div>
                        <p className="text-gray-400">
                            متجرك الإلكتروني للتسوق بسهولة وراحة. نوفر لك كل ما تحتاجه بأفضل الأسعار وأسرع توصيل.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">روابط سريعة</h4>
                        <nav className="space-y-2">
                            <Link href="/products" className="block text-gray-400 hover:text-primary transition-colors">
                                المنتجات
                            </Link>
                            <Link href="/categories" className="block text-gray-400 hover:text-primary transition-colors">
                                الأقسام
                            </Link>
                            <Link href="/offers" className="block text-gray-400 hover:text-primary transition-colors">
                                العروض
                            </Link>
                            <Link href="/support" className="block text-gray-400 hover:text-primary transition-colors">
                                الدعم
                            </Link>
                        </nav>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">خدمة العملاء</h4>
                        <nav className="space-y-2">
                            <Link href="/account" className="block text-gray-400 hover:text-primary transition-colors">
                                حسابي
                            </Link>
                            <Link href="/orders" className="block text-gray-400 hover:text-primary transition-colors">
                                طلباتي
                            </Link>
                            <Link href="/terms" className="block text-gray-400 hover:text-primary transition-colors">
                                الشروط والأحكام
                            </Link>
                            <Link href="/privacy" className="block text-gray-400 hover:text-primary transition-colors">
                                سياسة الخصوصية
                            </Link>
                        </nav>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">تواصل معنا</h4>
                        <div className="space-y-3">
                            <a href="tel:+963912345678" className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
                                <Phone className="w-5 h-5" />
                                <span>+963 912 345 678</span>
                            </a>
                            <a href="mailto:info@marketbasha.com" className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
                                <Mail className="w-5 h-5" />
                                <span>info@marketbasha.com</span>
                            </a>
                            <div className="flex items-center gap-2 text-gray-400">
                                <MapPin className="w-5 h-5" />
                                <span>سوريا</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>© {new Date().getFullYear()} ماركت باشا. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        </footer>
    );
}

// Main Home Page Component
export default function HomePage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes, offersRes, userRes] = await Promise.all([
                    fetch('/api/products?limit=12'),
                    fetch('/api/categories'),
                    fetch('/api/offers?active=true'),
                    fetch('/api/auth/me'),
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

                if (userRes.ok) {
                    const data = await userRes.json();
                    if (data.user) setUser(data.user);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Load cart from localStorage - only on client
        if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                try {
                    setCartItems(JSON.parse(savedCart));
                } catch (e) {
                    console.error('Error parsing cart:', e);
                }
            }
        }
    }, []);

    // Save cart to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined' && cartItems.length > 0) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    }, [cartItems]);

    const addToCart = (product: Product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setCartOpen(true);
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return;
        setCartItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const removeFromCart = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
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
            <Header
                cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                onCartClick={() => setCartOpen(true)}
                user={user}
            />

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
                                <h2 className="text-2xl font-bold text-secondary-800">تصفح الأقسام</h2>
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
                                    onAddToCart={addToCart}
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
