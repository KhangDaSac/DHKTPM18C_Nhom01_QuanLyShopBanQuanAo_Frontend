import axios from "axios";
import type { ApiResponse } from "../authentication"; 


export interface ReviewRequest {
    productId: number;  // Tương ứng Long
    customerId: string;
    orderItemId?: number; // Tương ứng Long
    rating: number;       // Tương ứng Integer (1-5)
    comment?: string;
    images?: string[];
}

export interface ReviewResponse {
    id: number;
    productId: number;
    customerId: string;
    orderItemId?: number;
    rating: number;
    comment?: string;
    createAt?: string;     // LocalDateTime
    updateAt?: string;
    images?: string[];
    firstName?: string;
    lastName?: string;
    image?: string;
    productImage?: string;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number; // Trang hiện tại (bắt đầu từ 0)
    first: boolean;
    last: boolean;
    empty: boolean;
}


// Tạo axios instance riêng cho review service
const reviewApiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor: Tự động thêm token vào mỗi request (giống hệt product service)
reviewApiClient.interceptors.request.use(
    (config) => {
        const authDataStr = localStorage.getItem("authData");
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
        return config;
    },
    (error) => Promise.reject(error)
);


class ReviewService {
    
    /**
     * POST /reviews - Tạo đánh giá mới
     */
    async createReview(requestData: ReviewRequest): Promise<{
        success: boolean;
        data?: ReviewResponse;
        message?: string;
    }> {
        try {
            const response = await reviewApiClient.post<ApiResponse<ReviewResponse>>('/reviews', requestData);
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Tạo đánh giá thất bại' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Tạo đánh giá thất bại' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * GET /reviews - Lấy tất cả đánh giá
     */
    async getAllReviews(): Promise<{
        success: boolean;
        data?: ReviewResponse[];
        message?: string;
    }> {
        try {
            const response = await reviewApiClient.get<ApiResponse<ReviewResponse[]>>('/reviews');
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Không thể lấy danh sách đánh giá' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Không thể lấy danh sách đánh giá' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * GET /reviews/{id} - Lấy đánh giá theo ID
     */
    async getReviewById(id: number): Promise<{
        success: boolean;
        data?: ReviewResponse;
        message?: string;
    }> {
        try {
            const response = await reviewApiClient.get<ApiResponse<ReviewResponse>>(`/reviews/${id}`);
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Không tìm thấy đánh giá' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Không tìm thấy đánh giá' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * GET /reviews/paginated - Lấy danh sách đánh giá có phân trang
     */
    async getReviewsWithPagination(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'createAt',
        sortDirection: 'asc' | 'desc' = 'desc'
    ): Promise<{
        success: boolean;
        data?: PageResponse<ReviewResponse>;
        message?: string;
    }> {
        try {
            const response = await reviewApiClient.get<ApiResponse<PageResponse<ReviewResponse>>>(
                '/reviews/paginated',
                {
                    params: { page, size, sortBy, sortDirection }
                }
            );
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Không thể lấy danh sách đánh giá' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Không thể lấy danh sách đánh giá' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * GET /reviews/product/{productId} - Lấy đánh giá theo ID sản phẩm
     */
    async getReviewsByProductId(productId: number): Promise<{
        success: boolean;
        data?: ReviewResponse[];
        message?: string;
    }> {
        try {
            const response = await reviewApiClient.get<ApiResponse<ReviewResponse[]>>(`/reviews/product/${productId}`);
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Không thể lấy đánh giá cho sản phẩm' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Không thể lấy đánh giá cho sản phẩm' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * GET /reviews/customer/{customerId} - Lấy đánh giá theo ID khách hàng
     */
    async getReviewsByCustomerId(customerId: string): Promise<{
        success: boolean;
        data?: ReviewResponse[];
        message?: string;
    }> {
        try {
            const response = await reviewApiClient.get<ApiResponse<ReviewResponse[]>>(`/reviews/customer/${customerId}`);
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Không thể lấy đánh giá của khách hàng' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Không thể lấy đánh giá của khách hàng' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * GET /reviews/product/{productId}/average-rating - Lấy điểm trung bình
     */
    async getAverageRatingByProductId(productId: number): Promise<{
        success: boolean;
        data?: number; // Backend trả về Double
        message?: string;
    }> {
        try {
            const response = await reviewApiClient.get<ApiResponse<number>>(`/reviews/product/${productId}/average-rating`);
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Không thể lấy điểm đánh giá trung bình' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Không thể lấy điểm đánh giá trung bình' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * PUT /reviews/{id} - Cập nhật đánh giá
     */
    async updateReview(id: number, requestData: ReviewRequest): Promise<{
        success: boolean;
        data?: ReviewResponse;
        message?: string;
    }> {
        try {
            const response = await reviewApiClient.put<ApiResponse<ReviewResponse>>(`/reviews/${id}`, requestData);
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Cập nhật đánh giá thất bại' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Cập nhật đánh giá thất bại' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * DELETE /reviews/{id} - Xóa đánh giá
     */
    async deleteReview(id: number): Promise<{
        success: boolean;
        data?: string; // Backend trả về String
        message?: string;
    }> {
        try {
            const response = await reviewApiClient.delete<ApiResponse<string>>(`/reviews/${id}`);
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Xóa đánh giá thất bại' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Xóa đánh giá thất bại' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * GET /reviews/count - Lấy tổng số lượng đánh giá
     */
    async getTotalReviewCount(): Promise<{
        success: boolean;
        data?: number; // Backend trả về Long
        message?: string;
    }> {
        try {
            const response = await reviewApiClient.get<ApiResponse<number>>('/reviews/count');
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Không thể lấy tổng số đánh giá' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Không thể lấy tổng số đánh giá' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }
    async getLatest10Reviews(): Promise<{
        success: boolean;
        data?: ReviewResponse[];
        message?: string;
    }> {
        try {
            const response = await reviewApiClient.get<ApiResponse<ReviewResponse[]>>('/reviews/latest');
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Không thể lấy đánh giá mới nhất' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Không thể lấy đánh giá mới nhất' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }
}

// Export instance để sử dụng trong các component
export const reviewService = new ReviewService();