# RECOL — Project Context

> Last updated: Step 3 — Game logic, Zustand wiring, scoring

---

## Current Project State

**Step completed:** 3 of 7 — Game logic, state wiring, scoring formula
**Next step:** 4 — Socket.io backend + multiplayer flow

---

## What Was Just Built

### `src/utils/game.ts` (new file)
- `generateColors(): ColorRound[]` — 5 random HSL colors, s: 35–90, l: 30–70 (avoids extremes)
- `scoreGuess(target, guess): number` — scoring formula with hue wrap-around
- `toHslString(c): string` — shared CSS hsl() string helper

### Scoring formula
```
deltaH = min(|h1 - h2|, 360 - |h1 - h2|)   ← handles wrap-around
score = clamp(100 - (deltaH/3.6 + deltaS + deltaL) / 3, 0, 100)
```

### HomeScreen
- `startGame()` now calls `reset()` → `setRounds(generateColors())` → `setPhase('memorize')` → navigate
- Store is fully cleared before each new game

### MemorizeScreen
- Reads `rounds[currentRound].target` from store → `toHslString()` for card background
- Progress shows live `currentRound + 1 / 5`
- Uses `navigation.replace('Go')` instead of push — keeps stack at depth 2 throughout game

### GoScreen
- Uses `navigation.replace('Recreate')` — same stack discipline

### RecreateScreen
- Reads `currentRound` from store for progress indicator
- On submit:
  1. `scoreGuess(round.target, hsl)` → score
  2. `recordGuess(hsl, score)` → stored in Zustand
  3. `currentRound < 4` → `setCurrentRound(+1)` + `navigation.replace('Memorize')`
  4. `currentRound === 4` → `setPhase('results')` + `navigation.replace('Results')`
- Each mount via `replace` is a fresh instance → slider state always starts at `{ h: 180, s: 50, l: 50 }`

### ResultsScreen
- Reads live `rounds` from store
- `total = rounds.reduce((sum, r) => sum + (r.score ?? 0), 0)`
- Displays real target vs guess swatches from store
- "Play again": `reset()` + `navigation.popToTop()` (returns to Home, clears store)
- Guard: shows fallback if `rounds.length === 0` (direct navigation edge case)

---

## Navigation stack discipline
All game-internal transitions use `replace` so the stack never grows past depth 2:
```
[Home]                         ← initial
[Home, Memorize]               ← after Solo/Daily press
[Home, Go]                     ← Memorize replace
[Home, Recreate]               ← Go replace
[Home, Memorize]               ← Recreate replace (next round)
...
[Home, Results]                ← final replace
[Home]                         ← popToTop on Play Again
```

---

## Architecture

### Monorepo
- npm workspaces — `@recol/mobile` and `@recol/server`

### Tech stack
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

### Types (src/types/index.ts)
- `HSLColor { h: 0–360, s: 0–100, l: 0–100 }`
- `ColorRound { target: HSLColor, guess: HSLColor | null, score: number | null }`
- `GameMode: 'solo' | 'multiplayer' | 'daily'`
- `Difficulty: 'easy' | 'hard'`
- `GamePhase: 'idle' | 'memorize' | 'go' | 'recreate' | 'results'`

### Zustand store actions
`setMode`, `setDifficulty`, `setPhase`, `setRounds`, `setCurrentRound`, `recordGuess`, `setRoomCode`, `setSocketId`, `reset`

### Server
- Express + Socket.io, port from `process.env.PORT ?? 3000`
- `/health` endpoint for Railway healthcheck

---

## Step 4 — Multiplayer Plan

### Flow
1. Multiplayer button → show "Create" / "Join" UI (modal or inline)
2. Create room → `socket.emit('create_room')` → server responds `room_joined` with 4-char code
3. Join room → `socket.emit('join_room', { code })` → server responds `room_joined`
4. Host starts game → `socket.emit('start_game', { roomCode })` → server generates 5 colors, emits `game_started` with colors to all players
5. Each player plays solo loop; on RecreateScreen submit also `socket.emit('submit_guess', { roomCode, roundIndex, score })`
6. When all players finish all 5 rounds → server emits `all_done` + `show_results` with leaderboard
7. ResultsScreen shows leaderboard for multiplayer mode

### Socket events
`create_room`, `join_room`, `room_joined`, `start_game`, `game_started`, `submit_guess`, `all_done`, `show_results`

### Server changes needed
- Room management (Map of roomCode → Room)
- Color generation on server (same `generateColors()` logic)
- Track per-player scores
- Detect when all players have submitted all 5 rounds

---

## Known Issues / Notes
- `expo-linear-gradient ~13.0.2` — run `npx expo install expo-linear-gradient` from `apps/mobile`
- `babel-plugin-module-resolver` needed for `@/` path alias (`npm i -D babel-plugin-module-resolver` in apps/mobile)
- Run `npm install` from monorepo root after any package.json changes

---

## Build Order Checklist
- [x] Step 1 — Scaffold monorepo
- [x] Step 2 — All 5 screens (hardcoded colors)
- [x] Step 3 — Game logic, Zustand wiring, scoring
- [ ] Step 4 — Socket.io backend + multiplayer
- [ ] Step 5 — Daily mode (seeded RNG + AsyncStorage)
- [ ] Step 6 — Difficulty toggle (Easy/Hard)
- [ ] Step 7 — Final polish (animations, transitions, sharing)
