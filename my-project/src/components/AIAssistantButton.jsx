// src/components/AIAssistantButton.jsx
import React from 'react';
import { Bot, MessageCircle } from 'lucide-react';

export default function AIAssistantButton({ onClick }) {
  return (
    <button
      className="fixed bottom-6 right-6 z-50 bg-gray-800 text-white p-4 rounded-full shadow-lg hover:bg-gray-700 hover:shadow-xl transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
      onClick={onClick}
      aria-label="Open AI Assistant"
    >
      <div className="relative">
        <Bot size={20} className="text-white" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
      </div>
    </button>
  );
}
