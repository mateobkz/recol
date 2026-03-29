import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { HSLColor } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Recreate'>;

const TRACK_H = 240;
const HANDLE_D = 24;
const TRACK_W = 44;

// Gradient values run top (low) → bottom (high)
const HUE_COLORS: [string, string, ...string[]] = [
  'hsl(0,100%,50%)',
  'hsl(60,100%,50%)',
  'hsl(120,100%,50%)',
  'hsl(180,100%,50%)',
  'hsl(240,100%,50%)',
  'hsl(300,100%,50%)',
  'hsl(360,100%,50%)',
];

const HARDCODED_ROUND = 1;
const TOTAL_ROUNDS = 5;

// ─────────────────────────────────────────────────────────────────────────────

interface SliderProps {
  value: number;
  max: number;
  onChange: (v: number) => void;
  gradientColors: string[];
  label: string;
}

function VerticalSlider({ value, max, onChange, gradientColors, label }: SliderProps) {
  const handleYRef = useRef((value / max) * TRACK_H);
  const startYRef = useRef(0);
  const [handleY, setHandleY] = useState(handleYRef.current);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startYRef.current = handleYRef.current;
      },
      onPanResponderMove: (_, g) => {
        const y = Math.max(0, Math.min(TRACK_H, startYRef.current + g.dy));
        handleYRef.current = y;
        setHandleY(y);
        onChange(Math.round((y / TRACK_H) * max));
      },
    })
  ).current;

  // Sync handle when value is updated externally (e.g., reset)
  useEffect(() => {
    const y = (value / max) * TRACK_H;
    if (Math.abs(y - handleYRef.current) > 0.5) {
      handleYRef.current = y;
      setHandleY(y);
    }
  }, [value, max]);

  return (
    <View style={sl.col}>
      <View style={sl.trackOuter} {...panResponder.panHandlers}>
        <LinearGradient
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={sl.gradient}
        />
        <View style={[sl.handle, { top: handleY }]} />
      </View>
      <Text style={sl.label}>{label}</Text>
    </View>
  );
}

const sl = StyleSheet.create({
  col: { alignItems: 'center', gap: 8 },
  trackOuter: {
    width: TRACK_W,
    height: TRACK_H + HANDLE_D,
  },
  gradient: {
    position: 'absolute',
    top: HANDLE_D / 2,
    left: (TRACK_W - 14) / 2,
    width: 14,
    height: TRACK_H,
    borderRadius: 7,
  },
  handle: {
    position: 'absolute',
    left: (TRACK_W - HANDLE_D) / 2,
    width: HANDLE_D,
    height: HANDLE_D,
    borderRadius: HANDLE_D / 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    color: '#FFFFFF99',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

// ─────────────────────────────────────────────────────────────────────────────

export default function RecreateScreen({ navigation }: Props) {
  // Hardcoded initial guess — wired to game state in step 3
  const [hsl, setHsl] = useState<HSLColor>({ h: 180, s: 50, l: 50 });

  const previewColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  const satColors = [
    `hsl(${hsl.h}, 0%, ${hsl.l}%)`,
    `hsl(${hsl.h}, 100%, ${hsl.l}%)`,
  ];
  const lightColors = [
    'hsl(0, 0%, 0%)',
    `hsl(${hsl.h}, ${hsl.s}%, 50%)`,
    'hsl(0, 0%, 100%)',
  ];

  function handleSubmit() {
    // In step 3: record guess, advance round or go to results
    navigation.navigate('Results');
  }

  return (
    <View style={s.screen}>
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* Top bar */}
        <View style={s.topBar}>
          <View />
          <Text style={s.progress}>{HARDCODED_ROUND}/{TOTAL_ROUNDS}</Text>
        </View>

        {/* Content */}
        <View style={s.content}>

          {/* Left: three vertical sliders */}
          <View style={s.slidersPanel}>
            <VerticalSlider
              value={hsl.h}
              max={360}
              onChange={(h) => setHsl((prev) => ({ ...prev, h }))}
              gradientColors={HUE_COLORS}
              label="H"
            />
            <VerticalSlider
              value={hsl.s}
              max={100}
              onChange={(sat) => setHsl((prev) => ({ ...prev, s: sat }))}
              gradientColors={satColors}
              label="S"
            />
            <VerticalSlider
              value={hsl.l}
              max={100}
              onChange={(l) => setHsl((prev) => ({ ...prev, l }))}
              gradientColors={lightColors}
              label="L"
            />
          </View>

          {/* Right: color preview */}
          <View style={s.previewPanel}>
            <View style={[s.previewColor, { backgroundColor: previewColor }]} />
          </View>

        </View>

        {/* Bottom bar: submit */}
        <View style={s.bottomBar}>
          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit}>
            <MaterialCommunityIcons name="target" size={28} color="#0d1f0d" />
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d1f0d' },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  progress: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    alignItems: 'center',
  },
  slidersPanel: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  previewPanel: {
    flex: 1,
    height: TRACK_H + HANDLE_D,
    borderRadius: 20,
    overflow: 'hidden',
  },
  previewColor: { flex: 1 },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'flex-end',
  },
  submitBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
