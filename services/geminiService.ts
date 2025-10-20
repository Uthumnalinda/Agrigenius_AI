import { GoogleGenAI } from "@google/genai";
import { fileToGenerativePart } from "../utils/imageUtils";

if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const geminiService = {
  generateContent: async (prompt: string) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error generating content:", error);
      throw new Error("Failed to get response from AI.");
    }
  },

  generateContentWithImage: async (prompt: string, image: File) => {
    try {
        const imagePart = await fileToGenerativePart(image);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{text: prompt}, imagePart] },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating content with image:", error);
        throw new Error("Failed to analyze image with AI.");
    }
  },

  createChatSession: () => {
    return ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are AgriGenius, a friendly and knowledgeable AI assistant for farmers. 🤖🌾 Your answers should be concise, helpful, and practical. Use emojis to make your advice more engaging and markdown for **bolding** key terms. If asked about non-farming topics, gently steer the conversation back to agriculture.",
      },
    });
  }
};
