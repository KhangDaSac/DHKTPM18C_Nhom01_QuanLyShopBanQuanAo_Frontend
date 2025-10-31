# Hướng dẫn tạo giao diện CRUD cho Khuyến mãi

## Đã hoàn thành:

### 1. Service API (`src/services/promotion/index.ts`) ✓
- Đã tạo service cho 2 loại khuyến mãi:
  - **PercentagePromotion**: Khuyến mãi giảm theo %
  - **AmountPromotion**: Khuyến mãi giảm theo số tiền

- Các chức năng API đã có:
  - `getAll()`: Lấy tất cả khuyến mãi
  - `getById(id)`: Lấy khuyến mãi theo ID
  - `create(data)`: Tạo khuyến mãi mới
  - `update(id, data)`: Cập nhật khuyến mãi
  - `delete(id)`: Xóa khuyến mãi
  - `getActive()`: Lấy khuyến mãi đang hoạt động

## Cấu trúc Entity từ Backend:

### PercentagePromotion (Giảm theo %)
```java
{
    id: Long
    code: String                 // Mã KM VD: "WELCOME10"
    discountPercent: BigDecimal  // % giảm VD: 10
    minOrderValue: BigDecimal    // Giá trị đơn tối thiểu VD: 100000
    startAt: LocalDateTime       // Ngày bắt đầu
    endAt: LocalDateTime         // Ngày kết thúc
    quantity: Integer            // Số lượng mã
    isActive: Boolean            // Trạng thái (true/false)
    createAt: LocalDateTime      // Ngày tạo (tự động)
}
```

### AmountPromotion (Giảm theo số tiền)
```java
{
    id: Long
    code: String                 // Mã KM VD: "SALE50K"
    discountAmount: BigDecimal   // Số tiền giảm VD: 50000
    minOrderValue: BigDecimal    // Giá trị đơn tối thiểu VD: 100000
    startAt: LocalDateTime       // Ngày bắt đầu
    endAt: LocalDateTime         // Ngày kết thúc
    quantity: Integer            // Số lượng mã
    isActive: Boolean            // Trạng thái (true/false)
    createAt: LocalDateTime      // Ngày tạo (tự động)
}
```

## File Component cần tạo:

### Đường dẫn: `src/dashboard/pages/promotions/index.tsx`

## Các tính năng cần có:

### 1. Giao diện chính
- **2 Tab riêng biệt**:
  - Tab 1: Khuyến mãi theo % (Percentage Promotions)
  - Tab 2: Khuyến mãi theo số tiền (Amount Promotions)

### 2. Thống kê (Statistics Cards)
- Tổng KM theo %
- KM theo % đang hoạt động
- Tổng KM theo số tiền
- KM theo số tiền đang hoạt động

### 3. Bảng hiển thị (Table)
**Columns cần có:**
- Mã KM (Tag màu xanh/xanh lá)
- Giá trị giảm (% hoặc VNĐ)
- Giá trị đơn tối thiểu
- Thời gian (Từ ngày - Đến ngày)
- Số lượng còn lại
- Trạng thái (Hoạt động/Không hoạt động)
- Thao tác (Xem, Sửa, Xóa)

### 4. Form thêm/sửa
**Fields cho Percentage Promotion:**
- Mã khuyến mãi (required, min 3 ký tự)
- Phần trăm giảm giá (required, 1-100%)
- Giá trị đơn tối thiểu (required, VNĐ)
- Thời gian áp dụng (RangePicker with time)
- Số lượng mã (required, >= 1)
- Trạng thái (Switch: Hoạt động/Không hoạt động)

**Fields cho Amount Promotion:**
- Mã khuyến mãi (required, min 3 ký tự)
- Số tiền giảm giá (required, VNĐ, min 1000)
- Giá trị đơn tối thiểu (required, VNĐ)
- Thời gian áp dụng (RangePicker with time)
- Số lượng mã (required, >= 1)
- Trạng thái (Switch: Hoạt động/Không hoạt động)

### 5. Modal xem chi tiết
- Hiển thị đầy đủ thông tin khuyến mãi
- Sử dụng Ant Design Descriptions component
- Format tiền tệ và ngày tháng đẹp mắt

## Component và Hooks cần import:

```typescript
import React, { useState, useEffect } from 'react';
import {
    Table, Button, Space, Tag, Modal, Form, Input, InputNumber,
    message, Card, Row, Col, Statistic, Typography, Popconfirm,
    Tabs, DatePicker, Switch, Descriptions, Badge
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
    PercentageOutlined, DollarOutlined, ReloadOutlined,
    TagOutlined, CalendarOutlined, CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    percentagePromotionService,
    amountPromotionService,
    type PercentagePromotion,
    type AmountPromotion
} from '../../../services/promotion';
```

## Các hàm chính cần implement:

1. **loadPercentagePromotions()** - Tải danh sách KM theo %
2. **loadAmountPromotions()** - Tải danh sách KM theo số tiền
3. **handlePercentageSubmit()** - Xử lý thêm/sửa KM theo %
4. **handleAmountSubmit()** - Xử lý thêm/sửa KM theo số tiền
5. **handleDeletePercentage()** - Xóa KM theo %
6. **handleDeleteAmount()** - Xóa KM theo số tiền
7. **openEditPercentageModal()** - Mở modal sửa KM theo %
8. **openEditAmountModal()** - Mở modal sửa KM theo số tiền
9. **handleViewPromotion()** - Xem chi tiết KM
10. **formatCurrency()** - Format tiền VNĐ

## Lưu ý khi code:

1. **API Endpoint** cần cấu hình đúng trong service:
   - Percentage: `/api/percentage-promotions`
   - Amount: `/api/amount-promotions`

2. **Format ngày giờ** khi gửi lên backend:
   - Sử dụng: `dayjs(date).format('YYYY-MM-DDTHH:mm:ss')`

3. **Validation**:
   - Mã KM: required, min 3 ký tự
   - Giảm %: 1-100
   - Số tiền giảm: >= 1000 VNĐ
   - Số lượng: >= 1
   - Ngày bắt đầu phải < Ngày kết thúc

4. **UX/UI**:
   - Hiển thị loading khi gọi API
   - Toast message khi thành công/thất bại
   - Confirm trước khi xóa
   - Disable input khi đang submit

## Ví dụ code snippet quan trọng:

### Load data
```typescript
const loadPercentagePromotions = async () => {
    setLoadingPercentage(true);
    try {
        const data = await percentagePromotionService.getAll();
        setPercentagePromotions(data);
    } catch (error) {
        message.error('Không thể tải danh sách khuyến mãi');
    } finally {
        setLoadingPercentage(false);
    }
};
```

### Submit form
```typescript
const handlePercentageSubmit = async (values: any) => {
    const promotionData = {
        code: values.code,
        discountPercent: values.discountPercent,
        minOrderValue: values.minOrderValue,
        startAt: values.dateRange[0].format('YYYY-MM-DDTHH:mm:ss'),
        endAt: values.dateRange[1].format('YYYY-MM-DDTHH:mm:ss'),
        quantity: values.quantity,
        isActive: values.isActive ?? true,
    };

    if (editingPercentage) {
        await percentagePromotionService.update(editingPercentage.id!, promotionData);
        message.success('Cập nhật thành công!');
    } else {
        await percentagePromotionService.create(promotionData);
        message.success('Tạo mới thành công!');
    }
    
    loadPercentagePromotions();
    setIsPercentageModalVisible(false);
};
```

## Kiểm tra Backend API

Trước khi chạy frontend, hãy đảm bảo backend đã có các endpoint sau:

**Percentage Promotions:**
- GET `/api/percentage-promotions` - Lấy tất cả
- GET `/api/percentage-promotions/{id}` - Lấy theo ID
- POST `/api/percentage-promotions` - Tạo mới
- PUT `/api/percentage-promotions/{id}` - Cập nhật
- DELETE `/api/percentage-promotions/{id}` - Xóa

**Amount Promotions:**
- GET `/api/amount-promotions` - Lấy tất cả
- GET `/api/amount-promotions/{id}` - Lấy theo ID
- POST `/api/amount-promotions` - Tạo mới
- PUT `/api/amount-promotions/{id}` - Cập nhật
- DELETE `/api/amount-promotions/{id}` - Xóa

## Test Cases

1. ✓ Hiển thị danh sách khuyến mãi
2. ✓ Thêm khuyến mãi mới (cả 2 loại)
3. ✓ Sửa khuyến mãi
4. ✓ Xóa khuyến mãi
5. ✓ Xem chi tiết khuyến mãi
6. ✓ Chuyển đổi giữa các tab
7. ✓ Validation form
8. ✓ Hiển thị thống kê đúng
9. ✓ Format tiền tệ và ngày tháng
10. ✓ Xử lý lỗi API

---

**Ghi chú:** File service đã được tạo tại `src/services/promotion/index.ts`. 
Bạn có thể tạo component tại `src/dashboard/pages/promotions/index.tsx` theo hướng dẫn trên.
