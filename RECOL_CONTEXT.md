# RECOL — Project Context

> Last updated: Step 1 — Monorepo scaffold complete

---

## Current Project State

**Step completed:** 1 of 7 — Monorepo scaffold
**Next step:** 2 — Build all 5 screens with hardcoded colors (no backend yet)

---

## What Was Just Built

Full monorepo scaffold with all configuration files:

### Repository structure
```
/
├── .gitignore
├── package.json                  ← npm workspaces root
├── RECOL_CONTEXT.md
└── apps/
    ├── mobile/                   ← Expo managed workflow
    │   ├── App.tsx               ← entry point, mounts RootNavigator
    │   ├── app.json              ← Expo config
    │   ├── babel.config.js       ← Reanimated plugin last
    │   ├── metro.config.js       ← monorepo watchFolders config
    │   ├── package.json
    │   ├── tsconfig.json         ← strict, path alias @/*
    │   └── src/
    │       ├── navigation/
    │       │   ├── types.ts      ← RootStackParamList
    │       │   └── RootNavigator.tsx
    │       ├── screens/
    │       │   ├── HomeScreen.tsx      ← placeholder
    │       │   ├── MemorizeScreen.tsx  ← placeholder
    │       │   ├── GoScreen.tsx        ← placeholder
    │       │   ├── RecreateScreen.tsx  ← placeholder
    │       │   └── ResultsScreen.tsx   ← placeholder
    │       ├── store/
    │       │   └── gameStore.ts  ← Zustand store (types + actions defined)
    │       └── types/
    │           └── index.ts      ← HSLColor, ColorRound, GameMode, etc.
    └── server/
        ├── package.json
        ├── tsconfig.json
        ├── railway.json          ← Railway deploy config
        └── src/
            └── index.ts          ← Express + Socket.io skeleton
```

---

## Key Decisions Made

### Architecture
- **Monorepo:** npm workspaces with two packages — `@recol/mobile` and `@recol/server`
- **Navigation:** `@react-navigation/native` v7 with `createNativeStackNavigator`, `animation: 'fade'`
- **State:** Zustand v5, single `useGameStore` with full type definitions already in place
- **Reanimated:** imported at top of `App.tsx` before any other imports (required); plugin last in babel

### Tech stack locked in
| Layer | Library | Version |
|---|---|---|
| Mobile framework | Expo SDK | ~52.0.46 |
| React Native | react-native | 0.76.7 |
| Navigation | @react-navigation/native + native-stack | ^7.x |
| State | zustand | ^5.0.2 |
| Animations | react-native-reanimated | ~3.16.2 |
| Real-time | socket.io-client | ^4.8.1 |
| Storage | @react-native-async-storage/async-storage | 2.1.0 |
| Backend | express + socket.io | ^4.x |

### Colors
- Home / Results background: `#000000`
- Memorize / Go / Recreate background: `#0d1f0d`
- Primary text: `#FFFFFF`

### Types defined (src/types/index.ts)
- `HSLColor { h: 0–360, s: 0–100, l: 0–100 }`
- `ColorRound { target, guess, score }`
- `GameMode: 'solo' | 'multiplayer' | 'daily'`
- `Difficulty: 'easy' | 'hard'`
- `GamePhase: 'idle' | 'memorize' | 'go' | 'recreate' | 'results'`

### Zustand store actions (already defined)
`setMode`, `setDifficulty`, `setPhase`, `setRounds`, `setCurrentRound`, `recordGuess`, `setRoomCode`, `setSocketId`, `reset`

### Server
- Express + Socket.io, port from `process.env.PORT ?? 3000`
- `/health` endpoint for Railway healthcheck
- Socket event stubs noted in comments for step 4
- Railway: `npm run build && npm run start` (compiles TS → dist, runs node)

---

## Screens to Build in Step 2

### Screen 1 — HomeScreen (`#000000`)
- Large "recol" title (bold, lowercase, white)
- Subtitle text (two lines)
- Row of mode buttons: Solo (person icon), Multiplayer (group icon), Daily (calendar icon, rainbow ring border)
- "Easy" toggle switch
- Trophy/leaderboard icon right side

### Screen 2 — MemorizeScreen (`#0d1f0d`)
- Full-screen color fill (hardcoded first — game logic in step 3)
- "1/5" progress indicator top-left
- Large countdown timer + "Seconds to remember" label
- Easy: 500s / Hard: 3s — toggled via store
- Auto-transition to GoScreen at 0

### Screen 3 — GoScreen (`#0d1f0d`)
- Word "go" large, top-right aligned, white
- 500ms then auto-transitions to RecreateScreen

### Screen 4 — RecreateScreen (`#0d1f0d`)
- Split: left = vertical HSL picker (hue strip + saturation + lightness sliders)
- Right = large color preview
- Two white dot handles on sliders
- "1/5" top-right
- Circular submit button (56px, white, target icon) bottom-right

### Screen 5 — ResultsScreen (`#000000`)
- 5 original vs guess color pairs side by side
- Per-color score (0–100)
- Total score /500
- Share button, Play again button

---

## Scoring Formula (step 3)
```
score = clamp(100 - (deltaH/3.6 + deltaS + deltaL) / 3, 0, 100)
```

## Socket Events (step 4)
`create_room`, `join_room`, `room_joined`, `start_game`, `game_started`, `submit_guess`, `all_done`, `show_results`

---

## Known Issues / Notes
- `babel-plugin-module-resolver` needs to be installed (`npm i -D babel-plugin-module-resolver` in apps/mobile) for the `@/` path alias to work
- Run `npm install` from monorepo root after scaffold
- Expo Go supports all deps in use; no bare workflow needed at this stage

---

## Build Order Checklist
- [x] Step 1 — Scaffold monorepo
- [ ] Step 2 — All 5 screens (hardcoded colors)
- [ ] Step 3 — Game logic, Zustand wiring, scoring
- [ ] Step 4 — Socket.io backend + multiplayer
- [ ] Step 5 — Daily mode (seeded RNG + AsyncStorage)
- [ ] Step 6 — Difficulty toggle (Easy/Hard)
- [ ] Step 7 — Final polish (animations, transitions, sharing)
