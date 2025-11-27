import { CategoryType } from './types';
import { Camera, Flower, Castle, Palette, Utensils, Music, Folder } from 'lucide-react';

export const CATEGORIES = [
  { id: CategoryType.PHOTOGRAPHER, label: 'Fotografi', icon: Camera, color: 'bg-blue-100 text-blue-600' },
  { id: CategoryType.FLORIST, label: 'Fiorai', icon: Flower, color: 'bg-pink-100 text-pink-600' },
  { id: CategoryType.VENUE, label: 'Ville e Castelli', icon: Castle, color: 'bg-amber-100 text-amber-600' },
  { id: CategoryType.MAKEUP, label: 'Make-up Artists', icon: Palette, color: 'bg-purple-100 text-purple-600' },
  { id: CategoryType.CATERING, label: 'Catering', icon: Utensils, color: 'bg-orange-100 text-orange-600' },
  { id: CategoryType.MUSIC, label: 'Musica', icon: Music, color: 'bg-indigo-100 text-indigo-600' },
];

export const MOCK_INITIAL_DATA = []; 

export const SYSTEM_PROMPT_EXTRACT = `
You are an expert event planner assistant. extract structured data from the provided text (which might be raw notes, email copy, or PDF content).
Return ONLY a valid JSON object with the following fields:
- name: string
- category: one of ["Fotografi", "Fiorai", "Ville e Castelli", "Make-up Artists", "Catering & Torte", "Musica & DJ", "Altro"]
- description: string (short summary)
- priceRange: one of ["$", "$$", "$$$", "$$$$"]
- location: string (city or address)
- contact: string (email or phone)
- tags: string[] (keywords like "luxury", "boho", "vegan", etc.)

If a field is missing, make a reasonable guess or leave it as "N/A" string.
`;
