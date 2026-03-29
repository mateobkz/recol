import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { getSocket, disconnectSocket, setupGameListeners } from '../utils/socket';

type Props = NativeStackScreenProps<RootStackParamList, 'Multiplayer'>;

type View = 'idle' | 'joining' | 'waiting';

export default function MultiplayerScreen({ navigation }: Props) {
  const [view, setView] = useState<View>('idle');
  const [codeInput, setCodeInput] = useState('');
  const [playerIds, setPlayerIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState(false);

  const { setRoomCode, setSocketId, setIsHost, setRoomPlayers, isHost, roomCode } =
    useGameStore();

  useEffect(() => {
    const socket = getSocket();

    if (!socket.connected) {
      setConnecting(true);
      socket.connect();
    }

    socket.on('connect', () => {
      setConnecting(false);
      setSocketId(socket.id ?? '');
    });

    socket.on('room_joined', (data: { roomCode: string; isHost: boolean; playerIds: string[] }) => {
      setRoomCode(data.roomCode);
      setIsHost(data.isHost);
      setRoomPlayers(data.playerIds);
      setPlayerIds(data.playerIds);
      setError('');
      setView('waiting');
    });

    socket.on('player_joined', (data: { playerIds: string[] }) => {
      setPlayerIds(data.playerIds);
      setRoomPlayers(data.playerIds);
    });

    socket.on('room_error', (data: { message: string }) => {
      setError(data.message);
      setConnecting(false);
    });

    // Register persistent game-phase listeners (game_started, show_results)
    setupGameListeners();

    return () => {
      socket.off('connect');
      socket.off('room_joined');
      socket.off('player_joined');
      socket.off('room_error');
      // game_started and show_results are intentionally kept alive
    };
  }, [setRoomCode, setSocketId, setIsHost, setRoomPlayers]);

  function handleCreate() {
    setError('');
    getSocket().emit('create_room');
  }

  function handleJoinSubmit() {
    const code = codeInput.trim().toUpperCase();
    if (code.length !== 4) {
      setError('Enter a 4-character room code');
      return;
    }
    setError('');
    getSocket().emit('join_room', { code });
  }

  function handleStartGame() {
    if (roomCode) {
      getSocket().emit('start_game', { roomCode });
    }
  }

  function handleLeave() {
    disconnectSocket();
    useGameStore.getState().reset();
    navigation.goBack();
  }

  // ── Idle ────────────────────────────────────────────────────────────────────
  if (view === 'idle') {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.inner}>
          <View style={s.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={s.title}>multiplayer</Text>
          <Text style={s.sub}>Play with friends. Share a room code.</Text>

          {connecting && (
            <View style={s.connectingRow}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={s.connectingText}>Connecting...</Text>
            </View>
          )}

          {!!error && <Text style={s.error}>{error}</Text>}

          <View style={s.buttons}>
            <TouchableOpacity style={s.primaryBtn} onPress={handleCreate} disabled={connecting}>
              <Text style={s.primaryBtnLbl}>Create Room</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.secondaryBtn}
              onPress={() => { setError(''); setView('joining'); }}
              disabled={connecting}
            >
              <Text style={s.secondaryBtnLbl}>Join Room</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Joining ─────────────────────────────────────────────────────────────────
  if (view === 'joining') {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.inner}>
          <View style={s.header}>
            <TouchableOpacity onPress={() => { setView('idle'); setError(''); setCodeInput(''); }} hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={s.title}>join a room</Text>
          <Text style={s.sub}>Enter the 4-character code from your friend.</Text>

          <TextInput
            style={s.codeInput}
            value={codeInput}
            onChangeText={(t) => setCodeInput(t.toUpperCase().slice(0, 4))}
            placeholder="XXXX"
            placeholderTextColor="#444444"
            maxLength={4}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
          />

          {!!error && <Text style={s.error}>{error}</Text>}

          <TouchableOpacity
            style={[s.primaryBtn, codeInput.length !== 4 && s.btnDisabled]}
            onPress={handleJoinSubmit}
            disabled={codeInput.length !== 4}
          >
            <Text style={s.primaryBtnLbl}>Join</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Waiting ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.container}>
      <View style={s.inner}>
        <View style={s.header}>
          <TouchableOpacity onPress={handleLeave} hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}>
            <Text style={s.leaveLink}>Leave</Text>
          </TouchableOpacity>
        </View>

        <View style={s.waitingCenter}>
          <Text style={s.codeLabel}>room code</Text>
          <Text style={s.roomCode}>{roomCode}</Text>
          <Text style={s.playerCount}>
            {playerIds.length} {playerIds.length === 1 ? 'player' : 'players'} in room
          </Text>

          {isHost ? (
            <TouchableOpacity
              style={[s.primaryBtn, s.startBtn, playerIds.length < 2 && s.btnDisabled]}
              onPress={handleStartGame}
              disabled={playerIds.length < 2}
            >
              <Text style={s.primaryBtnLbl}>Start Game</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.waitingRow}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={s.waitingText}>Waiting for host to start...</Text>
            </View>
          )}

          {isHost && playerIds.length < 2 && (
            <Text style={s.hint}>Waiting for at least one other player to join.</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  inner: { flex: 1, paddingHorizontal: 28, paddingTop: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 8,
  },
  sub: {
    color: '#999999',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 40,
  },
  connectingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  connectingText: {
    color: '#666666',
    fontSize: 14,
  },
  error: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: 16,
  },
  buttons: { gap: 12 },
  primaryBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  primaryBtnLbl: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  secondaryBtnLbl: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  codeInput: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 12,
    textAlign: 'center',
    marginVertical: 32,
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
    paddingBottom: 8,
  },
  waitingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  codeLabel: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  roomCode: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: 12,
  },
  playerCount: {
    color: '#999999',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  startBtn: {
    paddingHorizontal: 48,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  waitingText: {
    color: '#999999',
    fontSize: 15,
  },
  hint: {
    color: '#555555',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  leaveLink: {
    color: '#666666',
    fontSize: 15,
  },
});
