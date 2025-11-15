# 💬 Hướng dẫn sử dụng Chat - ModaMint

## 🎯 Chat ở đâu?

### 1. **Trên website (Customer)**
- Chat xuất hiện ở **góc dưới bên phải màn hình**
- Icon: 💬 (màu cam/đỏ)
- Hiển thị trên TẤT CẢ các trang sau khi đăng nhập

### 2. **Vị trí trong code**
```
File: src/components/layout/RootLayout/RootLayout.tsx
Line 18: <Chatbox />
```

Chat được import trong `RootLayout`, nên sẽ hiện trên toàn bộ website.

---

## 🚀 Cách sử dụng Chat

### **Bước 1: Đăng nhập**
⚠️ **BẮT BUỘC** phải đăng nhập trước
- Chat chỉ hoạt động khi có user
- Nếu chưa login → Icon chat sẽ không hiện

### **Bước 2: Mở Chatbox**
1. Tìm icon 💬 ở góc dưới phải
2. Click vào icon
3. Cửa sổ chat sẽ bật lên

### **Bước 3: Chọn chế độ chat**

#### 🤖 **Mode AI** (Mặc định)
- Click nút "🤖 AI"
- Đợi kết nối WebSocket (● Đã kết nối)
- Gửi tin nhắn → AI trả lời tự động

#### 👨‍💼 **Mode Shop** (Chat với nhân viên)
- Click nút "👨‍💼 Shop"
- Đợi kết nối WebSocket (● Đã kết nối)
- Gửi tin nhắn → Nhân viên shop sẽ nhận và trả lời

---

## 🧪 Test Chat

### Test nhanh (3 bước):

```bash
# 1. Chạy dev server (nếu chưa chạy)
npm run dev

# 2. Mở browser
# Truy cập: http://localhost:5173 (hoặc port khác nếu 5173 đã dùng)

# 3. Đăng nhập và test
```

### **Kịch bản test:**

#### ✅ Test AI Chat:
1. Đăng nhập vào website
2. Click icon 💬 góc dưới phải
3. Đảm bảo tab "🤖 AI" đang active (màu trắng)
4. Đợi trạng thái: "● Đã kết nối"
5. Gửi: "Xin chào"
6. **Kỳ vọng**: AI trả lời ngay qua WebSocket

#### ✅ Test Shop Chat:
1. Click tab "👨‍💼 Shop"
2. Đợi reconnect WebSocket
3. Trạng thái: "● Đã kết nối"
4. Gửi: "Tôi muốn tư vấn sản phẩm"
5. **Kỳ vọng**: Tin nhắn gửi đến nhân viên qua WebSocket

---

## 🔍 Xem log debug

Mở **Console** trong DevTools (F12):

```javascript
// Xem logs:
// - WebSocket connection status
// - STOMP frames
// - Messages sent/received
// - Errors
```

Các log bạn sẽ thấy:
```
[STOMP Debug]: Connecting...
WebSocket connected for ai mode
● Đã kết nối
```

---

## ⚙️ Backend Requirements

### API Endpoints cần có:

```java
// 1. Lấy conversation
GET /conversation/{userId}
→ Response: ConversationResponse { id, isActive }

// 2. Lấy lịch sử chat
GET /history/{conversationId}
→ Response: List<MessageResponse>

// 3. WebSocket endpoint
WS /ws (SockJS)

// 4. STOMP destinations
/app/sendMessage/ai → /topic/messages/ai
/app/sendMessage/shop → /topic/messages/shop
```

### Kiểm tra backend:

```bash
# Test conversation endpoint
curl http://localhost:8080/api/v1/conversation/{userId}

# Test history endpoint
curl http://localhost:8080/api/v1/history/{conversationId}
```

---

## 🐛 Troubleshooting

### ❌ Icon chat không hiện?
**Nguyên nhân**: Chưa đăng nhập
**Giải pháp**: 
1. Check console: Có lỗi auth không?
2. Đảm bảo `user?.id` có giá trị
3. Xem component guard: `if (!user?.id) return null;`

### ❌ "○ Đang kết nối..." mãi không kết nối?
**Nguyên nhân**: WebSocket không kết nối được
**Giải pháp**:
1. Check backend có chạy không?
2. Check CORS config cho WebSocket
3. Xem console có lỗi WebSocket error không?
4. Verify endpoint: `ws://localhost:8080/api/v1/ws` (hoặc URL backend của bạn)

### ❌ Gửi tin nhắn không có phản hồi?
**Nguyên nhân**: Backend chưa implement đúng
**Giải pháp**:
1. Check backend logs
2. Verify STOMP topics match:
   - Frontend subscribe: `/topic/messages/ai` hoặc `/topic/messages/shop`
   - Backend send to: `@SendTo("/topic/messages/ai")` hoặc `@SendTo("/topic/messages/shop")`
3. Check `ApiResponse` wrapper có đúng không

### ❌ Lỗi "Cannot read properties of undefined"?
**Nguyên nhân**: Backend response sai format
**Giải pháp**:
1. Backend phải trả về:
```json
{
  "code": 1000,
  "message": "Success",
  "result": { ... }
}
```
2. Check network tab → Preview response structure

---

## 📋 Checklist triển khai

- [ ] Backend API `/conversation/{userId}` hoạt động
- [ ] Backend API `/history/{conversationId}` hoạt động
- [ ] WebSocket `/ws` endpoint configured
- [ ] STOMP broker enabled (`/topic`, `/app`)
- [ ] AI handler `@MessageMapping("/sendMessage/ai")`
- [ ] Shop handler `@MessageMapping("/sendMessage/shop")`
- [ ] CORS cho phép WebSocket connections
- [ ] Frontend `VITE_API_URL` đúng trong `.env`
- [ ] User đã đăng nhập
- [ ] Icon 💬 hiển thị góc dưới phải
- [ ] Click icon → chatbox mở
- [ ] Chọn mode AI/Shop
- [ ] Gửi tin nhắn → nhận phản hồi

---

## 🎨 Tùy chỉnh vị trí chat

Nếu muốn đổi vị trí icon chat, sửa trong `style.css`:

```css
.modamint-chatbox {
  position: fixed;
  bottom: 2.4rem;  /* Khoảng cách từ đáy */
  right: 2.4rem;   /* Khoảng cách từ phải */
  z-index: 50;
}
```

Ví dụ đổi sang góc trái:
```css
.modamint-chatbox {
  bottom: 2.4rem;
  left: 2.4rem;   /* Thay right = left */
}
```

---

## 📞 Support

Nếu vẫn gặp vấn đề:
1. Check console logs (F12)
2. Check network tab → WS connections
3. Verify backend logs
4. Đọc `CHAT_FEATURE.md` để hiểu chi tiết implementation

---

**Tóm tắt nhanh:**
1. ✅ Đăng nhập
2. ✅ Click icon 💬 góc dưới phải
3. ✅ Chọn AI hoặc Shop
4. ✅ Đợi "● Đã kết nối"
5. ✅ Gửi tin nhắn

**Vậy là xong! 🎉**
