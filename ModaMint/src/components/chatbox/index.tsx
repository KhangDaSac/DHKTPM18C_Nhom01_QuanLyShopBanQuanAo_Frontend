import React, { useState, useRef, useEffect } from 'react';
import './style.css';
import { chatService } from '../../services/chat';
import { SenderType, type MessageResponse } from '../../types/chat.types';
import { useAuth } from '../../contexts/authContext';
import { getUserInfoFromToken } from '../../utils/apiAuthUtils';
import { toast } from 'react-toastify';

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
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Debug conversationId
  useEffect(() => {
    console.log('[Chatbox] conversationId state:', conversationId);
    console.log('[Chatbox] isLoading:', isLoading);
    console.log('[Chatbox] Input will be disabled:', isLoading || !conversationId);
  }, [conversationId, isLoading]);

  // Initialize conversation and load history when opened
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!open || conversationId || !userId) return;
      try {
        setIsLoading(true);
        console.log('[Chatbox] Getting conversation for userId:', userId);
        const conv = await chatService.getConversation(userId);
        console.log('[Chatbox] Conversation response:', conv);
        if (!mounted) return;
        setConversationId(conv.id);
        console.log('[Chatbox] Set conversationId to:', conv.id);
        
        // Load history (optional - comment out if causing issues)
        try {
          const history = await chatService.getChatHistory(conv.id);
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
  }, [open, conversationId, userId]);

  // Send message to AI via REST API
  const send = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    console.log('[Chatbox] Send - conversationId:', conversationId);
    console.log('[Chatbox] Send - input:', input);
    
    if (!input.trim() || !conversationId) {
      console.log('[Chatbox] Cannot send - missing conversationId or input');
      return;
    }

    const content = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message immediately
    const userMsg: MessageResponse = {
      id: Date.now(),
      content: content,
      timestamp: new Date().toISOString(),
      senderType: SenderType.CUSTOMER
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // Send to AI and get response
      const aiResponse = await chatService.sendMessageToAI(conversationId, content);
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
      <button className="modamint-chatbox-toggle" onClick={() => { setOpen((o) => !o); if (maximized) setMaximized(false); }}>
        <span role="img" aria-label="Chat">💬</span>
      </button>

      {open && (
        <div className="modamint-chatbox-window" role="dialog" aria-label="Chat support">
          <div className="modamint-chatbox-header">
            <div className="modamint-chatbox-title">
              <div>🤖 Chat với AI Assistant</div>
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
                const isCustomer = msg.senderType === SenderType.CUSTOMER;
                const isAI = msg.senderType === SenderType.AI;
                const isStaff = msg.senderType === SenderType.STAFF;
                const senderName = isAI ? 'AI Assistant' : isStaff ? 'Nhân viên' : 'Bạn';
                const rowClass = isCustomer ? 'user' : isAI ? 'ai' : 'staff';
                
                return (
                  <div key={msg.id ?? i} className={`modamint-chatbox-row ${rowClass}`}>
                    {!isCustomer && (<div className="modamint-chatbox-avatar"><span>{isAI ? '🤖' : '👨‍💼'}</span></div>)}
                    <div className={`modamint-chatbox-msg ${rowClass}`}>
                      <div className="message-header">
                        <span className="sender-name">{senderName}</span>
                        {msg.timestamp && <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>}
                      </div>
                      <div className="modamint-chatbox-bubble">{msg.content}</div>
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
                console.log('[Chatbox] Input changed:', e.target.value);
                setInput(e.target.value);
              }} 
              placeholder="Hỏi AI bất cứ điều gì..." 
              disabled={isLoading || !conversationId} 
              autoFocus 
            />
            <button type="submit" disabled={isLoading || !input.trim() || !conversationId}>
              {isLoading ? '⏳' : '📤'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

