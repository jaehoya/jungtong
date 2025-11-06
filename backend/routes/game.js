const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const GameScore = require('../models/GameScore');

// @route   GET api/game/state
// @desc    Get the current game state
// @access  Public
router.get('/state', (req, res) => {
  res.json(req.gameState);
});

// @route   POST api/game/score
// @desc    Submit score
// @access  Private
router.post('/score', authMiddleware, async (req, res) => {
  const { gameType, round, score } = req.body;
  try {
    const newScore = new GameScore({
      user: req.user.id,
      gameType,
      round,
      score,
    });
    const savedScore = await newScore.save();
    res.json(savedScore);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/game/leaderboard/:gameType/:round
// @desc    Get leaderboard for a specific game and round
// @access  Public
router.get('/leaderboard/:gameType/:round', async (req, res) => {
  try {
    const { gameType, round } = req.params;
    const leaderboard = await GameScore.find({ gameType, round })
      .sort({ score: -1 })
      .limit(10)
      .populate('user', ['name', 'studentId']);
    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;