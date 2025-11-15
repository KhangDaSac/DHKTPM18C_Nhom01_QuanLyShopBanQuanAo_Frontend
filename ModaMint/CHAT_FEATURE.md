# Chat Feature Documentation

## Tổng quan

Chức năng chat hỗ trợ hai chế độ:
1. **Chat với AI**: Tương tác tự động với AI assistant
2. **Chat với Nhân viên**: Kết nối real-time với nhân viên qua WebSocket

## Cấu trúc

### 1. Types (`src/types/chat.types.ts`)

```typescript
export enum SenderType {
    CUSTOMER = 'CUSTOMER',
    STAFF = 'STAFF',
    AI = 'AI'
}

export interface MessageRequest {
    content: string;
    senderType: SenderType;
}

export interface MessageResponse {
    id: number;
    content: string;
    timestamp: string;
    senderType: SenderType;
}

export interface Conversation {
    id: number;
    userId: string;
    createdAt: string;
    updatedAt: string;
    status?: string;
}
```

### 2. API Endpoints (`src/api/endpoints.ts`)

```typescript
CHAT: {
    START_CONVERSATION: (userId: string) => `/conversation/${userId}`,
    GET_MESSAGES: (conversationId: number) => `/messages/${conversationId}`,
    CHAT_WITH_AI: (conversationId: number) => `/${conversationId}/chat-with-ai`,
    WEBSOCKET_ENDPOINT: '/ws',
    WEBSOCKET_SEND: (conversationId: number) => `/app/chat/${conversationId}`,
    WEBSOCKET_SUBSCRIBE: (conversationId: number) => `/topic/conversation/${conversationId}`,
}
```

### 3. Chat Service (`src/services/chat/chat.service.ts`)

#### Methods:

##### `startConversation(userId: string): Promise<Conversation>`
Khởi tạo hoặc lấy conversation hiện có cho user.

##### `getMessages(conversationId: number): Promise<MessageResponse[]>`
Lấy tất cả tin nhắn trong conversation.

##### `chatWithAI(conversationId: number, request: MessageRequest): Promise<MessageResponse>`
Gửi tin nhắn đến AI và nhận phản hồi.

##### `connectWebSocket(conversationId: number, callbacks): void`
Kết nối WebSocket để chat real-time với nhân viên.

Parameters:
- `conversationId`: ID của conversation
- `onMessageReceived`: Callback khi nhận tin nhắn mới
- `onConnected`: Callback khi kết nối thành công
- `onError`: Callback khi có lỗi

##### `sendMessage(conversationId: number, content: string, senderType: SenderType): void`
Gửi tin nhắn qua WebSocket.

##### `disconnectWebSocket(): void`
Ngắt kết nối WebSocket.

##### `isConnected(): boolean`
Kiểm tra trạng thái kết nối WebSocket.

## Component Usage

### Option 1: Using the Chatbox Component

Import and use the main chatbox component:

```tsx
import Chatbox from './components/chatbox';

function App() {
  return (
    <>
      {/* Your app content */}
      <Chatbox />
    </>
  );
}
```

### Option 2: Using the useChat Hook

For custom implementations:

```tsx
import { useChat } from './hooks/useChat';

function MyCustomChat() {
  const {
    messages,
    conversationId,
    isConnected,
    isLoading,
    sendMessageToAI,
    sendMessageToStaff,
    connectWebSocket,
    disconnectWebSocket,
  } = useChat({
    userId: user.id,
    autoConnect: false, // true to auto-connect WebSocket
  });

  // Use the returned values and methods
  const handleSendToAI = async () => {
    await sendMessageToAI('Hello AI!');
  };

  const handleSendToStaff = () => {
    if (!isConnected) {
      connectWebSocket();
    }
    sendMessageToStaff('Hello Staff!');
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

### Option 3: Using ChatboxWithHook

A cleaner implementation using the useChat hook:

```tsx
import ChatboxWithHook from './components/chatbox/ChatboxWithHook';

function App() {
  return (
    <>
      {/* Your app content */}
      <ChatboxWithHook />
    </>
  );
}
```

### Chatbox Component (`src/components/chatbox/index.tsx`)

Component tự động:
1. Khởi tạo conversation khi mở
2. Load tin nhắn cũ
3. Kết nối WebSocket khi chuyển sang chế độ "Nhân viên"
4. Ngắt kết nối khi đóng hoặc chuyển về chế độ "AI"

#### Features:
- **Mode Switching**: Chuyển đổi giữa AI và Staff
- **Real-time Updates**: Nhận tin nhắn real-time qua WebSocket
- **Message History**: Hiển thị lịch sử tin nhắn
- **Loading States**: Hiển thị trạng thái loading
- **Connection Status**: Hiển thị trạng thái kết nối WebSocket
- **Auto-scroll**: Tự động scroll đến tin nhắn mới nhất

## Backend Requirements

Backend cần implement:

### 1. REST Endpoints

```java
@PostMapping("/conversation/{userId}")
public Conversation startConversation(@PathVariable String userId)

@GetMapping("/messages/{conversationId}")
public List<MessageResponse> getMessages(@PathVariable Long conversationId)

@PostMapping("/{conversationId}/chat-with-ai")
public ApiResponse<MessageResponse> chatWithAi(
    @PathVariable Long conversationId, 
    @RequestBody MessageRequest request
)
```

### 2. WebSocket Configuration

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("*")
                .withSockJS();
    }
}
```

### 3. WebSocket Controller

```java
@MessageMapping("/chat/{conversationId}")
@SendTo("/topic/conversation/{conversationId}")
public MessageResponse handleMessage(
    @DestinationVariable Long conversationId, 
    MessageRequest messageRequest
)
```

## Environment Variables

Thêm vào `.env`:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

## Dependencies

Đã cài đặt:
```json
{
  "dependencies": {
    "sockjs-client": "^1.6.1",
    "@stomp/stompjs": "^7.0.0"
  },
  "devDependencies": {
    "@types/sockjs-client": "^1.1.6"
  }
}
```

## Testing

### Test AI Chat:
1. Mở chatbox
2. Chọn chế độ "🤖 AI"
3. Gửi tin nhắn
4. Nhận phản hồi từ AI

### Test Staff Chat:
1. Mở chatbox
2. Chọn chế độ "👨‍💼 Nhân viên"
3. Đợi kết nối WebSocket (hiển thị "● Đã kết nối")
4. Gửi tin nhắn
5. Nhân viên trên dashboard sẽ nhận và phản hồi real-time

## Error Handling

Service tự động xử lý:
- Connection errors
- Network timeouts
- WebSocket disconnections
- Invalid responses

Hiển thị thông báo lỗi qua `react-toastify`.

## Performance Considerations

1. **WebSocket Connection**: Chỉ kết nối khi cần (chế độ Staff)
2. **Auto-disconnect**: Tự động ngắt khi đóng chatbox
3. **Message Loading**: Chỉ load một lần khi mở
4. **Debouncing**: Không spam requests

## Future Enhancements

- [ ] Typing indicators
- [ ] Message read receipts
- [ ] File/image sharing
- [ ] Emoji picker
- [ ] Message search
- [ ] Conversation list
- [ ] Notification sounds
- [ ] Unread message counter
