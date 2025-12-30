'use client';

import { useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

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
    if (isAndroidApp()) return null;

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

async function sendTokenToServer(token: string): Promise<boolean> {
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
}

// Auto-registration hook - registers notifications automatically when user is logged in
export function useAutoRegisterNotifications() {
    const registeredRef = useRef(false);

    useEffect(() => {
        if (registeredRef.current) return;

        const autoRegister = async () => {
            try {
                if (isAndroidApp()) {
                    // Android: Set up the receiver and let native handle it
                    window.receiveNativeFCMToken = async (token: string) => {
                        console.log('Auto-registering native FCM token');
                        await sendTokenToServer(token);
                    };

                    // Try to get existing token
                    if (window.AndroidBridge) {
                        const token = window.AndroidBridge.getFCMToken();
                        if (token) {
                            await sendTokenToServer(token);
                            registeredRef.current = true;
                        }
                    }
                } else if ('Notification' in window && 'serviceWorker' in navigator) {
                    // Web: Check if permission is already granted
                    if (Notification.permission === 'granted') {
                        const fcmMessaging = getFirebaseMessaging();
                        if (fcmMessaging) {
                            try {
                                // Register service worker first
                                await navigator.serviceWorker.register('/firebase-messaging-sw.js');

                                const token = await getToken(fcmMessaging, {
                                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                                });

                                if (token) {
                                    await sendTokenToServer(token);
                                    registeredRef.current = true;

                                    // Set up foreground listener
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
                            } catch (error) {
                                console.error('Auto-register error:', error);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Auto-registration failed:', error);
            }
        };

        // Delay to ensure user session is loaded
        const timer = setTimeout(autoRegister, 3000);
        return () => clearTimeout(timer);
    }, []);
}

// Component that auto-registers - add to layout
export default function NotificationAutoRegister() {
    useAutoRegisterNotifications();
    return null;
}
