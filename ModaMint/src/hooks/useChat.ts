// src/hooks/useChat.ts
import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/chat';
import { SenderType, type MessageResponse, type Conversation } from '../types/chat.types';
import { toast } from 'react-toastify';

interface UseChatOptions {
    userId: string;
    autoConnect?: boolean;
    onError?: (error: any) => void;
}

interface UseChatReturn {
    messages: MessageResponse[];
    conversationId: number | null;
    isConnected: boolean;
    isLoading: boolean;
    sendMessageToAI: (content: string) => Promise<void>;
    sendMessageToStaff: (content: string) => void;
    connectWebSocket: () => void;
    disconnectWebSocket: () => void;
    loadMessages: () => Promise<void>;
}

/**
 * Custom hook for managing chat functionality
 * 
 * @example
 * ```tsx
 * const { 
 *   messages, 
 *   sendMessageToAI, 
 *   sendMessageToStaff,
 *   isConnected 
 * } = useChat({ userId: user.id });
 * ```
 */
export function useChat({ 
    userId, 
    autoConnect = false,
    onError 
}: UseChatOptions): UseChatReturn {
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize conversation
    useEffect(() => {
        const initConversation = async () => {
            if (!userId) return;

            try {
                setIsLoading(true);
                const conversation: Conversation = await chatService.startConversation(userId);
                setConversationId(conversation.id);

                // Load existing messages
                const msgs = await chatService.getMessages(conversation.id);
                setMessages(msgs);

                // Auto-connect WebSocket if enabled
                if (autoConnect) {
                    connectWebSocketInternal(conversation.id);
                }
            } catch (error) {
                console.error('Failed to initialize conversation:', error);
                onError?.(error);
                toast.error('Không thể khởi tạo cuộc trò chuyện');
            } finally {
                setIsLoading(false);
            }
        };

        initConversation();
    }, [userId, autoConnect]);

    // Connect WebSocket
    const connectWebSocketInternal = useCallback((convId: number) => {
        if (!convId) return;

        chatService.connectWebSocket(
            convId,
            (message: MessageResponse) => {
                setMessages(prev => [...prev, message]);
            },
            () => {
                setIsConnected(true);
            },
            (error) => {
                console.error('WebSocket error:', error);
                setIsConnected(false);
                onError?.(error);
            }
        );
    }, [onError]);

    // Public method to connect WebSocket
    const connectWebSocket = useCallback(() => {
        if (conversationId) {
            connectWebSocketInternal(conversationId);
        }
    }, [conversationId, connectWebSocketInternal]);

    // Disconnect WebSocket
    const disconnectWebSocket = useCallback(() => {
        chatService.disconnectWebSocket();
        setIsConnected(false);
    }, []);

    // Send message to AI
    const sendMessageToAI = useCallback(async (content: string) => {
        if (!conversationId || !content.trim()) return;

        try {
            setIsLoading(true);
            const response = await chatService.chatWithAI(conversationId, {
                content,
                senderType: SenderType.CUSTOMER,
            });
            setMessages(prev => [...prev, response]);
        } catch (error) {
            console.error('Failed to send message to AI:', error);
            onError?.(error);
            toast.error('Không thể gửi tin nhắn đến AI');
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, onError]);

    // Send message to Staff via WebSocket
    const sendMessageToStaff = useCallback((content: string) => {
        if (!conversationId || !content.trim() || !isConnected) {
            toast.warning('Vui lòng kết nối với nhân viên trước');
            return;
        }

        try {
            chatService.sendMessage(conversationId, content, SenderType.CUSTOMER);
        } catch (error) {
            console.error('Failed to send message to staff:', error);
            onError?.(error);
            toast.error('Không thể gửi tin nhắn');
        }
    }, [conversationId, isConnected, onError]);

    // Load messages
    const loadMessages = useCallback(async () => {
        if (!conversationId) return;

        try {
            setIsLoading(true);
            const msgs = await chatService.getMessages(conversationId);
            setMessages(msgs);
        } catch (error) {
            console.error('Failed to load messages:', error);
            onError?.(error);
            toast.error('Không thể tải tin nhắn');
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, onError]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isConnected) {
                disconnectWebSocket();
            }
        };
    }, [isConnected, disconnectWebSocket]);

    return {
        messages,
        conversationId,
        isConnected,
        isLoading,
        sendMessageToAI,
        sendMessageToStaff,
        connectWebSocket,
        disconnectWebSocket,
        loadMessages,
    };
}

export default useChat;
