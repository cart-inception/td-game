const { v4: uuidv4 } = require('uuid');
const GameManager = require('./GameManager');

// Store for active game rooms
const rooms = {};
// Store for player socket mappings
const playerRooms = {};
// Create game manager instance
const gameManager = new GameManager();

module.exports = (io) => {
  io.on('connection', (socket) => {
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
      const playerId = socket.id;
      
      rooms[roomId] = {
        id: roomId,
        name: roomName,
        players: [{ id: playerId, username, position: 0, ready: false }],
        maxPlayers: 6,
        active: false
      };
      
      // Associate player with room
      playerRooms[playerId] = roomId;
      
      // Join socket.io room
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
      io.to(roomId).emit('playersInRoom', 
        rooms[roomId].players.map(p => p.username),
        true // Is owner
      );
    });
    
    // Join an existing room
    socket.on('joinRoom', ({ roomName, username }) => {
      const room = Object.values(rooms).find(r => r.name === roomName);
      const playerId = socket.id;
      
      if (room && room.players.length < room.maxPlayers && !room.active) {
        room.players.push({
          id: playerId,
          username,
          position: room.players.length,
          ready: false
        });
        
        // Associate player with room
        playerRooms[playerId] = room.id;
        
        // Join socket.io room
        socket.join(room.id);
        
        // Notify room members about players
        io.to(room.id).emit('playersInRoom', 
          room.players.map(p => p.username),
          false // Not owner
        );
      }
    });
    
    // Start the game
    socket.on('startGame', ({ roomName }) => {
      const room = Object.values(rooms).find(r => r.name === roomName);
      
      if (room && room.players.length >= 2) {
        // Mark room as active
        room.active = true;
        
        // Initialize game state with game manager
        const gameId = gameManager.createGame(room.id, room.players);
        
        // Notify all clients about room status update
        io.emit('roomsList', Object.values(rooms).map(room => ({
          id: room.id,
          name: room.name,
          players: room.players.length,
          maxPlayers: room.maxPlayers,
          active: room.active
        })));
        
        // Notify players that game is starting
        io.to(room.id).emit('gameStarting');
      }
    });
    
    // Get game state
    socket.on('getGameState', () => {
      const playerId = socket.id;
      const roomId = playerRooms[playerId];
      
      if (roomId) {
        const gameState = gameManager.getGameState(roomId);
        if (gameState) {
          // Send game state to player
          socket.emit('gameState', gameState);
          
          // Send player-specific data
          const playerData = gameManager.getPlayerData(roomId, playerId);
          if (playerData) {
            socket.emit('playerData', playerData);
          }
        }
      }
    });
    
    // Place tower
    socket.on('placeTower', ({ type, x, y }) => {
      const playerId = socket.id;
      const roomId = playerRooms[playerId];
      
      if (roomId) {
        const towerId = gameManager.placeTower(roomId, playerId, type, x, y);
        if (towerId) {
          // Get updated game state
          const gameState = gameManager.getGameState(roomId);
          
          // Send updated game state to all players in room
          io.to(roomId).emit('gameState', gameState);
          
          // Notify about tower placement
          const tower = gameState.towers.find(t => t.id === towerId);
          if (tower) {
            io.to(roomId).emit('towerPlaced', tower);
          }
        }
      }
    });
    
    // Upgrade tower
    socket.on('upgradeTower', ({ towerId }) => {
      const playerId = socket.id;
      const roomId = playerRooms[playerId];
      
      if (roomId) {
        const success = gameManager.upgradeTower(roomId, playerId, towerId);
        if (success) {
          // Get updated game state
          const gameState = gameManager.getGameState(roomId);
          
          // Send updated game state to all players in room
          io.to(roomId).emit('gameState', gameState);
          
          // Find upgraded tower to notify about level
          const tower = gameState.towers.find(t => t.id === towerId);
          if (tower) {
            io.to(roomId).emit('towerUpgraded', towerId, tower.level);
          }
        }
      }
    });
    
    // Start round
    socket.on('startRound', () => {
      const playerId = socket.id;
      const roomId = playerRooms[playerId];
      
      if (roomId) {
        const roundNumber = gameManager.startRound(roomId);
        if (roundNumber > 0) {
          // Notify all players in room about round start
          io.to(roomId).emit('roundStart', roundNumber);
        }
      }
    });
    
    // Return to lobby
    socket.on('returnToLobby', () => {
      const playerId = socket.id;
      const roomId = playerRooms[playerId];
      
      if (roomId) {
        // Remove player from game
        gameManager.removePlayer(roomId, playerId);
        
        // Remove player from room
        if (rooms[roomId]) {
          rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== playerId);
          
          // If room is empty, remove it
          if (rooms[roomId].players.length === 0) {
            delete rooms[roomId];
          } else {
            // Update room activity status
            rooms[roomId].active = false;
            
            // Notify remaining players
            io.to(roomId).emit('playersInRoom', 
              rooms[roomId].players.map(p => p.username),
              rooms[roomId].players[0].id === socket.id // First player is new owner
            );
          }
        }
        
        // Leave socket.io room
        socket.leave(roomId);
        
        // Remove player-room association
        delete playerRooms[playerId];
      }
    });
    
    // Handle disconnections
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      const playerId = socket.id;
      const roomId = playerRooms[playerId];
      
      if (roomId) {
        // Remove player from game
        gameManager.removePlayer(roomId, playerId);
        
        // Remove player from room
        if (rooms[roomId]) {
          rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== playerId);
          
          // If room is empty, remove it
          if (rooms[roomId].players.length === 0) {
            delete rooms[roomId];
          } else {
            // Notify remaining players
            io.to(roomId).emit('playersInRoom', 
              rooms[roomId].players.map(p => p.username),
              rooms[roomId].players[0].id === socket.id // First player is new owner
            );
          }
        }
        
        // Remove player-room association
        delete playerRooms[playerId];
      }
      
      // Update room list for all clients
      io.emit('roomsList', Object.values(rooms).map(room => ({
        id: room.id,
        name: room.name,
        players: room.players.length,
        maxPlayers: room.maxPlayers,
        active: room.active
      })));
    });
  });
};