const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const User = require('../models/User');
const GameScore = require('../models/GameScore');

// Middleware stack for admin routes
const adminAuth = [authMiddleware, adminMiddleware];

// @route   POST api/admin/users
// @desc    Add a new user
// @access  Private (Admin)
router.post('/users', adminAuth, async (req, res) => {
  const { name, studentId, isAdmin } = req.body;
  try {
    let user = await User.findOne({ studentId });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    user = new User({ name, studentId, isAdmin });
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/leaderboard
// @desc    Reset the leaderboard
// @access  Private (Admin)
router.delete('/leaderboard', adminAuth, async (req, res) => {
  try {
    await GameScore.deleteMany({});
    res.json({ msg: 'Leaderboard has been reset' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/game/visibility
// @desc    Set game visibility
// @access  Private (Admin)
router.post('/game/visibility', adminAuth, (req, res) => {
  const { gameType, isVisible } = req.body;
  if (req.gameState[gameType]) {
    req.gameState[gameType].isVisible = isVisible;
    req.io.emit('gameStateUpdate', req.gameState);
    res.json(req.gameState);
  } else {
    res.status(400).json({ msg: 'Invalid game type' });
  }
});

// @route   POST api/admin/game/set-round
// @desc    Set the current round for a game
// @access  Private (Admin)
router.post('/game/set-round', adminAuth, (req, res) => {
  const { gameType, round } = req.body;
  if (req.gameState[gameType] && [1, 2, 3].includes(round)) {
    req.gameState[gameType].currentRound = round;
    req.io.emit('gameStateUpdate', req.gameState);
    res.json(req.gameState);
  } else {
    res.status(400).json({ msg: 'Invalid game type or round number' });
  }
});

module.exports = router;
