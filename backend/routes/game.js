const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const GameScore = require('../models/GameScore');
const User = require('../models/User');


// Submit Game Score
router.post('/score', auth, async (req, res) => {
  const { gameType, round, score } = req.body;

  try {
    const newScore = new GameScore({
      gameType,
      round,
      user: req.user.id,
      score,
    });

    const gameScore = await newScore.save();
    res.json(gameScore);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// Get Leaderboard for a specific game and round
router.get('/leaderboard/:gameType/:round', auth, async (req, res) => {
  try {
    const leaderboard = await GameScore.find({
      gameType: req.params.gameType,
      round: req.params.round,
    })
      .sort({ score: -1 }) // Sort by score descending
      .populate('user', ['name', 'studentId'])
      .limit(10); // Top 10 scores

    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// Admin route to start a game (example - this would be more complex in a real app)
router.post('/admin/start-game', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ msg: 'Admin access required' });
    }

    // Logic to start a game - for now, just a confirmation
    res.json({ msg: 'Game started by admin' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;