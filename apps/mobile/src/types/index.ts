export type GameMode = 'solo' | 'multiplayer' | 'daily';
export type Difficulty = 'easy' | 'hard';
export type GamePhase = 'idle' | 'memorize' | 'go' | 'recreate' | 'results';

export interface HSLColor {
  h: number; // 0–360
  s: number; // 0–100
  l: number; // 0–100
}

export interface ColorRound {
  target: HSLColor;
  guess: HSLColor | null;
  score: number | null;
}

export interface Player {
  id: string;
  name: string;
  totalScore: number;
  rounds: ColorRound[];
}

export interface Room {
  code: string;
  players: Player[];
  colors: HSLColor[];
  state: 'waiting' | 'playing' | 'finished';
}
