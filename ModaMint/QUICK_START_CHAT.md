# 🚀 Quick Start Guide - Chat Feature

## Bắt đầu nhanh trong 5 phút!

### 1️⃣ Component đã được tạo sẵn

Chatbox component đã được tạo và sẵn sàng sử dụng tại:
```
src/components/chatbox/index.tsx
```

### 2️⃣ Sử dụng ngay

Trong file `App.tsx` hoặc `RootLayout`:

```tsx
import Chatbox from './components/chatbox';

function App() {
  return (
    <>
      {/* Your existing code */}
      
      {/* Add chatbox - nó sẽ hiển thị ở góc dưới phải */}
      <Chatbox />
    </>
  );
}
```

### 3️⃣ Đảm bảo có AuthContext

Chatbox cần user đã login (dùng `useAuth()` hook):

```tsx
// Đã có sẵn trong project
const { user } = useAuth();
```

### 4️⃣ Cấu hình Backend URL

Trong file `.env`:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

### 5️⃣ Backend Checklist

Backend cần có các endpoints sau:

- ✅ `POST /conversation/{userId}` - Tạo conversation
- ✅ `GET /messages/{conversationId}` - Lấy messages
- ✅ `POST /{conversationId}/chat-with-ai` - Chat với AI
- ✅ WebSocket `/ws` với STOMP config

## 🎮 Cách dùng

### User (Customer):

1. Click icon 💬 ở góc dưới phải
2. Chọn chế độ:
   - **🤖 AI**: Chat với AI assistant (tự động, nhanh)
   - **👨‍💼 Nhân viên**: Chat với nhân viên (real-time)
3. Nhập tin nhắn và gửi

### Staff (Admin/Dashboard):

Sử dụng `ChatExample` component:

```tsx
import ChatExample from './components/chatbox/ChatExample';

<ChatExample 
  conversationId={123} 
  userId="customer-user-id" 
/>
```

## 📱 Features

- ✅ Chuyển đổi AI/Staff mode
- ✅ Real-time chat với WebSocket
- ✅ Lịch sử tin nhắn
- ✅ Trạng thái kết nối
- ✅ Loading indicators
- ✅ Timestamps
- ✅ Responsive design
- ✅ Tự động scroll
- ✅ Thu phóng chatbox

## 🎨 Tùy chỉnh

### Thay đổi màu sắc:

Chỉnh trong `src/components/chatbox/style.css`:

```css
.modamint-chatbox-toggle {
  background: linear-gradient(135deg, #YOUR_COLOR 60%, #YOUR_COLOR_LIGHT 100%);
}
```

### Thay đổi vị trí:

```css
.modamint-chatbox {
  bottom: 2.4rem; /* Khoảng cách từ bottom */
  right: 2.4rem;  /* Khoảng cách từ right */
}
```

## 🐛 Troubleshooting

### Chatbox không hiện?
- Kiểm tra user đã login chưa
- Kiểm tra import đúng component

### Không kết nối được WebSocket?
- Kiểm tra `VITE_API_URL` trong .env
- Kiểm tra backend WebSocket config
- Xem console logs

### AI không trả lời?
- Kiểm tra backend endpoint `/chat-with-ai`
- Xem network tab trong DevTools

## 📚 Documentation đầy đủ

Xem thêm:
- `CHAT_FEATURE.md` - Documentation chi tiết
- `CHAT_IMPLEMENTATION_SUMMARY.md` - Tổng quan implementation

## 💡 Tips

1. **Development**: Mở console để xem logs
2. **Testing**: Test cả 2 modes (AI & Staff)
3. **Production**: Đảm bảo CORS được config đúng
4. **Performance**: WebSocket chỉ kết nối khi cần

## ✨ That's it!

Chỉ cần import `<Chatbox />` và bạn đã có một hệ thống chat hoàn chỉnh!

**Happy Coding! 🎉**
