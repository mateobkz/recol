import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';
import { toHslString } from '../utils/game';
import { disconnectSocket } from '../utils/socket';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export default function ResultsScreen({ navigation }: Props) {
  const rounds = useGameStore((s) => s.rounds);
  const mode = useGameStore((s) => s.mode);
  const socketId = useGameStore((s) => s.socketId);
  const multiLeaderboard = useGameStore((s) => s.multiLeaderboard);
  const reset = useGameStore((s) => s.reset);

  const total = rounds.reduce((sum, r) => sum + (r.score ?? 0), 0);

  function handlePlayAgain() {
    if (mode === 'multiplayer') disconnectSocket();
    reset();
    navigation.popToTop();
  }

  if (rounds.length === 0) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.empty}>
          <Text style={s.emptyText}>No game data.</Text>
          <TouchableOpacity onPress={() => navigation.popToTop()}>
            <Text style={s.emptyLink}>Go home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>results</Text>

        {/* Total score */}
        <View style={s.scoreBlock}>
          <Text style={s.totalScore}>{total}</Text>
          <Text style={s.totalDenom}> / 500</Text>
        </View>

        {/* Color pairs */}
        <View style={s.pairsRow}>
          {rounds.map((r, i) => {
            const guessColor = r.guess ?? r.target;
            return (
              <View key={i} style={s.pair}>
                <View style={s.swatchPair}>
                  <View style={[s.swatch, s.swatchLeft, { backgroundColor: toHslString(r.target) }]} />
                  <View style={[s.swatch, s.swatchRight, { backgroundColor: toHslString(guessColor) }]} />
                </View>
                <Text style={s.pairScore}>{r.score ?? 0}</Text>
              </View>
            );
          })}
        </View>

        <View style={s.legendRow}>
          <Text style={s.legend}>target</Text>
          <Text style={s.legend}>guess</Text>
        </View>

        {/* Multiplayer leaderboard */}
        {mode === 'multiplayer' && (
          <View style={s.leaderboard}>
            <Text style={s.leaderboardTitle}>leaderboard</Text>

            {multiLeaderboard.length === 0 ? (
              <View style={s.waitingRow}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={s.waitingText}>Waiting for all players...</Text>
              </View>
            ) : (
              multiLeaderboard.map((entry, i) => (
                <View
                  key={entry.id}
                  style={[s.leaderboardRow, entry.id === socketId && s.leaderboardRowSelf]}
                >
                  <Text style={s.leaderboardRank}>#{i + 1}</Text>
                  <Text style={s.leaderboardId}>
                    {entry.id === socketId ? 'you' : entry.id.slice(0, 6)}
                  </Text>
                  <Text style={s.leaderboardScore}>{entry.totalScore}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Buttons */}
        <View style={s.buttons}>
          <TouchableOpacity style={s.shareBtn}>
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            <Text style={s.shareLbl}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.playAgainBtn} onPress={handlePlayAgain}>
            <Text style={s.playAgainLbl}>Play again</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const SWATCH_W = 44;
const SWATCH_H = 72;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scroll: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 48 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 16 },
  emptyLink: { color: '#666666', fontSize: 14 },
  title: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 4,
  },
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 36,
  },
  totalScore: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '900',
    lineHeight: 80,
  },
  totalDenom: { color: '#666666', fontSize: 28, fontWeight: '600' },
  pairsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pair: { alignItems: 'center', gap: 8 },
  swatchPair: { flexDirection: 'row', borderRadius: 10, overflow: 'hidden' },
  swatch: { width: SWATCH_W, height: SWATCH_H },
  swatchLeft: { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
  swatchRight: { borderTopRightRadius: 10, borderBottomRightRadius: 10 },
  pairScore: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 32,
  },
  legend: { color: '#555555', fontSize: 11, letterSpacing: 0.5 },
  leaderboard: {
    marginBottom: 32,
    gap: 2,
  },
  leaderboardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  waitingText: { color: '#666666', fontSize: 14 },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#111111',
    marginBottom: 6,
  },
  leaderboardRowSelf: {
    backgroundColor: '#1a2a1a',
    borderWidth: 1,
    borderColor: '#FFFFFF22',
  },
  leaderboardRank: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '700',
    width: 28,
  },
  leaderboardId: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  leaderboardScore: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  buttons: { gap: 12 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  shareLbl: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  playAgainBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  playAgainLbl: { color: '#000000', fontSize: 16, fontWeight: '700' },
});
