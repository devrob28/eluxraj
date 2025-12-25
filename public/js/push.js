const VAPID_PUBLIC_KEY = 'BHPbiLK1eFh6wtoGKBhH4R4H4CTGuwWVOeCUc_UHc4xJSTi5OHq9UehJ19OZd0Yy-FmnEnmzI_tXowQF56qhwx0';
const API = 'https://eluxraj-api-production.up.railway.app/api/v1';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push not supported');
        return false;
    }
    
    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
        
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return false;
        }
        
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
        
        const token = localStorage.getItem('token');
        if (!token) return false;
        
        const response = await fetch(`${API}/push/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
                    auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
                }
            })
        });
        
        if (response.ok) {
            console.log('Push subscription saved');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Push subscription error:', error);
        return false;
    }
}

async function unsubscribeFromPush() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
        await subscription.unsubscribe();
        const token = localStorage.getItem('token');
        if (token) {
            await fetch(`${API}/push/unsubscribe`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
    }
}

// Auto-subscribe on page load if logged in
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('token') && Notification.permission === 'default') {
        setTimeout(() => subscribeToPush(), 3000);
    }
});
