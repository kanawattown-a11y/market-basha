'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

interface PushNotificationButtonProps {
    className?: string;
}

// Firebase config from environment
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let messaging: Messaging | null = null;

function getFirebaseMessaging() {
    if (typeof window === 'undefined') return null;

    if (!firebaseConfig.apiKey) {
        console.warn('Firebase not configured');
        return null;
    }

    if (messaging) return messaging;

    try {
        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        messaging = getMessaging(app);
        return messaging;
    } catch (error) {
        console.error('Firebase init error:', error);
        return null;
    }
}

export default function PushNotificationButton({ className = '' }: PushNotificationButtonProps) {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if notifications are supported
        if ('Notification' in window && 'serviceWorker' in navigator) {
            setIsSupported(true);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        // Check if already subscribed
        if (Notification.permission === 'granted') {
            const fcmMessaging = getFirebaseMessaging();
            if (fcmMessaging) {
                try {
                    const token = await getToken(fcmMessaging, {
                        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                    });
                    setIsSubscribed(!!token);
                } catch {
                    setIsSubscribed(false);
                }
            }
        }
    };

    const subscribe = async () => {
        setLoading(true);
        try {
            // Request permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                alert('يرجى السماح بالإشعارات من إعدادات المتصفح');
                return;
            }

            // Register service worker for FCM
            await navigator.serviceWorker.register('/firebase-messaging-sw.js');

            // Get FCM token
            const fcmMessaging = getFirebaseMessaging();
            if (!fcmMessaging) {
                alert('Firebase غير مُعد');
                return;
            }

            const token = await getToken(fcmMessaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });

            if (!token) {
                alert('فشل الحصول على token');
                return;
            }

            // Send token to server
            const res = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            if (res.ok) {
                setIsSubscribed(true);

                // Listen for foreground messages
                onMessage(fcmMessaging, (payload) => {
                    console.log('Foreground message:', payload);
                    // Show notification manually for foreground
                    if (payload.notification) {
                        new Notification(payload.notification.title || 'إشعار جديد', {
                            body: payload.notification.body,
                            icon: '/icons/icon-192x192.png',
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error subscribing:', error);
            alert('حدث خطأ في تفعيل الإشعارات');
        } finally {
            setLoading(false);
        }
    };

    const unsubscribe = async () => {
        setLoading(true);
        try {
            const fcmMessaging = getFirebaseMessaging();
            if (fcmMessaging) {
                const token = await getToken(fcmMessaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                });

                if (token) {
                    await fetch(`/api/push/subscribe?token=${encodeURIComponent(token)}`, {
                        method: 'DELETE',
                    });
                }
            }
            setIsSubscribed(false);
        } catch (error) {
            console.error('Error unsubscribing:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isSupported) {
        return null;
    }

    return (
        <button
            onClick={isSubscribed ? unsubscribe : subscribe}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isSubscribed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${className}`}
            title={isSubscribed ? 'إلغاء الإشعارات' : 'تفعيل الإشعارات'}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : isSubscribed ? (
                <>
                    <Bell className="w-5 h-5" />
                    <span className="text-sm">الإشعارات مفعلة</span>
                </>
            ) : (
                <>
                    <BellOff className="w-5 h-5" />
                    <span className="text-sm">تفعيل الإشعارات</span>
                </>
            )}
        </button>
    );
}
