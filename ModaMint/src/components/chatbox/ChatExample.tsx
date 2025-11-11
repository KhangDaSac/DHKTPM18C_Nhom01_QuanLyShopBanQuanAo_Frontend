// src/components/chatbox/ChatExample.tsx
// Example component demonstrating how to use the chat service
// This can be used in dashboard or admin panel

import { useEffect, useState } from 'react';
import { chatService } from '../../services/chat';
import { SenderType, type MessageResponse } from '../../types/chat.types';

interface ChatExampleProps {
    conversationId: number;
    userId: string;
}

/**
 * Example component showing how to integrate chat functionality
 * in dashboard or admin panel for staff to respond to customers
 */
export default function ChatExample({ conversationId, userId }: ChatExampleProps) {
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [input, setInput] = useState('');
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // Load message history
        const loadMessages = async () => {
            try {
                const msgs = await chatService.getMessages(conversationId);
                setMessages(msgs);
            } catch (error) {
                console.error('Failed to load messages:', error);
            }
        };

        loadMessages();

        // Connect to WebSocket
        chatService.connectWebSocket(
            conversationId,
            (message) => {
                // Add new message to list
                setMessages(prev => [...prev, message]);
            },
            () => {
                setConnected(true);
                console.log('Connected to conversation:', conversationId);
            },
            (error) => {
                console.error('WebSocket error:', error);
                setConnected(false);
            }
        );

        // Cleanup on unmount
        return () => {
            chatService.disconnectWebSocket();
            setConnected(false);
        };
    }, [conversationId]);

    const handleSendMessage = () => {
        if (!input.trim() || !connected) return;

        try {
            // Send message as STAFF
            chatService.sendMessage(
                conversationId,
                input,
                SenderType.STAFF
            );
            setInput('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '10px',
                marginBottom: '10px'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    padding: '10px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px'
                }}>
                    <span><strong>Conversation ID:</strong> {conversationId}</span>
                    <span><strong>User ID:</strong> {userId}</span>
                    <span style={{ 
                        color: connected ? 'green' : 'red',
                        fontWeight: 'bold'
                    }}>
                        {connected ? '● Connected' : '○ Disconnected'}
                    </span>
                </div>
            </div>

            <div style={{ 
                height: '400px', 
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: '#fafafa'
            }}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            marginBottom: '10px',
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor: 
                                msg.senderType === SenderType.STAFF ? '#e3f2fd' :
                                msg.senderType === SenderType.AI ? '#fff3e0' :
                                '#f1f8e9',
                            textAlign: msg.senderType === SenderType.STAFF ? 'right' : 'left'
                        }}
                    >
                        <div style={{ 
                            fontSize: '12px', 
                            color: '#666',
                            marginBottom: '4px'
                        }}>
                            <strong>
                                {msg.senderType === SenderType.STAFF ? '👨‍💼 Staff' :
                                 msg.senderType === SenderType.AI ? '🤖 AI' :
                                 '👤 Customer'}
                            </strong>
                            {' • '}
                            {new Date(msg.timestamp).toLocaleString('vi-VN')}
                        </div>
                        <div>{msg.content}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    disabled={!connected}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                    }}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!connected || !input.trim()}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: connected ? '#2196F3' : '#ccc',
                        color: 'white',
                        cursor: connected ? 'pointer' : 'not-allowed',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}
                >
                    Send
                </button>
            </div>

            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                <strong>ℹ️ Usage Example:</strong>
                <pre style={{ fontSize: '12px', marginTop: '5px', overflow: 'auto' }}>
{`// Import the component
import ChatExample from './components/chatbox/ChatExample';

// Use in your dashboard
<ChatExample 
  conversationId={123} 
  userId="user-uuid" 
/>`}
                </pre>
            </div>
        </div>
    );
}
