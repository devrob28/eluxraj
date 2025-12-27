/**
 * ELUXRAJ Auth Utility
 * Handles token management and 401 errors globally
 */

const AUTH = {
    API: 'https://eluxraj-api-production.up.railway.app/api/v1',
    
    getToken() {
        return localStorage.getItem('token');
    },
    
    setToken(token) {
        localStorage.setItem('token', token);
    },
    
    clearToken() {
        localStorage.removeItem('token');
    },
    
    // Redirect to login with optional message
    redirectToLogin(message = '') {
        this.clearToken();
        const params = message ? `?msg=${encodeURIComponent(message)}` : '';
        window.location.href = `/login.html${params}`;
    },
    
    // Check if logged in, redirect if not
    requireAuth() {
        if (!this.getToken()) {
            this.redirectToLogin('Please log in to continue');
            return false;
        }
        return true;
    },
    
    // Wrapper for fetch that handles 401 automatically
    async fetch(url, options = {}) {
        const token = this.getToken();
        
        if (!options.headers) options.headers = {};
        if (token) options.headers['Authorization'] = `Bearer ${token}`;
        
        try {
            const response = await fetch(url, options);
            
            // Handle 401 - token expired or invalid
            if (response.status === 401) {
                const data = await response.json().catch(() => ({}));
                const msg = data.detail || 'Session expired';
                this.redirectToLogin(msg);
                throw new Error('AUTH_REDIRECT');
            }
            
            return response;
        } catch (error) {
            if (error.message === 'AUTH_REDIRECT') throw error;
            throw error;
        }
    },
    
    // Convenience method for authenticated GET
    async get(endpoint) {
        return this.fetch(`${this.API}${endpoint}`);
    },
    
    // Convenience method for authenticated POST
    async post(endpoint, body) {
        return this.fetch(`${this.API}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    },
    
    // Convenience method for authenticated DELETE
    async delete(endpoint) {
        return this.fetch(`${this.API}${endpoint}`, { method: 'DELETE' });
    }
};

// Export for use
window.AUTH = AUTH;
