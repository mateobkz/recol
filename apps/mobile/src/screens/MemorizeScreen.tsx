import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useGameStore } from '../store/gameStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Memorize'>;

// Hardcoded for step 2 — replaced with Zustand rounds in step 3
const HARDCODED_COLOR = 'hsl(210, 70%, 50%)';
const HARDCODED_ROUND = 1;
const TOTAL_ROUNDS = 5;

export default function MemorizeScreen({ navigation }: Props) {
  const difficulty = useGameStore((s) => s.difficulty);
  const initialSeconds = difficulty === 'easy' ? 500 : 3;
  const [seconds, setSeconds] = useState(initialSeconds);

  // Reset timer when difficulty changes
  useEffect(() => {
    setSeconds(difficulty === 'easy' ? 500 : 3);
  }, [difficulty]);

  // Countdown
  useEffect(() => {
    if (seconds <= 0) {
      navigation.navigate('Go');
      return;
    }
    const id = setTimeout(() => setSeconds((prev) => prev - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds, navigation]);

  return (
    <View style={s.screen}>
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <Text style={s.progress}>
          {HARDCODED_ROUND}/{TOTAL_ROUNDS}
        </Text>

        <View style={s.card}>
          <View style={[s.colorFill, { backgroundColor: HARDCODED_COLOR }]} />
        </View>

        <View style={s.timerBlock}>
          <Text style={s.timerNumber}>{seconds}</Text>
          <Text style={s.timerLabel}>Seconds to remember</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d1f0d' },
  safe: { flex: 1 },
  progress: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  card: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  colorFill: { flex: 1 },
  timerBlock: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  timerNumber: {
    color: '#FFFFFF',
    fontSize: 80,
    fontWeight: '900',
    lineHeight: 88,
  },
  timerLabel: {
    color: '#FFFFFF99',
    fontSize: 14,
    marginTop: 4,
  },
});
