// src/api/interceptors/auth.interceptor.ts
import type { InternalAxiosRequestConfig } from 'axios';

// Danh sách các endpoints KHÔNG CẦN token (public endpoints)
const PUBLIC_ENDPOINTS = [
    '/auth/login',
    '/auth/logout',
    '/auth/refresh',
    '/auth/introspect',
];

// Kiểm tra xem endpoint có phải là public không
const isPublicEndpoint = (url?: string): boolean => {
    if (!url) return false;
    return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

/**
 * Request Interceptor: Tự động thêm JWT token vào headers
 */
export const authRequestInterceptor = (config: InternalAxiosRequestConfig) => {
    // CHỈ thêm token nếu KHÔNG phải public endpoint
    if (!isPublicEndpoint(config.url)) {
        const authDataStr = localStorage.getItem('authData');
        if (authDataStr) {
            try {
                const authData = JSON.parse(authDataStr);
                if (authData?.accessToken) {
                    config.headers.Authorization = `Bearer ${authData.accessToken}`;
                }
            } catch (error) {
                console.error('Error parsing authData:', error);
            }
        }
    }
    return config;
};

/**
 * Response Interceptor: Xử lý refresh token tự động
 */
export const authResponseInterceptor = async (error: any) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
        // Biến để theo dõi refresh token
        let isRefreshing = false;
        let failedQueue: Array<{
            resolve: (value: any) => void;
            reject: (reason: any) => void;
        }> = [];

        const processQueue = (queueError: any, token: string | null = null) => {
            failedQueue.forEach(({ resolve, reject }) => {
                if (queueError) reject(queueError);
                else resolve(token);
            });
            failedQueue = [];
        };

        if (isRefreshing) {
            // Đang refresh, thêm vào queue
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                // Return apiClient(originalRequest); // Will be handled by the client
                return Promise.resolve(token);
            }).catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const authDataStr = localStorage.getItem('authData');
            if (!authDataStr) throw new Error('No auth data');

            const authData = JSON.parse(authDataStr);
            const refreshToken = authData?.refreshToken;

            if (!refreshToken) throw new Error('No refresh token');

            // Call refresh API
            const response = await fetch(`${error.config.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            const data = await response.json();
            const { accessToken } = data.result;
            
            authData.accessToken = accessToken;
            localStorage.setItem('authData', JSON.stringify(authData));

            processQueue(null, accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // Retry the original request (will be handled by client)
            return Promise.resolve(accessToken);
        } catch (refreshError) {
            processQueue(refreshError, null);
            // Redirect to login
            localStorage.removeItem('authData');
            window.location.href = '/login';
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }

    return Promise.reject(error);
};