import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const RAINBOW: [string, string, ...string[]] = [
  '#FF0000', '#FF7700', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF', '#FF0000',
];

export default function HomeScreen({ navigation }: Props) {
  const { mode, setMode, difficulty, setDifficulty } = useGameStore();

  function startGame(selectedMode: typeof mode) {
    setMode(selectedMode);
    navigation.navigate('Memorize');
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.inner}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>recol</Text>
          <TouchableOpacity hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}>
            <Ionicons name="trophy-outline" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        <Text style={s.sub}>
          Humans can't reliably recall colors. This is a simple game to see how good (or bad) you are at it.
        </Text>
        <Text style={[s.sub, s.subGap]}>
          We'll show you five colors, then you'll try and recreate them.
        </Text>

        {/* Mode buttons */}
        <View style={s.modeRow}>
          <TouchableOpacity
            style={[s.modeBtn, mode === 'solo' && s.modeBtnActive]}
            onPress={() => startGame('solo')}
          >
            <Ionicons name="person" size={22} color="#FFFFFF" />
            <Text style={s.modeLbl}>Solo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.modeBtn, mode === 'multiplayer' && s.modeBtnActive]}
            onPress={() => setMode('multiplayer')}
          >
            <Ionicons name="people" size={22} color="#FFFFFF" />
            <Text style={s.modeLbl}>Multi</Text>
          </TouchableOpacity>

          {/* Daily — rainbow ring border */}
          <TouchableOpacity style={s.dailyWrapper} onPress={() => startGame('daily')}>
            <LinearGradient
              colors={RAINBOW}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.dailyRing}
            >
              <View style={[s.dailyInner, mode === 'daily' && s.modeBtnActive]}>
                <Ionicons name="calendar" size={22} color="#FFFFFF" />
                <Text style={s.modeLbl}>Daily</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Difficulty toggle */}
        <View style={s.diffRow}>
          <Text style={s.diffLbl}>Easy</Text>
          <Switch
            value={difficulty === 'easy'}
            onValueChange={(v) => setDifficulty(v ? 'easy' : 'hard')}
            trackColor={{ false: '#333333', true: '#5a7a5a' }}
            thumbColor="#FFFFFF"
          />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -1,
  },
  sub: {
    color: '#999999',
    fontSize: 15,
    lineHeight: 22,
  },
  subGap: { marginTop: 8 },
  modeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 40,
  },
  modeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#111111',
    gap: 8,
  },
  modeBtnActive: {
    backgroundColor: '#1a2a1a',
  },
  modeLbl: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  dailyWrapper: { flex: 1 },
  dailyRing: {
    flex: 1,
    borderRadius: 16,
    padding: 2,
  },
  dailyInner: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: '#111111',
    gap: 8,
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 28,
  },
  diffLbl: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
