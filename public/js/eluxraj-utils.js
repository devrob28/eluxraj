/**
 * ELUXRAJ Utilities - Production Ready
 * Core utilities for API, Auth, and Formatting
 */

const API_BASE = 'https://eluxraj-api-production.up.railway.app/api/v1';

// ============== API UTILITIES ==============
const API = {
    async get(endpoint) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        
        try {
            const res = await fetch(API_BASE + endpoint, { headers });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.detail || data.message || 'Request failed');
            }
            return data;
        } catch (err) {
            console.error('API GET error:', endpoint, err);
            throw err;
        }
    },
    
    async post(endpoint, body, isFormData = false) {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) headers['Authorization'] = 'Bearer ' + token;
        if (!isFormData) headers['Content-Type'] = 'application/json';
        
        try {
            const res = await fetch(API_BASE + endpoint, {
                method: 'POST',
                headers,
                body: isFormData ? body : JSON.stringify(body)
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.detail || data.message || 'Request failed');
            }
            return data;
        } catch (err) {
            console.error('API POST error:', endpoint, err);
            throw err;
        }
    },
    
    async patch(endpoint, body) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        
        try {
            const res = await fetch(API_BASE + endpoint, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(body)
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.detail || data.message || 'Request failed');
            }
            return data;
        } catch (err) {
            console.error('API PATCH error:', endpoint, err);
            throw err;
        }
    },
    
    async delete(endpoint) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        
        try {
            const res = await fetch(API_BASE + endpoint, { method: 'DELETE', headers });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Delete failed');
            }
            return true;
        } catch (err) {
            console.error('API DELETE error:', endpoint, err);
            throw err;
        }
    }
};

// ============== AUTH UTILITIES ==============
const Auth = {
    async check() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return null;
        }
        
        try {
            const user = await API.get('/auth/me');
            return user;
        } catch (err) {
            console.error('Auth check failed:', err);
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return null;
        }
    },
    
    async login(email, password) {
        const res = await fetch(API_BASE + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.detail || 'Login failed');
        }
        
        localStorage.setItem('token', data.access_token);
        return data;
    },
    
    logout() {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    },
    
    getToken() {
        return localStorage.getItem('token');
    },
    
    isLoggedIn() {
        return !!localStorage.getItem('token');
    }
};

// ============== FORMAT UTILITIES ==============
const Format = {
    currency(value, decimals = 2) {
        if (value === null || value === undefined || isNaN(value)) return '$--';
        const num = parseFloat(value);
        if (num >= 1000000000) return '$' + (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return '$' + num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        if (num >= 1) return '$' + num.toFixed(decimals);
        if (num >= 0.01) return '$' + num.toFixed(4);
        return '$' + num.toFixed(6);
    },
    
    percent(value, decimals = 2) {
        if (value === null || value === undefined || isNaN(value)) return '--%';
        const num = parseFloat(value);
        const sign = num >= 0 ? '+' : '';
        return sign + num.toFixed(decimals) + '%';
    },
    
    number(value, decimals = 0) {
        if (value === null || value === undefined || isNaN(value)) return '--';
        return parseFloat(value).toLocaleString('en-US', { 
            minimumFractionDigits: decimals, 
            maximumFractionDigits: decimals 
        });
    },
    
    compact(value) {
        if (value === null || value === undefined || isNaN(value)) return '--';
        const num = parseFloat(value);
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toFixed(0);
    },
    
    date(dateStr) {
        if (!dateStr) return '--';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },
    
    time(dateStr) {
        if (!dateStr) return '--';
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    },
    
    timeAgo(dateStr) {
        if (!dateStr) return '--';
        const now = new Date();
        const past = new Date(dateStr);
        const diff = Math.floor((now - past) / 1000);
        
        if (diff < 60) return diff + 's ago';
        if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
        return Math.floor(diff / 86400) + 'd ago';
    }
};

// ============== TOAST NOTIFICATIONS ==============
const Toast = {
    container: null,
    
    init() {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
        document.body.appendChild(this.container);
    },
    
    show(message, type = 'info', duration = 4000) {
        this.init();
        
        const colors = {
            success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#34d399', icon: '✓' },
            error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#f87171', icon: '✕' },
            warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24', icon: '⚠' },
            info: { bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)', text: '#a78bfa', icon: 'ℹ' }
        };
        
        const c = colors[type] || colors.info;
        const toast = document.createElement('div');
        toast.style.cssText = 'background:' + c.bg + ';border:1px solid ' + c.border + ';color:' + c.text + ';padding:14px 18px;border-radius:10px;font-size:14px;font-weight:500;display:flex;align-items:center;gap:10px;animation:slideIn 0.3s ease;max-width:350px;backdrop-filter:blur(10px);';
        toast.innerHTML = '<span style="font-size:16px">' + c.icon + '</span><span>' + message + '</span>';
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    warning(msg) { this.show(msg, 'warning'); },
    info(msg) { this.show(msg, 'info'); }
};

// Add toast animations
const style = document.createElement('style');
style.textContent = '@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}';
document.head.appendChild(style);

// ============== LOADING STATES ==============
const Loading = {
    show(element, height = '100px') {
        if (!element) return;
        element.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:' + height + '"><div style="width:30px;height:30px;border:3px solid rgba(124,58,237,0.2);border-top-color:#7c3aed;border-radius:50%;animation:spin 1s linear infinite"></div></div>';
    },
    
    skeleton(element, height = '100px') {
        if (!element) return;
        element.innerHTML = '<div style="background:linear-gradient(90deg,#12121a 25%,rgba(124,58,237,0.1) 50%,#12121a 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px;height:' + height + '"></div>';
    }
};

// Add loading animation
const loadStyle = document.createElement('style');
loadStyle.textContent = '@keyframes spin{to{transform:rotate(360deg)}}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}';
document.head.appendChild(loadStyle);

// ============== UTILITY HELPERS ==============
const Utils = {
    debounce(fn, delay = 300) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), delay);
        };
    },
    
    throttle(fn, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            Toast.success('Copied to clipboard');
        }).catch(() => {
            Toast.error('Failed to copy');
        });
    },
    
    getQueryParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// ============== EXPORT FOR GLOBAL USE ==============
window.API = API;
window.Auth = Auth;
window.Format = Format;
window.Toast = Toast;
window.Loading = Loading;
window.Utils = Utils;

console.log('ELUXRAJ Utils loaded v1.0.0');
