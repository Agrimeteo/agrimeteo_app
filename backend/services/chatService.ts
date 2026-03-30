import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseServiceClient } from '../config/supabase.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const sendChat = async (userId: string, message: string) => {
  // Get history
  const { data: history } = await supabaseServiceClient
    .from('chat_history')
    .select('message, response')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
    
  const context = history?.map((h: any) => `${h.message}: ${h.response}`).join('\\n') || '';
  
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const prompt = `Tu es AgriBot, assistant agricole expert pour Agrimétéo. Conseils pratiques en français sur cultures, maladies, météo.

${context}
Question: ${message}`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response.text();

  // Save to history
  await supabaseServiceClient
    .from('chat_history')
    .insert({
      user_id: userId,
      message,
      response
    });

  return { response };
};

