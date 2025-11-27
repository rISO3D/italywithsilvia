import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT_EXTRACT } from '../../constants';
import { CategoryType } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Text is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ message: 'Server configuration error: Missing API Key' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract vendor information from this text: \n\n${text}`,
      config: {
        systemInstruction: SYSTEM_PROMPT_EXTRACT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING, enum: Object.values(CategoryType) },
            description: { type: Type.STRING },
            priceRange: { type: Type.STRING, enum: ['$', '$$', '$$$', '$$$$'] },
            location: { type: Type.STRING },
            contact: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["name", "category", "description", "priceRange", "location"]
        }
      }
    });

    if (response.text) {
      res.status(200).json(JSON.parse(response.text));
    } else {
      res.status(500).json({ message: 'No content generated' });
    }
  } catch (error) {
    console.error("API Extract Error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
}