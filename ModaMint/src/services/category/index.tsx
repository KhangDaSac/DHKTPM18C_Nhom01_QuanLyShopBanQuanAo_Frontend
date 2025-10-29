import axios from "axios";
import type { ApiResponse } from "../authentication";

// ==================== INTERFACES ====================

// Category từ backend Entity
export interface Category {
    id: number;
    name: string;
    isActive: boolean;
    createAt?: string;
    updateAt?: string;
    image?: string;
}

// Request tạo/cập nhật category (từ CategoryRequest DTO)
export interface CategoryRequest {
    name: string;
    isActive?: boolean;
}

// ==================== API CLIENT ====================

// Tạo axios instance riêng cho category service
const categoryApiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor: Tự động thêm token vào mỗi request
categoryApiClient.interceptors.request.use(
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

// ==================== CATEGORY SERVICE ====================

class CategoryService {
    // Tạo category mới
    async createCategory(request: CategoryRequest): Promise<ApiResponse<Category>> {
        try {
            const response = await categoryApiClient.post('/categories', request);
            return response.data;
        } catch (error: any) {
            console.error('Error creating category:', error);
            return {
                code: 1001,
                message: error.response?.data?.message || 'Không thể tạo danh mục',
                result: null as any
            };
        }
    }

    // Lấy tất cả categories
    async getAllCategories(): Promise<ApiResponse<Category[]>> {
        try {
            const response = await categoryApiClient.get('/categories');
            return response.data;
        } catch (error: any) {
            console.error('Error getting all categories:', error);
            return {
                code: 1001,
                message: error.response?.data?.message || 'Không thể lấy danh sách danh mục',
                result: []
            };
        }
    }

    // Lấy category theo ID
    async getCategoryById(id: number): Promise<ApiResponse<Category>> {
        try {
            const response = await categoryApiClient.get(`/categories/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Error getting category by id:', error);
            return {
                code: 1001,
                message: error.response?.data?.message || 'Không thể lấy thông tin danh mục',
                result: null as any
            };
        }
    }

    // Lấy categories với phân trang
    async getCategoriesWithPagination(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'id',
        sortDirection: string = 'desc'
    ): Promise<ApiResponse<{
        content: Category[];
        totalElements: number;
        totalPages: number;
        size: number;
        number: number;
        first: boolean;
        last: boolean;
    }>> {
        try {
            const response = await categoryApiClient.get('/categories/paginated', {
                params: {
                    page,
                    size,
                    sortBy,
                    sortDirection
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error getting categories with pagination:', error);
            return {
                code: 1001,
                message: error.response?.data?.message || 'Không thể lấy danh sách danh mục phân trang',
                result: null as any
            };
        }
    }

    // Lấy danh mục đang hoạt động
    async getActiveCategories(): Promise<ApiResponse<Category[]>> {
        try {
            const response = await categoryApiClient.get('/categories/active');
            return response.data;
        } catch (error: any) {
            console.error('Error getting active categories:', error);
            return {
                code: 1001,
                message: error.response?.data?.message || 'Không thể lấy danh sách danh mục đang hoạt động',
                result: []
            };
        }
    }

    // Tìm kiếm categories theo tên
    async searchCategoriesByName(name: string): Promise<ApiResponse<Category[]>> {
        try {
            const response = await categoryApiClient.get('/categories/search', {
                params: { name }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error searching categories by name:', error);
            return {
                code: 1001,
                message: error.response?.data?.message || 'Không thể tìm kiếm danh mục',
                result: []
            };
        }
    }

    // Cập nhật category
    async updateCategory(id: number, request: CategoryRequest): Promise<ApiResponse<Category>> {
        try {
            const response = await categoryApiClient.put(`/categories/${id}`, request);
            return response.data;
        } catch (error: any) {
            console.error('Error updating category:', error);
            return {
                code: 1001,
                message: error.response?.data?.message || 'Không thể cập nhật danh mục',
                result: null as any
            };
        }
    }

    // Xóa category (soft delete)
    async deleteCategory(id: number): Promise<ApiResponse<string>> {
        try {
            const response = await categoryApiClient.delete(`/categories/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Error deleting category:', error);
            return {
                code: 1001,
                message: error.response?.data?.message || 'Không thể xóa danh mục',
                result: null as any
            };
        }
    }

    // Khôi phục category
    async restoreCategory(id: number): Promise<ApiResponse<Category>> {
        try {
            const response = await categoryApiClient.put(`/categories/${id}/restore`);
            return response.data;
        } catch (error: any) {
            console.error('Error restoring category:', error);
            return {
                code: 1001,
                message: error.response?.data?.message || 'Không thể khôi phục danh mục',
                result: null as any
            };
        }
    }

    // Xóa vĩnh viễn category
    async permanentDeleteCategory(id: number): Promise<ApiResponse<string>> {
        try {
            const response = await categoryApiClient.delete(`/categories/${id}/permanent`);
            return response.data;
        } catch (error: any) {
            console.error('Error permanent deleting category:', error);
            return {
                code: 1001,
                message: error.response?.data?.message || 'Không thể xóa vĩnh viễn danh mục',
                result: null as any
            };
        }
    }

    // Lấy tổng số lượng categories
    async getTotalCategoryCount(): Promise<ApiResponse<number>> {
        try {
            const response = await categoryApiClient.get('/categories/count');
            return response.data;
        } catch (error: any) {
            console.error('Error getting total category count:', error);
            return {
                code: 1001,
                message: error.response?.data?.message || 'Không thể lấy tổng số lượng danh mục',
                result: 0
            };
        }
    }

    // Lấy số lượng categories đang hoạt động
    async getActiveCategoryCount(): Promise<ApiResponse<number>> {
        try {
            const response = await categoryApiClient.get('/categories/count/active');
            return response.data;
        } catch (error: any) {
            console.error('Error getting active category count:', error);
            return {
                code: 1001,
                message: error.response?.data?.message || 'Không thể lấy số lượng danh mục đang hoạt động',
                result: 0
            };
        }
    }

    //QuocHuy
    async getTop8ActiveCategoriesByProductCount(): Promise<ApiResponse<Category[]>> {
        try {
            // 1. Gọi đúng endpoint mới đã tạo ở backend
            const response = await categoryApiClient.get('/categories/top-8-active-by-products'); // <-- THAY ĐỔI URL
            
            return response.data;
            
        } catch (error: any) {
            console.error('Error getting top 8 active categories:', error);
            
            return {
                code: 1001,
                message: error.response?.data?.message || 'Không thể lấy top 8 danh mục', // <-- THAY ĐỔI MESSAGE LỖI
                result: [] 
            };
        }
    }
}

// Export singleton instance
export const categoryService = new CategoryService();
