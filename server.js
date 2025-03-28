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
const SOCKET_PORT = process.env.SOCKET_PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tower-defense';

// Connect to MongoDB (optional, can be removed if not using database initially)
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.prepare().then(() => {
  // Create Next.js server
  const nextServer = express();
  const nextHttpServer = http.createServer(nextServer);
  
  // Create separate Socket.io server
  const socketServer = express();
  const socketHttpServer = http.createServer(socketServer);
  const io = new Server(socketHttpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  
  // Apply middleware
  nextServer.use(cors());
  nextServer.use(express.json());
  
  // Import socket handlers
  require('./src/server/socket')(io);
  
  // API routes
  nextServer.use('/api/users', require('./src/server/routes/users'));
  nextServer.use('/api/games', require('./src/server/routes/games'));
  
  // Handle Next.js requests
  nextServer.all('*', (req, res) => {
    return handle(req, res);
  });
  
  // Start Next.js server
  nextHttpServer.listen(PORT, () => {
    console.log(`Next.js server running on port ${PORT}`);
  });
  
  // Start Socket.io server
  socketHttpServer.listen(SOCKET_PORT, () => {
    console.log(`Socket.io server running on port ${SOCKET_PORT}`);
  });
});