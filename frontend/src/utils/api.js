export const BASE_URL = 'http://localhost:8000';

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb);
}

function onTokenRefresh(token) {
    refreshSubscribers.map(cb => cb(token));
}

export const parseApiError = (error) => {
    if (!error.response) return error.message || 'Something went wrong';

    const data = error.response.data;

    if (data.detail) return data.detail;
    if (data.error) return data.error;

    // Handle field-level errors
    if (typeof data === 'object' && !Array.isArray(data)) {
        const messages = [];
        for (const [field, errors] of Object.entries(data)) {
            const fieldName = field === 'non_field_errors' ? '' : `${field}: `;
            if (Array.isArray(errors)) {
                messages.push(`${fieldName}${errors.join(', ')}`);
            } else {
                messages.push(`${fieldName}${errors}`);
            }
        }
        return messages.join('\n');
    }

    return 'An unexpected error occurred';
};

export const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('access_token');
        const isFormData = options.body instanceof FormData;
        const headers = {
            ...(!isFormData && { 'Content-Type': 'application/json' }),
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        };

        let response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Handle 401 Unauthorized
        if (response.status === 401 && endpoint !== '/api/auth/login/' && endpoint !== '/api/auth/refresh/') {
            const refreshToken = localStorage.getItem('refresh_token');

            if (!refreshToken) {
                this.logout();
                throw { message: 'Unauthorized', response };
            }

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refresh: refreshToken }),
                    });

                    if (refreshRes.ok) {
                        const data = await refreshRes.json();
                        localStorage.setItem('access_token', data.access);
                        isRefreshing = false;
                        onTokenRefresh(data.access);
                        refreshSubscribers = [];
                    } else {
                        this.logout();
                        throw { message: 'Refresh failed', response: refreshRes };
                    }
                } catch (err) {
                    this.logout();
                    throw err;
                }
            }

            // Return a promise that resolves when the token is refreshed
            const retryOriginalRequest = new Promise(resolve => {
                subscribeTokenRefresh(newToken => {
                    options.headers = {
                        ...options.headers,
                        'Authorization': `Bearer ${newToken}`,
                    };
                    resolve(fetch(`${BASE_URL}${endpoint}`, options));
                });
            });

            return retryOriginalRequest;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // Throw an object that mimicks axios error for easier transition if needed or just for consistency
            throw { response: { data: errorData, status: response.status }, message: errorData.detail || errorData.message || 'API Error' };
        }

        return response;
    },

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {
            window.location.href = '/login';
        }
    },

    async get(endpoint) {
        const response = await this.request(endpoint);
        return response.json();
    },

    async post(endpoint, data) {
        const response = await this.request(endpoint, {
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data),
        });
        return response.json();
    },

    async patch(endpoint, data) {
        const response = await this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        return response.json();
    },

    async delete(endpoint) {
        await this.request(endpoint, { method: 'DELETE' });
    }
};
