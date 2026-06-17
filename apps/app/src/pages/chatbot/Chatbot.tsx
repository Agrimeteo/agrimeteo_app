import React, { useEffect, useRef, useState } from 'react';
import { Bot, Info, MoreVertical, ArrowLeft, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { getChatHistory, sendChatMessage, type ChatMessage } from '../../services/chatService';

type UiMessage = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  time: string;
};

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const welcomeMessage: UiMessage = {
  id: 'welcome-message',
  text:
    "Bonjour, je suis AgroAI. Pose-moi une question sur les cultures, la meteo, les maladies des plantes ou les bonnes pratiques agricoles au Cameroun.",
  sender: 'ai',
  time: formatTime(new Date().toISOString()),
};

const toUiMessage = (message: ChatMessage): UiMessage => ({
  id: message.id,
  text: message.message,
  sender: message.sender,
  time: formatTime(message.created_at),
});

const Chatbot: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<UiMessage[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getChatHistory();
        if (history.length > 0) {
          setMessages(history.map(toUiMessage));
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Impossible de charger l’historique du chat.';
        setErrorMessage(message);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const currentInput = input.trim();
    const optimisticUserMessage: UiMessage = {
      id: `temp-user-${Date.now()}`,
      text: currentInput,
      sender: 'user',
      time: formatTime(new Date().toISOString()),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setInput('');
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await sendChatMessage(currentInput);
      const aiMessage = result?.message;

      setMessages((prev) => {
        const withoutTemp = prev.filter((message) => message.id !== optimisticUserMessage.id);

        return [
          ...withoutTemp,
          {
            ...optimisticUserMessage,
            id: `user-${Date.now()}`,
          },
          aiMessage
            ? toUiMessage(aiMessage)
            : {
                id: `ai-${Date.now()}`,
                text:
                  result?.response ||
                  "Desole, je n'ai pas pu generer une reponse cette fois-ci.",
                sender: 'ai',
                time: formatTime(new Date().toISOString()),
              },
        ];
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Impossible d’envoyer le message.';
      setErrorMessage(message);
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f6f8f8]">
      <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-tight tracking-tight text-primary">AgroAI</h1>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-xs font-medium text-slate-500">Assistant agricole</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-full p-2 text-primary transition-colors hover:bg-primary/10">
              <Info size={20} />
            </button>
            <button className="rounded-full p-2 text-primary transition-colors hover:bg-primary/10">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto p-4">
        <div className="mb-6 flex flex-col items-center justify-center py-4 opacity-70">
          <div className="mb-3 rounded-full bg-primary/10 p-4">
            <Bot size={40} className="text-primary" />
          </div>
          <p className="text-sm font-medium text-slate-500">Conseils agricoles en continu</p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {loadingHistory ? (
          <div className="py-10 text-center text-sm text-slate-500">Chargement de votre historique...</div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex max-w-[85%] items-end gap-3 ${
                  msg.sender === 'user' ? 'ml-auto justify-end' : ''
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <Bot size={16} className="text-primary" />
                  </div>
                )}
                <div className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'rounded-br-none bg-primary text-white'
                        : 'rounded-bl-none border border-primary/5 bg-white text-slate-800'
                    }`}
                  >
                    {msg.text}
                  </motion.div>
                  <span className="px-1 text-[10px] text-slate-400">{msg.time}</span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex max-w-[85%] items-end gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <Bot size={16} className="text-primary" />
                </div>
                <div className="rounded-xl rounded-bl-none border border-primary/5 bg-white px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="size-1.5 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: '0ms' }} />
                    <span className="size-1.5 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: '150ms' }} />
                    <span className="size-1.5 animate-bounce rounded-full bg-primary/40" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="mx-auto w-full max-w-2xl px-4 pb-8">
        <div className="flex items-center gap-2 rounded-2xl border border-primary/10 bg-white p-2 shadow-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void handleSend();
              }
            }}
            className="flex-1 bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            placeholder="Ex: Mon plantain jaunit, que faire ?"
          />
          <button
            onClick={() => void handleSend()}
            disabled={isLoading || !input.trim()}
            className="flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
