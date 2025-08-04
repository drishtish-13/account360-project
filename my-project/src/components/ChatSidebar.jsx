// src/components/ChatSidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';

export default function ChatSidebar({ isOpen, onClose, onSendMessage }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { type: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const aiResponse = await onSendMessage(trimmed);
      setMessages((prev) => [...prev, { type: 'ai', text: aiResponse }]);
    } catch (err) {
      setMessages((prev) => [...prev, { type: 'ai', text: 'Failed to get AI response.' }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-800 rounded-lg">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">AI Assistant</h2>
            <p className="text-xs text-gray-500">Ask me anything</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto h-[calc(100%-140px)] p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Bot size={24} className="text-gray-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Welcome to AI Assistant</h3>
            <p className="text-xs text-gray-500">Start a conversation by typing a message below</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`p-2 rounded-full ${msg.type === 'user' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                {msg.type === 'user' ? (
                  <User size={14} className="text-white" />
                ) : (
                  <Bot size={14} className="text-gray-600" />
                )}
              </div>
              <div
                className={`px-4 py-3 rounded-lg text-sm ${
                  msg.type === 'user' 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-900 border border-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{msg.text}</div>
              </div>
            </div>
          </div>
        ))}
        
        {isSending && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-[85%]">
              <div className="p-2 rounded-full bg-gray-100">
                <Bot size={14} className="text-gray-600" />
              </div>
              <div className="px-4 py-3 rounded-lg bg-gray-100 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Loader2 size={14} className="animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-sm"
              rows="1"
              disabled={isSending}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            className="p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {isSending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
