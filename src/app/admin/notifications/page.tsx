'use client';

import { useState, useEffect } from 'react';
import { formatRelativeTime } from '@/lib/utils';
import { Bell, Check, Package, ShoppingCart, User, Ticket as TicketIcon } from 'lucide-react';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications?limit=50');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAllAsRead = async () => {
        setMarking(true);
        try {
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        } finally {
            setMarking(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationIds: [id] }),
            });
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'ORDER_STATUS': return ShoppingCart;
            case 'NEW_ORDER': return Package;
            case 'NEW_USER': return User;
            case 'TICKET_UPDATE': return TicketIcon;
            case 'LOW_STOCK': return Package;
            default: return Bell;
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'ORDER_STATUS': return 'bg-blue-100 text-blue-600';
            case 'NEW_ORDER': return 'bg-green-100 text-green-600';
            case 'NEW_USER': return 'bg-purple-100 text-purple-600';
            case 'LOW_STOCK': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="spinner mx-auto"></div>
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-800">الإشعارات</h1>
                    <p className="text-gray-500">
                        جميع الإشعارات والتنبيهات
                        {unreadCount > 0 && (
                            <span className="text-primary mr-2">({unreadCount} غير مقروءة)</span>
                        )}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        disabled={marking}
                        className="btn btn-outline btn-sm"
                    >
                        {marking ? (
                            <div className="spinner w-4 h-4"></div>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                تعيين الكل كمقروء
                            </>
                        )}
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="card p-12 text-center">
                    <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">لا توجد إشعارات</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => {
                        const Icon = getIcon(notification.type);
                        return (
                            <div
                                key={notification.id}
                                className={`card p-4 flex items-start gap-4 cursor-pointer hover:shadow-md transition-shadow ${!notification.isRead ? 'bg-primary/5 border-primary/20' : ''}`}
                                onClick={() => !notification.isRead && markAsRead(notification.id)}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconColor(notification.type)}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-semibold text-secondary-800">{notification.title}</h3>
                                            <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                                        </div>
                                        {!notification.isRead && (
                                            <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2"></span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {formatRelativeTime(notification.createdAt)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
