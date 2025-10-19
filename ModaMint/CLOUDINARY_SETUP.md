# Hướng dẫn cấu hình Cloudinary cho ModaMint

## 1. Tạo tài khoản Cloudinary

1. Truy cập [https://cloudinary.com](https://cloudinary.com)
2. Đăng ký tài khoản miễn phí
3. Xác nhận email

## 2. Lấy thông tin cấu hình

Sau khi đăng nhập vào Cloudinary Dashboard:

1. **Cloud Name**: Tìm ở góc trên bên phải dashboard
2. **Upload Preset**: 
   - Vào Settings > Upload
   - Tạo Upload Preset mới hoặc sử dụng preset có sẵn
   - Đặt Signing Mode: "Unsigned" để upload từ frontend

## 3. Cấu hình Environment Variables

Tạo file `.env` trong thư mục gốc của project và thêm:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## 4. Ví dụ cấu hình

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=dmodamint
VITE_CLOUDINARY_API_KEY=123456789012345
VITE_CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
VITE_CLOUDINARY_UPLOAD_PRESET=modamint_avatars
```

## 5. Lấy thông tin từ Cloudinary Dashboard

1. **Cloud Name**: Tìm ở góc trên bên phải dashboard
2. **API Key**: Vào Settings > API Keys
3. **API Secret**: Vào Settings > API Keys (chỉ hiển thị một lần)
4. **Upload Preset**: 
   - Vào Settings > Upload
   - Tạo Upload Preset mới
   - Đặt Signing Mode: "Unsigned" để upload từ frontend

## 6. Tính năng đã tích hợp

### Upload Avatar
- Người dùng có thể click vào nút camera để upload ảnh mới
- Ảnh được upload trực tiếp lên Cloudinary
- URL ảnh được lưu vào database thông qua API `/auth/profile`

### Hiển thị Avatar
- Avatar được load từ API `/auth/me` với field `image`
- Fallback về icon mặc định nếu không có ảnh

### Validation
- Chỉ cho phép file JPG/PNG
- Giới hạn kích thước 2MB
- Hiển thị loading khi đang upload

## 7. API Endpoints cần thiết

### GET `/auth/me`
Trả về thông tin user bao gồm:
```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "id": "user_id",
    "username": "username",
    "email": "email@example.com",
    "firstName": "First",
    "lastName": "Last",
    "phone": "0123456789",
    "dob": "1990-01-01",
    "image": "https://res.cloudinary.com/cloud_name/image/upload/v1234567890/modamint/avatars/avatar.jpg"
  }
}
```

### PUT `/auth/profile`
Cập nhật thông tin user:
```json
{
  "firstName": "New First",
  "lastName": "New Last",
  "email": "new@example.com",
  "phone": "0987654321",
  "dob": "1990-01-01",
  "image": "https://res.cloudinary.com/cloud_name/image/upload/v1234567890/modamint/avatars/new_avatar.jpg"
}
```

## 8. Troubleshooting

### Lỗi upload
- Kiểm tra Upload Preset có đúng không
- Kiểm tra Cloud Name có đúng không
- Kiểm tra Upload Preset có được set "Unsigned" không

### Lỗi hiển thị ảnh
- Kiểm tra URL ảnh có hợp lệ không
- Kiểm tra API `/auth/me` có trả về field `image` không

### Lỗi cập nhật profile
- Kiểm tra API `/auth/profile` có hoạt động không
- Kiểm tra token có hợp lệ không

## 9. Lưu ý quan trọng

### Environment Variables
- File `.env` phải được tạo trong thư mục gốc của project (cùng cấp với `package.json`)
- Không commit file `.env` vào git (đã có trong `.gitignore`)
- Restart dev server sau khi thay đổi `.env`

### Security
- API Key và Secret chỉ cần thiết cho signed uploads
- Với unsigned uploads (khuyến nghị), chỉ cần Cloud Name và Upload Preset
- Upload Preset phải được set "Unsigned" để upload từ frontend

### Performance
- Cloudinary tự động optimize hình ảnh
- Có thể thêm transformations trong URL để resize/crop
- Sử dụng `getCloudinaryImageUrl()` helper để tạo URL với transformations
