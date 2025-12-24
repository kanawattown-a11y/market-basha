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
    ChevronDown
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
        setCurrentSlide((prev) => (prev + 1) % offers.length);
    }, [offers.length]);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + offers.length) % offers.length);
    };

    useEffect(() => {
        if (offers.length <= 1) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [offers.length, nextSlide]);

    if (offers.length === 0) {
        return (
            <div className="relative h-[400px] md:h-[500px] bg-gradient-to-br from-primary via-primary-400 to-primary-600 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-secondary">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">ماركت باشا</h1>
                        <p className="text-xl md:text-2xl opacity-80">تسوق بسهولة وراحة</p>
                    </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
            </div>
        );
    }

    return (
        <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden group">
            <div
                className="flex h-full transition-transform duration-700 ease-out"
                style={{ transform: `translateX(${currentSlide * 100}%)` }}
            >
                {offers.map((offer) => (
                    <div
                        key={offer.id}
                        className="min-w-full h-full relative bg-gradient-to-br from-primary via-primary-400 to-primary-600"
                    >
                        {offer.image && (
                            <Image
                                src={offer.image}
                                alt={offer.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 right-0 p-8 md:p-12 max-w-xl">
                            <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                                {offer.discountType === 'percentage' ? `خصم ${offer.discountValue}%` : `خصم ${formatCurrency(Number(offer.discountValue))}`}
                            </span>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{offer.title}</h2>
                            {offer.description && (
                                <p className="text-white/80 text-lg mb-6">{offer.description}</p>
                            )}
                            <Link href={`/offers/${offer.id}`} className="btn btn-primary btn-lg">
                                تسوق الآن
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {offers.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {offers.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={cn(
                                    "w-3 h-3 rounded-full transition-all",
                                    index === currentSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/70"
                                )}
                            />
                        ))}
                    </div>
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

    return (
        <div className="card group">
            <div className="relative aspect-square overflow-hidden bg-gray-100">
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
                    <span className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        -{discount}%
                    </span>
                )}

                {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold">
                            نفذت الكمية
                        </span>
                    </div>
                )}

                <button className="absolute top-3 left-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                    <Heart className="w-5 h-5" />
                </button>
            </div>

            <div className="p-4">
                <span className="text-xs text-primary font-medium">{product.category.name}</span>
                <h3 className="font-semibold text-secondary-800 mt-1 line-clamp-2 h-12">
                    {product.name}
                </h3>

                <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-primary">{formatCurrency(Number(product.price))}</span>
                    {product.compareAtPrice && (
                        <span className="text-sm text-gray-400 line-through">
                            {formatCurrency(Number(product.compareAtPrice))}
                        </span>
                    )}
                </div>

                <span className="text-xs text-gray-500">/ {product.unit}</span>

                <button
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock <= 0}
                    className="w-full btn btn-primary btn-sm mt-4"
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
            className="card p-4 text-center group hover:border-primary"
        >
            <div className="relative w-20 h-20 mx-auto mb-3 rounded-2xl bg-primary/10 overflow-hidden group-hover:bg-primary/20 transition-colors">
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
            <h3 className="font-semibold text-secondary-800">{category.name}</h3>
            <span className="text-sm text-gray-500">{category._count.products} منتج</span>
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
                <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
            )}
            <div className={cn(
                "fixed top-0 left-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 shadow-2xl",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-xl font-bold text-secondary-800">سلة التسوق</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {items.length === 0 ? (
                            <div className="text-center py-12">
                                <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">السلة فارغة</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 bg-gray-50 rounded-xl p-3">
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Package className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-secondary-800 line-clamp-1">{item.name}</h4>
                                            <p className="text-primary font-bold">{formatCurrency(Number(item.price))}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="w-8 h-8 rounded-full bg-white border flex items-center justify-center hover:bg-primary hover:text-secondary hover:border-primary disabled:opacity-50"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.stock}
                                                    className="w-8 h-8 rounded-full bg-white border flex items-center justify-center hover:bg-primary hover:text-secondary hover:border-primary disabled:opacity-50"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onRemove(item.id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-full h-fit"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {items.length > 0 && (
                        <div className="p-4 border-t bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-600">المجموع</span>
                                <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
                            </div>
                            <Link href="/checkout" className="btn btn-primary w-full btn-lg" onClick={onClose}>
                                إتمام الطلب
                            </Link>
                        </div>
                    )}
                </div>
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

    return (
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg border-b border-gray-100">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <span className="text-secondary font-bold text-xl">م</span>
                        </div>
                        <span className="text-xl font-bold text-secondary-800 hidden sm:block">ماركت باشا</span>
                    </Link>

                    {/* Search - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-8">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="ابحث عن منتجات..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="input pr-12"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onCartClick}
                            className="relative p-2 hover:bg-gray-100 rounded-full"
                        >
                            <ShoppingCart className="w-6 h-6 text-secondary-700" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-secondary text-xs font-bold rounded-full flex items-center justify-center">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </button>

                        {user ? (
                            <Link
                                href={
                                    user.role === 'ADMIN' ? '/admin' :
                                        user.role === 'OPERATIONS' ? '/operations' :
                                            user.role === 'DRIVER' ? '/driver' :
                                                '/account'
                                }
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full"
                            >
                                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <span className="hidden sm:block text-sm font-medium text-secondary-700">{user.name}</span>
                            </Link>
                        ) : (
                            <Link href="/login" className="btn btn-primary btn-sm">
                                تسجيل الدخول
                            </Link>
                        )}

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 hover:bg-gray-100 rounded-full"
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
                            className="input pr-12"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-[120px] bg-white z-40 p-4">
                    <nav className="space-y-2">
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
                        <Link href="/support" className="sidebar-link" onClick={() => setMobileMenuOpen(false)}>
                            الدعم
                        </Link>
                    </nav>
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
