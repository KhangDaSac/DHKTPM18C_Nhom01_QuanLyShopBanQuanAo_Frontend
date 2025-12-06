import React, { useState, useRef, useEffect } from 'react';
import './style.css';
import { chatService } from '../../services/chat';
import { useAuth } from '../../contexts/authContext';
import { getUserInfoFromToken } from '../../utils/apiAuthUtils';
import { toast } from 'react-toastify';
import type { ChatAiResponse } from '@/types';

export default function Chatbox() {
  const { accessToken } = useAuth();

  // Get userId from JWT token
  const userId = accessToken ? getUserInfoFromToken(accessToken)?.id : null;

  // Debug: log userId
  useEffect(() => {
    console.log('[Chatbox] accessToken:', accessToken ? 'exists' : 'null');
    console.log('[Chatbox] userId from token:', userId);
    console.log('[Chatbox] Will render chat button:', !!userId);
  }, [accessToken, userId]);

  // UI state
  const [open, setOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [messages, setMessages] = useState<ChatAiResponse[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);


  // Initialize conversation and load history when opened
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!open || !userId) return;
      try {
        setIsLoading(true);
        console.log('[Chatbox] Getting conversation for userId:', userId);
        const conv = await chatService.getHistory();
        console.log('[Chatbox] Conversation response:', conv);
        if (!mounted) return;

        try {
          const history = await chatService.getHistory();
          console.log('[Chatbox] History loaded:', history.length, 'messages');
          console.log('[Chatbox] History data:', history);
          if (mounted) {
            setMessages(Array.isArray(history) ? history : []);
            console.log('[Chatbox] Messages set successfully');
          }
        } catch (historyErr) {
          console.error('[Chatbox] Failed to load history:', historyErr);
          // Continue anyway - user can still chat
        }

        console.log('[Chatbox] Init complete, messages set');
      } catch (err) {
        console.error('[Chatbox] Init conversation failed:', err);
        if (err && typeof err === 'object' && 'response' in err) {
          console.error('[Chatbox] Error response:', (err as any).response);
        }
        toast.error('Không thể khởi tạo cuộc trò chuyện');
      } finally {
        console.log('[Chatbox] Finally block - setting isLoading to false');
        setIsLoading(false); // Safe to call even if unmounted
      }
    };
    init();
    return () => {
      console.log('[Chatbox] Cleanup');
      mounted = false;
    };
  }, [open, userId]);

  // Send message to AI via REST API
  const send = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!input.trim()) {
      return;
    }

    const content = input.trim();
    setInput('');
    setIsLoading(true);

    const userMsg: ChatAiResponse = {
      message: content,
      type: 'USER'
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      // Send to AI and get response
      const aiResponse = await chatService.sendMessageToAI(content);
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error('[Chatbox] Send message failed:', err);
      toast.error('Gửi tin nhắn thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if user not logged in or no userId in token
  if (!userId) return null;

  return (
    <div className={`modamint-chatbox ${open ? 'open' : ''} ${maximized ? 'maximized' : ''}`}>
      {
        !open &&
        <button className="modamint-chatbox-toggle" onClick={() => { setOpen((o) => !o); if (maximized) setMaximized(false); }}>
          <span role="img" aria-label="Chat">💬</span>
        </button>
      }

      {open && (
        <div className="modamint-chatbox-window" role="dialog" aria-label="Chat support">
          <div className="modamint-chatbox-header">
            <div className="modamint-chatbox-title">
              <div>🤖 Chat với trợ lý AI</div>
            </div>
            <div className="modamint-chatbox-controls">
              <button className="modamint-chatbox-control" title={maximized ? 'Thu nhỏ' : 'Mở rộng'} onClick={() => setMaximized((m) => !m)}>{maximized ? '🗗' : '🗖'}</button>
              <button className="modamint-chatbox-control close" title="Đóng" onClick={() => { setOpen(false); setMaximized(false); }}>{'✕'}</button>
            </div>
          </div>

          <div className="modamint-chatbox-messages">
            {messages.length === 0 ? (
              <div className="empty-state">
                <p>👋 Xin chào! Tôi là AI Assistant của ModaMint</p>
                <p className="hint">Hãy hỏi tôi bất cứ điều gì về sản phẩm, đơn hàng hoặc chính sách của shop!</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isCustomer = msg.type === 'USER';
                const isAI = msg.type === 'ASSISTANT';
                const senderName = isAI ? 'AI' : 'Bạn';
                const rowClass = isCustomer ? 'user' : 'ai';

                return (
                  <div className={`modamint-chatbox-row ${rowClass}`}>
                    {!isCustomer && (<div className="modamint-chatbox-avatar"><span>{isAI ? '🤖' : '👨‍💼'}</span></div>)}
                    <div className={`modamint-chatbox-msg ${rowClass}`}>
                      <div className="message-header">
                        <span className="sender-name">{senderName}</span>

                      </div>
                      <div className="modamint-chatbox-bubble ">{msg.message}</div>
                    </div>
                    {isCustomer && (<div className="modamint-chatbox-avatar user"><span>🙋‍♀️</span></div>)}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="modamint-chatbox-input" onSubmit={send}>
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              placeholder="Hỏi AI bất cứ điều gì..."
              disabled={isLoading}
              autoFocus
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? '⏳' : '📤'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

