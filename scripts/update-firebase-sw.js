// Script to update firebase-messaging-sw.js with values from .env
// Run this script during build: node scripts/update-firebase-sw.js

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
};

const swContent = `// Firebase Cloud Messaging Service Worker
// Auto-generated - DO NOT EDIT MANUALLY

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp(${JSON.stringify(firebaseConfig, null, 4)});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'إشعار جديد';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: payload.notification?.icon || '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        dir: 'rtl',
        lang: 'ar',
        data: payload.data || {},
        vibrate: [100, 50, 100],
        tag: payload.data?.tag || 'default',
        renotify: true,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const data = event.notification.data || {};
    let url = '/';

    // Navigate based on notification type
    if (data.orderId) {
        url = data.userRole === 'DRIVER'
            ? \`/driver/orders/\${data.orderId}\`
            : data.userRole === 'OPERATIONS'
                ? \`/operations/orders/\${data.orderId}\`
                : \`/account/orders/\${data.orderId}\`;
    } else if (data.ticketId) {
        url = '/account/tickets';
    } else if (data.productId) {
        url = '/operations/products';
    } else if (data.userId) {
        url = \`/admin/users/\${data.userId}\`;
    } else if (data.clickAction) {
        url = data.clickAction;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(url) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
`;

const outputPath = path.join(__dirname, '..', 'public', 'firebase-messaging-sw.js');
fs.writeFileSync(outputPath, swContent, 'utf8');

console.log('✅ firebase-messaging-sw.js updated successfully!');
console.log('Firebase Config:', firebaseConfig.projectId ? 'Configured' : '⚠️ Missing values');
