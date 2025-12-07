# Tích Hợp API Đơn Hàng - Dashboard

## 📋 Tổng Quan

Đã tích hợp API backend để lấy danh sách đơn hàng thực từ database thay vì dữ liệu mock.

---

## ✅ Đã Hoàn Thành

### 1. **Order Service** (`src/services/order/index.ts`)

#### Các Interface
```typescript
export interface OrderResponse {
  id: number;
  orderCode: string;
  customerId: string;
  totalAmount: number;
  subTotal: number;
  promotionId?: string;
  promotionValue?: number;
  orderStatus: 'PENDING' | 'PREPARING' | 'ARRIVED_AT_LOCATION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'E_WALLET';
  shippingAddressId?: number;
  phone: string;
  createAt: string;
  updateAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
```

#### Các Methods

1. **getAllOrders()** - Lấy tất cả đơn hàng
```typescript
const result = await orderService.getAllOrders();
// Returns: { success: boolean, data: OrderResponse[], message?: string }
```

2. **getOrdersWithPagination()** - Lấy đơn hàng có phân trang
```typescript
const result = await orderService.getOrdersWithPagination(page, size, sortBy, sortDirection);
// Returns: { success: boolean, data: PageResponse<OrderResponse> }
```

3. **getOrderById()** - Lấy chi tiết đơn hàng
```typescript
const result = await orderService.getOrderById(orderId);
// Returns: { success: boolean, data: OrderResponse }
```

4. **getOrdersByCustomerId()** - Lấy đơn hàng của khách hàng
```typescript
const result = await orderService.getOrdersByCustomerId(customerId);
// Returns: { success: boolean, data: OrderResponse[] }
```

5. **getOrdersByStatus()** - Lấy đơn hàng theo trạng thái
```typescript
const result = await orderService.getOrdersByStatus('PENDING');
// Returns: { success: boolean, data: OrderResponse[] }
```

6. **updateOrder()** - Cập nhật đơn hàng
```typescript
const result = await orderService.updateOrder(orderId, payload);
// Returns: { success: boolean, data: OrderResponse }
```

7. **deleteOrder()** - Xóa đơn hàng
```typescript
const result = await orderService.deleteOrder(orderId);
// Returns: { success: boolean, data: string }
```

8. **getTotalOrderCount()** - Lấy tổng số đơn hàng
```typescript
const result = await orderService.getTotalOrderCount();
// Returns: { success: boolean, data: number }
```

---

### 2. **Orders Page** (`src/dashboard/pages/orders/index.tsx`)

#### Các Thay Đổi Chính

**Import Service:**
```typescript
import { orderService, type OrderResponse } from '../../../services/order';
```

**Fetch Orders từ Backend:**
```typescript
useEffect(() => {
    fetchOrders();
}, []);

const fetchOrders = async () => {
    setLoading(true);
    try {
        const result = await orderService.getAllOrders();
        if (result.success && result.data) {
            const mappedOrders = result.data.map((order: OrderResponse) => ({
                // Map backend data to frontend Order interface
                id: order.id,
                orderNumber: order.orderCode,
                customerId: parseInt(order.customerId) || 0,
                customerPhone: order.phone,
                status: mapBackendStatus(order.orderStatus),
                paymentMethod: mapPaymentMethod(order.paymentMethod),
                subtotal: order.totalAmount,
                discount: order.promotionValue || 0,
                total: order.subTotal,
                createdAt: new Date(order.createAt).toLocaleString('vi-VN'),
                updatedAt: new Date(order.updateAt).toLocaleString('vi-VN')
            }));
            setOrders(mappedOrders);
        }
    } catch (error) {
        message.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
        setLoading(false);
    }
};
```

**Status Mapping:**
```typescript
// Map backend order status to frontend status
const mapBackendStatus = (status: string): Order['status'] => {
    const statusMap: Record<string, Order['status']> = {
        'PENDING': 'pending',
        'PREPARING': 'processing',
        'ARRIVED_AT_LOCATION': 'processing',
        'SHIPPED': 'shipping',
        'DELIVERED': 'delivered',
        'CANCELLED': 'cancelled',
        'RETURNED': 'returned'
    };
    return statusMap[status] || 'pending';
};

// Map backend payment method to frontend
const mapPaymentMethod = (method: string): Order['paymentMethod'] => {
    const methodMap: Record<string, Order['paymentMethod']> = {
        'COD': 'cash',
        'BANK_TRANSFER': 'bank_transfer',
        'E_WALLET': 'e_wallet'
    };
    return methodMap[method] || 'cash';
};
```

**Nút Làm Mới:**
```typescript
<Button
    icon={<ReloadOutlined />}
    onClick={fetchOrders}
    loading={loading}
>
    Làm mới
</Button>
```

---

## 🔄 Flow Hoạt Động

```
1. Component mount
   ↓
2. useEffect() gọi fetchOrders()
   ↓
3. orderService.getAllOrders() → Call API GET /orders
   ↓
4. Backend trả về List<OrderResponse>
   ↓
5. Map OrderResponse[] → Order[] (frontend interface)
   ↓
6. setOrders(mappedOrders)
   ↓
7. Table hiển thị dữ liệu
```

---

## 📊 Mapping Data

### Backend → Frontend

| Backend Field | Frontend Field | Transform |
|---------------|----------------|-----------|
| `id` | `id` | Direct |
| `orderCode` | `orderNumber` | Direct |
| `customerId` | `customerId` | parseInt() |
| `phone` | `customerPhone` | Direct |
| `orderStatus` | `status` | mapBackendStatus() |
| `paymentMethod` | `paymentMethod` | mapPaymentMethod() |
| `totalAmount` | `subtotal` | Direct |
| `subTotal` | `total` | Direct |
| `promotionValue` | `discount` | Default 0 |
| `createAt` | `createdAt` | toLocaleString('vi-VN') |
| `updateAt` | `updatedAt` | toLocaleString('vi-VN') |

### Missing Fields (Backend không có)

Các field này hiện tại set giá trị mặc định:
- `customerName`: 'N/A'
- `customerEmail`: 'N/A'
- `paymentStatus`: 'pending'
- `shippingAddress`: Object với các field 'N/A'
- `items`: [] (empty array)
- `shippingFee`: 0

**Lưu ý:** Cần cập nhật backend để trả về đầy đủ thông tin khách hàng và items.

---

## 🎯 Backend APIs

### Base URL
```
http://localhost:8080
```

### Endpoints Đang Sử Dụng

#### 1. GET /orders
Lấy tất cả đơn hàng (có authentication)

**Authorization:** Bearer Token (Admin)

**Response:**
```json
{
  "code": 200,
  "message": "Lấy danh sách đơn hàng thành công",
  "result": [
    {
      "id": 1,
      "orderCode": "ORD-2025-001",
      "customerId": "user-123",
      "totalAmount": 500000,
      "subTotal": 450000,
      "promotionValue": 50000,
      "orderStatus": "PENDING",
      "paymentMethod": "COD",
      "phone": "0987654321",
      "createAt": "2025-12-07T10:30:00",
      "updateAt": "2025-12-07T10:30:00"
    }
  ]
}
```

---

## 🐛 Troubleshooting

### 1. CORS Error
**Vấn đề:** API bị chặn bởi CORS policy

**Giải pháp:**
- Kiểm tra backend có `@CrossOrigin(origins = "*")` trong OrderController
- Hoặc config CORS globally trong Spring Security

### 2. 401 Unauthorized
**Vấn đề:** Không có quyền truy cập

**Giải pháp:**
- Đảm bảo đã login với tài khoản ADMIN
- Kiểm tra token được gửi trong header
- Thêm interceptor để attach token:

```typescript
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Empty Data (No data)
**Vấn đề:** API trả về array rỗng

**Giải pháp:**
- Kiểm tra database có dữ liệu không
- Chạy seed script để tạo dữ liệu test
- Check console.log để debug response

### 4. Loading Mãi Không Dừng
**Vấn đề:** `loading` state không tắt

**Giải pháp:**
- Đảm bảo `finally` block luôn gọi `setLoading(false)`
- Kiểm tra API có response về không

---

## 🚀 Cách Test

### 1. Kiểm Tra Backend Running
```bash
cd BE/OrientalFashionShop_Backend
./mvnw spring-boot:run
```

### 2. Test API Trực Tiếp (Postman/curl)
```bash
curl -X GET http://localhost:8080/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Kiểm Tra Frontend
```bash
cd FE/ModaMint
npm run dev
```

1. Mở http://localhost:5173
2. Login với tài khoản admin
3. Vào Dashboard → Quản lý Đơn hàng
4. Kiểm tra:
   - ✅ Loading spinner hiển thị
   - ✅ Danh sách đơn hàng load từ backend
   - ✅ Nút "Làm mới" hoạt động
   - ✅ Các thống kê (tổng đơn, pending, delivered) tính đúng

---

## 📝 Todo List

### Cần Backend Cập Nhật
- [ ] Thêm thông tin khách hàng (name, email) vào OrderResponse
- [ ] Trả về danh sách items trong order
- [ ] Thêm field `paymentStatus`
- [ ] Trả về thông tin shipping address chi tiết

### Frontend Improvements
- [ ] Implement pagination (dùng `/orders/paginated`)
- [ ] Thêm search/filter theo mã đơn, tên khách hàng
- [ ] Tích hợp update order status
- [ ] Export Excel với data thật
- [ ] Xem chi tiết đơn hàng (fetch từ `/orders/{id}`)

---

## 🔗 Related Files

- **Service:** `src/services/order/index.ts`
- **Component:** `src/dashboard/pages/orders/index.tsx`
- **Backend Controller:** `BE/OrientalFashionShop_Backend/src/main/java/com/example/ModaMint_Backend/controller/OrderController.java`
- **Backend DTO:** `BE/OrientalFashionShop_Backend/src/main/java/com/example/ModaMint_Backend/dto/response/order/OrderResponse.java`

---

## 📚 Best Practices

1. **Error Handling:**
   - Luôn có try-catch
   - Hiển thị message.error() cho user
   - Log error ra console để debug

2. **Loading State:**
   - Set loading = true trước khi call API
   - Set loading = false trong finally block
   - Disable buttons khi đang loading

3. **Data Validation:**
   - Check result.success trước khi dùng data
   - Validate data type (parseInt, etc.)
   - Set default values cho missing fields

4. **Performance:**
   - Chỉ fetch khi cần (component mount, user click refresh)
   - Implement pagination cho dataset lớn
   - Cache data khi có thể

---

**Ngày cập nhật:** 2025-12-07  
**Version:** 1.0.0
