'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Package, MapPin, XCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    data?: Record<string, unknown>;
}

export default function DriverNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
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
        const interval = setInterval(fetchNotifications, 10000); // كل 10 ثواني للسائق
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [id], isRead: true }),
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'DRIVER_ASSIGNED':
                return <Package className="w-5 h-5 text-green-600" />;
            case 'ORDER_CANCELLED':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'ADDRESS_UPDATED':
                return <MapPin className="w-5 h-5 text-blue-600" />;
            default:
                return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const getOrderLink = (notification: Notification) => {
        if (notification.data?.orderId) {
            return `/driver/orders/${notification.data.orderId}`;
        }
        return null;
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="spinner mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-800">الإشعارات</h1>
                    <p className="text-gray-500">
                        {unreadCount > 0 ? `${unreadCount} إشعار جديد` : 'لا توجد إشعارات جديدة'}
                    </p>
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className="card p-12 text-center">
                    <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">لا توجد إشعارات</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => {
                        const orderLink = getOrderLink(notification);
                        const NotificationContent = (
                            <div
                                className={`card p-4 transition-all ${notification.isRead ? 'bg-white' : 'bg-primary/5 border-primary/20'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.isRead ? 'bg-gray-100' : 'bg-primary/10'
                                            }`}
                                    >
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-secondary-800">
                                                    {notification.title}
                                                </h3>
                                                <p className="text-gray-600 mt-1">{notification.message}</p>
                                                <p className="text-sm text-gray-400 mt-2">
                                                    {formatDateTime(notification.createdAt)}
                                                </p>
                                            </div>

                                            {!notification.isRead && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        markAsRead(notification.id);
                                                    }}
                                                    className="text-primary hover:text-primary-dark transition-colors"
                                                    title="تحديد كمقروء"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );

                        return orderLink ? (
                            <Link
                                key={notification.id}
                                href={orderLink}
                                onClick={() => !notification.isRead && markAsRead(notification.id)}
                            >
                                {NotificationContent}
                            </Link>
                        ) : (
                            <div key={notification.id}>{NotificationContent}</div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
