// src/services/chat/chat.service.ts
import type { ApiResponse } from '@/types';
import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type {
    MessageRequest,
    MessageResponse,
    ConversationResponse,
    SenderTypeValue
} from '../../types/chat.types';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

type ChatMode = 'ai' | 'shop';

/**
 * Chat Service - Handles chat operations with AI and Shop Staff
 */
class ChatService {
    private stompClient: Client | null = null;
    private currentMode: ChatMode | null = null;

    /**
     * Get conversation for a user
     */
    async getConversation(userId: string): Promise<ConversationResponse> {
        const response = await apiClient.get<ApiResponse<ConversationResponse>>(
            API_ENDPOINTS.CHAT.GET_CONVERSATION(userId)
        );
        return response.data.result;
    }

    /**
     * Get chat history for a conversation
     */
    async getChatHistory(conversationId: number): Promise<MessageResponse[]> {
        const response = await apiClient.get<ApiResponse<MessageResponse[]>>(
            API_ENDPOINTS.CHAT.GET_HISTORY(conversationId)
        );
        return response.data.result;
    }

    /**
     * Send message to AI via REST API (no WebSocket)
     */
    async sendMessageToAI(conversationId: number, content: string): Promise<MessageResponse> {
        const request: MessageRequest = {
            content: content,
            senderType: 'CUSTOMER'
        };
        const response = await apiClient.post<ApiResponse<MessageResponse>>(
            API_ENDPOINTS.CHAT.SEND_MESSAGE_AI,
            { ...request, conversationId }
        );
        return response.data.result;
    }

    /**
     * Connect to WebSocket for real-time chat
     */
    connectWebSocket(
        mode: ChatMode,
        onMessageReceived: (message: MessageResponse) => void,
        onConnected?: () => void,
        onError?: (error: any) => void
    ): void {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
        const wsUrl = baseURL.replace('/api/v1', API_ENDPOINTS.CHAT.WEBSOCKET_ENDPOINT);

        this.currentMode = mode;

        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(wsUrl) as any,
            debug: (str) => {
                console.log('[STOMP Debug]:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.stompClient.onConnect = () => {
            console.log('WebSocket Connected for mode:', mode);
            
            // Subscribe to the appropriate topic based on mode
            const topic = mode === 'ai' 
                ? API_ENDPOINTS.CHAT.WEBSOCKET_TOPIC_AI
                : API_ENDPOINTS.CHAT.WEBSOCKET_TOPIC_SHOP;
            
            this.stompClient?.subscribe(topic, (message) => {
                try {
                    const apiResponse: ApiResponse<MessageResponse> = JSON.parse(message.body);
                    onMessageReceived(apiResponse.result);
                } catch (error) {
                    console.error('Failed to parse message:', error);
                }
            });

            onConnected?.();
        };

        this.stompClient.onStompError = (frame) => {
            console.error('STOMP error:', frame);
            onError?.(frame);
        };

        this.stompClient.onWebSocketError = (event) => {
            console.error('WebSocket error:', event);
            onError?.(event);
        };

        this.stompClient.activate();
    }

    /**
     * Send message through WebSocket
     */
    sendMessage(
        content: string,
        senderType: SenderTypeValue,
        mode: ChatMode
    ): void {
        if (!this.stompClient?.connected) {
            throw new Error('WebSocket is not connected');
        }

        const messageRequest: MessageRequest = {
            content,
            senderType,
        };

        const destination = mode === 'ai'
            ? API_ENDPOINTS.CHAT.WEBSOCKET_SEND_AI
            : API_ENDPOINTS.CHAT.WEBSOCKET_SEND_SHOP;

        this.stompClient.publish({
            destination,
            body: JSON.stringify(messageRequest),
        });
    }

    /**
     * Disconnect WebSocket
     */
    disconnectWebSocket(): void {
        if (this.stompClient?.connected) {
            this.stompClient.deactivate();
            this.currentMode = null;
            console.log('WebSocket Disconnected');
        }
    }

    /**
     * Check if WebSocket is connected
     */
    isConnected(): boolean {
        return this.stompClient?.connected ?? false;
    }

    /**
     * Get current chat mode
     */
    getCurrentMode(): ChatMode | null {
        return this.currentMode;
    }
}

export const chatService = new ChatService();
export default chatService;
