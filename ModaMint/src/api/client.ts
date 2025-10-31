// src/api/client.ts
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { authRequestInterceptor, authResponseInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

/**
 * Axios instance chung cho TẤT CẢ services
 */
export const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
    withCredentials: true,
});

// ==================== SETUP INTERCEPTORS ====================

// Request Interceptor: Thêm JWT token
apiClient.interceptors.request.use(
    authRequestInterceptor,
    (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý refresh token và lỗi
apiClient.interceptors.response.use(
    (response) => response, // Success handler
    async (error) => {
        // Thử auth handling trước
        const authResult = await authResponseInterceptor(error);
        if (authResult !== undefined) {
            return Promise.resolve(authResult);
        }
        // Nếu không phải auth error, xử lý error chung
        return errorInterceptor(error);
    }
);

export default apiClient;