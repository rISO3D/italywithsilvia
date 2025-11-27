export enum CategoryType {
  PHOTOGRAPHER = 'Fotografi',
  FLORIST = 'Fiorai',
  VENUE = 'Ville e Castelli',
  MAKEUP = 'Make-up Artists',
  CATERING = 'Catering & Torte',
  MUSIC = 'Musica & DJ',
  OTHER = 'Altro'
}

export interface Vendor {
  id: string;
  name: string;
  category: CategoryType;
  description: string; // Short summary
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  location: string;
  contact: string;
  details: string; // The raw info or extracted full details
  website?: string;
  tags: string[];
  createdAt: number;
}

export interface AiExtractionResponse {
  name: string;
  description: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  location: string;
  contact: string;
  tags: string[];
  category: CategoryType;
}
