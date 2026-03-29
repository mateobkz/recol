# RECOL — Project Context

> Last updated: Step 4 — Socket.io backend + multiplayer

---

## Current Project State

**Step completed:** 4 of 7 — Multiplayer (Socket.io)
**Next step:** 5 — Daily mode (seeded RNG + AsyncStorage)

---

## What Was Just Built

### Server (`apps/server/src/index.ts`)
Full room management:
- `rooms: Map<string, Room>` — in-memory store
- `PlayerData { roundScores: number[] }` — per-player round scores
- `Room { code, hostId, players: Map, colors, state: waiting|playing|finished }`
- `generateCode()` — 4-char from unambiguous charset (no 0/O, 1/I), guaranteed unique
- `generateColors()` — same algorithm as mobile (5 random HSL, s:35–90, l:30–70)

**Socket events handled:**
| Event (client→server) | Behaviour |
|---|---|
| `create_room` | Generate code, create room, host joins, emit `room_joined` |
| `join_room { code }` | Validate room + state, add player, emit `room_joined` to joiner + `player_joined` to others |
| `start_game { roomCode }` | Host-only, min 2 players, generate colors, emit `game_started` |
| `submit_guess { roomCode, roundIndex, score }` | Store score, check if all done → emit `show_results` |
| `disconnect` | Remove player, reassign host if needed, clean up empty rooms |

**Events emitted (server→client):**
- `room_joined { roomCode, isHost, playerIds }` → to joining socket only
- `player_joined { playerIds }` → to all others in room
- `room_error { message }` → to socket that triggered error
- `game_started { colors: HSLColor[] }` → to entire room
- `show_results { leaderboard: { id, totalScore, scores }[] }` → to entire room, sorted desc by score
- `host_changed { newHostId, playerIds }` → when host disconnects

### Mobile infrastructure

**`src/navigation/navigationRef.ts`** (new)
- `createNavigationContainerRef<RootStackParamList>()` — used by `NavigationContainer` and socket listeners

**`src/utils/socket.ts`** (new)
- `getSocket()` — singleton socket, lazy init, `autoConnect: false`, websocket transport
- `disconnectSocket()` — full teardown (removeAllListeners + disconnect + null)
- `setupGameListeners()` — registers `game_started` + `show_results` handlers on the singleton socket; called once when entering the waiting room; survives screen transitions; idempotent (removes previous before adding)
  - `game_started`: updates store rounds/phase, navigates to Memorize via `navigationRef`
  - `show_results`: stores leaderboard in `multiLeaderboard`

**`src/store/gameStore.ts`** (extended)
New fields: `isHost`, `roomPlayers: string[]`, `multiLeaderboard: MultiLeaderboardEntry[]`
New actions: `setIsHost`, `setRoomPlayers`, `setMultiLeaderboard`
`reset()` clears all including multiplayer fields.

**`src/types/index.ts`** (extended)
New type: `MultiLeaderboardEntry { id: string; totalScore: number; scores: number[] }`

**`src/navigation/types.ts`** (extended)
Added `Multiplayer: undefined` to `RootStackParamList`

**`src/navigation/RootNavigator.tsx`** (updated)
Uses `navigationRef` on `<NavigationContainer>`, registers `MultiplayerScreen`

### Mobile screens

**`MultiplayerScreen`** (new, `#000000`)
Three internal views:
1. `idle` — Create Room + Join Room buttons
2. `joining` — 4-char TextInput + Join button + validation
3. `waiting` — large room code display, player count, Start Game (host only, min 2 players) or "Waiting for host..." spinner

Lifecycle:
- Connects socket on mount if not connected
- Registers `room_joined`, `player_joined`, `room_error` listeners (cleaned up on unmount)
- Calls `setupGameListeners()` — persists after unmount
- Leave button: `disconnectSocket()` + `reset()` + `goBack()`

**`HomeScreen`** (updated)
Multi button: `setMode('multiplayer')` + `navigation.navigate('Multiplayer')` (was a no-op)

**`RecreateScreen`** (updated)
In `handleSubmit`: if `mode === 'multiplayer' && roomCode`, emits `submit_guess { roomCode, roundIndex, score }`

**`ResultsScreen`** (updated)
Multiplayer leaderboard section below color pairs:
- Shows `ActivityIndicator` + "Waiting for all players..." if `multiLeaderboard` is empty
- Shows ranked rows when received; highlights "you" (your socketId), truncates others to 6 chars
- "Play again" calls `disconnectSocket()` before `reset()` in multiplayer mode

---

## Navigation stack
```
[Home]
[Home, Multiplayer]           ← Multi button
[Home, Multiplayer, Memorize] ← game_started fires, navigationRef.navigate('Memorize')
[Home, Multiplayer, Go]       ← replace
[Home, Multiplayer, Recreate] ← replace
[Home, Multiplayer, Results]  ← replace (last round)
[Home]                        ← popToTop on Play Again
```

---

## Architecture

### Monorepo
npm workspaces — `@recol/mobile` and `@recol/server`

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
- Home / Results / Multiplayer background: `#000000`
- Memorize / Go / Recreate background: `#0d1f0d`

### Server URL
- iOS Simulator: `http://localhost:3000`
- Android Emulator: `http://10.0.2.2:3000`
- Production: set `EXPO_PUBLIC_SERVER_URL` in `.env`

---

## Step 5 — Daily Mode Plan

1. **Seeded RNG** — seed with `YYYY-MM-DD` string → deterministic 5 colors (same for all players on same day)
2. **AsyncStorage** — persist `lastDailyDate` key; on Daily press, check if today's date matches; if yes, show "already played today" message
3. **Daily flow** — same solo game loop but with seeded colors; no server needed
4. **Seed algorithm** — simple hash of date string → use as seed for a seeded PRNG (e.g., mulberry32)

---

## Known Issues / Notes
- `expo-linear-gradient ~13.0.2` — run `npx expo install expo-linear-gradient` from `apps/mobile`
- Android Emulator requires `http://10.0.2.2:3000` instead of `localhost`
- Socket singleton is module-level; if hot-reload resets modules, call `disconnectSocket()` first

---

## Build Order Checklist
- [x] Step 1 — Scaffold monorepo
- [x] Step 2 — All 5 screens (hardcoded colors)
- [x] Step 3 — Game logic, Zustand wiring, scoring
- [x] Step 4 — Socket.io backend + multiplayer
- [ ] Step 5 — Daily mode (seeded RNG + AsyncStorage)
- [ ] Step 6 — Difficulty toggle (Easy/Hard)
- [ ] Step 7 — Final polish (animations, transitions, sharing)
