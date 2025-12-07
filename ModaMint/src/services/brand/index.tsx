// File: src/services/brand.service.ts

import axios from "axios";
// Giả sử bạn có file định nghĩa ApiResponse chung
import type { ApiResponse } from "../authentication";

// ==================== INTERFACES ====================

// DTO từ backend
export interface BrandResponse {
    id: number;
    name: string;
    description?: string;
    logoUrl?: string;
    productCount?: number; // Số lượng sản phẩm
    isActive?: boolean; // Backend trả về isActive
}

// DTO để tạo/cập nhật
export interface BrandRequest {
    name: string;
    description?: string;
    logoUrl?: string;
    active?: boolean;
}

// Pagination response (Spring Data Page)
export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number; // trang hiện tại
    first: boolean;
    last: boolean;
    empty: boolean;
}

// ==================== API CLIENT ====================

// Tạo axios instance riêng cho brand service
const brandApiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor: Tự động thêm token vào mỗi request
brandApiClient.interceptors.request.use(
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

// ==================== BRAND SERVICE ====================

class BrandService {

    /**
     * POST /brands - Tạo thương hiệu mới (Admin)
     */
    async createBrand(brandData: BrandRequest): Promise<{
        success: boolean;
        data?: BrandResponse;
        message?: string;
    }> {
        try {
            const response = await brandApiClient.post<ApiResponse<BrandResponse>>('/brands', brandData);
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Tạo thương hiệu thất bại' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Tạo thương hiệu thất bại' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * GET /brands - Lấy tất cả thương hiệu
     */
    async getAllBrands(): Promise<{
        success: boolean;
        data?: BrandResponse[];
        message?: string;
    }> {
        try {
            const response = await brandApiClient.get<ApiResponse<BrandResponse[]>>('/brands');
            const apiResponse = response.data;

            if (!apiResponse || apiResponse.code !== 1000 || !apiResponse.result) {
                return {
                    success: false,
                    message: apiResponse?.message || 'Lấy danh sách thương hiệu thất bại'
                };
            }

            return {
                success: true,
                data: apiResponse.result,
                message: apiResponse.message
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Lấy danh sách thương hiệu thất bại'
                };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * GET /brands/{id} - Lấy thương hiệu theo ID
     */
    async getBrandById(id: number): Promise<{
        success: boolean;
        data?: BrandResponse;
        message?: string;
    }> {
        try {
            const response = await brandApiClient.get<ApiResponse<BrandResponse>>(`/brands/${id}`);
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Không tìm thấy thương hiệu' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Không tìm thấy thương hiệu' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * GET /brands/paginated - Lấy danh sách thương hiệu có phân trang
     */
    async getBrandsWithPagination(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'id',
        sortDirection: 'asc' | 'desc' = 'asc'
    ): Promise<{
        success: boolean;
        data?: PageResponse<BrandResponse>;
        message?: string;
    }> {
        try {
            const response = await brandApiClient.get<ApiResponse<PageResponse<BrandResponse>>>(
                '/brands/paginated',
                {
                    params: { page, size, sortBy, sortDirection }
                }
            );

            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Lấy danh sách phân trang thất bại' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Lấy danh sách phân trang thất bại' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * GET /brands/search?name={name} - Tìm kiếm thương hiệu theo tên
     */
    async searchBrandsByName(name: string): Promise<{
        success: boolean;
        data?: BrandResponse[];
        message?: string;
    }> {
        try {
            const response = await brandApiClient.get<ApiResponse<BrandResponse[]>>(
                '/brands/search',
                {
                    params: { name }
                }
            );

            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Tìm kiếm thất bại' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Tìm kiếm thất bại' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * PUT /brands/{id} - Cập nhật thương hiệu (Admin)
     */
    async updateBrand(id: number, brandData: BrandRequest): Promise<{
        success: boolean;
        data?: BrandResponse;
        message?: string;
    }> {
        try {
            const response = await brandApiClient.put<ApiResponse<BrandResponse>>(
                `/brands/${id}`,
                brandData
            );

            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Cập nhật thất bại' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Cập nhật thất bại' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * DELETE /brands/{id} - Xóa (soft delete) thương hiệu (Admin)
     */
    async deleteBrand(id: number): Promise<{
        success: boolean;
        data?: string;
        message?: string;
    }> {
        try {
            const response = await brandApiClient.delete<ApiResponse<string>>(`/brands/${id}`);
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Xóa thất bại' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Xóa thất bại' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * PUT /brands/{id}/restore - Kích hoạt lại thương hiệu (Admin)
     */
    async restoreBrand(id: number): Promise<{
        success: boolean;
        data?: BrandResponse;
        message?: string;
    }> {
        try {
            const response = await brandApiClient.put<ApiResponse<BrandResponse>>(`/brands/${id}/restore`);
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Kích hoạt lại thất bại' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Kích hoạt lại thất bại' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * DELETE /brands/{id}/permanent - Xóa vĩnh viễn thương hiệu (Admin)
     */
    async permanentDeleteBrand(id: number): Promise<{
        success: boolean;
        data?: string;
        message?: string;
    }> {
        try {
            const response = await brandApiClient.delete<ApiResponse<string>>(`/brands/${id}/permanent`);
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Xóa vĩnh viễn thất bại' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Xóa vĩnh viễn thất bại' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * GET /brands/active - Lấy tất cả thương hiệu đang hoạt động
     */
    async getActiveBrands(): Promise<{
        success: boolean;
        data?: BrandResponse[];
        message?: string;
    }> {
        try {
            const response = await brandApiClient.get<ApiResponse<BrandResponse[]>>('/brands/active');
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Lấy danh sách active thất bại' };
            }
            return { success: true, data: apiResponse.result, message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Lấy danh sách active thất bại' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * GET /brands/count - Lấy tổng số thương hiệu
     */
    async getTotalBrandCount(): Promise<{
        success: boolean;
        data?: number;
        message?: string;
    }> {
        try {
            const response = await brandApiClient.get<ApiResponse<number>>('/brands/count');
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Lấy tổng số thất bại' };
            }
            // Chuyển đổi Long (number) sang number
            return { success: true, data: Number(apiResponse.result), message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Lấy tổng số thất bại' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }

    /**
     * GET /brands/count/active - Lấy tổng số thương hiệu đang hoạt động
     */
    async getActiveBrandCount(): Promise<{
        success: boolean;
        data?: number;
        message?: string;
    }> {
        try {
            const response = await brandApiClient.get<ApiResponse<number>>('/brands/count/active');
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return { success: false, message: apiResponse.message || 'Lấy số active thất bại' };
            }
            // Chuyển đổi Long (number) sang number
            return { success: true, data: Number(apiResponse.result), message: apiResponse.message };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return { success: false, message: errorResponse?.message || 'Lấy số active thất bại' };
            }
            return { success: false, message: 'Lỗi kết nối đến server' };
        }
    }
}

// Export instance để sử dụng trong các component
export const brandService = new BrandService();