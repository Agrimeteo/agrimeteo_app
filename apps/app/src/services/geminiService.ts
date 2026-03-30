import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const getGeminiResponse = async (prompt: string) => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are AgroBot, a highly knowledgeable agricultural assistant. Provide practical, sustainable, and accurate farming advice. Keep responses concise and helpful for farmers.",
    },
  });

  return response.text;
};

export const analyzePlantImage = async (base64Image: string, description: string) => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: `Analyze this plant image. Description from farmer: ${description}. Provide a diagnosis of any issues (diseases, pests, deficiencies) and a treatment plan. Return the response in a clear, structured format.`,
        },
      ],
    },
    config: {
      systemInstruction: "You are a plant pathologist and agricultural expert. Analyze images of plants to diagnose issues and provide treatment plans.",
    },
  });

  return response.text;
};
