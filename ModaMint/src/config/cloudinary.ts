// Cloudinary Configuration
// Đọc từ environment variables

export const CLOUDINARY_CONFIG = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    folder: 'modamint/avatars', // Folder lưu trữ trong Cloudinary
    apiUrl: 'https://api.cloudinary.com/v1_1'
};

// Helper function để tạo URL upload
export const getCloudinaryUploadUrl = () => {
    return `${CLOUDINARY_CONFIG.apiUrl}/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
};

// Helper function để tạo URL hình ảnh với transformations
export const getCloudinaryImageUrl = (publicId: string, transformations?: string) => {
    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
    return transformations 
        ? `${baseUrl}/${transformations}/${publicId}`
        : `${baseUrl}/${publicId}`;
};
