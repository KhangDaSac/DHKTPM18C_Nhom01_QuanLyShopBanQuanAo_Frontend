const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export interface ProductVariant {
    id: number;
    productId: number;
    size: string;
    color: string;
    image?: string;
    price: number;
    discount: number;
    quantity: number;
    additionalPrice: number;
    createAt?: string;
}

export interface ProductVariantRequest {
    productId: number;
    size: string;
    color: string;
    image?: string;
    price: number;
    discount?: number;
    quantity: number;
    additionalPrice?: number;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

export interface ServiceResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

class ProductVariantService {
    private async fetchApi<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        // Lấy token từ localStorage như các service khác
        const authDataStr = localStorage.getItem('authData');
        let token: string | null = null;
        
        if (authDataStr) {
            try {
                const authData = JSON.parse(authDataStr);
                token = authData?.accessToken || null;
            } catch (error) {
                console.error('Error parsing authData:', error);
            }
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async getAllProductVariants(): Promise<ServiceResponse<ProductVariant[]>> {
        try {
            const response = await this.fetchApi<ProductVariant[]>('/product-variants');
            
            if (response.code === 1000) {
                return {
                    success: true,
                    message: 'Lấy danh sách biến thể thành công',
                    data: response.result
                };
            }
            
            return {
                success: false,
                message: response.message || 'Không thể lấy danh sách biến thể'
            };
        } catch (error) {
            console.error('Error fetching product variants:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách biến thể'
            };
        }
    }

    async getProductVariantById(id: number): Promise<ServiceResponse<ProductVariant>> {
        try {
            const response = await this.fetchApi<ProductVariant>(`/product-variants/${id}`);
            
            if (response.code === 1000) {
                return {
                    success: true,
                    message: 'Lấy thông tin biến thể thành công',
                    data: response.result
                };
            }
            
            return {
                success: false,
                message: response.message || 'Không thể lấy thông tin biến thể'
            };
        } catch (error) {
            console.error('Error fetching product variant:', error);
            return {
                success: false,
                message: 'Lỗi khi lấy thông tin biến thể'
            };
        }
    }

    async getProductVariantsByProductId(productId: number): Promise<ServiceResponse<ProductVariant[]>> {
        try {
            const response = await this.fetchApi<ProductVariant[]>(`/product-variants/product/${productId}`);
            
            // API có thể trả về code 2000 (thành công) hoặc 1000
            if (response.code === 2000 || response.code === 1000) {
                return {
                    success: true,
                    message: 'Lấy danh sách biến thể sản phẩm thành công',
                    data: response.result
                };
            }
            
            console.error('❌ API returned error code:', response.code, response.message);
            return {
                success: false,
                message: response.message || 'Không thể lấy danh sách biến thể sản phẩm'
            };
        } catch (error: any) {
            console.error('❌ Error fetching product variants by product:', error);
            return {
                success: false,
                message: error.message || 'Lỗi khi lấy danh sách biến thể sản phẩm'
            };
        }
    }

    async createProductVariant(data: ProductVariantRequest): Promise<ServiceResponse<ProductVariant>> {
        try {
            const response = await this.fetchApi<ProductVariant>('/product-variants', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            
            if (response.code === 1000) {
                return {
                    success: true,
                    message: 'Tạo biến thể thành công',
                    data: response.result
                };
            }
            
            return {
                success: false,
                message: response.message || 'Không thể tạo biến thể'
            };
        } catch (error) {
            console.error('Error creating product variant:', error);
            return {
                success: false,
                message: 'Lỗi khi tạo biến thể'
            };
        }
    }

    async updateProductVariant(id: number, data: ProductVariantRequest): Promise<ServiceResponse<ProductVariant>> {
        try {
            const response = await this.fetchApi<ProductVariant>(`/product-variants/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            
            if (response.code === 1000) {
                return {
                    success: true,
                    message: 'Cập nhật biến thể thành công',
                    data: response.result
                };
            }
            
            return {
                success: false,
                message: response.message || 'Không thể cập nhật biến thể'
            };
        } catch (error) {
            console.error('Error updating product variant:', error);
            return {
                success: false,
                message: 'Lỗi khi cập nhật biến thể'
            };
        }
    }

    async deleteProductVariant(id: number): Promise<ServiceResponse<void>> {
        try {
            const response = await this.fetchApi<void>(`/product-variants/${id}`, {
                method: 'DELETE',
            });
            
            if (response.code === 1000) {
                return {
                    success: true,
                    message: 'Xóa biến thể thành công'
                };
            }
            
            return {
                success: false,
                message: response.message || 'Không thể xóa biến thể'
            };
        } catch (error) {
            console.error('Error deleting product variant:', error);
            return {
                success: false,
                message: 'Lỗi khi xóa biến thể'
            };
        }
    }
}

export const productVariantService = new ProductVariantService();
export type { ProductVariantService };
