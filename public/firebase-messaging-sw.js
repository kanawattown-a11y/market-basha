// Firebase Cloud Messaging Service Worker

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase config - سيتم تحديثها من البيئة
firebase.initializeApp({
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
});

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
            ? `/driver/orders/${data.orderId}`
            : data.userRole === 'OPERATIONS'
                ? `/operations/orders/${data.orderId}`
                : `/account/orders/${data.orderId}`;
    } else if (data.ticketId) {
        url = `/account/tickets`;
    } else if (data.productId) {
        url = `/operations/products`;
    } else if (data.userId) {
        url = `/admin/users/${data.userId}`;
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
