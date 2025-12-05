// src/api/interceptors/error.interceptor.ts
import { message } from 'antd';
import type { AxiosError } from 'axios';

/**
 * Error Response Interceptor
 * Xử lý các lỗi HTTP và hiển thị thông báo phù hợp
 */
export const errorInterceptor = (error: AxiosError) => {
    const requestUrl = error.config?.url || '';
    
    // Lỗi đã được xử lý bởi auth interceptor (but not for checkout endpoints)
    if (error.response?.status === 401 && !requestUrl.includes('/checkout')) {
        return Promise.reject(error);
    }

    // Xử lý các lỗi khác
    const errorMessage = 
        (error.response?.data as any)?.message || 
        error.message || 
        'Có lỗi xảy ra';

    if (error.response?.status === 403) {
        message.error('Không có quyền truy cập');
    } else if (error.response?.status === 404) {
        message.error('Không tìm thấy dữ liệu');
    } else if (error.response?.status === 500) {
        message.error('Lỗi máy chủ, vui lòng thử lại sau');
    } else if (!error.response) {
        message.error('Không thể kết nối đến server');
    } else {
        // Lỗi khác (400, 422, etc.)
        message.error(errorMessage);
    }

    return Promise.reject(error);
};