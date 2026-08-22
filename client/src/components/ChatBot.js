import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { Bot, Send, X, Loader2, User } from 'lucide-react';



export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am AgriSmart AI, your expert digital agronomist. How can I help you with your crops, soil, or farming today?'
    }
  ]);

  const chatEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput('');

    // Add user message to state
    const updatedMessages = [
      ...messages,
      { sender: 'user', text: userQuery }
    ];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Format chat history for backend (excluding full context for light payload)
      const formattedHistory = updatedMessages.slice(1, -1).map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));

      const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        question: userQuery,
        chatHistory: formattedHistory,
        context: {
          city: 'Local Farm',
          crop: 'General'
        }
      });

      if (response.data && response.data.reply) {
        setMessages(prev => [
          ...prev,
          { sender: 'ai', text: response.data.reply }
        ]);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Chatbot API Error:', error);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Sorry, I had trouble processing that request. Please make sure your backend is running and try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper" style={styles.wrapper}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={styles.toggleBtn}
          title="Ask AgriSmart AI"
        >
          <Bot size={24} color="#fff" />
          <span style={styles.toggleText}>AI Assistant</span>
        </button>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div style={styles.chatWindow}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerTitle}>
              <Bot size={20} color="#fff" />
              <strong style={{ color: '#fff', marginLeft: '8px' }}>AgriSmart AI Assistant</strong>
            </div>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
              <X size={18} color="#fff" />
            </button>
          </div>

          {/* Messages Body */}
          <div style={styles.messagesContainer}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  ...styles.messageRow,
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                {msg.sender === 'ai' && (
                  <div style={{ ...styles.avatar, backgroundColor: '#2e7d32' }}>
                    <Bot size={14} color="#fff" />
                  </div>
                )}

                <div
                  style={{
                    ...styles.messageBubble,
                    ...(msg.sender === 'user' ? styles.userBubble : styles.aiBubble)
                  }}
                >
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                    {msg.text}
                  </p>
                </div>

                {msg.sender === 'user' && (
                  <div style={{ ...styles.avatar, backgroundColor: '#1565c0' }}>
                    <User size={14} color="#fff" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
                <div style={{ ...styles.avatar, backgroundColor: '#2e7d32' }}>
                  <Bot size={14} color="#fff" />
                </div>
                <div style={{ ...styles.messageBubble, ...styles.aiBubble }}>
                  <Loader2 size={16} className="spin" style={{ marginRight: '6px' }} />
                  <span>Analyzing farm query...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} style={styles.inputForm}>
            <input
              type="text"
              placeholder="Ask about crops, diseases, soil..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={styles.inputField}
            />
            <button type="submit" disabled={loading || !input.trim()} style={styles.sendBtn}>
              <Send size={16} color="#fff" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// Inline Styles for clean layout without styling dependencies
const styles = {
  wrapper: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#2e7d32',
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    padding: '12px 20px',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  toggleText: {
    fontSize: '14px'
  },
  chatWindow: {
    width: '350px',
    height: '480px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid #e0e0e0'
  },
  header: {
    backgroundColor: '#2e7d32',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  messagesContainer: {
    flex: 1,
    padding: '12px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: '#f9f9f9'
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px'
  },
  avatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  messageBubble: {
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '13px'
  },
  aiBubble: {
    backgroundColor: '#e8f5e9',
    color: '#1b5e20',
    borderTopLeftRadius: '2px'
  },
  userBubble: {
    backgroundColor: '#2e7d32',
    color: '#ffffff',
    borderTopRightRadius: '2px'
  },
  inputForm: {
    display: 'flex',
    padding: '8px 12px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #eeeeee',
    gap: '8px'
  },
  inputField: {
    flex: 1,
    border: '1px solid #cccccc',
    borderRadius: '20px',
    padding: '8px 14px',
    fontSize: '13px',
    outline: 'none'
  },
  sendBtn: {
    backgroundColor: '#2e7d32',
    border: 'none',
    borderRadius: '50%',
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  }
};