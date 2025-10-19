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
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor để thêm token
apiClient.interceptors.request.use(
    (config) => {
        const authDataStr = localStorage.getItem("authData");
        const authData = authDataStr ? JSON.parse(authDataStr) : null;
        if (authData && authData.token) {
            config.headers.Authorization = `Bearer ${authData.token}`;
        }
        return config;
    },
    (error) => {
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
            const response = await apiClient.post<ApiResponse<User>>('/users', userData);

            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Tạo người dùng thất bại',
                };
            }

            return {
                success: true,
                data: apiResponse.result,
                message: 'Đăng ký thành công! Chào mừng bạn đến với ModaMint.',
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Tạo người dùng thất bại',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
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