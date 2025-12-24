// Service Worker for Push Notifications
self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();

        const options = {
            body: data.body,
            icon: data.icon || '/icons/icon-192x192.png',
            badge: data.badge || '/icons/badge-72x72.png',
            vibrate: [100, 50, 100],
            data: data.data || {},
            dir: 'rtl',
            lang: 'ar',
            actions: data.actions || [],
            tag: data.tag || 'default',
            renotify: true,
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const data = event.notification.data;
    let url = '/';

    // Navigate based on notification type
    if (data.orderId) {
        url = `/orders/${data.orderId}`;
    } else if (data.ticketId) {
        url = `/support/tickets/${data.ticketId}`;
    } else if (data.productId) {
        url = `/products/${data.productId}`;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(function (clientList) {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// Cache strategy for offline support
const CACHE_NAME = 'market-basha-v1';
const urlsToCache = [
    '/',
    '/offline',
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) {
                return response;
            }
            return fetch(event.request).catch(function () {
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline');
                }
            });
        })
    );
});
