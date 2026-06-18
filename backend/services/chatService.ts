import { GoogleGenAI } from '@google/genai';
import { supabaseServiceClient } from '../config/supabase.js';

type ChatMessageRecord = {
  id: string;
  user_id: string;
  message: string;
  sender: 'user' | 'ai';
  created_at: string;
};

const apiKey = process.env.GEMINI_API_KEY;

const buildSystemInstruction = (context?: string) => `
Tu es AgroAI, un assistant agricole intelligent pour les agriculteurs camerounais.
1. Reponds en francais simple, court et accessible.
2. Donne des conseils adaptes au climat du Cameroun et aux realites locales.
3. Sois encourageant, bienveillant et pratique.
4. Si la question n'est pas liee a l'agriculture, ramene poliment le sujet vers la terre.
5. Quand l'information manque, dis-le franchement et propose une verification terrain simple.
${context ? `Contexte de conversation recente : ${context}` : ''}
`.trim();

const formatContext = (messages: ChatMessageRecord[]) =>
  messages
    .map((entry) => `${entry.sender === 'user' ? 'Utilisateur' : 'AgroAI'}: ${entry.message}`)
    .join('\n');

const buildPlantDiagnosisInstruction = () => `
Tu es AgroAI, un assistant agronome specialise dans le diagnostic des cultures.
1. Reponds en francais clair et pratique.
2. Analyse l'image et la description pour identifier maladies, ravageurs ou carences probables.
3. Structure la reponse en sections courtes : Observation, Diagnostic probable, Actions immediates, Prevention.
4. Si tu n'es pas sur, dis-le clairement et propose une verification terrain simple.
5. Donne des conseils adaptes a des agriculteurs du Cameroun.
`.trim();

export const getChatHistory = async (userId: string) => {
  const { data, error } = await supabaseServiceClient
    .from('chat_messages')
    .select('id, user_id, message, sender, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Unable to load chat history: ${error.message}`);
  }

  return (data ?? []) as ChatMessageRecord[];
};

export const sendChat = async (userId: string, message: string) => {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured on the server.');
  }

  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    throw new Error('Message required');
  }

  const { error: userMessageError } = await supabaseServiceClient
    .from('chat_messages')
    .insert({
      user_id: userId,
      message: trimmedMessage,
      sender: 'user',
    });

  if (userMessageError) {
    throw new Error(`Unable to save user message: ${userMessageError.message}`);
  }

  const history = await getChatHistory(userId);
  const context = formatContext(history.slice(-10));

  const ai = new GoogleGenAI({ apiKey });

  let reply =
    "Desole, j'ai un petit souci technique. Reessaie dans un instant.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: trimmedMessage,
      config: {
        systemInstruction: buildSystemInstruction(context),
      },
    });

    reply = response.text || reply;
  } catch {
    reply = "Desole, j'ai un petit souci technique. Reessaie dans un instant.";
  }

  const { data: aiMessage, error: aiMessageError } = await supabaseServiceClient
    .from('chat_messages')
    .insert({
      user_id: userId,
      message: reply,
      sender: 'ai',
    })
    .select('id, user_id, message, sender, created_at')
    .single();

  if (aiMessageError) {
    throw new Error(`Unable to save AI response: ${aiMessageError.message}`);
  }

  return {
    response: reply,
    message: aiMessage as ChatMessageRecord,
  };
};

export const diagnosePlant = async (userId: string, base64Image: string, description?: string) => {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured on the server.');
  }

  if (!userId) {
    throw new Error('Authenticated user required');
  }

  const normalizedImage = base64Image.trim();
  if (!normalizedImage) {
    throw new Error('Plant image is required');
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: normalizedImage.split(',')[1] || normalizedImage,
          },
        },
        {
          text: `Description du cultivateur: ${description?.trim() || 'Aucune description fournie.'}`,
        },
      ],
    },
    config: {
      systemInstruction: buildPlantDiagnosisInstruction(),
    },
  });

  return {
    diagnosis: response.text || 'Aucun diagnostic n’a pu etre genere.',
  };
};
