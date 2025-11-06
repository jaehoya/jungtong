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
    // Check if the user has already played this round
    const existingScore = await GameScore.findOne({ user: req.user.id, gameType, round });
    if (existingScore) {
      return res.status(400).json({ msg: 'You have already played this round' });
    }

    const newScore = new GameScore({
      user: req.user.id,
      gameType,
      round,
      score,
    });
    const savedScore = await newScore.save();
    res.json(savedScore);
  } catch (err) {
    console.error('Score submission error:', err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/game/leaderboard/:gameType/:round
// @desc    Get leaderboard for a specific game and round
// @access  Public
router.get('/leaderboard/:gameType/:round', async (req, res) => {
  try {
    const { gameType, round } = req.params;
    const sortOrder = gameType === 'timing_game' ? 1 : -1; // 1 for ascending, -1 for descending

    const leaderboard = await GameScore.find({ gameType, round })
      .sort({ score: sortOrder })
      .limit(10)
      .populate('user', ['name', 'studentId']);
    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;