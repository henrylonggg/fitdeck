'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: false },
  serveClient: true,
  transports: ['polling', 'websocket'],
});

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const ROOM_TTL_SECONDS = 6 * 60 * 60;
const memoryRooms = new Map();
const timerHandles = new Map();
let redis = null;
let storageMode = 'memory';

const randomId = () => typeof crypto.randomUUID === 'function'
  ? crypto.randomUUID()
  : crypto.randomBytes(16).toString('hex');

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const roomKey = (code) => `deathbox:room:${code}`;

async function initRedis() {
  if (!process.env.REDIS_URL) {
    console.warn('REDIS_URL is not configured. Rooms will only work inside one server process.');
    return;
  }

  const pubClient = createClient({ url: process.env.REDIS_URL });
  pubClient.on('error', (error) => console.error('Redis error:', error.message));
  await pubClient.connect();
  const subClient = pubClient.duplicate();
  await subClient.connect();
  io.adapter(createAdapter(pubClient, subClient));
  redis = pubClient;
  storageMode = 'redis';
  console.log('Shared Redis room storage enabled.');
}

async function getRoom(code) {
  if (!code) return null;
  if (!redis) return memoryRooms.get(code) || null;
  const value = await redis.get(roomKey(code));
  return value ? JSON.parse(value) : null;
}

async function saveRoom(room) {
  room.lastActive = Date.now();
  if (!redis) {
    memoryRooms.set(room.code, room);
    return;
  }
  await redis.set(roomKey(room.code), JSON.stringify(room), { EX: ROOM_TTL_SECONDS });
}

async function deleteRoom(code) {
  const handle = timerHandles.get(code);
  if (handle) clearInterval(handle);
  timerHandles.delete(code);
  if (!redis) memoryRooms.delete(code);
  else await redis.del(roomKey(code));
}

async function roomExists(code) {
  if (!redis) return memoryRooms.has(code);
  return Boolean(await redis.exists(roomKey(code)));
}

async function roomCount() {
  if (!redis) return memoryRooms.size;
  let cursor = '0';
  let count = 0;
  do {
    const result = await redis.scan(cursor, { MATCH: 'deathbox:room:*', COUNT: 100 });
    cursor = String(result.cursor);
    count += result.keys.length;
  } while (cursor !== '0');
  return count;
}

app.get('/health', async (_req, res) => {
  try {
    res.status(200).json({ ok: true, storage: storageMode, rooms: await roomCount() });
  } catch (error) {
    res.status(503).json({ ok: false, storage: storageMode, error: error.message });
  }
});
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const suits = ['♠', '♥', '♣', '♦'];
const ranks = [['A',14],['2',2],['3',3],['4',4],['5',5],['6',6],['7',7],['8',8],['9',9],['10',10],['J',11],['Q',12],['K',13]];
const makeDeck = () => suits.flatMap((suit) => ranks.map(([label, value]) => ({ suit, label, value, id: randomId() })));
function shuffle(cards) { for (let i = cards.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; } return cards; }
const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function normalizeRoomCode(value) { return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5); }
async function createRoomCode() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const value = Array.from({ length: 5 }, () => ROOM_ALPHABET[crypto.randomInt(0, ROOM_ALPHABET.length)]).join('');
    if (!(await roomExists(value))) return value;
  }
  throw new Error('Could not generate a unique room code.');
}
function cleanName(value) { return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 20); }
function playerFor(room, socket) { return room?.players.find((player) => player.id === socket.data.playerId); }
function publicRoom(room) {
  return {
    code: room.code, hostId: room.hostId, started: room.started, difficulty: room.difficulty,
    turn: room.turn, streak: room.streak, selected: room.selected, deckCount: room.deck.length,
    piles: room.piles.map((pile) => ({ count: pile.length, top: pile[pile.length - 1] || null })),
    players: room.players.map((player) => ({
      id: player.id, name: player.name, connected: player.connected, guesses: player.guesses,
      correct: player.correct, points: player.points, penalty: player.penalty,
      riskTotal: player.riskTotal, riskGuesses: player.riskGuesses,
    })),
    logs: room.logs.slice(0, 80), result: room.result, timer: room.timer,
    currentPlayerId: room.players[room.turn]?.id || null,
  };
}
async function broadcast(room) {
  await saveRoom(room);
  io.to(room.code).emit('roomState', publicRoom(room));
}
function newPlayer(name, socketId) { return { id: randomId(), socketId, name, connected: true, guesses: 0, correct: 0, points: 0, penalty: 0, riskTotal: 0, riskGuesses: 0 }; }
async function createRoom(host, socket, difficulty) {
  const code = await createRoomCode();
  const room = { code, hostId: host.id, players: [host], difficulty: ['easy','normal','hard'].includes(difficulty) ? difficulty : 'normal', started: false, turn: 0, streak: 0, deck: [], piles: [], selected: null, logs: [], result: 'Waiting for the creator to start.', timer: null, lastActive: Date.now() };
  await saveRoom(room);
  await socket.join(code);
  socket.data.roomCode = code;
  socket.data.playerId = host.id;
  return room;
}
function start(room) {
  room.started = true; room.turn = 0; room.streak = 0; room.selected = null; room.deck = shuffle(makeDeck());
  room.piles = Array.from({ length: 9 }, () => [room.deck.pop()]); room.logs = []; room.result = `${room.players[0].name} goes first.`;
  room.players.forEach((player) => Object.assign(player, { guesses: 0, correct: 0, points: 0, penalty: 0, riskTotal: 0, riskGuesses: 0 }));
}
function probability(room, current, direction) { if (!room.deck.length) return 0; const wins = room.deck.filter((card) => direction === 'higher' ? card.value > current.value : card.value < current.value).length; return wins / room.deck.length; }
function riskPoints(probabilityValue) { return Math.max(1, Math.min(10, Math.round(1 + (1 - probabilityValue) * 9))); }
function advance(room) { room.turn = (room.turn + 1) % room.players.length; room.streak = 0; room.selected = null; }
function clearTimer(room) {
  const handle = timerHandles.get(room.code);
  if (handle) clearInterval(handle);
  timerHandles.delete(room.code);
  room.timer = null;
}
async function socketRoom(socket) { return socket.data.roomCode ? getRoom(socket.data.roomCode) : null; }

io.on('connection', (socket) => {
  socket.on('createRoom', async ({ name, difficulty } = {}) => {
    try {
      const safeName = cleanName(name);
      if (!safeName) return socket.emit('errorMessage', 'Enter your name.');
      const host = newPlayer(safeName, socket.id);
      const room = await createRoom(host, socket, difficulty);
      socket.emit('roomJoined', { playerId: host.id, room: publicRoom(room) });
      await broadcast(room);
    } catch (error) {
      console.error(error);
      socket.emit('errorMessage', 'Could not create the room. Please try again.');
    }
  });

  socket.on('joinRoom', async ({ name, code: rawCode } = {}) => {
    try {
      const safeName = cleanName(name);
      const code = normalizeRoomCode(rawCode);
      if (!safeName) return socket.emit('errorMessage', 'Enter your name.');
      if (code.length !== 5) return socket.emit('errorMessage', 'Enter the full 5-character access code.');
      const room = await getRoom(code);
      if (!room) return socket.emit('errorMessage', 'That access code is not active. Check the code and make sure both devices use the same website.');
      if (room.started) return socket.emit('errorMessage', 'This game has already started.');
      if (room.players.length >= 12) return socket.emit('errorMessage', 'This room is full.');
      const player = newPlayer(safeName, socket.id);
      room.players.push(player);
      await socket.join(code);
      socket.data.roomCode = code;
      socket.data.playerId = player.id;
      await saveRoom(room);
      socket.emit('roomJoined', { playerId: player.id, room: publicRoom(room) });
      await broadcast(room);
    } catch (error) {
      console.error(error);
      socket.emit('errorMessage', 'Could not join the room. Please try again.');
    }
  });

  socket.on('startGame', async () => {
    const room = await socketRoom(socket); const player = playerFor(room, socket);
    if (!room || !player) return;
    if (player.id !== room.hostId) return socket.emit('errorMessage', 'Only the creator can start the game.');
    start(room); await broadcast(room);
  });
  socket.on('setDifficulty', async (value) => {
    const room = await socketRoom(socket); const player = playerFor(room, socket);
    if (!room || player?.id !== room.hostId || room.started) return;
    if (['easy','normal','hard'].includes(value)) { room.difficulty = value; await broadcast(room); }
  });
  socket.on('selectPile', async (index) => {
    const room = await socketRoom(socket); const player = playerFor(room, socket);
    if (!room?.started || !player || room.timer) return;
    if (room.players[room.turn]?.id !== player.id) return socket.emit('errorMessage', 'It is not your turn.');
    const pileIndex = Number(index);
    if (!Number.isInteger(pileIndex) || !room.piles[pileIndex]) return;
    room.selected = pileIndex; await broadcast(room);
  });
  socket.on('choose', async (direction) => {
    const room = await socketRoom(socket); const player = playerFor(room, socket);
    if (!room?.started || !player || room.timer) return;
    if (room.players[room.turn]?.id !== player.id) return socket.emit('errorMessage', 'It is not your turn.');
    if (!['higher','lower'].includes(direction) || room.selected === null || !room.deck.length) return;
    const pile = room.piles[room.selected]; const current = pile[pile.length - 1]; const chance = probability(room, current, direction); const next = room.deck.pop(); pile.push(next);
    const equal = next.value === current.value; const correct = direction === 'higher' ? next.value > current.value : next.value < current.value;
    player.guesses += 1; player.riskGuesses += 1; const awarded = riskPoints(chance); player.riskTotal += awarded;
    if (correct) {
      player.correct += 1; player.points += awarded; room.streak += 1;
      room.result = `${player.name} was correct: ${next.label}${next.suit} was ${direction}. +${awarded} risk point${awarded === 1 ? '' : 's'} (${Math.round(chance * 100)}% success chance).`;
      room.logs.unshift({ at: Date.now(), text: room.result, type: 'correct' });
      if (room.streak >= 3) { advance(room); room.result = `Turn complete. ${room.players[room.turn].name} is up.`; }
    } else {
      const penalty = pile.length * (equal ? 2 : 1); player.penalty += penalty;
      room.result = `${player.name} missed${equal ? ' on a matching rank' : ''}: ${penalty} penalty points.`;
      room.logs.unshift({ at: Date.now(), text: room.result, type: 'wrong' });
      room.timer = { playerId: player.id, target: penalty, elapsed: 0, running: false, complete: false };
      room.streak = 0;
    }
    if (!room.deck.length) { room.result = 'The deck is empty. Final results are ready.'; room.started = false; clearTimer(room); }
    await broadcast(room);
  });
  socket.on('startTimer', async () => {
    const room = await socketRoom(socket); const player = playerFor(room, socket);
    if (!room?.timer || room.timer.playerId !== player?.id || room.timer.running) return;
    room.timer.running = true;
    const interval = room.difficulty === 'easy' ? 700 : room.difficulty === 'hard' ? 1300 : 1000;
    await broadcast(room);
    const oldHandle = timerHandles.get(room.code); if (oldHandle) clearInterval(oldHandle);
    const handle = setInterval(async () => {
      const latest = await getRoom(room.code);
      if (!latest?.timer || !latest.timer.running) { clearInterval(handle); timerHandles.delete(room.code); return; }
      latest.timer.elapsed += 1;
      if (latest.timer.elapsed >= latest.timer.target) {
        latest.timer.complete = true; latest.timer.running = false;
        clearInterval(handle); timerHandles.delete(room.code);
      }
      await broadcast(latest);
    }, interval);
    timerHandles.set(room.code, handle);
  });
  socket.on('finishTimer', async () => {
    const room = await socketRoom(socket); const player = playerFor(room, socket);
    if (!room?.timer || room.timer.playerId !== player?.id || !room.timer.complete) return;
    clearTimer(room); advance(room); room.result = `Penalty complete. ${room.players[room.turn].name} is up.`; await broadcast(room);
  });
  socket.on('restartGame', async () => {
    const room = await socketRoom(socket); const player = playerFor(room, socket);
    if (room && player?.id === room.hostId) { clearTimer(room); start(room); await broadcast(room); }
  });
  socket.on('disconnect', async () => {
    try {
      const room = await socketRoom(socket); const player = playerFor(room, socket);
      if (!room || !player) return;
      player.connected = false; await broadcast(room);
    } catch (error) { console.error('Disconnect update failed:', error.message); }
  });
});

setInterval(async () => {
  if (redis) return; // Redis TTL handles shared-room cleanup.
  const cutoff = Date.now() - ROOM_TTL_SECONDS * 1000;
  for (const [code, room] of memoryRooms) {
    if (room.lastActive < cutoff && !room.players.some((player) => player.connected)) await deleteRoom(code);
  }
}, 30 * 60 * 1000).unref();

(async () => {
  try {
    await initRedis();
    server.listen(PORT, HOST, () => console.log(`Deathbox listening on http://${HOST}:${PORT}`));
  } catch (error) {
    console.error('Startup failed:', error);
    process.exit(1);
  }
})();
