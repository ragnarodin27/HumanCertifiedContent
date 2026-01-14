import { GoogleGenAI, Type } from "@google/genai";
import { WritingSession, AIAnalysis } from "../types";

// Initialize specific model for analysis
const getClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found in process.env.API_KEY");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeWritingStyle = async (session: WritingSession): Promise<AIAnalysis | null> => {
  const ai = getClient();
  if (!ai) return null;

  const durationMinutes = ((session.endTime || Date.now()) - session.startTime) / 1000 / 60;
  const wpm = (session.finalContent.split(' ').length / durationMinutes).toFixed(1);

  const prompt = `
    Analyze the following text written by a human user to certify authorship.
    
    Writing Statistics:
    - Duration: ${durationMinutes.toFixed(2)} minutes
    - Words per minute: ${wpm} (Natural human writing varies, usually 30-80 wpm)
    - Backspaces used: ${session.backspaceCount} (High backspaces indicate human self-correction)
    - Pastes: ${session.pasteCount}

    Text Content:
    "${session.finalContent}"

    Please provide a structured analysis.
    1. Calculate a "Human Score" (0-100) based on the presence of natural imperfections, voice, and the provided statistics.
    2. Analyze "Burstiness" - does the text feel like it flowed naturally or does it feel mechanically generated?
    3. Assess tone and vocabulary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tone: { type: Type.STRING },
            vocabularyLevel: { type: Type.STRING },
            originalityScore: { type: Type.NUMBER, description: "Score from 1-100 on uniqueness" },
            humanScore: { type: Type.NUMBER, description: "Likelihood of human authorship 0-100 based on stats and style" },
            burstinessAnalysis: { type: Type.STRING, description: "Analysis of the rhythm and flow variations" },
            summary: { type: Type.STRING },
            feedback: { type: Type.STRING, description: "Brief comment on the human qualities of the text" }
          },
          required: ["tone", "vocabularyLevel", "originalityScore", "humanScore", "burstinessAnalysis", "summary", "feedback"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysis;
    }
    return null;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
};

export const generateVisualAsset = async (prompt: string): Promise<string | null> => {
  const ai = getClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
           aspectRatio: "16:9",
        }
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini image generation failed:", error);
    return null;
  }
};