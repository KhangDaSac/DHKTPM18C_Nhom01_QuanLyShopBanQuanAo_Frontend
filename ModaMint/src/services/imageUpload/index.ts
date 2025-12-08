import axios from 'axios';

// Interface cho ImageUploadResponse từ backend
export interface ImageUploadResponse {
    imageUrl: string;
}

// Interface cho API Response
export interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

// Tạo axios client cho image upload
const imageApiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
    withCredentials: true,
});

// Interceptor để thêm token
imageApiClient.interceptors.request.use(
    (config) => {
        const authDataStr = localStorage.getItem('authData');
        const authData = authDataStr ? JSON.parse(authDataStr) : null;
        const token = authData?.accessToken || authData?.token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

class ImageUploadService {
    /**
     * Upload ảnh lên Cloudinary thông qua backend API
     * Endpoint: POST /images/upload
     * Content-Type: multipart/form-data
     * 
     * @param file - File ảnh cần upload
     * @returns Promise với imageUrl nếu thành công
     */
    async uploadImage(file: File): Promise<{ success: boolean; imageUrl?: string; message?: string }> {
        try {
            console.log('📤 Uploading image:', file.name, 'size:', file.size, 'bytes');

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                return {
                    success: false,
                    message: 'Chỉ hỗ trợ file ảnh định dạng JPG, PNG, GIF, WEBP',
                };
            }

            // Validate file size (10MB max)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                return {
                    success: false,
                    message: 'Kích thước file không được vượt quá 10MB',
                };
            }

            // Tạo FormData
            const formData = new FormData();
            formData.append('file', file);

            // Upload lên backend
            const response = await imageApiClient.post<ApiResponse<ImageUploadResponse>>(
                '/images/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log('📥 Upload response:', response.data);

            const apiResponse = response.data;

            if (apiResponse.code !== 1000) {
                return {
                    success: false,
                    message: apiResponse.message || 'Upload ảnh thất bại',
                };
            }

            return {
                success: true,
                imageUrl: apiResponse.result.imageUrl,
                message: 'Upload ảnh thành công',
            };
        } catch (error) {
            console.error('❌ Upload image error:', error);

            if (axios.isAxiosError(error)) {
                const errorResponse = error.response?.data as ApiResponse<any>;
                return {
                    success: false,
                    message: errorResponse?.message || 'Upload ảnh thất bại',
                };
            }

            return {
                success: false,
                message: 'Lỗi kết nối đến server',
            };
        }
    }

    /**
     * Upload nhiều ảnh cùng lúc
     * @param files - Mảng các file ảnh
     * @returns Promise với mảng imageUrl
     */
    async uploadMultipleImages(files: File[]): Promise<{
        success: boolean;
        imageUrls?: string[];
        message?: string
    }> {
        try {
            const uploadPromises = files.map(file => this.uploadImage(file));
            const results = await Promise.all(uploadPromises);

            const failedUploads = results.filter(r => !r.success);
            if (failedUploads.length > 0) {
                return {
                    success: false,
                    message: `${failedUploads.length} ảnh upload thất bại`,
                };
            }

            const imageUrls = results
                .filter(r => r.success && r.imageUrl)
                .map(r => r.imageUrl!);

            return {
                success: true,
                imageUrls,
                message: `Upload ${imageUrls.length} ảnh thành công`,
            };
        } catch (error) {
            console.error('❌ Upload multiple images error:', error);
            return {
                success: false,
                message: 'Lỗi khi upload nhiều ảnh',
            };
        }
    }
}

export const imageUploadService = new ImageUploadService();
