# Profile Update Feature Documentation

## Overview
This document describes the implementation of the user profile update feature with Cloudinary image upload integration.

## Backend API

### 1. Update User Information
**Endpoint**: `PUT /users/{userId}`

**Request Headers**:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body** (UserUpdateRequest):
```json
{
  "email": "user@example.com",
  "phone": "0123456789",
  "firstName": "Nguyen",
  "lastName": "Van A",
  "dob": "2000-01-15",
  "image": "https://res.cloudinary.com/xxx/image/upload/v123/products/avatar.jpg"
}
```

**Validation Rules**:
- `email`: Must be valid email format
- `phone`: Must be 10-11 digits (pattern: `^[0-9]{10,11}$`)
- `dob`: Format yyyy-MM-dd

**Response** (ApiResponse<UserResponse>):
```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "id": "user123",
    "username": "nguyenvana",
    "email": "user@example.com",
    "phone": "0123456789",
    "firstName": "Nguyen",
    "lastName": "Van A",
    "dob": "2000-01-15",
    "image": "https://res.cloudinary.com/xxx/image/upload/v123/products/avatar.jpg",
    "roles": ["USER"]
  }
}
```

### 2. Upload Image to Cloudinary
**Endpoint**: `POST /images/upload`

**Request Headers**:
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Request Body**:
- Form field: `file` (MultipartFile)

**File Validation**:
- Allowed types: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`
- Max size: 10MB
- Auto upload to Cloudinary folder: `products`

**Response** (ApiResponse<ImageUploadResponse>):
```json
{
  "code": 1000,
  "message": "Upload ảnh thành công",
  "result": {
    "imageUrl": "https://res.cloudinary.com/xxx/image/upload/v123/products/image.jpg"
  }
}
```

## Frontend Implementation

### Services

#### 1. ImageUploadService (`src/services/imageUpload/index.ts`)

**Purpose**: Handle image uploads to Cloudinary via backend API

**Key Methods**:
```typescript
// Upload single image
uploadImage(file: File): Promise<{
  success: boolean;
  imageUrl?: string;
  message?: string;
}>

// Upload multiple images
uploadMultipleImages(files: File[]): Promise<{
  success: boolean;
  imageUrls?: string[];
  message?: string;
}>
```

**Features**:
- Client-side validation (file type, file size)
- Automatic token injection via interceptor
- FormData creation for multipart upload
- Error handling with user-friendly messages

**Usage Example**:
```typescript
import { imageUploadService } from '@/services/imageUpload';

const handleUpload = async (file: File) => {
  const result = await imageUploadService.uploadImage(file);
  if (result.success) {
    console.log('Image URL:', result.imageUrl);
  } else {
    console.error('Error:', result.message);
  }
};
```

#### 2. UserService Updates (`src/services/user/index.ts`)

**Updated Interface**:
```typescript
export interface UpdateUserRequest {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;       // yyyy-MM-dd format
  image?: string;     // Cloudinary URL
}
```

**Method**:
```typescript
updateUser(userId: string, updateData: UpdateUserRequest): Promise<{
  success: boolean;
  data?: User;
  message?: string;
}>
```

### Components

#### ProfileMain Component (`src/pages/profile/ProfileMain.tsx`)

**Features**:
1. **Avatar Upload**:
   - Click camera icon to upload new avatar
   - Instant preview after selection
   - Auto-save to backend after successful upload
   - File validation (type, size)
   - Loading indicator during upload

2. **User Information Form**:
   - Edit mode toggle
   - Required field validation
   - Email format validation
   - Phone number validation (10-11 digits)
   - Date picker for birth date
   - Cancel/Save actions

3. **Quick Actions**:
   - Navigate to address management
   - Navigate to order history
   - Navigate to change password

**State Management**:
```typescript
const [userData, setUserData] = useState<any>(null);
const [avatarUrl, setAvatarUrl] = useState<string>('');
const [isEditing, setIsEditing] = useState(false);
const [loading, setLoading] = useState(false);
```

**Key Functions**:

```typescript
// Fetch current user data
const fetchUserData = async () => {
  const result = await authenticationService.getCurrentUser();
  if (result.success && result.data) {
    setUserData(result.data);
    form.setFieldsValue({
      ...result.data,
      dob: result.data.dob ? dayjs(result.data.dob) : null
    });
  }
};

// Handle avatar upload
const handleAvatarChange = async (info: any) => {
  if (info.file.status === 'done') {
    const file = info.file.originFileObj;
    
    // 1. Upload to Cloudinary
    const uploadResult = await imageUploadService.uploadImage(file);
    
    // 2. Update user profile
    if (uploadResult.success) {
      const updateResult = await userService.updateUser(
        userData.id,
        { image: uploadResult.imageUrl }
      );
      
      if (updateResult.success) {
        setUserData(updateResult.data);
        updateUser(updateResult.data); // Update AuthContext
        message.success('Cập nhật ảnh đại diện thành công!');
      }
    }
  }
};

// Handle form submit
const handleSubmit = async () => {
  const values = form.getFieldsValue();
  
  const updateData: UpdateUserRequest = {
    email: values.email,
    phone: values.phone,
    firstName: values.firstName,
    lastName: values.lastName,
    dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : undefined,
    image: avatarUrl || undefined
  };
  
  const result = await userService.updateUser(userData.id, updateData);
  
  if (result.success) {
    setUserData(result.data);
    updateUser(result.data); // Update AuthContext
    message.success('Cập nhật thông tin thành công!');
    setIsEditing(false);
  }
};
```

## User Flow

### Flow 1: Update Avatar
1. User clicks camera icon on avatar
2. File picker opens
3. User selects image file
4. Frontend validates file (type, size)
5. Upload to backend `/images/upload`
6. Backend uploads to Cloudinary
7. Backend returns Cloudinary URL
8. Frontend calls `PUT /users/{userId}` with new image URL
9. Backend updates user record
10. Frontend updates UI and AuthContext
11. Success message displayed

### Flow 2: Update Profile Information
1. User clicks "Chỉnh sửa" button
2. Form becomes editable
3. User modifies fields (email, phone, firstName, lastName, dob)
4. User clicks "Lưu thay đổi"
5. Frontend validates form fields
6. Frontend formats date to yyyy-MM-dd
7. Frontend calls `PUT /users/{userId}` with updated data
8. Backend validates and updates user record
9. Backend returns updated UserResponse
10. Frontend updates UI and AuthContext
11. Form becomes read-only again
12. Success message displayed

## Error Handling

### Client-side Validation Errors
- Invalid file type → "Chỉ hỗ trợ file ảnh định dạng JPG, PNG, GIF, WEBP"
- File too large → "Kích thước file không được vượt quá 10MB"
- Invalid email → "Email không hợp lệ!"
- Invalid phone → "Số điện thoại không hợp lệ!"
- Required fields → "Vui lòng nhập {field}!"

### Server-side Errors
- Upload failed → Display backend error message
- Update failed → Display backend error message
- Token expired → Redirect to login page
- Network error → "Lỗi kết nối đến server"

## Integration with AuthContext

The profile update feature integrates with `AuthContext` to maintain authentication state:

```typescript
const { isAuthenticated, updateUser } = useAuth();

// After successful update
updateUser(updatedUserData); // Sync with global auth state
```

This ensures:
- User data is consistent across the app
- Avatar changes reflect in header/navbar
- User info updates reflect everywhere

## Security Considerations

1. **Authentication**: All API calls require valid JWT token
2. **Authorization**: Users can only update their own profile
3. **File Validation**: Both client and server validate file type and size
4. **Data Validation**: Email, phone number format validated
5. **HTTPS**: Cloudinary URLs use secure_url (HTTPS)

## Testing Checklist

- [ ] Upload avatar with valid image (JPG, PNG, GIF, WEBP)
- [ ] Upload avatar with invalid file type (should reject)
- [ ] Upload avatar larger than 10MB (should reject)
- [ ] Update email with valid format
- [ ] Update email with invalid format (should show error)
- [ ] Update phone with 10 digits
- [ ] Update phone with 11 digits
- [ ] Update phone with invalid format (should show error)
- [ ] Update first name and last name
- [ ] Select date of birth
- [ ] Cancel edit mode (should restore original values)
- [ ] Save changes (should persist to backend)
- [ ] Check if avatar updates in header/navbar
- [ ] Check if updates reflect after page refresh
- [ ] Test with expired token (should redirect to login)

## Dependencies

### Frontend
- `antd`: ^5.x (UI components: Form, Input, Button, Upload, DatePicker, message)
- `dayjs`: ^1.11.10 (Date formatting)
- `axios`: HTTP client
- `react-router-dom`: Navigation

### Backend
- Spring Boot
- Cloudinary Java SDK
- MultipartFile support
- JWT authentication

## Future Enhancements

1. **Image Cropping**: Add image cropping before upload
2. **Progress Bar**: Show upload progress percentage
3. **Multiple Images**: Support profile gallery
4. **Image Optimization**: Auto-resize/compress images
5. **Email Verification**: Require email verification on change
6. **Phone Verification**: Require OTP on phone change
7. **Audit Log**: Track profile changes history
8. **Profile Completion**: Show % complete indicator
