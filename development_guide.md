# Tower Defense Game Development Guide

This guide provides step-by-step instructions for developing a multiplayer tower defense game similar to Bloons TD 6, supporting up to 6 players simultaneously. The guide is based on our selected technology stack and architecture design.

## Project Setup

### Prerequisites

Before starting development, ensure you have the following installed:

- Node.js (v18 or later)
- npm or yarn package manager
- MongoDB
- Docker and Docker Compose
- Git

### Initial Project Setup

1. Create a new Next.js project with TypeScript support:

```bash
npx create-nextjs-app tower-defense-game --typescript
cd tower-defense-game
```

2. Install required dependencies:

```bash
# Frontend dependencies
npm install phaser react react-dom socket.io-client axios tailwindcss postcss autoprefixer

# Backend dependencies
npm install express socket.io mongoose cors dotenv jsonwebtoken bcrypt
npm install --save-dev nodemon ts-node @types/express @types/socket.io @types/mongoose @types/cors @types/jsonwebtoken @types/bcrypt
```

3. Set up Tailwind CSS:

```bash
npx tailwindcss init -p
```

4. Configure project structure:

```
tower-defense-game/
├── src/
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   ├── game/                 # Phaser game code
│   │   ├── assets/           # Game assets
│   │   ├── scenes/           # Game scenes
│   │   ├── objects/          # Game objects
│   │   ├── config.ts         # Phaser configuration
│   │   └── index.ts          # Game entry point
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   └── server/               # Server-side code
│       ├── controllers/      # API controllers
│       ├── models/           # MongoDB models
│       ├── routes/           # API routes
│       ├── socket/           # Socket.io handlers
│       └── index.ts          # Server entry point
├── public/                   # Static assets
└── server.js                 # Custom server file
```

## Frontend Implementation

### Setting Up Phaser with Next.js

1. Create a Phaser configuration file at `src/game/config.ts`:

```typescript
import Phaser from 'phaser';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: process.env.NODE_ENV === 'development'
    }
  },
  scene: [],
  backgroundColor: '#333333',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
```

2. Create a Phaser game component at `src/components/Game.tsx`:

```typescript
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '../game/config';
import { BootScene } from '../game/scenes/BootScene';
import { GameScene } from '../game/scenes/GameScene';
import { UIScene } from '../game/scenes/UIScene';

const Game: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      const config = {
        ...gameConfig,
        parent: containerRef.current,
        scene: [BootScene, GameScene, UIScene]
      };
      
      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="game-container" />;
};

export default Game;
```

3. Create basic game scenes:

`src/game/scenes/BootScene.ts`:
```typescript
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Load assets
    this.load.image('tower1', '/assets/towers/tower1.png');
    this.load.image('tower2', '/assets/towers/tower2.png');
    this.load.image('enemy1', '/assets/enemies/enemy1.png');
    this.load.image('map', '/assets/maps/map1.png');
    this.load.image('ui-panel', '/assets/ui/panel.png');
    // Add more assets as needed
  }

  create() {
    this.scene.start('GameScene');
  }
}
```

`src/game/scenes/GameScene.ts`:
```typescript
import Phaser from 'phaser';
import { Socket } from 'socket.io-client';

export class GameScene extends Phaser.Scene {
  private socket: Socket | null = null;
  private map: Phaser.GameObjects.Image | null = null;
  private towers: Phaser.GameObjects.Group | null = null;
  private enemies: Phaser.GameObjects.Group | null = null;
  private path: Phaser.Curves.Path | null = null;

  constructor() {
    super('GameScene');
  }

  init(data: { socket: Socket }) {
    this.socket = data.socket;
  }

  create() {
    // Create game map
    this.map = this.add.image(0, 0, 'map').setOrigin(0, 0);
    
    // Initialize groups
    this.towers = this.add.group();
    this.enemies = this.add.group();
    
    // Define path for enemies
    this.path = new Phaser.Curves.Path(100, 100);
    this.path.lineTo(300, 100);
    this.path.lineTo(300, 300);
    this.path.lineTo(500, 300);
    
    // Set up socket event listeners
    if (this.socket) {
      this.setupSocketListeners();
    }
    
    // Start UI scene
    this.scene.launch('UIScene');
  }

  update() {
    // Game update logic
  }

  private setupSocketListeners() {
    if (!this.socket) return;
    
    this.socket.on('gameState', (gameState) => {
      this.updateGameState(gameState);
    });
    
    this.socket.on('newEnemy', (enemyData) => {
      this.spawnEnemy(enemyData);
    });
    
    this.socket.on('towerPlaced', (towerData) => {
      this.placeTower(towerData);
    });
  }

  private updateGameState(gameState: any) {
    // Update game state based on server data
  }

  private spawnEnemy(enemyData: any) {
    // Spawn enemy based on server data
  }

  private placeTower(towerData: any) {
    // Place tower based on server data
  }
}
```

`src/game/scenes/UIScene.ts`:
```typescript
import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    // Create UI elements
    const panel = this.add.image(this.cameras.main.width - 150, this.cameras.main.height / 2, 'ui-panel');
    
    // Add tower selection buttons
    const tower1Button = this.add.image(panel.x, panel.y - 100, 'tower1').setInteractive();
    const tower2Button = this.add.image(panel.x, panel.y, 'tower2').setInteractive();
    
    // Add event listeners
    tower1Button.on('pointerdown', () => {
      this.selectTower('tower1');
    });
    
    tower2Button.on('pointerdown', () => {
      this.selectTower('tower2');
    });
  }

  private selectTower(towerType: string) {
    // Notify game scene about tower selection
    const gameScene = this.scene.get('GameScene');
    gameScene.events.emit('towerSelected', towerType);
  }
}
```

### Setting Up React UI Components

1. Create a lobby component at `src/components/Lobby.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

interface LobbyProps {
  socket: Socket;
  onGameStart: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ socket, onGameStart }) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomName, setRoomName] = useState('');
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);

  useEffect(() => {
    socket.on('roomsList', (roomsList) => {
      setRooms(roomsList);
    });

    socket.on('playersInRoom', (playersList) => {
      setPlayers(playersList);
    });

    socket.on('gameStarting', () => {
      onGameStart();
    });

    socket.emit('getRooms');

    return () => {
      socket.off('roomsList');
      socket.off('playersInRoom');
      socket.off('gameStarting');
    };
  }, [socket, onGameStart]);

  const createRoom = () => {
    if (roomName && username) {
      socket.emit('createRoom', { roomName, username });
      setJoined(true);
    }
  };

  const joinRoom = (room: string) => {
    if (username) {
      socket.emit('joinRoom', { roomName: room, username });
      setJoined(true);
    }
  };

  const startGame = () => {
    socket.emit('startGame', { roomName });
  };

  return (
    <div className="lobby-container p-4">
      {!joined ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Game Lobby</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Your Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-2 border rounded mr-2"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="p-2 border rounded mr-2"
            />
            <button
              onClick={createRoom}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Create Room
            </button>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Available Rooms</h3>
            <ul className="border rounded p-2">
              {rooms.map((room) => (
                <li key={room.id} className="mb-2 p-2 border-b">
                  {room.name} ({room.players}/{room.maxPlayers})
                  <button
                    onClick={() => joinRoom(room.name)}
                    className="ml-2 bg-green-500 text-white p-1 rounded"
                    disabled={room.players >= room.maxPlayers}
                  >
                    Join
                  </button>
                </li>
              ))}
              {rooms.length === 0 && <li>No rooms available</li>}
            </ul>
          </div>
        </>
      ) : (
        <div className="waiting-room">
          <h2 className="text-2xl font-bold mb-4">Room: {roomName}</h2>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Players</h3>
            <ul className="border rounded p-2">
              {players.map((player, index) => (
                <li key={index} className="mb-1">
                  {player}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={startGame}
            className="bg-green-500 text-white p-2 rounded"
            disabled={players.length < 2}
          >
            Start Game
          </button>
        </div>
      )}
    </div>
  );
};

export default Lobby;
```

2. Create a main game page at `src/app/game/page.tsx`:

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Game from '../../components/Game';
import Lobby from '../../components/Lobby';

const GamePage: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  if (!socket) {
    return <div>Connecting to server...</div>;
  }

  return (
    <div className="game-page">
      {gameStarted ? (
        <Game socket={socket} />
      ) : (
        <Lobby socket={socket} onGameStart={() => setGameStarted(true)} />
      )}
    </div>
  );
};

export default GamePage;
```

## Backend Implementation

### Setting Up Express and Socket.io Server

1. Create a custom server file at `server.js`:

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tower-defense';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  
  // Set up Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  
  // Apply middleware
  server.use(cors());
  server.use(express.json());
  
  // Import socket handlers
  require('./src/server/socket')(io);
  
  // API routes
  server.use('/api/users', require('./src/server/routes/users'));
  server.use('/api/games', require('./src/server/routes/games'));
  
  // Handle Next.js requests
  server.all('*', (req, res) => {
    return handle(req, res);
  });
  
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
```

2. Create Socket.io handlers at `src/server/socket/index.ts`:

```typescript
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

interface GameRoom {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  gameState: any;
  active: boolean;
}

interface Player {
  id: string;
  username: string;
  position: number;
  ready: boolean;
}

const rooms: Record<string, GameRoom> = {};

module.exports = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Get available rooms
    socket.on('getRooms', () => {
      const roomsList = Object.values(rooms).map(room => ({
        id: room.id,
        name: room.name,
        players: room.players.length,
        maxPlayers: room.maxPlayers,
        active: room.active
      }));
      
      socket.emit('roomsList', roomsList);
    });
    
    // Create a new room
    socket.on('createRoom', ({ roomName, username }) => {
      const roomId = uuidv4();
      
      rooms[roomId] = {
        id: roomId,
        name: roomName,
        players: [{ id: socket.id, username, position: 0, ready: false }],
        maxPlayers: 6,
        gameState: {
          round: 0,
          towers: [],
          enemies: [],
          lives: 100,
          money: 650
        },
        active: false
      };
      
      socket.join(roomId);
      
      // Notify all clients about new room
      io.emit('roomsList', Object.values(rooms).map(room => ({
        id: room.id,
        name: room.name,
        players: room.players.length,
        maxPlayers: room.maxPlayers,
        active: room.active
      })));
      
      // Notify room members about players
      io.to(roomId).emit('playersInRoom', rooms[roomId].players.map(p => p.username));
    });
    
    // Join an existing room
    socket.on('joinRoom', ({ roomName, username }) => {
      const room = Object.values(rooms).find(r => r.name === roomName);
      
      if (room && room.players.length < room.maxPlayers && !room.active) {
        room.players.push({
          id: socket.id,
          username,
          position: room.players.length,
          ready: false
        });
        
        socket.join(room.id);
        
        // Notify room members about players
        io.to(room.id).emit('playersInRoom', room.players.map(p => p.username));
      }
    });
    
    // Start the game
    socket.on('startGame', ({ roomName }) => {
      const room = Object.values(rooms).find(r => r.name === roomName);
      
      if (room && room.players.length >= 2) {
        room.active = true;
        
        // Notify all clients about room status
        io.emit('roomsList', Object.values(rooms).map(room => ({
          id: room<response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>