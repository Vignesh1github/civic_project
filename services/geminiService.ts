import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeGrievance = async (
  description: string,
  imageBase64: string | null
): Promise<AIAnalysis> => {
  
  if (!apiKey) {
    console.warn("API Key is missing. Returning mock analysis.");
    return {
      category: 'Uncategorized (No API Key)',
      priority: 'Medium',
      summary: description.substring(0, 50) + '...',
      suggestedAction: 'Manual review required.'
    };
  }

  try {
    const parts: any[] = [{ text: description }];
    
    if (imageBase64) {
      // Remove data URL prefix if present for the API call
      const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg', 
          data: cleanBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: `You are an intelligent civic grievance assistant. Analyze the user's complaint (text and optional image).
        Categorize the issue into one of: Sanitation, Roads, Water Supply, Electricity, Garbage, Public Transport, Other.
        Assign a priority (High, Medium, Low) based on urgency and public impact.
        Provide a 1-sentence summary.
        Suggest a 1-sentence action for the municipal team.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
            summary: { type: Type.STRING },
            suggestedAction: { type: Type.STRING }
          },
          required: ['category', 'priority', 'summary', 'suggestedAction']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysis;
    }
    
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      category: 'General',
      priority: 'Medium',
      summary: 'AI Analysis failed, manual review needed.',
      suggestedAction: 'Check complaint details manually.'
    };
  }
};
