'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
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

// Check if running inside Android WebView
function isAndroidApp(): boolean {
    if (typeof window === 'undefined') return false;
    return window.navigator.userAgent.includes('MarketBashaApp');
}

// Android Bridge interface
declare global {
    interface Window {
        AndroidBridge?: {
            getFCMToken: () => string;
            requestNotificationPermission: () => void;
            isNotificationPermissionGranted: () => boolean;
        };
        receiveNativeFCMToken?: (token: string) => void;
    }
}

function getFirebaseMessaging() {
    if (typeof window === 'undefined') return null;
    if (isAndroidApp()) return null; // Don't use web FCM in Android app

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
    const toast = useToast();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);

    useEffect(() => {
        const android = isAndroidApp();
        setIsAndroid(android);

        if (android) {
            // Android native app
            setIsSupported(true);
            checkAndroidSubscription();

            // Listen for token from native app
            window.receiveNativeFCMToken = async (token: string) => {
                console.log('Received native FCM token:', token);
                await sendTokenToServer(token);
                setIsSubscribed(true);
            };
        } else if ('Notification' in window && 'serviceWorker' in navigator) {
            // Web browser
            setIsSupported(true);
            checkWebSubscription();
        }

        return () => {
            window.receiveNativeFCMToken = undefined;
        };
    }, []);

    const checkAndroidSubscription = () => {
        if (window.AndroidBridge) {
            const token = window.AndroidBridge.getFCMToken();
            setIsSubscribed(!!token);
        }
    };

    const checkWebSubscription = async () => {
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

    const sendTokenToServer = async (token: string) => {
        try {
            const res = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            return res.ok;
        } catch (error) {
            console.error('Error sending token to server:', error);
            return false;
        }
    };

    const subscribe = async () => {
        setLoading(true);
        try {
            if (isAndroid) {
                // Android: Request permission and get token via bridge
                if (window.AndroidBridge) {
                    window.AndroidBridge.requestNotificationPermission();
                    // Token will be sent via receiveNativeFCMToken callback
                }
            } else {
                // Web: Use Firebase JS SDK
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    toast.warning('يرجى السماح بالإشعارات من إعدادات المتصفح');
                    return;
                }

                await navigator.serviceWorker.register('/firebase-messaging-sw.js');

                const fcmMessaging = getFirebaseMessaging();
                if (!fcmMessaging) {
                    toast.error('Firebase غير مُعد');
                    return;
                }

                const token = await getToken(fcmMessaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                });

                if (!token) {
                    toast.error('فشل الحصول على token');
                    return;
                }

                const success = await sendTokenToServer(token);
                if (success) {
                    setIsSubscribed(true);

                    // Listen for foreground messages
                    onMessage(fcmMessaging, (payload) => {
                        console.log('Foreground message:', payload);
                        if (payload.notification) {
                            new Notification(payload.notification.title || 'إشعار جديد', {
                                body: payload.notification.body,
                                icon: '/icons/icon-192x192.png',
                            });
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error subscribing:', error);
            toast.error('حدث خطأ في تفعيل الإشعارات');
        } finally {
            setLoading(false);
        }
    };

    const unsubscribe = async () => {
        setLoading(true);
        try {
            if (isAndroid) {
                if (window.AndroidBridge) {
                    const token = window.AndroidBridge.getFCMToken();
                    if (token) {
                        await fetch(`/api/push/subscribe?token=${encodeURIComponent(token)}`, {
                            method: 'DELETE',
                        });
                    }
                }
            } else {
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
