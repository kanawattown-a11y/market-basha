'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Truck,
    Package,
    LogOut,
    ChevronRight,
    X,
    Menu,
    CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DriverSidebarProps {
    user: {
        id: string;
        name: string;
        email: string | null;
        role: string;
        avatar: string | null;
    };
}

const menuItems = [
    { href: '/driver', label: 'الطلبات الجاهزة', icon: Package },
    { href: '/driver/active', label: 'التوصيلات النشطة', icon: Truck },
    { href: '/driver/completed', label: 'الطلبات المكتملة', icon: CheckCircle },
];

export default function DriverSidebar({ user }: DriverSidebarProps) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    };

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="p-4 border-b border-gray-700">
                <Link href="/driver" className="flex items-center gap-3">
                    <div className="w-10 h-10 relative">
                        <img src="/logo.svg" alt="ماركت باشا" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <span className="font-bold text-white text-lg">ماركت باشا</span>
                        <span className="block text-xs text-gray-400">لوحة السائق</span>
                    </div>
                </Link>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-green-400 font-bold">
                            {user.name.charAt(0)}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-400">سائق توصيل</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
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
        </>
    );

    return (
        <>
            {/* Mobile Header with Toggle */}
            <div className="lg:hidden fixed top-0 right-0 left-0 z-40 bg-secondary-800 px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 text-white hover:bg-gray-700 rounded-lg"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <span className="text-white font-bold">لوحة السائق</span>
                <div className="w-10"></div>
            </div>

            {/* Mobile Sidebar */}
            <div className={cn(
                "lg:hidden fixed inset-0 z-50 transition-all duration-300",
                isMobileOpen ? "visible" : "invisible"
            )}>
                <div
                    className={cn(
                        "absolute inset-0 bg-black/50 transition-opacity",
                        isMobileOpen ? "opacity-100" : "opacity-0"
                    )}
                    onClick={() => setIsMobileOpen(false)}
                />
                <div className={cn(
                    "absolute right-0 top-0 h-full w-72 bg-secondary-800 transform transition-transform duration-300",
                    isMobileOpen ? "translate-x-0" : "translate-x-full"
                )}>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="h-full flex flex-col">
                        <SidebarContent />
                    </div>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex fixed right-0 top-0 h-screen w-64 bg-secondary-800 flex-col z-30">
                <SidebarContent />
            </aside>
        </>
    );
}
