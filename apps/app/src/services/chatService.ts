import api from './api';

export type ChatMessage = {
  id: string;
  message: string;
  sender: 'user' | 'ai';
  created_at: string;
};

export const getChatHistory = async () => {
  const response = await api.get('/chat/history');
  return (response.data?.data ?? []) as ChatMessage[];
};

export const sendChatMessage = async (message: string) => {
  const response = await api.post('/chat', { message });
  return response.data?.data as {
    response: string;
    message: ChatMessage;
  };
};
