import axios from "axios"
import { CLOUDINARY_CONFIG, getCloudinaryUploadUrl } from '../../config/cloudinary';

export interface AuthenticationRequest {
    username: string,
    password: string,
}


export interface AuthenticationResponse {
    accessToken: string,
    refreshToken: string,
    tokenType: string,
    expiresIn: number,
}

// Interface cho thông tin user trả về từ API
export interface UserResponse {
    id: string,
    username: string,
    email: string,
    firstName: string,
    lastName: string,
    phone: string,
    dob: string,
    image?: string, // URL hình ảnh từ Cloudinary
    createdDate?: string,
    lastModifiedDate?: string,
}

// Interface cho ChangePasswordRequest
export interface ChangePasswordRequest {
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
}

// Interface định nghĩa cấu trúc chung của tất cả API response từ server
export interface ApiResponse<T> {
    code: number,    // Mã trạng thái (VD: 1000 = success, 1001 = error...)
    message: string, // Thông báo từ server
    result: T,       // Dữ liệu thực tế (có thể là bất kỳ kiểu nào - generic T)
}

// Tạo một axios instance với config mặc định
const apiClient = axios.create({
    // URL gốc của API server, lấy từ env hoặc dùng localhost
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    headers: {
        // Báo cho server biết chúng ta gửi dữ liệu dạng JSON
        'Content-Type': 'application/json',
    }
})

// Debug: Log baseURL để kiểm tra
console.log('🌐 API Base URL:', apiClient.defaults.baseURL);

// Biến để theo dõi việc refresh token đang diễn ra
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });

    failedQueue = [];
};

// Interceptor: can thiệp vào mỗi request trước khi gửi đi
apiClient.interceptors.request.use(
    (config) => {
        // Lấy token từ authData
        const authDataStr = localStorage.getItem("authData");
        
        if (authDataStr) {
            try {
                const authData = JSON.parse(authDataStr);
                if (authData && authData.accessToken) {
                    // Thêm token vào header Authorization để server biết user đã đăng nhập
                    config.headers.Authorization = `Bearer ${authData.accessToken}`;
                    console.log('🔑 Token added to header');
                } else {
                    console.log('⚠️ No accessToken found in authData');
                }
            } catch (error) {
                console.error('Error parsing authData:', error);
            }
        } else {
            console.log('⚠️ No authData found in localStorage');
        }
        return config; // Trả về config đã được modify
    },
    (error) => {
        // Nếu có lỗi trong quá trình chuẩn bị request
        return Promise.reject(error);
    }
)

// Interceptor: can thiệp vào response để xử lý refresh token
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 (Unauthorized) và chưa thử refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Nếu đang refresh, thêm request vào queue
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const authDataStr = localStorage.getItem("authData");
            if (!authDataStr) {
                processQueue(error, null);
                isRefreshing = false;
                return Promise.reject(error);
            }

            try {
                const authData = JSON.parse(authDataStr);
                if (!authData.refreshToken) {
                    processQueue(error, null);
                    isRefreshing = false;
                    return Promise.reject(error);
                }

                // Gọi API refresh token
                const refreshResult = await authenticationService.refreshAccessToken(authData.refreshToken);

                if (refreshResult.success && refreshResult.data) {
                    // Cập nhật token mới
                    const newAuthData = {
                        ...authData,
                        accessToken: refreshResult.data.accessToken,
                        refreshToken: refreshResult.data.refreshToken || authData.refreshToken
                    };
                    localStorage.setItem("authData", JSON.stringify(newAuthData));

                    // Xử lý các request trong queue
                    processQueue(null, refreshResult.data.accessToken);

                    // Thử lại request ban đầu với token mới
                    originalRequest.headers.Authorization = `Bearer ${refreshResult.data.accessToken}`;
                    isRefreshing = false;
                    return apiClient(originalRequest);
                } else {
                    // Refresh token thất bại, đăng xuất user
                    processQueue(error, null);
                    isRefreshing = false;
                    localStorage.removeItem("authData");
                    window.location.href = "/login";
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                localStorage.removeItem("authData");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
)

// Class chứa các method xử lý authentication
class AuthenticationService {
    // Method đăng nhập
    async authenticate(credentials: AuthenticationRequest): Promise<{ success: boolean; data?: AuthenticationResponse; message?: string }> {
        try {
            const response = await apiClient.post<ApiResponse<AuthenticationResponse>>(
                '/auth/login',
                credentials
            );
            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Đăng nhập thất bại',
                };
            }
            return {
                success: true,
                data: apiResponse.result, // Trả về AuthenticationResponse
            };
        } catch (error) {
            // Xử lý lỗi nếu request failed
            if (axios.isAxiosError(error)) {
                // Nếu là lỗi từ axios (VD: 400, 401, 500...)
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Đăng nhập thất bại',
                };
            }
            // Lỗi khác (VD: không có internet)
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    // Method upload hình ảnh lên Cloudinary
    async uploadImage(file: File): Promise<{ success: boolean; imageUrl?: string; message?: string }> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
            formData.append('folder', CLOUDINARY_CONFIG.folder);
            
            // Thêm timestamp để tránh cache
            formData.append('timestamp', Date.now().toString());

            const response = await fetch(getCloudinaryUploadUrl(), {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Cloudinary upload error:', errorData);
                throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            return {
                success: true,
                imageUrl: data.secure_url
            };
        } catch (error) {
            console.error('Upload error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Lỗi khi upload hình ảnh'
            };
        }
    }

    // Method cập nhật thông tin user bao gồm hình ảnh
    async updateUserProfile(userData: Partial<UserResponse>): Promise<{ success: boolean; data?: UserResponse; message?: string }> {
        try {
            const response = await apiClient.put<ApiResponse<UserResponse>>('/auth/profile', userData);
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Không thể cập nhật thông tin',
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
                    message: errorResponse?.message || 'Lỗi khi cập nhật thông tin',
                };
            }
            return {
                success: false,
                message: 'Lỗi không xác định',
            };
        }
    }

    // Method lấy thông tin user hiện tại từ server
    async getCurrentUser(): Promise<{ success: boolean; data?: UserResponse; message?: string }> {
        try {
            const response = await apiClient.get<ApiResponse<UserResponse>>('/auth/me');
            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Không thể lấy thông tin người dùng',
                };
            }

            return {
                success: true,
                data: apiResponse.result,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                // Nếu token hết hạn hoặc không hợp lệ
                if (error.response?.status === 401) {
                    // Xóa authData và yêu cầu đăng nhập lại
                    localStorage.removeItem('authData');
                    return {
                        success: false,
                        message: 'Phiên đăng nhập đã hết hạn',
                    };
                }
                return {
                    success: false,
                    message: errorResponse?.message || 'Không thể lấy thông tin người dùng',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    // Method refresh access token
    async refreshAccessToken(refreshToken: string): Promise<{ success: boolean; data?: AuthenticationResponse; message?: string }> {
        try {
            const response = await axios.post<ApiResponse<AuthenticationResponse>>(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/refresh`,
                { refreshToken },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Refresh token thất bại',
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
                    message: errorResponse?.message || 'Refresh token thất bại',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    // Method đổi mật khẩu
    async changePassword(passwordData: ChangePasswordRequest): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await apiClient.post<ApiResponse<any>>(
                '/auth/change-password',
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                }
            );

            const apiResponse = response.data;
            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Đổi mật khẩu thất bại',
                };
            }

            return {
                success: true,
                message: 'Đổi mật khẩu thành công',
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Đổi mật khẩu thất bại',
                };
            }
            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    // Method đăng xuất
    async logout(): Promise<{ success: boolean; message?: string }> {
        try {
            // Gọi API logout để invalidate token trên server
            await apiClient.post('/auth/logout');

            return {
                success: true,
                message: 'Đăng xuất thành công'
            };
        } catch (error) {
            // Ngay cả khi API logout lỗi, chúng ta vẫn trả success
            console.error('Logout API error:', error);
            return {
                success: true, // Vẫn trả success vì sẽ xóa local data ở AuthContext
                message: 'Đăng xuất thành công'
            };
        }
    }

    // Lấy thông tin auth hiện tại từ localStorage
    getCurrentAuthData(): AuthenticationResponse | null {
        const authDataStr = localStorage.getItem('authData');
        return authDataStr ? JSON.parse(authDataStr) : null; // Parse JSON hoặc trả null
    }

    // Lấy token hiện tại
    getToken(): string | null {
        const authDataStr = localStorage.getItem('authData');
        if (authDataStr) {
            try {
                const authData = JSON.parse(authDataStr);
                return authData.accessToken || null;
            } catch (error) {
                console.error('Error parsing authData:', error);
                return null;
            }
        }
        return null;
    }

    // Kiểm tra xem user có đăng nhập không
    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        // Kiểm tra token có hết hạn không (optional)
        try {
            // Parse JWT token để lấy expiry time
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;

            // Nếu token sắp hết hạn trong 5 phút, coi như hết hạn
            return payload.exp > (now + 300);
        } catch (error) {
            // Nếu không parse được token, coi như hết hạn
            return false;
        }
    }

    // Kiểm tra token có sắp hết hạn không
    isTokenExpiringSoon(): boolean {
        const token = this.getToken();
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;

            // Kiểm tra token có hết hạn trong 10 phút không
            return payload.exp <= (now + 600);
        } catch (error) {
            return true;
        }
    }

    // Refresh user data từ server
    async refreshUserData(): Promise<UserResponse | null> {
        const result = await this.getCurrentUser();
        if (result.success && result.data) {
            // Cập nhật user data trong authData
            const authDataStr = localStorage.getItem('authData');
            if (authDataStr) {
                try {
                    const authData = JSON.parse(authDataStr);
                    authData.user = result.data;
                    localStorage.setItem('authData', JSON.stringify(authData));
                    return result.data;
                } catch (error) {
                    console.error('Error updating authData:', error);
                }
            }
        }
        return null;
    }



}

// Export instance để sử dụng trong các component khác
export const authenticationService = new AuthenticationService();