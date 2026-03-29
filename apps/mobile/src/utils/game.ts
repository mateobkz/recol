import type { HSLColor, ColorRound } from '../types';

/**
 * Generate 5 random HSL colors for a game session.
 * Saturation 35–90, lightness 30–70 — avoids near-gray and near-white/black extremes.
 */
export function generateColors(): ColorRound[] {
  return Array.from({ length: 5 }, () => ({
    target: {
      h: Math.round(Math.random() * 359),
      s: Math.round(35 + Math.random() * 55),
      l: Math.round(30 + Math.random() * 40),
    },
    guess: null,
    score: null,
  }));
}

/**
 * Score a guess against the target.
 * deltaH accounts for hue wrap-around (e.g. 350° and 10° are 20° apart, not 340°).
 * Formula: clamp(100 - (deltaH/3.6 + deltaS + deltaL) / 3, 0, 100)
 */
export function scoreGuess(target: HSLColor, guess: HSLColor): number {
  const rawDeltaH = Math.abs(target.h - guess.h);
  const deltaH = Math.min(rawDeltaH, 360 - rawDeltaH);
  const deltaS = Math.abs(target.s - guess.s);
  const deltaL = Math.abs(target.l - guess.l);
  const raw = 100 - (deltaH / 3.6 + deltaS + deltaL) / 3;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

/** Convert HSLColor to a CSS hsl() string. */
export function toHslString(c: HSLColor): string {
  return `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
}
