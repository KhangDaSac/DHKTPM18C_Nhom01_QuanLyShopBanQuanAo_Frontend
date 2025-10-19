import axios from "axios";
import type { ApiResponse } from "../authentication";

// ==================== INTERFACES ====================

// Product Variant (Biến thể sản phẩm: màu, size...)
export interface ProductVariant {
    id: number;
    productId: number;
    size?: string;
    color?: string;
    additionalPrice?: number;
    createAt?: string;
}

// Product Image
export interface ProductImage {
    id: number;
    productId: number;
    imageUrl: string;
    isPrimary?: boolean;
}

// Product chính (từ backend Entity)
export interface Product {
    id: number;
    name: string;
    brandId: number;
    brandName?: string;
    categoryId: number;
    categoryName?: string;
    description: string;
    price: number;
    active: boolean;
    createAt?: string;
    updateAt?: string;
    productVariants?: ProductVariant[];
    productImages?: ProductImage[];
}

// Request tạo/cập nhật sản phẩm (từ ProductRequest DTO)
export interface ProductRequest {
    name: string;
    brandId: number;
    categoryId: number;
    description: string;
    price: number;
    active?: boolean;
}

// Product Response DTO (từ backend)
export interface ProductResponse {
    id: number;
    name: string;
    price: number;
    active: boolean;
    description: string;
    brandName: string;
    categoryName: string;
}

// Pagination response (Spring Data Page)
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

// ==================== API CLIENT ====================

// Tạo axios instance riêng cho product service
const productApiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor: Tự động thêm token vào mỗi request
productApiClient.interceptors.request.use(
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

// ==================== PRODUCT SERVICE ====================

class ProductService {
    
    /**
     * GET /products - Lấy tất cả sản phẩm
     */
    async getAllProducts(): Promise<{
        success: boolean;
        data?: ProductResponse[];
        message?: string;
    }> {
        try {
            const response = await productApiClient.get<ApiResponse<ProductResponse[]>>('/products');
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Không thể lấy danh sách sản phẩm',
                };
            }

            return {
                success: true,
                data: apiResponse.result,
                message: apiResponse.message,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Không thể lấy danh sách sản phẩm',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    /**
     * GET /products/paginated - Lấy danh sách sản phẩm có phân trang
     */
    async getProductsWithPagination(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'id',
        sortDirection: 'asc' | 'desc' = 'asc'
    ): Promise<{
        success: boolean;
        data?: PageResponse<ProductResponse>;
        message?: string;
    }> {
        try {
            const response = await productApiClient.get<ApiResponse<PageResponse<ProductResponse>>>(
                '/products/paginated',
                {
                    params: {
                        page,
                        size,
                        sortBy,
                        sortDirection,
                    }
                }
            );

            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Không thể lấy danh sách sản phẩm',
                };
            }

            return {
                success: true,
                data: apiResponse.result,
                message: apiResponse.message,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Không thể lấy danh sách sản phẩm',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    /**
     * GET /products/{id} - Lấy chi tiết một sản phẩm theo ID
     */
    async getProductById(id: number): Promise<{
        success: boolean;
        data?: ProductResponse;
        message?: string;
    }> {
        try {
            const response = await productApiClient.get<ApiResponse<ProductResponse>>(`/products/${id}`);
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Không tìm thấy sản phẩm',
                };
            }

            return {
                success: true,
                data: apiResponse.result,
                message: apiResponse.message,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Không tìm thấy sản phẩm',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    /**
     * GET /products/search?name={name} - Tìm kiếm sản phẩm theo tên
     */
    async searchProductsByName(name: string): Promise<{
        success: boolean;
        data?: ProductResponse[];
        message?: string;
    }> {
        try {
            const response = await productApiClient.get<ApiResponse<ProductResponse[]>>(
                '/products/search',
                {
                    params: { name }
                }
            );

            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Tìm kiếm thất bại',
                };
            }

            return {
                success: true,
                data: apiResponse.result,
                message: apiResponse.message,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Tìm kiếm thất bại',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    /**
     * POST /products - Tạo sản phẩm mới (chỉ Admin)
     */
    async createProduct(productData: ProductRequest): Promise<{
        success: boolean;
        data?: ProductResponse;
        message?: string;
    }> {
        try {
            const response = await productApiClient.post<ApiResponse<ProductResponse>>(
                '/products',
                productData
            );

            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Tạo sản phẩm thất bại',
                };
            }

            return {
                success: true,
                data: apiResponse.result,
                message: apiResponse.message,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Tạo sản phẩm thất bại',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    /**
     * PUT /products/{id} - Cập nhật sản phẩm (chỉ Admin)
     */
    async updateProduct(id: number, productData: ProductRequest): Promise<{
        success: boolean;
        data?: ProductResponse;
        message?: string;
    }> {
        try {
            const response = await productApiClient.put<ApiResponse<ProductResponse>>(
                `/products/${id}`,
                productData
            );

            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Cập nhật sản phẩm thất bại',
                };
            }

            return {
                success: true,
                data: apiResponse.result,
                message: apiResponse.message,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Cập nhật sản phẩm thất bại',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    /**
     * DELETE /products/{id} - Xóa sản phẩm (Soft Delete - vô hiệu hóa)
     */
    async deleteProduct(id: number): Promise<{
        success: boolean;
        data?: string;
        message?: string;
    }> {
        try {
            const response = await productApiClient.delete<ApiResponse<string>>(
                `/products/${id}`
            );

            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Xóa sản phẩm thất bại',
                };
            }

            return {
                success: true,
                data: apiResponse.result,
                message: apiResponse.message,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Xóa sản phẩm thất bại',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    /**
     * PUT /products/{id}/restore - Kích hoạt lại sản phẩm
     */
    async restoreProduct(id: number): Promise<{
        success: boolean;
        data?: ProductResponse;
        message?: string;
    }> {
        try {
            const response = await productApiClient.put<ApiResponse<ProductResponse>>(
                `/products/${id}/restore`
            );

            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Kích hoạt lại sản phẩm thất bại',
                };
            }

            return {
                success: true,
                data: apiResponse.result,
                message: apiResponse.message,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Kích hoạt lại sản phẩm thất bại',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    /**
     * DELETE /products/{id}/permanent - Xóa vĩnh viễn sản phẩm
     */
    async permanentDeleteProduct(id: number): Promise<{
        success: boolean;
        data?: string;
        message?: string;
    }> {
        try {
            const response = await productApiClient.delete<ApiResponse<string>>(
                `/products/${id}/permanent`
            );

            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Xóa vĩnh viễn sản phẩm thất bại',
                };
            }

            return {
                success: true,
                data: apiResponse.result,
                message: apiResponse.message,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Xóa vĩnh viễn sản phẩm thất bại',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    /**
     * GET /products/brand/{brandId} - Lấy sản phẩm theo brand
     */
    async getProductsByBrandId(brandId: number): Promise<{
        success: boolean;
        data?: ProductResponse[];
        message?: string;
    }> {
        try {
            const response = await productApiClient.get<ApiResponse<ProductResponse[]>>(
                `/products/brand/${brandId}`
            );

            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Không thể lấy sản phẩm theo thương hiệu',
                };
            }

            return {
                success: true,
                data: apiResponse.result,
                message: apiResponse.message,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Không thể lấy sản phẩm theo thương hiệu',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    /**
     * GET /products/category/{categoryId} - Lấy sản phẩm theo category
     */
    async getProductsByCategoryId(categoryId: number): Promise<{
        success: boolean;
        data?: ProductResponse[];
        message?: string;
    }> {
        try {
            const response = await productApiClient.get<ApiResponse<ProductResponse[]>>(
                `/products/category/${categoryId}`
            );

            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Không thể lấy sản phẩm theo danh mục',
                };
            }

            return {
                success: true,
                data: apiResponse.result,
                message: apiResponse.message,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Không thể lấy sản phẩm theo danh mục',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    /**
     * GET /products/active - Lấy sản phẩm đang hoạt động
     */
    async getActiveProducts(): Promise<{
        success: boolean;
        data?: ProductResponse[];
        message?: string;
    }> {
        try {
            const response = await productApiClient.get<ApiResponse<ProductResponse[]>>(
                '/products/active'
            );

            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Không thể lấy sản phẩm đang hoạt động',
                };
            }

            return {
                success: true,
                data: apiResponse.result,
                message: apiResponse.message,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Không thể lấy sản phẩm đang hoạt động',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    /**
     * GET /products/count - Lấy tổng số lượng sản phẩm
     */
    async getTotalProductCount(): Promise<{
        success: boolean;
        data?: number;
        message?: string;
    }> {
        try {
            const response = await productApiClient.get<ApiResponse<number>>(
                '/products/count'
            );

            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Không thể lấy tổng số lượng sản phẩm',
                };
            }

            return {
                success: true,
                data: apiResponse.result,
                message: apiResponse.message,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Không thể lấy tổng số lượng sản phẩm',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    /**
     * GET /products/count/active - Lấy số lượng sản phẩm đang hoạt động
     */
    async getActiveProductCount(): Promise<{
        success: boolean;
        data?: number;
        message?: string;
    }> {
        try {
            const response = await productApiClient.get<ApiResponse<number>>(
                '/products/count/active'
            );

            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Không thể lấy số lượng sản phẩm đang hoạt động',
                };
            }

            return {
                success: true,
                data: apiResponse.result,
                message: apiResponse.message,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Không thể lấy số lượng sản phẩm đang hoạt động',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }
}

// Export instance để sử dụng trong các component
export const productService = new ProductService();
