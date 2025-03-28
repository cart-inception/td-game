const express = require('express');
const router = express.Router();

// Simple in-memory user store (would use MongoDB in production)
const users = [];

// Get all users
router.get('/', (req, res) => {
  res.json(users.map(user => ({
    id: user.id,
    username: user.username
  })));
});

// Create new user (simplified registration)
router.post('/', (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  // Check if username already exists
  if (users.find(user => user.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    username,
    createdAt: new Date()
  };
  
  users.push(newUser);
  
  res.status(201).json({
    id: newUser.id,
    username: newUser.username
  });
});

// Get user by ID
router.get('/:id', (req, res) => {
  const user = users.find(user => user.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    id: user.id,
    username: user.username
  });
});

module.exports = router;