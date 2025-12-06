// src/components/chatbox/ChatExample.tsx
// Example component demonstrating how to use the chat service
// This can be used in dashboard or admin panel

import { useEffect, useState } from 'react';
import { chatService } from '../../services/chat';
import { type ChatAiResponse } from '../../types/chat.types';

interface ChatExampleProps {
    conversationId: number;
    userId: string;
}

/**
 * Example component showing how to integrate chat functionality
 * in dashboard or admin panel for staff to respond to customers
 */
export default function ChatExample({ conversationId, userId }: ChatExampleProps) {
    const [messages, setMessages] = useState<ChatAiResponse[]>([]);
    const [input, setInput] = useState('');
    const [connected, setConnected] = useState(true);

    useEffect(() => {
        // Load message history
        const loadMessages = async () => {
            try {
                const msgs = await chatService.getHistory();
                setMessages(msgs);
            } catch (error) {
                console.error('Failed to load messages:', error);
            }
        };

        loadMessages();
    }, [])

    const handleSendMessage = () => {
        if (!input.trim() || !connected) return;

        try {
            // Send message as STAFF
            chatService.sendMessageToAI(input);
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
                        style={{
                            marginBottom: '10px',
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor:
                                msg.type === 'USER' ? '#e3f2fd' :
                                    msg.type === 'ASSISTANT' ? '#fff3e0' :
                                        '#f1f8e9',
                            textAlign: msg.type === 'USER' ? 'right' : 'left'
                        }}
                    >
                        <div>{msg.message}</div>
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
                            marginBottom: '10px',
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor: '#e3f2fd',
                            textAlign: 'right'
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
        </div>
    );
}
