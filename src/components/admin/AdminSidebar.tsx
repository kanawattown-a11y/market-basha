'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    Tag,
    Ticket,
    MapPin,
    Settings,
    BarChart3,
    Bell,
    LogOut,
    ChevronRight,
    X,
    Gift,
    Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface AdminSidebarProps {
    user: {
        id: string;
        name: string;
        email: string | null;
        role: string;
        avatar: string | null;
    };
}

const menuItems = [
    { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
    { href: '/admin/users', label: 'المستخدمين', icon: Users },
    { href: '/admin/products', label: 'المنتجات', icon: Package },
    { href: '/admin/categories', label: 'المتاجر', icon: Tag },
    { href: '/admin/orders', label: 'الطلبات', icon: ShoppingCart },
    { href: '/admin/reviews', label: 'التقييمات', icon: Star },
    { href: '/admin/offers', label: 'العروض', icon: Gift },
    { href: '/admin/tickets', label: 'التذاكر', icon: Ticket },
    { href: '/admin/areas', label: 'مناطق التخديم', icon: MapPin },
    { href: '/admin/financials', label: 'التقارير المالية', icon: BarChart3 },
    { href: '/admin/stores/financials', label: 'أرباح المتاجر', icon: BarChart3 },
    { href: '/admin/audit', label: 'سجل العمليات', icon: BarChart3 },
    { href: '/admin/notifications', label: 'الإشعارات', icon: Bell },
    { href: '/admin/settings', label: 'الإعدادات', icon: Settings },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Only render dynamic content after mount to avoid hydration issues
    useEffect(() => {
        setMounted(true);
    }, []);

    // Listen for custom event to open sidebar from header
    useEffect(() => {
        const handleOpenSidebar = () => setIsMobileOpen(true);
        window.addEventListener('open-admin-sidebar', handleOpenSidebar);
        return () => window.removeEventListener('open-admin-sidebar', handleOpenSidebar);
    }, []);

    // Close sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    };

    const closeSidebar = () => setIsMobileOpen(false);

    return (
        <>
            {/* Mobile Overlay and Sidebar - Only render on client */}
            {mounted && (
                <div className={cn(
                    "lg:hidden fixed inset-0 z-50 transition-all duration-300",
                    isMobileOpen ? "visible" : "invisible pointer-events-none"
                )}>
                    <div
                        className={cn(
                            "absolute inset-0 bg-black/50 transition-opacity",
                            isMobileOpen ? "opacity-100" : "opacity-0"
                        )}
                        onClick={closeSidebar}
                    />
                    <div className={cn(
                        "absolute right-0 top-0 h-full w-72 bg-secondary-800 transform transition-transform duration-300 flex flex-col",
                        isMobileOpen ? "translate-x-0" : "translate-x-full"
                    )}>
                        <button
                            onClick={closeSidebar}
                            className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Logo */}
                        <div className="p-4 border-b border-gray-700">
                            <Link href="/admin" className="flex items-center gap-3" onClick={closeSidebar}>
                                <div className="relative w-10 h-10 flex-shrink-0">
                                    <Image src="/logo.svg" alt="Market Basha" fill className="object-contain" />
                                </div>
                                <div>
                                    <span className="font-bold text-white text-lg">ماركت باشا</span>
                                    <span className="block text-xs text-gray-400">لوحة الإدارة</span>
                                </div>
                            </Link>
                        </div>

                        {/* User Info */}
                        <div className="p-4 border-b border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                    <span className="text-primary font-bold">
                                        {user.name.charAt(0)}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white truncate">{user.name}</p>
                                    <p className="text-xs text-gray-400">مدير النظام</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={closeSidebar}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                            isActive
                                                ? "bg-primary text-secondary font-semibold"
                                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Logout */}
                        <div className="p-4 border-t border-gray-700">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>تسجيل الخروج</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex fixed right-0 top-0 h-screen w-64 bg-secondary-800 flex-col z-30">
                {/* Logo */}
                <div className="p-4 border-b border-gray-700">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="relative w-10 h-10 flex-shrink-0">
                            <Image src="/logo.svg" alt="Market Basha" fill className="object-contain" />
                        </div>
                        <div>
                            <span className="font-bold text-white text-lg">ماركت باشا</span>
                            <span className="block text-xs text-gray-400">لوحة الإدارة</span>
                        </div>
                    </Link>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold">
                                {user.name.charAt(0)}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-400">مدير النظام</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-secondary font-semibold"
                                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                                {isActive && <ChevronRight className="w-4 h-4 mr-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
