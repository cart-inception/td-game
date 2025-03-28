const express = require('express');
const router = express.Router();

// Simple in-memory games store (would use MongoDB in production)
const games = [];

// Get all active games
router.get('/', (req, res) => {
  res.json(games.map(game => ({
    id: game.id,
    name: game.name,
    players: game.players.length,
    maxPlayers: game.maxPlayers,
    active: game.active
  })));
});

// Get game by ID
router.get('/:id', (req, res) => {
  const game = games.find(game => game.id === req.params.id);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  res.json({
    id: game.id,
    name: game.name,
    players: game.players.map(player => ({
      id: player.id,
      username: player.username
    })),
    maxPlayers: game.maxPlayers,
    active: game.active
  });
});

module.exports = router;