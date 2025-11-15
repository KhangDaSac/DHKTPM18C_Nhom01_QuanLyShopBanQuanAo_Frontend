// Test component to debug chat functionality
// Add this to your page temporarily to test

import { useState } from 'react';
import { chatService } from '../services/chat';
import { SenderType } from '../types/chat.types';

export default function ChatDebugTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [userId, setUserId] = useState('test-user-123');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [message, setMessage] = useState('Hello AI');

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const testStartConversation = async () => {
    try {
      addLog('🔄 Testing START_CONVERSATION...');
      const conv = await chatService.startConversation(userId);
      setConversationId(conv.id);
      addLog(`✅ SUCCESS: Conversation ID = ${conv.id}`);
    } catch (error: any) {
      addLog(`❌ FAILED: ${error.message}`);
      console.error(error);
    }
  };

  const testGetMessages = async () => {
    if (!conversationId) {
      addLog('❌ No conversation ID. Create conversation first!');
      return;
    }
    try {
      addLog('🔄 Testing GET_MESSAGES...');
      const messages = await chatService.getMessages(conversationId);
      addLog(`✅ SUCCESS: Got ${messages.length} messages`);
    } catch (error: any) {
      addLog(`❌ FAILED: ${error.message}`);
      console.error(error);
    }
  };

  const testChatWithAI = async () => {
    if (!conversationId) {
      addLog('❌ No conversation ID. Create conversation first!');
      return;
    }
    try {
      addLog('🔄 Testing CHAT_WITH_AI...');
      const response = await chatService.chatWithAI(conversationId, {
        content: message,
        senderType: SenderType.CUSTOMER,
      });
      addLog(`✅ SUCCESS: AI replied: "${response.content}"`);
    } catch (error: any) {
      addLog(`❌ FAILED: ${error.message}`);
      if (error.response) {
        addLog(`Status: ${error.response.status}`);
        addLog(`Data: ${JSON.stringify(error.response.data)}`);
      }
      console.error(error);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '20px auto',
      border: '2px solid #ff6347',
      borderRadius: '8px',
      backgroundColor: '#fff'
    }}>
      <h2 style={{ color: '#ff6347', marginBottom: '20px' }}>
        🔧 Chat API Debug Tool
      </h2>

      {/* Configuration */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Configuration</h3>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            User ID:
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ddd' 
            }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Message:
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ddd' 
            }}
          />
        </div>
        {conversationId && (
          <div style={{ padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px', color: '#155724' }}>
            ✅ Conversation ID: <strong>{conversationId}</strong>
          </div>
        )}
      </div>

      {/* Test Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={testStartConversation}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          1️⃣ Start Conversation
        </button>
        <button
          onClick={testGetMessages}
          disabled={!conversationId}
          style={{
            padding: '10px 20px',
            backgroundColor: conversationId ? '#28a745' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: conversationId ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
        >
          2️⃣ Get Messages
        </button>
        <button
          onClick={testChatWithAI}
          disabled={!conversationId}
          style={{
            padding: '10px 20px',
            backgroundColor: conversationId ? '#ff6347' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: conversationId ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
        >
          3️⃣ Chat with AI
        </button>
        <button
          onClick={() => setLogs([])}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🗑️ Clear Logs
        </button>
      </div>

      {/* Logs */}
      <div style={{ 
        backgroundColor: '#000', 
        color: '#0f0', 
        padding: '15px', 
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <div style={{ marginBottom: '10px', color: '#fff', fontWeight: 'bold' }}>
          📋 Logs:
        </div>
        {logs.length === 0 ? (
          <div style={{ color: '#666' }}>No logs yet. Click buttons above to test.</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} style={{ marginBottom: '5px' }}>
              {log}
            </div>
          ))
        )}
      </div>

      {/* Instructions */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#fff3cd', 
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <strong>ℹ️ Instructions:</strong>
        <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Click "1️⃣ Start Conversation" first</li>
          <li>If successful, you'll see a Conversation ID</li>
          <li>Then click "2️⃣ Get Messages" to load messages</li>
          <li>Click "3️⃣ Chat with AI" to test AI chat</li>
          <li>Check logs and browser console (F12) for details</li>
        </ol>
        <p style={{ marginTop: '10px', color: '#856404' }}>
          ⚠️ Make sure backend is running at <code>VITE_API_URL</code>
        </p>
      </div>
    </div>
  );
}
