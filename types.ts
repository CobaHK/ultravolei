
export interface Player {
  id: number;
  name: string;
  position: string;
  imageUrl: string;
  gender: 'M' | 'F'; // Masculino ou Feminino
}

export interface Game {
  id: number;
  opponent: string;
  date: string;
  time: string;
  location: string;
  isUpcoming: boolean;
  score?: string; // e.g., "3-1"
  result?: 'W' | 'L';
}

export interface Sponsor {
  id: number;
  name: string;
  logoUrl: string;
  websiteUrl: string;
  tier: 'gold' | 'silver' | 'bronze';
}

export interface InstagramPost {
  id: number;
  imageUrl: string;
  postUrl: string;
}
