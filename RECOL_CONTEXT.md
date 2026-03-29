# RECOL — Project Context

> Last updated: Step 2 — All 5 screens built with hardcoded colors

---

## Current Project State

**Step completed:** 2 of 7 — All 5 screens (hardcoded colors)
**Next step:** 3 — Wire game logic, Zustand state, and scoring formula

---

## What Was Just Built

### Screen 1 — HomeScreen (`#000000`)
- "recol" title (52px, weight 900) + trophy icon (right)
- Two-line subtitle in #999999
- Three mode buttons: Solo → starts game, Multi → sets mode only (step 4), Daily → starts game
- Daily button has a rainbow gradient ring border via `LinearGradient` (2px padding trick)
- Easy/Hard toggle switch wired to `useGameStore().setDifficulty`
- Tapping Solo or Daily calls `setMode()` then navigates to Memorize

### Screen 2 — MemorizeScreen (`#0d1f0d`)
- Hardcoded color: `hsl(210, 70%, 50%)` in a rounded card (borderRadius 24)
- "1/5" progress indicator top-left
- Countdown: `difficulty === 'easy'` → 500s, `'hard'` → 3s
- `useEffect` with `setTimeout` tick; navigates to Go at 0

### Screen 3 — GoScreen (`#0d1f0d`)
- "go" in 80px weight-900 white, top-right aligned
- `useEffect` navigates to Recreate after 500ms

### Screen 4 — RecreateScreen (`#0d1f0d`)
- Left: three vertical sliders (H/S/L), each a `VerticalSlider` component
  - PanResponder tracks `dy` from `startYRef` set on `onPanResponderGrant`
  - `handleYRef` keeps position in sync without stale closure
  - `LinearGradient` track (14px wide strip, 240px tall) centered in 44px touch target
  - White circle handle (24px) positioned at `top: handleY`
  - Guard in `useEffect` (threshold 0.5px) prevents feedback loop when value echoes back
- Hue gradient: 7-stop rainbow, top=0° bottom=360°
- Sat gradient: dynamic, `hsl(h, 0%, l%)` → `hsl(h, 100%, l%)`
- Light gradient: black → `hsl(h, s%, 50%)` → white
- Right: full-height color preview rectangle using `backgroundColor: hsl(h, s%, l%)`
- "1/5" top-right; submit button (56px circle, white, `target` icon) bottom-right
- Submit navigates to Results (step 3: will record guess + advance round)

### Screen 5 — ResultsScreen (`#000000`)
- "results" title + total score (e.g. `411 / 500`)
- 5 pairs of color swatches side by side (target | guess), width 44 each
- Per-pair score below each swatch
- "target / guess" legend labels
- Share button (outlined), Play again button (white fill → navigates Home)
- All data hardcoded — step 3 replaces with Zustand `rounds` array

---

## Key Decisions Made

### Architecture
- **Monorepo:** npm workspaces — `@recol/mobile` and `@recol/server`
- **Navigation:** `@react-navigation/native` v7 with `createNativeStackNavigator`, `animation: 'fade'`
- **State:** Zustand v5, single `useGameStore`
- **Reanimated:** imported at top of `App.tsx` before any other imports; plugin last in babel

### Tech stack locked in
| Layer | Library | Version |
|---|---|---|
| Mobile framework | Expo SDK | ~52.0.46 |
| React Native | react-native | 0.76.7 |
| Navigation | @react-navigation/native + native-stack | ^7.x |
| State | zustand | ^5.0.2 |
| Animations | react-native-reanimated | ~3.16.2 |
| Gradients | expo-linear-gradient | ~13.0.2 |
| Real-time | socket.io-client | ^4.8.1 |
| Storage | @react-native-async-storage/async-storage | 2.1.0 |
| Backend | express + socket.io | ^4.x |

### Colors
- Home / Results background: `#000000`
- Memorize / Go / Recreate background: `#0d1f0d`
- Primary text: `#FFFFFF`

### HSL slider design
- Track: 14px wide gradient strip, 240px tall, borderRadius 7
- Touch target: 44px wide × 264px tall (TRACK_H + HANDLE_D)
- Handle: 24px white circle, positioned via `top: handleY` (0 = top of gradient, TRACK_H = bottom)
- `PanResponder.create()` called once on mount; stale-closure avoided with refs
- Gradient colors passed as `string[]`, cast to `any` at LinearGradient prop to satisfy tuple type

### Types defined (src/types/index.ts)
- `HSLColor { h: 0–360, s: 0–100, l: 0–100 }`
- `ColorRound { target, guess, score }`
- `GameMode: 'solo' | 'multiplayer' | 'daily'`
- `Difficulty: 'easy' | 'hard'`
- `GamePhase: 'idle' | 'memorize' | 'go' | 'recreate' | 'results'`

### Zustand store actions (defined in step 1)
`setMode`, `setDifficulty`, `setPhase`, `setRounds`, `setCurrentRound`, `recordGuess`, `setRoomCode`, `setSocketId`, `reset`

### Server
- Express + Socket.io, port from `process.env.PORT ?? 3000`
- `/health` endpoint for Railway healthcheck

---

## Step 3 — Game Logic Wiring Plan

Replace all hardcoded data with live Zustand state:

1. **HomeScreen** — on Solo/Daily press, call `reset()` then `setRounds(generateColors())` then navigate
2. **generateColors()** — utility: create 5 random `HSLColor` values, wrap in `ColorRound[]` with `guess: null, score: null`
3. **MemorizeScreen** — read `rounds[currentRound].target`, convert to `hsl()` string for card background
4. **RecreateScreen** — on submit: compute score via formula, call `recordGuess(guess, score)`, then:
   - if `currentRound < 4`: `setCurrentRound(currentRound + 1)`, navigate to Memorize
   - else: `setPhase('results')`, navigate to Results
5. **ResultsScreen** — read `rounds` array from store, compute total score live

### Scoring formula
```
score = clamp(100 - (deltaH/3.6 + deltaS + deltaL) / 3, 0, 100)
```

---

## Socket Events (step 4)
`create_room`, `join_room`, `room_joined`, `start_game`, `game_started`, `submit_guess`, `all_done`, `show_results`

---

## Known Issues / Notes
- `expo-linear-gradient` added to package.json (`~13.0.2`). Run `npx expo install expo-linear-gradient` from `apps/mobile` to install with correct pinned version.
- `babel-plugin-module-resolver` needed for `@/` path alias (`npm i -D babel-plugin-module-resolver` in apps/mobile)
- Run `npm install` from monorepo root after any package.json changes

---

## Build Order Checklist
- [x] Step 1 — Scaffold monorepo
- [x] Step 2 — All 5 screens (hardcoded colors)
- [ ] Step 3 — Game logic, Zustand wiring, scoring
- [ ] Step 4 — Socket.io backend + multiplayer
- [ ] Step 5 — Daily mode (seeded RNG + AsyncStorage)
- [ ] Step 6 — Difficulty toggle (Easy/Hard)
- [ ] Step 7 — Final polish (animations, transitions, sharing)
