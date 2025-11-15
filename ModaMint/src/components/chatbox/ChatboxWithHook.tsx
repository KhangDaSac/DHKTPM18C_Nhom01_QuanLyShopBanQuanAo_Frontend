// src/components/chatbox/ChatboxWithHook.tsx
// Alternative implementation using the useChat hook
// This version is cleaner and easier to understand

import React, { useState, useRef, useEffect } from 'react';
import './style.css';
import { useAuth } from '../../contexts/authContext';
import { useChat } from '../../hooks/useChat';

type ChatMode = 'ai' | 'staff';

/**
 * Simplified Chatbox component using useChat hook
 */
export default function ChatboxWithHook() {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('ai');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();

  // Use the custom chat hook
  const {
    messages,
    isConnected,
    isLoading,
    sendMessageToAI,
    sendMessageToStaff,
    connectWebSocket,
    disconnectWebSocket,
  } = useChat({
    userId: user?.id || '',
    autoConnect: false, // We'll connect manually when needed
  });

  // Auto scroll to bottom
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Handle mode changes
  useEffect(() => {
    if (chatMode === 'staff' && !isConnected) {
      connectWebSocket();
    } else if (chatMode === 'ai' && isConnected) {
      disconnectWebSocket();
    }
  }, [chatMode, isConnected, connectWebSocket, disconnectWebSocket]);

  // Cleanup on close
  useEffect(() => {
    if (!open && isConnected) {
      disconnectWebSocket();
    }
  }, [open, isConnected, disconnectWebSocket]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageContent = input;
    setInput('');

    if (chatMode === 'ai') {
      await sendMessageToAI(messageContent);
    } else {
      sendMessageToStaff(messageContent);
    }
  };

  const handleModeChange = (mode: ChatMode) => {
    if (mode === chatMode) return;
    setChatMode(mode);
  };

  const handleClose = () => {
    setOpen(false);
    setMaximized(false);
  };

  const getMessageAvatar = (senderType: string) => {
    if (senderType === 'AI') return '🤖';
    if (senderType === 'STAFF') return '👨‍💼';
    return '🙋‍♀️';
  };

  const getMessageLabel = (senderType: string) => {
    if (senderType === 'AI') return 'AI Assistant';
    if (senderType === 'STAFF') return 'Nhân viên';
    return 'Bạn';
  };

  if (!user) return null;

  return (
    <div className={`modamint-chatbox ${open ? 'open' : ''} ${maximized ? 'maximized' : ''}`}>
      <button 
        className="modamint-chatbox-toggle" 
        onClick={() => { 
          setOpen(o => !o); 
          if (maximized) setMaximized(false); 
        }}
      >
        <span role="img" aria-label="Chat">💬</span>
      </button>
      
      {open && (
        <div className="modamint-chatbox-window" role="dialog" aria-label="Chat support">
          <div className="modamint-chatbox-header">
            <div className="modamint-chatbox-title">
              <div>Hỗ trợ khách hàng</div>
              <div className="modamint-chatbox-mode-switch">
                <button
                  className={`mode-btn ${chatMode === 'ai' ? 'active' : ''}`}
                  onClick={() => handleModeChange('ai')}
                  disabled={isLoading}
                >
                  🤖 AI
                </button>
                <button
                  className={`mode-btn ${chatMode === 'staff' ? 'active' : ''}`}
                  onClick={() => handleModeChange('staff')}
                  disabled={isLoading}
                >
                  👨‍💼 Nhân viên
                </button>
              </div>
              {chatMode === 'staff' && (
                <div className="ws-status">
                  <span className={isConnected ? 'connected' : 'disconnected'}>
                    {isConnected ? '● Đã kết nối' : '○ Đang kết nối...'}
                  </span>
                </div>
              )}
            </div>
            <div className="modamint-chatbox-controls">
              <button
                className="modamint-chatbox-control"
                title={maximized ? 'Thu nhỏ' : 'Mở rộng'}
                onClick={() => setMaximized(m => !m)}
              >
                {maximized ? '🗗' : '🗖'}
              </button>
              <button
                className="modamint-chatbox-control close"
                title="Đóng"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="modamint-chatbox-messages">
            {messages.length === 0 && (
              <div className="empty-state">
                <p>👋 Xin chào! Chúng tôi có thể giúp gì cho bạn?</p>
                <p className="hint">
                  {chatMode === 'ai' 
                    ? 'Hỏi AI để được hỗ trợ nhanh chóng' 
                    : 'Kết nối với nhân viên để được tư vấn trực tiếp'}
                </p>
              </div>
            )}

            {messages.map((msg) => {
              const isCustomer = msg.senderType === 'CUSTOMER';
              return (
                <div 
                  key={msg.id} 
                  className={`modamint-chatbox-row ${isCustomer ? 'user' : msg.senderType.toLowerCase()}`}
                >
                  {!isCustomer && (
                    <div className="modamint-chatbox-avatar">
                      <span>{getMessageAvatar(msg.senderType)}</span>
                    </div>
                  )}

                  <div className={`modamint-chatbox-msg ${isCustomer ? 'user' : msg.senderType.toLowerCase()}`}>
                    <div className="message-header">
                      <span className="sender-name">{getMessageLabel(msg.senderType)}</span>
                      <span className="timestamp">
                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="modamint-chatbox-bubble">{msg.content}</div>
                  </div>

                  {isCustomer && (
                    <div className="modamint-chatbox-avatar user">
                      <span>{getMessageAvatar(msg.senderType)}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="modamint-chatbox-row ai">
                <div className="modamint-chatbox-avatar">
                  <span>{getMessageAvatar(chatMode === 'ai' ? 'AI' : 'STAFF')}</span>
                </div>
                <div className="modamint-chatbox-msg ai">
                  <div className="modamint-chatbox-bubble loading">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="modamint-chatbox-input" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={
                chatMode === 'ai' 
                  ? 'Hỏi AI...' 
                  : isConnected 
                    ? 'Nhắn tin với nhân viên...'
                    : 'Đang kết nối...'
              }
              disabled={isLoading || (chatMode === 'staff' && !isConnected)}
              autoFocus
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim() || (chatMode === 'staff' && !isConnected)}
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
