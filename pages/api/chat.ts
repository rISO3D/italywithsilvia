import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from "@google/genai";
import { Vendor } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { query, vendors } = req.body;

  if (!query || !vendors) {
    return res.status(400).json({ message: 'Query and vendors are required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: 'Server configuration error: Missing API Key' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Construct context from vendors
    const vendorContext = (vendors as Vendor[]).map(v => 
      `ID: ${v.id}, Name: ${v.name}, Category: ${v.category}, Price: ${v.priceRange}, Location: ${v.location}, Details: ${v.description}`
    ).join('\n');

    const prompt = `
    You are a helpful event planning assistant. The user asks a question about their saved vendors.
    
    Here is the list of vendors the user has saved:
    ---
    ${vendorContext}
    ---
    
    User Question: "${query}"
    
    Answer in Italian. Be helpful, specific, and concise. Compare vendors if asked.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.status(200).json({ response: response.text || "Non ho trovato una risposta specifica." });
  } catch (error) {
    console.error("API Chat Error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
}