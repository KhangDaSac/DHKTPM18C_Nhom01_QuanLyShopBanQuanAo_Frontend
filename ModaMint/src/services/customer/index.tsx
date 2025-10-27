import axios from "axios";
import type { ApiResponse } from "../authentication";

// ==================== INTERFACES ====================

export interface AddressResponse {
    id: number;
    city: string;
    ward: string;
    addressDetail: string;
}

export interface CartResponse {
    id: number;
    sessionId: string;
}

export interface OrderResponse {
    id: number;
    orderCode: string;
    orderStatus: string;
    paymentMethod: string;
}

export interface ReviewResponse {
    id: number;
    rating: number;
    comment: string;
}

export interface UserResponse {
    username: string;
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    dob?: string;
    image?: string;
    roles?: string[];
}

export interface CustomerResponse {
    userId: string;
    user: UserResponse;
    addresses?: AddressResponse[];
    cart?: CartResponse;
    orders?: OrderResponse[];
    reviews?: ReviewResponse[];
}

export interface CustomerRequest {
    userId: string;
    addresses?: any[];
}

// ==================== API CLIENT ====================

const customerApiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Debug: Log baseURL
console.log('🌐 Customer Service API Base URL:', customerApiClient.defaults.baseURL);

// Interceptor để thêm token
customerApiClient.interceptors.request.use(
    (config) => {
        console.log('🔍 Customer Request - URL:', config.url);
        console.log('🔍 Customer Request - Method:', config.method);
        
        // Thêm token cho tất cả các request
        const authDataStr = localStorage.getItem("authData");
        console.log('🔍 AuthData from localStorage:', authDataStr);
        
        const authData = authDataStr ? JSON.parse(authDataStr) : null;
        console.log('🔍 Parsed authData:', authData);
        
        // Sử dụng accessToken thay vì token
        const token = authData?.accessToken || authData?.token;
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Token added to customer request');
            console.log('🔍 Header Authorization:', config.headers.Authorization);
        } else {
            console.log('⚠️ No token found for customer request');
            console.log('⚠️ AuthData:', authData);
        }
        return config;
    },
    (error) => {
        console.error('❌ Customer request interceptor error:', error);
        return Promise.reject(error);
    }
);

// ==================== CUSTOMER SERVICE ====================

class CustomerService {
    // Lấy tất cả customers
    async getAllCustomers(): Promise<{ success: boolean; data?: CustomerResponse[]; message?: string }> {
        try {
            const response = await customerApiClient.get<ApiResponse<CustomerResponse[]>>('/customers');
            
            const apiResponse = response.data;

            
            if (apiResponse.code !== 2000) {
                console.warn('⚠️ Response code is not 2000:', apiResponse.code);
                return {
                    success: false,
                    message: apiResponse.message || 'Lấy danh sách khách hàng thất bại',
                };
            }
            
            console.log('✅ Success! Returning data...');
            return {
                success: true,
                data: apiResponse.result,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('❌ Customer API Error Response:', error.response);
                console.error('❌ Customer API Error Data:', error.response?.data);
                console.error('❌ Customer API Error Status:', error.response?.status);
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || `Lỗi: ${error.response?.status} - ${error.message}`,
                };
            }
            console.error('❌ Customer unknown error:', error);
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    // Lấy customer theo ID
    async getCustomerById(userId: string): Promise<{ success: boolean; data?: CustomerResponse; message?: string }> {
        try {
            const response = await customerApiClient.get<ApiResponse<CustomerResponse>>(`/customers/${userId}`);
            
            const apiResponse = response.data;
            
            if (apiResponse.code !== 2000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Không tìm thấy khách hàng',
                };
            }
            
            return {
                success: true,
                data: apiResponse.result,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Lấy thông tin khách hàng thất bại',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    // Tạo customer mới
    async createCustomer(request: CustomerRequest): Promise<{ success: boolean; data?: CustomerResponse; message?: string }> {
        try {
            const response = await customerApiClient.post<ApiResponse<CustomerResponse>>('/customers', request);
            
            const apiResponse = response.data;
            
            if (apiResponse.code !== 2000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Tạo khách hàng thất bại',
                };
            }
            
            return {
                success: true,
                data: apiResponse.result,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Tạo khách hàng thất bại',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    // Cập nhật customer
    async updateCustomer(userId: string, request: CustomerRequest): Promise<{ success: boolean; data?: CustomerResponse; message?: string }> {
        try {
            const response = await customerApiClient.put<ApiResponse<CustomerResponse>>(`/customers/${userId}`, request);
            
            const apiResponse = response.data;
            
            if (apiResponse.code !== 2000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Cập nhật khách hàng thất bại',
                };
            }
            
            return {
                success: true,
                data: apiResponse.result,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Cập nhật khách hàng thất bại',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    // Xóa customer
    async deleteCustomer(userId: string): Promise<{ success: boolean; message?: string }> {
        try {
            console.log('🗑️ Service deleteCustomer called with userId:', userId);
            const url = `/customers/${userId}`;
            console.log('🗑️ Request URL:', url);
            console.log('🗑️ Full URL:', `${customerApiClient.defaults.baseURL}${url}`);
            
            const response = await customerApiClient.delete<ApiResponse<void>>(url);
            
            console.log('🗑️ Delete response:', response);
            const apiResponse = response.data;
            console.log('🗑️ API Response code:', apiResponse.code);
            console.log('🗑️ API Response message:', apiResponse.message);
            
            if (apiResponse.code !== 2000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Xóa khách hàng thất bại',
                };
            }
            
            return {
                success: true,
                message: 'Đã xóa khách hàng thành công',
            };
        } catch (error) {
            console.error('🗑️ Delete customer error:', error);
            if (axios.isAxiosError(error)) {
                console.error('🗑️ Error response:', error.response);
                console.error('🗑️ Error status:', error.response?.status);
                console.error('🗑️ Error data:', error.response?.data);
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || `Lỗi ${error.response?.status}: ${error.message}`,
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }
}

export const customerService = new CustomerService();

