import React, { useState, useRef, useEffect } from 'react';
import './style.css';

const defaultMessages = [
  { from: 'bot', text: 'Xin chào! Tôi có thể giúp gì cho bạn?' }
];

export default function Chatbox() {
  const [messages, setMessages] = useState(defaultMessages);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { from: 'user', text: input }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: 'Cảm ơn bạn đã nhắn tin! (Demo)' }]);
    }, 700);
    setInput('');
  };

  return (
    <div className={`modamint-chatbox ${open ? 'open' : ''} ${maximized ? 'maximized' : ''}`}>
      <button className="modamint-chatbox-toggle" onClick={() => { setOpen(o => !o); if (maximized) setMaximized(false); }}>
        <span role="img" aria-label="Chat">💬</span>
      </button>
      {open && (
        <div className="modamint-chatbox-window" role="dialog" aria-label="Chat support">
          <div className="modamint-chatbox-header">
            <div className="modamint-chatbox-title">Hỗ trợ khách hàng</div>
            <div className="modamint-chatbox-controls">
              <button
                className="modamint-chatbox-control"
                title={maximized ? 'Thu nhỏ' : 'Mở rộng'}
                aria-label={maximized ? 'Restore' : 'Maximize'}
                onClick={() => setMaximized(m => !m)}
              >
                {maximized ? '🗗' : '🗖'}
              </button>
              <button
                className="modamint-chatbox-control close"
                title="Đóng"
                aria-label="Close"
                onClick={() => { setOpen(false); setMaximized(false); }}
              >
                ✕
              </button>
            </div>
          </div>
          <div className="modamint-chatbox-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`modamint-chatbox-row ${msg.from}`}>
                {msg.from === 'bot' && (
                  <div className="modamint-chatbox-avatar" aria-hidden>
                    <span>🤖</span>
                  </div>
                )}

                <div className={`modamint-chatbox-msg ${msg.from}`}>
                  <div className="modamint-chatbox-bubble">{msg.text}</div>
                </div>

                {msg.from === 'user' && (
                  <div className="modamint-chatbox-avatar user" aria-hidden>
                    <span>🙋‍♀️</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="modamint-chatbox-input" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              autoFocus
            />
            <button type="submit">Gửi</button>
          </form>
        </div>
      )}
    </div>
  );
}
