
import type { Player, Game, Sponsor, InstagramPost } from './types';

export const TEAM_NAME = "UltraVôlei Joinville";
export const TEAM_SLOGAN = "Garra, União e Paixão Pela Quadra";

export const PLAYERS: Player[] = [
  // Time Masculino
  { id: 1, name: 'Lucas "The Wall" Silva', position: 'Central', imageUrl: 'https://picsum.photos/seed/player1/400/400', gender: 'M' },
  { id: 2, name: 'Pedro "Rocket" Alves', position: 'Ponteiro', imageUrl: 'https://picsum.photos/seed/player2/400/400', gender: 'M' },
  { id: 3, name: 'Gabriel "Maestro" Costa', position: 'Levantador', imageUrl: 'https://picsum.photos/seed/player3/400/400', gender: 'M' },
  { id: 4, name: 'Matheus "Hammer" Santos', position: 'Oposto', imageUrl: 'https://picsum.photos/seed/player4/400/400', gender: 'M' },
  { id: 5, name: 'Fernando "Flash" Lima', position: 'Líbero', imageUrl: 'https://picsum.photos/seed/player5/400/400', gender: 'M' },
  { id: 6, name: 'Rafael "Titan" Oliveira', position: 'Central', imageUrl: 'https://picsum.photos/seed/player6/400/400', gender: 'M' },
  // Time Feminino
  { id: 7, name: 'Mariana "Ace" Santos', position: 'Ponteiro', imageUrl: 'https://picsum.photos/seed/player7/400/400', gender: 'F' },
  { id: 8, name: 'Júlia "Storm" Oliveira', position: 'Levantadora', imageUrl: 'https://picsum.photos/seed/player8/400/400', gender: 'F' },
  { id: 9, name: 'Carolina "Shield" Costa', position: 'Líbero', imageUrl: 'https://picsum.photos/seed/player9/400/400', gender: 'F' },
  { id: 10, name: 'Ana "Thunder" Silva', position: 'Central', imageUrl: 'https://picsum.photos/seed/player10/400/400', gender: 'F' },
  { id: 11, name: 'Beatriz "Phoenix" Alves', position: 'Oposto', imageUrl: 'https://picsum.photos/seed/player11/400/400', gender: 'F' },
  { id: 12, name: 'Camila "Warrior" Lima', position: 'Ponteiro', imageUrl: 'https://picsum.photos/seed/player12/400/400', gender: 'F' },
];

export const GAMES: Game[] = [
  { id: 1, opponent: 'Tigres do Vôlei', date: '25 DEZ 2024', time: '20:00', location: 'Ginásio Abel Schulz', isUpcoming: true },
  { id: 2, opponent: 'Corujas Voleibol', date: '15 DEZ 2024', time: '19:00', location: 'Ivan Rodrigues', isUpcoming: false, score: '3-1', result: 'W' },
  { id: 3, opponent: 'Joinville Vôlei Club', date: '01 DEZ 2024', time: '20:30', location: 'Ginásio da Univille', isUpcoming: false, score: '2-3', result: 'L' },
  { id: 4, opponent: 'Amigos do Vôlei Jlle', date: '18 NOV 2024', time: '19:00', location: 'Ginásio Abel Schulz', isUpcoming: false, score: '3-0', result: 'W' },
  { id: 5, opponent: 'Vôlei Master SC', date: '05 NOV 2024', time: '21:00', location: 'Ivan Rodrigues', isUpcoming: false, score: '3-2', result: 'W' },
];

export const SPONSORS: Sponsor[] = [
  { id: 1, name: 'Patrocinador 1', logoUrl: './patrocinios/Captura de tela 2025-10-25 124806.png', websiteUrl: '#', tier: 'gold' },
  { id: 2, name: 'Patrocinador 2', logoUrl: './patrocinios/Captura de tela 2025-10-25 124809.png', websiteUrl: '#', tier: 'gold' },
  { id: 3, name: 'Patrocinador 3', logoUrl: './patrocinios/Captura de tela 2025-10-25 124812.png', websiteUrl: '#', tier: 'silver' },
  { id: 4, name: 'Patrocinador 4', logoUrl: './patrocinios/Captura de tela 2025-10-25 124815.png', websiteUrl: '#', tier: 'silver' },
  { id: 5, name: 'Patrocinador 5', logoUrl: './patrocinios/Captura de tela 2025-10-25 124818.png', websiteUrl: '#', tier: 'bronze' },
  { id: 6, name: 'Patrocinador 6', logoUrl: './patrocinios/Captura de tela 2025-10-25 124822.png', websiteUrl: '#', tier: 'bronze' },
  { id: 7, name: 'Patrocinador 7', logoUrl: './patrocinios/Captura de tela 2025-10-25 124903.png', websiteUrl: '#', tier: 'bronze' },
  { id: 8, name: 'Patrocinador 8', logoUrl: './patrocinios/Captura de tela 2025-10-25 124908.png', websiteUrl: '#', tier: 'bronze' },
];

export const INSTAGRAM_POSTS: InstagramPost[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  imageUrl: `https://picsum.photos/seed/insta${i + 1}/500/500`,
  postUrl: '#',
}));

// --- SVG Icons ---

export const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

export const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

export const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

export const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);
