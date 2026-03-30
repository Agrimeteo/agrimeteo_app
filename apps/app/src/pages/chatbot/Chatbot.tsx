import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Paperclip, Bot, Info, MoreVertical, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { getGeminiResponse } from '../../services/geminiService';

interface Message {
  id: number;
  text: string;
  sender: string;
  time: string;
  suggestions?: string[];
}

const Chatbot: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm AgroBot, your smart farming assistant. How can I help you with your crops today?", sender: 'bot', time: '10:24 AM' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    
    try {
      const responseText = await getGeminiResponse(currentInput);
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: responseText || "I'm sorry, I couldn't process that request.",
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I'm having trouble connecting to my brain right now. Please try again later.",
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f6f8f8]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center p-4 justify-between max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-tight tracking-tight text-primary">AgroBot</h1>
              <div className="flex items-center gap-1.5">
                <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-slate-500 text-xs font-medium">Active now</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors">
              <Info size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 max-w-2xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center py-8 opacity-60">
          <div className="bg-primary/10 p-4 rounded-full mb-3">
            <Bot size={40} className="text-primary" />
          </div>
          <p className="text-sm font-medium text-slate-500">Today</p>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end ml-auto' : ''} max-w-[85%]`}>
            {msg.sender === 'bot' && (
              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-primary" />
              </div>
            )}
            <div className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-xl text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-primary text-white rounded-br-none' 
                  : 'bg-white border border-primary/5 text-slate-800 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
              {msg.suggestions && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.suggestions.map((s, i) => (
                    <button key={i} className="px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium hover:bg-primary/10 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <span className="text-[10px] text-slate-400 px-1">{msg.time}</span>
            </div>
            {msg.sender === 'user' && (
              <div className="size-8 rounded-full bg-slate-300 overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVw3EqzcrnVIlv6Q_9JajNaMlPia3vHBjYFrSsnNIPOE3-DhTyBQEArJ_ocIcyJHSFjRa-cJbd4dui1GttmyeK9lr_huK-EihLjoT19QfLaxMTt-a31r_e8VwsjO6TYAJg7PKElAnz4DKeSRHm_2JPZQSSjnjB6jkIugUSsZCHi5t6ZIovwf9s2jSDfsd1BhXyrAb1N06xHlecOzM__EpDlVN0TJnd1ui1uYJ8ZcLD5XkLLLo2GjFD4VysqDBLZ13I9zDagy_KkBm_" alt="User" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-end gap-3 max-w-[85%]">
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-primary" />
            </div>
            <div className="bg-white border border-primary/5 px-4 py-3 rounded-xl rounded-bl-none shadow-sm">
              <div className="flex gap-1">
                <span className="size-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="size-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="size-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="max-w-2xl mx-auto w-full px-4 pb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-primary/10 p-2 flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-primary transition-colors">
            <Paperclip size={20} />
          </button>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-400 py-2 outline-none" 
            placeholder="Ask AgroBot anything..." 
          />
          <button 
            onClick={handleSend}
            className="size-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all shadow-md active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
