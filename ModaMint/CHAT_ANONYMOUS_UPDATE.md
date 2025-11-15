# Cập nhật Chat Implementation theo Backend mới

## Thay đổi API

Backend đã thay đổi từ:
- `POST /{conversationId}/chat-with-ai` → WebSocket `/app/sendMessage/ai`
- Staff chat riêng biệt → WebSocket `/app/sendMessage/shop`

## Files đã cập nhật:

### 1. Types (`src/types/chat.types.ts`)
- ✅ Thêm `ConversationResponse` với `isActive`
- ✅ Thêm `ApiResponse<T>` wrapper
- ✅ Đổi `Conversation` thành `ConversationResponse`

### 2. API Endpoints (`src/api/endpoints.ts`)
- ✅ `GET_CONVERSATION`: `/conversation/{userId}`
- ✅ `GET_HISTORY`: `/history/{conversationId}`
- ✅ `WEBSOCKET_SEND_AI`: `/app/sendMessage/ai`
- ✅ `WEBSOCKET_SEND_SHOP`: `/app/sendMessage/shop`
- ✅ `WEBSOCKET_TOPIC_AI`: `/topic/messages/ai`
- ✅ `WEBSOCKET_TOPIC_SHOP`: `/topic/messages/shop`

### 3. Chat Service (`src/services/chat/chat.service.ts`)
- ✅ `getConversation()`: Lấy conversation cho user
- ✅ `getChatHistory()`: Lấy lịch sử chat
- ✅ `connectWebSocket(mode)`: Kết nối theo mode (ai/shop)
- ✅ `sendMessage(content, senderType, mode)`: Gửi tin nhắn
- ✅ Subscribe đúng topic theo mode

### 4. Chatbox Component
- ✅ Đổi mode từ 'staff' thành 'shop'
- ✅ Cả 2 mode đều dùng WebSocket
- ✅ Tự động reconnect khi đổi mode
- ✅ Guard check user login

## Cách hoạt động mới:

### Mode AI:
1. Click "🤖 AI"
2. Kết nối WebSocket `/topic/messages/ai`
3. Gửi qua `/app/sendMessage/ai`
4. Nhận response từ AI qua WebSocket

### Mode Shop:
1. Click "👨‍💼 Shop"
2. Kết nối WebSocket `/topic/messages/shop`
3. Gửi qua `/app/sendMessage/shop`
4. Nhận response từ nhân viên qua WebSocket

## Backend Requirements:

```java
@MessageMapping("/sendMessage/ai")
@SendTo("/topic/messages/ai")
public ApiResponse<MessageResponse> handleAiMessage(MessageRequest request)

@MessageMapping("/sendMessage/shop")
@SendTo("/topic/messages/shop")
public ApiResponse<MessageResponse> handleShopMessage(MessageRequest request)

@GetMapping("/conversation/{userId}")
public ApiResponse<ConversationResponse> getConversationByUserId(@PathVariable String userId)

@GetMapping("/history/{conversationId}")
public ApiResponse<List<MessageResponse>> getChatHistory(@PathVariable Long conversationId)
```

## Test Steps:

1. **Login user** → Cần để có userId
2. **Mở chatbox** → Click icon 💬
3. **Test AI**:
   - Click "🤖 AI"
   - Đợi "● Đã kết nối"
   - Gửi: "Xin chào"
   - Nhận response từ AI

4. **Test Shop**:
   - Click "👨‍💼 Shop"
   - Đợi reconnect
   - Gửi: "Tôi cần tư vấn"
   - Nhân viên sẽ nhận và reply

## Notes:

- Cả AI và Shop đều real-time qua WebSocket
- Không còn REST API cho chat với AI
- Topic riêng biệt cho mỗi mode
- ApiResponse wrapper cho tất cả responses
