/**
 * API Response Types
 * Standard response format từ backend
 */

export interface ApiResponse<T> {
    code: number;     // 1000 = success, others = error
    message: string;  // Thông báo
    result: T;        // Data thực tế
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface PaginationParams {
    page?: number;
    size?: number;
    sort?: string;
}

export interface ServiceResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: any;
}