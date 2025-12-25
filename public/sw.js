self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'ELUXRAJ Alert';
    const options = {
        body: data.body || 'You have a new alert',
        icon: data.icon || '/icon-192.png',
        badge: data.badge || '/badge-72.png',
        data: { url: data.url || '/dashboard.html' },
        requireInteraction: true,
        actions: [
            { action: 'open', title: 'View' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    if (event.action === 'dismiss') return;
    event.waitUntil(clients.openWindow(event.notification.data.url || '/dashboard.html'));
});
