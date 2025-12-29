'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, Menu, X, LogOut, Package, MapPin, Settings, LayoutDashboard, Truck, Ticket, Heart, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

interface HeaderProps {
    className?: string;
    onCartClick?: () => void;
}

export default function Header({ className, onCartClick }: HeaderProps) {
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Use cart context for real-time updates
    const { cartCount } = useCart();

    useEffect(() => {
        // Fetch user session
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch {
                // Not logged in
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
    };

    // Get menu items based on user role
    const getMenuItems = () => {
        if (!user) return [];

        // Admin
        if (user.role === 'ADMIN') {
            return [
                { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
                { href: '/admin/orders', label: 'الطلبات', icon: Package },
                { href: '/admin/users', label: 'المستخدمين', icon: User },
                { href: '/admin/settings', label: 'الإعدادات', icon: Settings },
            ];
        }

        // Operations
        if (user.role === 'OPERATIONS') {
            return [
                { href: '/operations', label: 'لوحة العمليات', icon: LayoutDashboard },
                { href: '/operations/orders', label: 'الطلبات', icon: Package },
            ];
        }

        // Driver
        if (user.role === 'DRIVER') {
            return [
                { href: '/driver', label: 'طلبات التوصيل', icon: Truck },
            ];
        }

        // Regular User
        return [
            { href: '/account', label: 'حسابي', icon: User },
            { href: '/account/orders', label: 'طلباتي', icon: Package },
            { href: '/account/addresses', label: 'عناويني', icon: MapPin },
            { href: '/support', label: 'الدعم', icon: Ticket },
            { href: '/favorites', label: 'المفضلة', icon: Heart },
            { href: '/account/settings', label: 'الإعدادات', icon: Settings },
        ];
    };

    const menuItems = getMenuItems();

    return (
        <header className={cn("bg-white border-b border-gray-200 sticky top-0 z-40", className)}>
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo & Nav (Right Side) */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 shrink-0 group">
                            <div className="w-10 h-10 md:w-12 md:h-12 relative transition-transform duration-300 group-hover:scale-105">
                                <img src="/logo.svg" alt="ماركت باشا" className="w-full h-full object-contain" />
                            </div>
                            <span className="font-black text-secondary-900 hidden lg:block text-xl tracking-tight group-hover:text-primary transition-colors">ماركت باشا</span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-6">
                            <Link href="/" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors">الرئيسية</Link>
                            <Link href="/products" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors">المنتجات</Link>
                            <Link href="/categories" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors">المتاجر</Link>
                            <Link href="/offers" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors">العروض</Link>
                        </nav>
                    </div>

                    {/* Search - Center */}
                    <div className="hidden md:flex flex-1 max-w-sm mx-4">
                        <form action="/products" className="w-full relative group">
                            <input
                                type="text"
                                name="search"
                                placeholder="ابحث عن..."
                                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                <Search className="w-4 h-4" />
                            </div>
                        </form>
                    </div>

                    {/* Actions - Left Side */}
                    <div className="flex items-center gap-2 xl:gap-3">
                        {/* Additional Links for large screens */}
                        <div className="hidden xl:flex items-center gap-2 border-l border-gray-200 pl-3 ml-1">
                            <Link href="/support" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary transition-colors" title="الدعم">
                                <Ticket className="w-5 h-5" />
                            </Link>
                        </div>

                        {/* Cart */}
                        {(!user || user.role === 'USER') && (
                            onCartClick ? (
                                <button onClick={onCartClick} className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all group">
                                    <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-primary transition-colors" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-secondary-900 text-xs font-bold rounded-full flex items-center justify-center shadow-sm animate-bounce-in">
                                            {cartCount > 9 ? '9+' : cartCount}
                                        </span>
                                    )}
                                </button>
                            ) : (
                                <Link href="/checkout" className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all group">
                                    <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-primary transition-colors" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-secondary-900 text-xs font-bold rounded-full flex items-center justify-center shadow-sm animate-bounce-in">
                                            {cartCount > 9 ? '9+' : cartCount}
                                        </span>
                                    )}
                                </Link>
                            )
                        )}

                        {/* User */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 p-1.5 pr-2 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-full transition-all"
                                >
                                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className="hidden sm:block text-sm font-bold text-secondary-800 max-w-[100px] truncate">{user.name}</span>
                                    <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                                </button>

                                {showUserMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                        <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-56 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-4 py-2 border-b border-gray-50 mb-1 bg-gray-50/50">
                                                <p className="font-bold text-secondary-900 truncate">{user.name}</p>
                                                <p className="text-xs text-secondary-500">مرحباً بك 👋</p>
                                            </div>
                                            {menuItems.map((item) => (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <item.icon className="w-4 h-4" />
                                                    {item.label}
                                                </Link>
                                            ))}
                                            <hr className="my-2 border-gray-100" />
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 w-full hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                تسجيل الخروج
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="btn btn-primary btn-sm px-5 py-2 h-auto rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hidden sm:flex">
                                تسجيل الدخول
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden mt-3 pb-1">
                    <form action="/products" className="relative group">
                        <input
                            type="text"
                            name="search"
                            placeholder="ابحث عن منتج..."
                            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                            <Search className="w-4 h-4" />
                        </div>
                    </form>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div className="lg:hidden border-t border-gray-100 bg-white absolute w-full shadow-xl rounded-b-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <nav className="p-4 space-y-1">
                        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium" onClick={() => setShowMobileMenu(false)}>
                            الرئيسية
                        </Link>
                        <Link href="/products" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium" onClick={() => setShowMobileMenu(false)}>
                            المنتجات
                        </Link>
                        <Link href="/categories" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium" onClick={() => setShowMobileMenu(false)}>
                            المتاجر
                        </Link>
                        <Link href="/offers" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium" onClick={() => setShowMobileMenu(false)}>
                            العروض
                        </Link>
                        <Link href="/support" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium" onClick={() => setShowMobileMenu(false)}>
                            الدعم
                        </Link>
                        {!user && (
                            <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary font-bold bg-primary/5 mt-2" onClick={() => setShowMobileMenu(false)}>
                                <User className="w-5 h-5" />
                                تسجيل الدخول
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
