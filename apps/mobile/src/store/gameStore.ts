import { create } from 'zustand';
import type {
  GameMode,
  Difficulty,
  GamePhase,
  HSLColor,
  ColorRound,
  MultiLeaderboardEntry,
} from '../types';

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
  isHost: boolean;
  roomPlayers: string[];
  multiLeaderboard: MultiLeaderboardEntry[];

  // Actions
  setMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setPhase: (phase: GamePhase) => void;
  setRounds: (rounds: ColorRound[]) => void;
  setCurrentRound: (index: number) => void;
  recordGuess: (guess: HSLColor, score: number) => void;
  setRoomCode: (code: string | null) => void;
  setSocketId: (id: string | null) => void;
  setIsHost: (isHost: boolean) => void;
  setRoomPlayers: (players: string[]) => void;
  setMultiLeaderboard: (lb: MultiLeaderboardEntry[]) => void;
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
  isHost: false,
  roomPlayers: [] as string[],
  multiLeaderboard: [] as MultiLeaderboardEntry[],
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
  setIsHost: (isHost) => set({ isHost }),
  setRoomPlayers: (roomPlayers) => set({ roomPlayers }),
  setMultiLeaderboard: (multiLeaderboard) => set({ multiLeaderboard }),
  reset: () => set(initialState),
}));
