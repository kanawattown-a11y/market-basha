'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface AdminHeaderProps {
    user: {
        id: string;
        name: string;
        email: string | null;
        role: string;
        avatar: string | null;
    };
}

interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications?limit=5', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications || []);
                    setUnreadCount(data.unreadCount || 0);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleOpenSidebar = () => {
        window.dispatchEvent(new CustomEvent('open-admin-sidebar'));
    };

    return (
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 sticky top-0 z-20">
            <div className="flex items-center justify-between gap-4">
                {/* Mobile Menu Button */}
                <button
                    onClick={handleOpenSidebar}
                    className="lg:hidden p-2 -mr-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6 text-gray-600" />
                </button>

                {/* Search */}
                <div className="hidden md:flex flex-1 max-w-md">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="بحث..."
                            className="w-full pr-10 pl-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>

                <div className="flex items-center gap-4 mr-auto lg:mr-0">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Bell className="w-6 h-6 text-gray-600" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowNotifications(false)}
                                />
                                <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="font-semibold text-secondary-800">الإشعارات</h3>
                                        {unreadCount > 0 && (
                                            <span className="text-xs text-primary">{unreadCount} جديد</span>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                لا توجد إشعارات
                                            </div>
                                        ) : (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-primary/5' : ''
                                                        }`}
                                                >
                                                    <p className="font-medium text-secondary-800">{notification.title}</p>
                                                    <p className="text-sm text-gray-500 line-clamp-2">{notification.message}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {formatRelativeTime(notification.createdAt)}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <a
                                        href="/admin/notifications"
                                        className="block p-3 text-center text-primary hover:bg-gray-50 transition-colors text-sm font-medium"
                                        onClick={() => setShowNotifications(false)}
                                    >
                                        عرض الكل
                                    </a>
                                </div>
                            </>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-3 pr-4 border-r border-gray-200">
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-semibold text-secondary-800">{user.name}</p>
                            <p className="text-xs text-gray-500">مدير النظام</p>
                        </div>
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold text-lg">
                                {user.name.charAt(0)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
