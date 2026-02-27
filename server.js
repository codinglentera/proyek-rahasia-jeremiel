import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import World from './world.js';
import Locks from './locks.js';
import { spliceSeeds } from './seeds.js';
import Inventory from './inventory.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// Game instances
const world = new World(100, 60);
const locks = new Locks();
const players = new Map(); // userId -> player data

// Serve static files
app.use(express.static('../client'));

io.on('connection', (socket) => {
  console.log(`[CONNECTION] ${socket.id}`);

  // Generate userId
  const userId = uuidv4();
  const playerData = {
    id: userId,
    name: `Player_${userId.slice(0, 8)}`,
    x: Math.floor(Math.random() * world.width),
    y: Math.floor(Math.random() * world.height),
    inventory: new Inventory(),
    socketId: socket.id
  };
  players.set(userId, playerData);

  // Send init data to client
  socket.emit('init', {
    userId,
    world: world.serialize(),
    players: Array.from(players.values()).map(p => ({
      id: p.id,
      name: p.name,
      x: p.x,
      y: p.y
    }))
  });

  // Broadcast new player to all
  io.emit('player:joined', {
    id: playerData.id,
    name: playerData.name,
    x: playerData.x,
    y: playerData.y
  });

  // Handle player movement
  socket.on('player:move', (data) => {
    const player = players.get(userId);
    if (player) {
      player.x = Math.max(0, Math.min(world.width - 1, data.x));
      player.y = Math.max(0, Math.min(world.height - 1, data.y));
      io.emit('player:moved', {
        id: userId,
        x: player.x,
        y: player.y
      });
    }
  });

  // Handle block placement
  socket.on('world:placeBlock', (data) => {
    const { x, y, type } = data;
    
    // Check lock
    if (locks.isProtected(x, y, userId)) {
      socket.emit('error', 'Area is locked!');
      return;
    }

    const result = world.setBlock(x, y, type, userId);
    if (result) {
      io.emit('world:blockPlaced', { x, y, type, userId });
    }
  });

  // Handle block break
  socket.on('world:breakBlock', (data) => {
    const { x, y } = data;
    
    if (locks.isProtected(x, y, userId)) {
      socket.emit('error', 'Area is locked!');
      return;
    }

    const block = world.getBlock(x, y);
    if (block && block.type !== 'air') {
      const result = world.setBlock(x, y, 'air', userId);
      if (result) {
        io.emit('world:blockBroken', { x, y });
      }
    }
  });

  // Handle splicing
  socket.on('seeds:splice', (data) => {
    const { seedA, seedB } = data;
    const result = spliceSeeds(seedA, seedB);
    socket.emit('seeds:spliced', result);
  });

  // Handle lock placement
  socket.on('lock:place', (data) => {
    const { x, y, size } = data;
    locks.placeLock(x, y, size, userId);
    io.emit('lock:placed', { x, y, size, userId });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    players.delete(userId);
    io.emit('player:left', { id: userId });
    console.log(`[DISCONNECT] ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
