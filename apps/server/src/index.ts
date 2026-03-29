import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// ── Types ─────────────────────────────────────────────────────────────────────

interface HSLColor {
  h: number;
  s: number;
  l: number;
}

interface PlayerData {
  roundScores: number[];
}

interface Room {
  code: string;
  hostId: string;
  players: Map<string, PlayerData>;
  colors: HSLColor[];
  state: 'waiting' | 'playing' | 'finished';
}

// ── State ─────────────────────────────────────────────────────────────────────

const rooms = new Map<string, Room>();

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateCode(): string {
  // Unambiguous characters (no 0/O, 1/I)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code: string;
  do {
    code = Array.from(
      { length: 4 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  } while (rooms.has(code));
  return code;
}

function generateColors(): HSLColor[] {
  return Array.from({ length: 5 }, () => ({
    h: Math.round(Math.random() * 359),
    s: Math.round(35 + Math.random() * 55),
    l: Math.round(30 + Math.random() * 40),
  }));
}

function buildLeaderboard(room: Room) {
  return Array.from(room.players.entries())
    .map(([id, data]) => ({
      id,
      scores: data.roundScores,
      totalScore: data.roundScores.reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => b.totalScore - a.totalScore);
}

function findRoomBySocket(socketId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.players.has(socketId)) return room;
  }
  return undefined;
}

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', rooms: rooms.size, timestamp: new Date().toISOString() });
});

// ── Socket.io ─────────────────────────────────────────────────────────────────

io.on('connection', (socket: Socket) => {
  console.log(`[socket] connected: ${socket.id}`);

  // ── create_room ─────────────────────────────────────────────────────────────
  socket.on('create_room', () => {
    const code = generateCode();
    const room: Room = {
      code,
      hostId: socket.id,
      players: new Map([[socket.id, { roundScores: [] }]]),
      colors: [],
      state: 'waiting',
    };
    rooms.set(code, room);
    socket.join(code);

    console.log(`[room] created: ${code} by ${socket.id}`);

    socket.emit('room_joined', {
      roomCode: code,
      isHost: true,
      playerIds: [socket.id],
    });
  });

  // ── join_room ────────────────────────────────────────────────────────────────
  socket.on('join_room', ({ code }: { code: string }) => {
    const room = rooms.get(code.toUpperCase());

    if (!room) {
      socket.emit('room_error', { message: 'Room not found. Check the code and try again.' });
      return;
    }
    if (room.state !== 'waiting') {
      socket.emit('room_error', { message: 'This game is already in progress.' });
      return;
    }

    room.players.set(socket.id, { roundScores: [] });
    socket.join(code);

    const playerIds = Array.from(room.players.keys());
    console.log(`[room] ${code} — ${socket.id} joined (${playerIds.length} players)`);

    // Tell the joiner about the room
    socket.emit('room_joined', { roomCode: code, isHost: false, playerIds });

    // Tell everyone else a new player arrived
    socket.broadcast.to(code).emit('player_joined', { playerIds });
  });

  // ── start_game ───────────────────────────────────────────────────────────────
  socket.on('start_game', ({ roomCode }: { roomCode: string }) => {
    const room = rooms.get(roomCode);

    if (!room) {
      socket.emit('room_error', { message: 'Room not found.' });
      return;
    }
    if (room.hostId !== socket.id) {
      socket.emit('room_error', { message: 'Only the host can start the game.' });
      return;
    }
    if (room.players.size < 2) {
      socket.emit('room_error', { message: 'Need at least 2 players to start.' });
      return;
    }

    room.colors = generateColors();
    room.state = 'playing';

    // Reset all round scores
    for (const player of room.players.values()) {
      player.roundScores = [];
    }

    console.log(`[room] ${roomCode} — game started (${room.players.size} players)`);

    io.to(roomCode).emit('game_started', { colors: room.colors });
  });

  // ── submit_guess ──────────────────────────────────────────────────────────────
  socket.on(
    'submit_guess',
    ({ roomCode, roundIndex, score }: { roomCode: string; roundIndex: number; score: number }) => {
      const room = rooms.get(roomCode);
      if (!room || room.state !== 'playing') return;

      const player = room.players.get(socket.id);
      if (!player) return;

      // Only accept each round submission once
      if (player.roundScores[roundIndex] !== undefined) return;

      player.roundScores[roundIndex] = Math.max(0, Math.min(100, Math.round(score)));

      // Check if all players have submitted all 5 rounds
      const totalPlayers = room.players.size;
      const finishedPlayers = Array.from(room.players.values()).filter(
        (p) => p.roundScores.filter((s) => s !== undefined).length === 5
      ).length;

      console.log(
        `[room] ${roomCode} — round ${roundIndex + 1}/5 from ${socket.id.slice(0, 6)} | finished: ${finishedPlayers}/${totalPlayers}`
      );

      if (finishedPlayers === totalPlayers) {
        room.state = 'finished';
        const leaderboard = buildLeaderboard(room);
        console.log(`[room] ${roomCode} — game finished, emitting results`);
        io.to(roomCode).emit('show_results', { leaderboard });
      }
    }
  );

  // ── disconnect ────────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`[socket] disconnected: ${socket.id}`);

    const room = findRoomBySocket(socket.id);
    if (!room) return;

    room.players.delete(socket.id);

    // Empty room — clean up
    if (room.players.size === 0) {
      rooms.delete(room.code);
      console.log(`[room] ${room.code} — deleted (empty)`);
      return;
    }

    const playerIds = Array.from(room.players.keys());

    // If host left, assign new host
    if (room.hostId === socket.id) {
      room.hostId = playerIds[0];
      io.to(room.code).emit('host_changed', { newHostId: room.hostId, playerIds });
      console.log(`[room] ${room.code} — new host: ${room.hostId}`);
    } else {
      io.to(room.code).emit('player_joined', { playerIds });
    }

    // If game was in progress and only one player remains, finish it
    if (room.state === 'playing' && room.players.size === 1) {
      room.state = 'finished';
      const leaderboard = buildLeaderboard(room);
      io.to(room.code).emit('show_results', { leaderboard });
    }
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`Recol server running on port ${PORT}`);
});
