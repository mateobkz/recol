import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

// Hardcoded for step 2 — replaced with Zustand rounds in step 3
const HARDCODED_RESULTS = [
  { target: { h: 210, s: 70, l: 50 }, guess: { h: 220, s: 65, l: 52 }, score: 87 },
  { target: { h: 30,  s: 80, l: 55 }, guess: { h: 45,  s: 75, l: 50 }, score: 72 },
  { target: { h: 120, s: 60, l: 40 }, guess: { h: 115, s: 65, l: 38 }, score: 91 },
  { target: { h: 0,   s: 90, l: 45 }, guess: { h: 10,  s: 85, l: 40 }, score: 78 },
  { target: { h: 270, s: 75, l: 55 }, guess: { h: 260, s: 70, l: 58 }, score: 83 },
] as const;

const TOTAL = HARDCODED_RESULTS.reduce((sum, r) => sum + r.score, 0);

function hslStr(h: number, s: number, l: number) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export default function ResultsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>results</Text>

        {/* Total score */}
        <View style={s.scoreBlock}>
          <Text style={s.totalScore}>{TOTAL}</Text>
          <Text style={s.totalDenom}> / 500</Text>
        </View>

        {/* Color pairs */}
        <View style={s.pairsRow}>
          {HARDCODED_RESULTS.map((r, i) => (
            <View key={i} style={s.pair}>
              <View style={s.swatchPair}>
                <View
                  style={[
                    s.swatch,
                    s.swatchLeft,
                    { backgroundColor: hslStr(r.target.h, r.target.s, r.target.l) },
                  ]}
                />
                <View
                  style={[
                    s.swatch,
                    s.swatchRight,
                    { backgroundColor: hslStr(r.guess.h, r.guess.s, r.guess.l) },
                  ]}
                />
              </View>
              <Text style={s.pairScore}>{r.score}</Text>
            </View>
          ))}
        </View>

        {/* Labels */}
        <View style={s.legendRow}>
          <Text style={s.legend}>target</Text>
          <Text style={s.legend}>guess</Text>
        </View>

        {/* Buttons */}
        <View style={s.buttons}>
          <TouchableOpacity style={s.shareBtn}>
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            <Text style={s.shareLbl}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.playAgainBtn}
            onPress={() => navigation.navigate('Home')}
          >
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
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 48,
  },
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
  totalDenom: {
    color: '#666666',
    fontSize: 28,
    fontWeight: '600',
  },
  pairsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pair: {
    alignItems: 'center',
    gap: 8,
  },
  swatchPair: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
  },
  swatch: {
    width: SWATCH_W,
    height: SWATCH_H,
  },
  swatchLeft: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  swatchRight: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  pairScore: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 40,
  },
  legend: {
    color: '#555555',
    fontSize: 11,
    letterSpacing: 0.5,
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
  shareLbl: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  playAgainBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  playAgainLbl: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
