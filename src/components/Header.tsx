'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, Menu, X, LogOut, Package, MapPin, Settings, LayoutDashboard, Truck, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
    className?: string;
}

export default function Header({ className }: HeaderProps) {
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);
    const [cartCount, setCartCount] = useState(0);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

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

        // Get cart count
        const updateCartCount = () => {
            if (typeof window !== 'undefined') {
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                    try {
                        const cart = JSON.parse(savedCart);
                        setCartCount(cart.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0));
                    } catch {
                        setCartCount(0);
                    }
                }
            }
        };

        fetchUser();
        updateCartCount();

        // Listen for cart updates
        window.addEventListener('storage', updateCartCount);
        return () => window.removeEventListener('storage', updateCartCount);
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
            { href: '/account/settings', label: 'الإعدادات', icon: Settings },
        ];
    };

    const menuItems = getMenuItems();

    return (
        <header className={cn("bg-white border-b border-gray-200 sticky top-0 z-30", className)}>
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <span className="text-secondary font-bold text-xl">م</span>
                        </div>
                        <span className="font-bold text-secondary-800 hidden sm:block">ماركت باشا</span>
                    </Link>

                    {/* Search - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-md">
                        <form action="/products" className="w-full relative">
                            <input
                                type="text"
                                name="search"
                                placeholder="ابحث عن منتج..."
                                className="w-full pr-10 pl-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </form>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Cart - Only for regular users */}
                        {(!user || user.role === 'USER') && (
                            <Link href="/checkout" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ShoppingCart className="w-6 h-6 text-gray-600" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-secondary text-xs font-bold rounded-full flex items-center justify-center">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* User */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                        <span className="text-primary font-bold text-sm">{user.name.charAt(0)}</span>
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-secondary-800">{user.name}</span>
                                </button>

                                {showUserMenu && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                                        <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-48 z-20">
                                            {menuItems.map((item) => (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className="dropdown-item flex items-center gap-2"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <item.icon className="w-4 h-4" />
                                                    {item.label}
                                                </Link>
                                            ))}
                                            <hr className="my-2" />
                                            <button
                                                onClick={handleLogout}
                                                className="dropdown-item flex items-center gap-2 text-red-500 w-full"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                تسجيل الخروج
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="btn btn-primary btn-sm">
                                تسجيل الدخول
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                        >
                            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden mt-3">
                    <form action="/products" className="relative">
                        <input
                            type="text"
                            name="search"
                            placeholder="ابحث عن منتج..."
                            className="w-full pr-10 pl-4 py-2 rounded-xl border border-gray-200 focus:border-primary outline-none"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </form>
                </div>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <nav className="container mx-auto px-4 py-4 space-y-2">
                        <Link href="/products" className="block py-2 text-gray-600 hover:text-primary">
                            المنتجات
                        </Link>
                        <Link href="/support" className="block py-2 text-gray-600 hover:text-primary">
                            الدعم
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
