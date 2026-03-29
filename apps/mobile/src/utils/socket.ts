import { io, Socket } from 'socket.io-client';
import type { HSLColor, ColorRound, MultiLeaderboardEntry } from '../types';
import { useGameStore } from '../store/gameStore';
import { navigationRef } from '../navigation/navigationRef';

// Local dev:  http://localhost:3000  (iOS Simulator)
//             http://10.0.2.2:3000   (Android Emulator)
// Production: set EXPO_PUBLIC_SERVER_URL in .env
const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL ?? 'http://localhost:3000';

let _socket: Socket | null = null;

export function getSocket(): Socket {
  if (!_socket) {
    _socket = io(SERVER_URL, {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return _socket;
}

export function disconnectSocket(): void {
  _socket?.removeAllListeners();
  _socket?.disconnect();
  _socket = null;
}

/**
 * Register persistent game-phase listeners.
 * Called once when the player enters the multiplayer waiting room.
 * These listeners are NOT tied to any React component — they survive screen transitions.
 */
export function setupGameListeners(): void {
  const socket = getSocket();

  // Remove previous registrations to prevent duplicates on re-entry
  socket.off('game_started');
  socket.off('show_results');

  socket.on('game_started', (data: { colors: HSLColor[] }) => {
    const store = useGameStore.getState();
    const rounds: ColorRound[] = data.colors.map((c) => ({
      target: c,
      guess: null,
      score: null,
    }));
    store.setRounds(rounds);
    store.setCurrentRound(0);
    store.setPhase('memorize');
    if (navigationRef.isReady()) {
      navigationRef.navigate('Memorize');
    }
  });

  socket.on('show_results', (data: { leaderboard: MultiLeaderboardEntry[] }) => {
    useGameStore.getState().setMultiLeaderboard(data.leaderboard);
  });
}
