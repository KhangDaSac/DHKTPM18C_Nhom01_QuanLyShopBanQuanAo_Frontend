# Hướng Dẫn Sử Dụng Upload Ảnh Sản Phẩm

## Tổng Quan
Chức năng thêm/sửa sản phẩm đã được cập nhật để **tải ảnh trực tiếp từ máy tính** thay vì nhập URL thủ công.

---

## Cách Sử Dụng

### 1. Tải Ảnh Sản Phẩm Chính

**Vị trí:** Tab "Thông tin sản phẩm" → Mục "Hình ảnh sản phẩm"

**Cách làm:**
1. Click vào khung "Tải ảnh" hoặc kéo thả ảnh vào khung
2. Chọn tối đa **8 ảnh** từ máy tính
3. Xem trước ảnh ngay sau khi chọn
4. Click biểu tượng **X** để xóa ảnh không muốn

**Lưu ý:**
- Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)
- Mỗi ảnh tối đa **10MB**
- Ảnh đầu tiên sẽ là ảnh đại diện

---

### 2. Tải Ảnh Biến Thể (Variants)

**Vị trí:** Tab "Biến thể sản phẩm" → Cột "Ảnh biến thể"

#### Khi THÊM sản phẩm mới:
1. Nhấn "Thêm biến thể mới"
2. Điền thông tin (size, màu, giá, số lượng...)
3. Ở cột "Ảnh biến thể", click vào khung upload
4. Chọn **1 ảnh** cho biến thể đó
5. Xem trước ảnh ngay lập tức

#### Khi SỬA sản phẩm:
1. Nhấn "Sửa" ở biến thể muốn đổi ảnh
2. Click vào ảnh hiện tại hoặc khung upload
3. Chọn ảnh mới từ máy tính
4. Nhấn "Lưu" để cập nhật

**Lưu ý:**
- Mỗi biến thể chỉ có **1 ảnh**
- File tối đa **10MB**

---

## Quy Trình Tải Ảnh Lên

### Khi nhấn "Thêm mới" / "Cập nhật":

1. ✅ **Kiểm tra thông tin** sản phẩm (tên, mô tả, brand, category...)
2. 🔄 **Tải ảnh sản phẩm lên Cloudinary** (nếu có)
   - Hiển thị: "Đang tải ảnh sản phẩm lên..."
   - Tải song song tất cả ảnh
3. 🔄 **Tải ảnh biến thể lên Cloudinary** (nếu có)
   - Hiển thị: "Đang tải ảnh biến thể lên..."
   - Tải tuần tự từng biến thể
4. ✅ **Lưu sản phẩm** với URL ảnh từ Cloudinary
5. 🎉 **Hoàn thành!**

---

## Xử Lý Lỗi

### Lỗi thường gặp:

| Lỗi | Nguyên nhân | Giải pháp |
|------|-------------|-----------|
| "Chỉ có thể tải lên file ảnh!" | File không phải ảnh | Chọn file JPG/PNG/GIF/WebP |
| "Kích thước ảnh phải nhỏ hơn 10MB!" | File quá lớn | Nén ảnh hoặc chọn ảnh nhỏ hơn |
| "Không thể tải ảnh lên" | Lỗi mạng/server | Kiểm tra kết nối, thử lại |
| "Một số ảnh không tải lên được" | Một vài ảnh lỗi | Kiểm tra lại các file ảnh |

---

## So Sánh Trước & Sau

### ❌ **Trước đây:**
```
Hình ảnh sản phẩm (URL, phân cách bằng |)
┌──────────────────────────────────────────────┐
│ https://image1.jpg|https://image2.jpg|...    │
└──────────────────────────────────────────────┘
```
- Phải tự upload ảnh lên Cloudinary
- Copy-paste URL thủ công
- Dễ nhầm lẫn, gõ sai
- Không xem trước được

### ✅ **Bây giờ:**
```
Hình ảnh sản phẩm
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│  📷 │ │  📷 │ │  📷 │ │  +  │
│     │ │     │ │     │ │Tải │
│  X  │ │  X  │ │  X  │ │ảnh │
└─────┘ └─────┘ └─────┘ └─────┘
```
- Click chọn file hoặc kéo thả
- Tự động upload lên Cloudinary
- Xem trước ngay lập tức
- Kiểm tra file tự động

---

## Lưu Ý Quan Trọng

### ⚠️ Cần Làm:
✅ Chọn ảnh chất lượng cao (rõ nét, đẹp)
✅ Chọn đúng file ảnh (JPG, PNG, GIF, WebP)
✅ Giữ kích thước file < 10MB
✅ Đợi quá trình tải ảnh hoàn tất trước khi đóng modal

### ⛔ Không Nên:
❌ Chọn file không phải ảnh (PDF, Word, video...)
❌ Chọn ảnh quá lớn (> 10MB)
❌ Nhấn "Thêm mới" nhiều lần khi đang tải ảnh
❌ Đóng modal khi đang upload

---

## Ví Dụ Thực Tế

### Thêm sản phẩm "Áo Sơ Mi Nam":

1. **Tab "Thông tin sản phẩm":**
   - Tên: "Áo Sơ Mi Nam Công Sở"
   - Mô tả: "Chất liệu cotton cao cấp..."
   - Brand: "Louis Vuitton"
   - Category: "Áo"
   - **Ảnh:** Chọn 5 ảnh áo sơ mi (góc trước, sau, chi tiết...)

2. **Tab "Biến thể sản phẩm":**
   
   **Biến thể 1:**
   - Size: M
   - Màu: Trắng
   - Giá: 500,000₫
   - Số lượng: 100
   - **Ảnh:** Chọn ảnh áo màu trắng
   
   **Biến thể 2:**
   - Size: L
   - Màu: Xanh
   - Giá: 520,000₫
   - Số lượng: 80
   - **Ảnh:** Chọn ảnh áo màu xanh

3. **Nhấn "Thêm mới":**
   - Hệ thống tải 5 ảnh sản phẩm + 2 ảnh biến thể = **7 ảnh** lên Cloudinary
   - Hiển thị thông báo: "Đã tải lên 5 ảnh sản phẩm"
   - Hiển thị: "Đã tải ảnh biến thể thành công"
   - **Thành công!** "Đã thêm sản phẩm và biến thể thành công"

---

## Câu Hỏi Thường Gặp (FAQ)

### 1. Tôi có thể tải bao nhiêu ảnh?
- Sản phẩm chính: **Tối đa 8 ảnh**
- Mỗi biến thể: **1 ảnh**

### 2. File ảnh tối đa bao nhiêu MB?
- **10MB** mỗi file ảnh

### 3. Loại file nào được chấp nhận?
- JPG, JPEG, PNG, GIF, WebP

### 4. Tôi có thể xóa ảnh đã tải không?
- **Có**, click vào biểu tượng **X** trên mỗi ảnh

### 5. Ảnh có tự động upload khi chọn không?
- **Không**, ảnh chỉ upload khi nhấn "Thêm mới" hoặc "Cập nhật"

### 6. Nếu upload lỗi thì sao?
- Hệ thống sẽ báo lỗi, bạn có thể thử lại

### 7. Có cần setup Cloudinary không?
- **Không**, backend đã config sẵn, chỉ cần chọn file và nhấn Save

### 8. Tại sao không thấy ảnh sau khi lưu?
- Kiểm tra backend có chạy không
- Kiểm tra Cloudinary credentials
- Xem console log để debug

---

## Hỗ Trợ Kỹ Thuật

### Nếu gặp lỗi:

1. **Mở Console** (F12)
2. Xem tab **Network** để kiểm tra request `/api/v1/images/upload`
3. Xem tab **Console** để xem lỗi JavaScript
4. Chụp màn hình và báo cho dev team

### Thông tin debug:

- Request URL: `POST /api/v1/images/upload`
- Content-Type: `multipart/form-data`
- Response: `{ success: true, data: { imageUrl: "..." } }`

---

## Tài Liệu Liên Quan

- [PRODUCT_IMAGE_UPLOAD_CHANGES.md](./PRODUCT_IMAGE_UPLOAD_CHANGES.md) - Chi tiết kỹ thuật
- [IMAGE_UPLOAD_README.md](../../BE/OrientalFashionShop_Backend/docs/IMAGE_UPLOAD_README.md) - Hướng dẫn backend
- [IMAGE_UPLOAD_MODULE_GUIDE.md](../../BE/OrientalFashionShop_Backend/docs/IMAGE_UPLOAD_MODULE_GUIDE.md) - Module guide

---

**Cập nhật:** $(date)
**Người thực hiện:** GitHub Copilot
