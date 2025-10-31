# Script Tự Động Lấy Hình Ảnh Sản Phẩm

Script Python để tự động lấy hình ảnh sản phẩm từ Picsum Photos và tạo SQL UPDATE script cho database.

## 🎯 Tính năng

- ✅ Tự động đọc danh sách sản phẩm từ file SQL
- ✅ Tạo URLs ảnh từ Picsum Photos (miễn access, không cần API key)
- ✅ Mỗi sản phẩm có 4 ảnh, kích thước 800x1000px
- ✅ Sử dụng seed để đảm bảo ảnh nhất quán cho từng sản phẩm
- ✅ Tự động tạo SQL UPDATE script với delimiter `|`

## 📋 Yêu cầu

- Python 3.7+
- Thư viện: `requests` (đã có trong requirements.txt)

## 🚀 Cách sử dụng

### 1. Cài đặt dependencies (nếu chưa có)

```bash
cd scraper
pip install -r requirements.txt
```

### 2. Chạy script

```bash
python fetch_product_images.py
```

Script sẽ:
1. Đọc danh sách sản phẩm từ file SQL
2. Tạo URLs ảnh cho từng sản phẩm (4 ảnh/sản phẩm)
3. Tạo file SQL UPDATE script tại: `../../BE/OrientalFashionShop_Backend/data/update_product_images_picsum.sql`

### 3. Chạy SQL script trong database

Mở file SQL đã tạo và chạy trong MySQL/PostgreSQL:

```sql
-- File: BE/OrientalFashionShop_Backend/data/update_product_images_picsum.sql
UPDATE products SET images = 'url1|url2|url3|url4' WHERE id = 1;
-- ... các UPDATE khác
```

## 📁 Cấu trúc file

```
FE/ModaMint/scraper/
├── fetch_product_images.py    # Script chính
├── requirements.txt            # Python dependencies
└── README_IMAGE_FETCHER.md    # File này

BE/OrientalFashionShop_Backend/data/
└── update_product_images_picsum.sql  # SQL script được tạo tự động
```

## 🔧 Cấu hình

Bạn có thể tùy chỉnh trong file `fetch_product_images.py`:

- **Kích thước ảnh**: Mặc định 800x1000px
  ```python
  width=800, height=1000
  ```

- **Số lượng ảnh**: Mặc định 4 ảnh/sản phẩm
  ```python
  count=4
  ```

- **Seeds**: Điều chỉnh để có ảnh khác nhau cho từng category
  ```python
  self.category_seeds = {
      9: {'base': 1000, 'name': 'Áo Sơ Mi'},
      # ...
  }
  ```

## 📝 Format dữ liệu

Images được lưu trong database với format:
```
url1|url2|url3|url4
```

Sử dụng delimiter `|` theo `StringSetConverter` trong backend Java.

## 💡 Lưu ý

1. **Picsum Photos**: 
   - Miễn phí, không cần API key
   - Ảnh placeholder random (không phải ảnh thời trang thực)
   - Phù hợp cho development/testing

2. **Nếu cần ảnh thực tế**:
   - Có thể sử dụng Unsplash API (cần đăng ký, có free tier)
   - Hoặc scrape từ các website thời trang
   - Hoặc upload ảnh lên Cloudinary/Cloudflare Images

3. **Ảnh nhất quán**:
   - Script sử dụng seed để mỗi sản phẩm luôn có cùng ảnh
   - Thay đổi seed sẽ thay đổi ảnh

## 🐛 Troubleshooting

### Lỗi: Không đọc được file SQL
- Kiểm tra đường dẫn file: `../../BE/OrientalFashionShop_Backend/data/modamint_db.sql`
- Đảm bảo file tồn tại và có quyền đọc

### Lỗi: Không tạo được SQL file
- Kiểm tra quyền ghi vào thư mục output
- Kiểm tra dung lượng ổ nxớng

### Ảnh không hiển thị
- Kiểm tra kết nối internet (ảnh được load từ Picsum Photos)
- Kiểm tra format delimiter `|` trong database
- Kiểm tra `StringSetConverter` trong backend

## 📚 Tham khảo

- [Picsum Photos API](https://picsum.photos/)
- [StringSetConverter](../BE/OrientalFashionShop_Backend/src/main/java/com/example/ModaMint_Backend/converter/StringSetConverter.java)

FILE này.

