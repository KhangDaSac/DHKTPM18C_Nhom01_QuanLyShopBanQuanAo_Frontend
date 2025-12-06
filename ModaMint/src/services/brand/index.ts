import apiClient from '../../api/client';
import type { ApiResponse } from '../authentication';

export interface BrandRequest {
    name: string;
    description?: string;
    image?: string;  // URL ảnh từ Cloudinary
    active?: boolean;  // Backend expects 'active', not 'isActive'
}

export interface BrandResponse {
    id: number;
    name: string;
    description?: string;
    image?: string;  // URL ảnh từ Cloudinary
    active?: boolean;
    isActive?: boolean;
    createAt?: string;
    updateAt?: string;
}

class BrandService {
    /**
     * GET /brands - Lấy tất cả thương hiệu
     */
    async getAllBrands() {
        const response = await apiClient.get<ApiResponse<BrandResponse[]>>('/brands');
        return response.data;
    }

    /**
     * GET /brands/{id} - Lấy thông tin thương hiệu theo ID
     */
    async getBrandById(id: number) {
        const response = await apiClient.get<ApiResponse<BrandResponse>>(`/brands/${id}`);
        return response.data;
    }

    /**
     * GET /brands/active - Lấy danh sách thương hiệu đang hoạt động
     */
    async getActiveBrands() {
        const response = await apiClient.get<ApiResponse<BrandResponse[]>>('/brands/active');
        return response.data;
    }

    /**
     * GET /brands/search - Tìm kiếm thương hiệu theo tên
     */
    async searchBrandsByName(name: string) {
        const response = await apiClient.get<ApiResponse<BrandResponse[]>>('/brands/search', {
            params: { name }
        });
        return response.data;
    }

    /**
     * GET /brands/count - Lấy tổng số thương hiệu
     */
    async getTotalBrandCount() {
        const response = await apiClient.get<ApiResponse<number>>('/brands/count');
        return response.data;
    }

    /**
     * GET /brands/count/active - Lấy số thương hiệu đang hoạt động
     */
    async getActiveBrandCount() {
        const response = await apiClient.get<ApiResponse<number>>('/brands/count/active');
        return response.data;
    }

    /**
     * POST /brands - Tạo thương hiệu mới
     */
    async createBrand(data: BrandRequest) {
        const response = await apiClient.post<ApiResponse<BrandResponse>>('/brands', data);
        return response.data;
    }

    /**
     * PUT /brands/{id} - Cập nhật thông tin thương hiệu
     */
    async updateBrand(id: number, data: BrandRequest) {
        const response = await apiClient.put<ApiResponse<BrandResponse>>(`/brands/${id}`, data);
        return response.data;
    }

    /**
     * DELETE /brands/{id} - Xóa mềm thương hiệu (vô hiệu hóa)
     */
    async deleteBrand(id: number) {
        const response = await apiClient.delete<ApiResponse<string>>(`/brands/${id}`);
        return response.data;
    }

    /**
     * PUT /brands/{id}/restore - Khôi phục thương hiệu đã vô hiệu hóa
     */
    async restoreBrand(id: number) {
        const response = await apiClient.put<ApiResponse<BrandResponse>>(`/brands/${id}/restore`);
        return response.data;
    }
}

export const brandService = new BrandService();
