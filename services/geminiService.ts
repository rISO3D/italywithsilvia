import { Vendor, AiExtractionResponse } from '../types';

export const extractVendorInfo = async (text: string): Promise<AiExtractionResponse | null> => {
  if (!text.trim()) return null;

  try {
    const response = await fetch('/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('API extraction failed');
    }

    const data = await response.json();
    return data as AiExtractionResponse;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Impossibile analizzare il testo. Riprova o inserisci i dati manualmente.");
  }
};

export const chatWithVendors = async (query: string, vendors: Vendor[]): Promise<string> => {
  if (!vendors.length) return "Non hai ancora salvato nessun fornitore. Aggiungine alcuni per iniziare!";

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, vendors }),
    });

    if (!response.ok) {
      throw new Error('API chat failed');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Mi dispiace, si è verificato un errore durante l'elaborazione della tua richiesta.";
  }
};