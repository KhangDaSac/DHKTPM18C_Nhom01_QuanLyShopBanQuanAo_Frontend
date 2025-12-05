# Backend Email Requirements for Guest Checkout

## Overview
The frontend now supports guest checkout with promotions. To complete the feature, the backend needs to implement email confirmation functionality.

## Required Backend Changes

### 1. Email Service Implementation

The backend should send order confirmation emails to customers (both registered and guest) after successful checkout.

#### Email Content Should Include:
- Order ID and Order Code
- Customer Name and Contact Info
- Ordered Items (with images, quantities, prices)
- Shipping Address
- Applied Promotions (if any)
- Price Breakdown:
  - Subtotal
  - Shipping Fee
  - Discount Amount
  - Total Amount
- Payment Method
- Order Status
- Expected Delivery Time

### 2. Checkout API Endpoint Enhancement

**Endpoint**: `POST /api/v1/checkout`

The endpoint should:

1. **Accept Guest Information**:
   - `isGuest` (boolean)
   - `guestName` (string) - when isGuest = true
   - `guestEmail` (string) - when isGuest = true

2. **Handle Guest Orders**:
   - Accept customerId format: `guest_${timestamp}`
   - Store guest information in order record
   - Associate guest orders with temporary/guest customer records

3. **Send Email After Successful Order**:
   ```java
   // Pseudo-code
   if (orderCreated) {
       String recipientEmail = isGuest ? guestEmail : customer.getEmail();
       emailService.sendOrderConfirmation(recipientEmail, orderDetails);
   }
   ```

### 3. Promotions API Enhancement

**Endpoint**: `GET /api/v1/checkout/promotions?customerId={customerId}`

The endpoint should:

1. **Support Guest Customers**:
   - When `customerId = "guest"`, return all active public promotions
   - Filter promotions that don't require customer history/loyalty tiers
   - Return promotions that are generally available to all customers

2. **Response Format** (unchanged):
   ```json
   {
     "result": [
       {
         "id": 1,
         "name": "Giảm giá 10%",
         "code": "GIAM10",
         "type": "PERCENTAGE",
         "discountPercent": 10,
         "minOrderValue": 100000,
         "remainingQuantity": 50,
         "isActive": true,
         "description": "Giảm 10% cho đơn hàng từ 100k"
       }
     ]
   }
   ```

### 4. Email Service Configuration

Recommended email service setup:

```properties
# application.yaml or application.properties
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${EMAIL_USERNAME}
    password: ${EMAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

### 5. Email Template Example

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Xác nhận đơn hàng</title>
</head>
<body>
    <h1>Cảm ơn bạn đã đặt hàng tại ModaMint!</h1>
    
    <h2>Thông tin đơn hàng</h2>
    <p><strong>Mã đơn hàng:</strong> {{orderCode}}</p>
    <p><strong>Tên khách hàng:</strong> {{customerName}}</p>
    <p><strong>Số điện thoại:</strong> {{phone}}</p>
    <p><strong>Địa chỉ giao hàng:</strong> {{shippingAddress}}</p>
    
    <h2>Sản phẩm đã đặt</h2>
    <table>
        <thead>
            <tr>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
            </tr>
        </thead>
        <tbody>
            {{#each orderItems}}
            <tr>
                <td>{{productName}} ({{color}}, {{size}})</td>
                <td>{{quantity}}</td>
                <td>{{formatCurrency price}}</td>
                <td>{{formatCurrency (multiply price quantity)}}</td>
            </tr>
            {{/each}}
        </tbody>
    </table>
    
    <h2>Tổng cộng</h2>
    <p>Tạm tính: {{formatCurrency subtotal}}</p>
    <p>Phí vận chuyển: {{formatCurrency shippingFee}}</p>
    {{#if discountAmount}}
    <p>Giảm giá: -{{formatCurrency discountAmount}}</p>
    {{/if}}
    <p><strong>Tổng tiền: {{formatCurrency totalAmount}}</strong></p>
    
    <p>Phương thức thanh toán: {{paymentMethod}}</p>
    
    <p>Đơn hàng của bạn đang được xử lý và sẽ được giao trong vòng 3-5 ngày làm việc.</p>
    
    <p>Cảm ơn bạn đã mua hàng!</p>
</body>
</html>
```

## Testing Checklist

- [ ] Guest customers can apply promotion codes at checkout
- [ ] Email is sent successfully after order creation (guest)
- [ ] Email is sent successfully after order creation (registered user)
- [ ] Email contains all order information correctly
- [ ] Guest orders are stored with guest information
- [ ] Promotions API returns public promotions for customerId="guest"
- [ ] Backend validates guest email format
- [ ] Backend handles email service failures gracefully (log error but don't fail order)

## Frontend Changes Already Implemented

✅ Guest customers can now apply promotion codes
✅ Checkout flow shows email confirmation message for guests
✅ Navigation goes to order-success page (not login page)
✅ Order success page displays order information for guests
✅ Frontend sends guest information in checkout request:
   - `isGuest: true`
   - `guestName: string`
   - `guestEmail: string`

## Priority

**HIGH** - Email confirmation is essential for guest checkout UX. Customers need order confirmation and tracking information.
