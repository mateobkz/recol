import { create } from 'zustand';
import type { GameMode, Difficulty, GamePhase, HSLColor, ColorRound } from '../types';

interface GameStore {
  // Config
  mode: GameMode;
  difficulty: Difficulty;

  // Runtime state
  phase: GamePhase;
  rounds: ColorRound[];
  currentRound: number;

  // Multiplayer
  roomCode: string | null;
  socketId: string | null;

  // Actions
  setMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setPhase: (phase: GamePhase) => void;
  setRounds: (rounds: ColorRound[]) => void;
  setCurrentRound: (index: number) => void;
  recordGuess: (guess: HSLColor, score: number) => void;
  setRoomCode: (code: string | null) => void;
  setSocketId: (id: string | null) => void;
  reset: () => void;
}

const initialState = {
  mode: 'solo' as GameMode,
  difficulty: 'easy' as Difficulty,
  phase: 'idle' as GamePhase,
  rounds: [] as ColorRound[],
  currentRound: 0,
  roomCode: null,
  socketId: null,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setMode: (mode) => set({ mode }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setPhase: (phase) => set({ phase }),
  setRounds: (rounds) => set({ rounds }),
  setCurrentRound: (currentRound) => set({ currentRound }),

  recordGuess: (guess, score) =>
    set((state) => {
      const rounds = [...state.rounds];
      rounds[state.currentRound] = {
        ...rounds[state.currentRound],
        guess,
        score,
      };
      return { rounds };
    }),

  setRoomCode: (roomCode) => set({ roomCode }),
  setSocketId: (socketId) => set({ socketId }),
  reset: () => set(initialState),
}));
