# ND Style Web Scraper

Tool để cào dữ liệu từ trang web ND Style (https://nd-style.mysapo.net/) và xuất ra file JSON.

## Tính năng

- ✅ Cào danh mục sản phẩm (categories)
- ✅ Cào thông tin sản phẩm (products) 
- ✅ Cào thông tin nhãn hiệu (brands)
- ✅ Cào mã khuyến mãi (promotions)
- ✅ Xuất dữ liệu ra file JSON
- ✅ Logging chi tiết quá trình cào
- ✅ Xử lý lỗi và retry

## Cài đặt

### 1. Cài đặt Python dependencies

```bash
cd scraper
pip install -r requirements.txt
```

### 2. Chạy scraper

```bash
python nd_style_scraper.py
```

## Cấu trúc dữ liệu xuất ra

File `nd_style_data.json` sẽ chứa:

```json
{
  "categories": [
    {
      "id": 1,
      "name": "Nữ",
      "slug": "women",
      "parent_id": null,
      "level": 1,
      "url": "https://nd-style.mysapo.net/nu"
    }
  ],
  "products": [
    {
      "id": 1,
      "name": "Áo Khoác Da Lộn Nam 2 Lớp",
      "code": "product-code",
      "description": "Mô tả sản phẩm",
      "category": "men",
      "brand": "ND Style",
      "prices": {
        "original": 2000000,
        "sale": 1860000,
        "discount_percent": 7
      },
      "image_url": "https://...",
      "product_url": "https://...",
      "in_stock": true,
      "rating": 0,
      "reviews_count": 0
    }
  ],
  "brands": [
    {
      "id": 1,
      "name": "ND Style",
      "description": "Thương hiệu thời trang ND Style",
      "logo_url": "",
      "website": "https://nd-style.mysapo.net",
      "country": "Vietnam"
    }
  ],
  "promotions": [
    {
      "id": 1,
      "code": "FREESHIP",
      "description": "Miễn phí vận chuyển cho đơn hàng đầu tiên",
      "discount_type": "fixed",
      "discount_value": 0,
      "min_order_amount": 0,
      "expires_at": null,
      "is_active": true
    }
  ],
  "metadata": {
    "scraped_at": "2024-10-18 18:30:00",
    "total_products": 50,
    "total_categories": 15,
    "base_url": "https://nd-style.mysapo.net"
  }
}
```

## Cấu hình

Bạn có thể tùy chỉnh scraper bằng cách chỉnh sửa các tham số trong class `NDStyleScraper`:

- `base_url`: URL gốc của website
- `timeout`: Thời gian timeout cho requests
- `delay`: Thời gian delay giữa các request

## Logging

Scraper sẽ tạo file log `scraper.log` để theo dõi quá trình cào dữ liệu.

## Lưu ý

- Scraper có delay 1 giây giữa các request để tránh bị website block
- Chỉ cào tối đa 5 danh mục để tránh quá tải
- Dữ liệu được lưu với encoding UTF-8
- Có thể cần điều chỉnh selectors nếu website thay đổi cấu trúc

## Troubleshooting

### Lỗi kết nối
- Kiểm tra kết nối internet
- Thử tăng timeout trong code

### Không cào được dữ liệu
- Kiểm tra xem website có thay đổi cấu trúc không
- Xem file log để biết chi tiết lỗi
- Có thể cần cập nhật selectors

### File JSON không được tạo
- Kiểm tra quyền ghi file trong thư mục scraper
- Đảm bảo có đủ dung lượng ổ cứng

## Mở rộng

Để cào thêm dữ liệu từ các trang khác, bạn có thể:

1. Thêm method mới trong class `NDStyleScraper`
2. Cập nhật method `run_scraper()` để gọi method mới
3. Thêm field mới vào `scraped_data`

Ví dụ:
```python
def scrape_reviews(self):
    # Code để cào đánh giá sản phẩm
    pass
```
