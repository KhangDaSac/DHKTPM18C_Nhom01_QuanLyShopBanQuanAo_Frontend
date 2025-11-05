import axios from "axios";

export interface User {
    // id: string;
    username: string;
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    dob?: string;
    // createdAt?: string; 
    // updatedAt?: string; 
}


export interface CreateUserRequest {
    username: string;   // min 3 ký tự
    email: string;
    password: string;   // min 8 ký tự  
    phone?: string;
    firstName: string;
    lastName: string;
    dob?: string;       // yyyy-MM-dd format
    roles?: string[];   // Backend expects roles array
}

// Interface cho UpdateUserRequest (giống UserUpdateRequest backend)
export interface UpdateUserRequest {
    email?: string;
    password?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    dob?: string;
}

// Interface cho API Response
export interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

// Tạo axios client
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for CORS
});

// Debug: Log baseURL để kiểm tra
console.log('🌐 User Service API Base URL:', apiClient.defaults.baseURL);

// Interceptor để thêm token
apiClient.interceptors.request.use(
    (config) => {
        console.log('🔍 Request interceptor - URL:', config.url);
        console.log('🔍 Request interceptor - Method:', config.method);
        console.log('🔍 Request interceptor - Headers:', config.headers);
        
        // Không thêm token chỉ cho POST /users (đăng ký)
        if (config.url?.includes('/users') && config.method === 'post') {
            console.log('🔍 Skipping token for registration endpoint');
            return config;
        }
        
        // Thêm token cho tất cả các request khác
        const authDataStr = localStorage.getItem("authData");
        const authData = authDataStr ? JSON.parse(authDataStr) : null;
        if (authData && authData.token) {
            config.headers.Authorization = `Bearer ${authData.token}`;
            console.log('✅ Token added to request');
        } else {
            console.log('⚠️ No token found in localStorage');
        }
        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

class UserService {
    // 1. Lấy tất cả users (GET /users)
    async getAllUsers(): Promise<{ success: boolean; data?: User[]; message?: string }> {
        try {
            const response = await apiClient.get<ApiResponse<User[]>>('/users');

            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Lấy danh sách người dùng thất bại',
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
                    message: errorResponse?.message || 'Lấy danh sách người dùng thất bại',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    // 2. Lấy user theo ID (GET /users/{userId})
    async getUserById(userId: string): Promise<{ success: boolean; data?: User; message?: string }> {
        try {
            const response = await apiClient.get<ApiResponse<User>>(`/users/${userId}`);

            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Không tìm thấy người dùng',
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
                    message: errorResponse?.message || 'Lấy thông tin người dùng thất bại',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    // 3. Tạo user mới (POST /users)
    async createUser(userData: CreateUserRequest): Promise<{ success: boolean; data?: User; message?: string }> {
        try {
            console.log('📤 Sending registration request to:', `${apiClient.defaults.baseURL}/users`);
            console.log('📤 Request data:', userData);
            console.log('📤 Full request config:', {
                url: `${apiClient.defaults.baseURL}/users`,
                method: 'POST',
                headers: apiClient.defaults.headers,
                data: userData
            });
            
            const response = await apiClient.post<ApiResponse<User>>('/users', userData);
            
            console.log('📥 Registration response:', response.data);

            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                console.error('❌ Registration failed with code:', apiResponse.code, 'Message:', apiResponse.message);
                return {
                    success: false,
                    message: apiResponse.message || 'Tạo người dùng thất bại',
                };
            }

            console.log('✅ Registration successful:', apiResponse.result);
            return {
                success: true,
                data: apiResponse.result,
                message: 'Đăng ký thành công! Chào mừng bạn đến với ModaMint.',
            };
        } catch (error) {
            console.error('💥 Registration API error:', error);
            
            if (axios.isAxiosError(error)) {
                console.error('📡 HTTP Status:', error.response?.status);
                console.error('📡 Response data:', error.response?.data);
                
                const errorResponse = error.response?.data as ApiResponse<any>;
                
                // Xử lý các lỗi HTTP cụ thể
                if (error.response?.status === 400) {
                    return {
                        success: false,
                        message: errorResponse?.message || 'Dữ liệu đăng ký không hợp lệ',
                    };
                } else if (error.response?.status === 409) {
                    return {
                        success: false,
                        message: errorResponse?.message || 'Email hoặc tên đăng nhập đã tồn tại',
                    };
                } else if (error.response?.status === 500) {
                    return {
                        success: false,
                        message: 'Lỗi server. Vui lòng thử lại sau',
                    };
                }
                
                return {
                    success: false,
                    message: errorResponse?.message || 'Tạo người dùng thất bại',
                };
            }
            
            // Lỗi không phải từ HTTP
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Lỗi kết nối đến server',
            };
        }
    }

    // 4. Cập nhật user (PUT /users/{userId})
    async updateUser(userId: string, userData: UpdateUserRequest): Promise<{ success: boolean; data?: User; message?: string }> {
        try {
            const response = await apiClient.put<ApiResponse<User>>(`/users/${userId}`, userData);

            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Cập nhật người dùng thất bại',
                };
            }

            return {
                success: true,
                data: apiResponse.result,
                message: apiResponse.message || 'Cập nhật người dùng thành công',
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Cập nhật người dùng thất bại',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    // 5. Xóa user (DELETE /users/{userId})
    async deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await apiClient.delete<ApiResponse<string>>(`/users/${userId}`);

            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Xóa người dùng thất bại',
                };
            }

            return {
                success: true,
                message: apiResponse.message || apiResponse.result || 'Xóa người dùng thành công',
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Xóa người dùng thất bại',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

}

export const userService = new UserService();