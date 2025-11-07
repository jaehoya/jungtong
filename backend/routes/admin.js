const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const User = require('../models/User');
const GameScore = require('../models/GameScore');

// Middleware stack for MC routes
const adminAuth = [authMiddleware, adminMiddleware];

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private (MC)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().sort({ studentId: 1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user and their scores
// @access  Private (MC)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    // First, delete all scores associated with the user
    await GameScore.deleteMany({ user: userId });
    // Then, delete the user
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ msg: 'User and their scores have been deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/users
// @desc    Add a new user
// @access  Private (MC)
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

// @route   POST api/admin/users/bulk
// @desc    Bulk add new users
// @access  Private (MC)
router.post('/users/bulk', adminAuth, async (req, res) => {
  const users = req.body;
  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ msg: 'Invalid input, expected an array of users.' });
  }

  try {
    // Extract student IDs from the input
    const incomingStudentIds = users.map(u => u.studentId);

    // Find which of the incoming student IDs already exist in the DB
    const existingUsers = await User.find({ studentId: { $in: incomingStudentIds } }).select('studentId');
    const existingStudentIds = new Set(existingUsers.map(u => u.studentId));

    // Filter out users that already exist
    const newUsers = users.filter(u => !existingStudentIds.has(u.studentId));

    if (newUsers.length === 0) {
      return res.status(200).json({
        msg: 'All users provided already exist. No new users were added.',
        added: 0,
        duplicates: users.length
      });
    }

    // Insert the new users
    const insertedUsers = await User.insertMany(newUsers, { ordered: false });

    res.status(201).json({
      msg: `Successfully added ${insertedUsers.length} new users.`,
      added: insertedUsers.length,
      duplicates: users.length - insertedUsers.length
    });

  } catch (err) {
    console.error('Bulk user import error:', err);
    res.status(500).send('Server Error');
  }
});


// @route   DELETE api/admin/leaderboard/:gameType
// @desc    Reset the leaderboard for a specific game
// @access  Private (MC)
router.delete('/leaderboard/:gameType', adminAuth, async (req, res) => {
  try {
    const { gameType } = req.params;
    const { round } = req.query; // Get optional round from query string

    if (!['timing_game', 'fast_hand_game'].includes(gameType)) {
      return res.status(400).json({ msg: 'Invalid game type' });
    }

    const query = { gameType };
    let message = `${gameType} leaderboard has been reset`;

    if (round) {
      const roundNum = parseInt(round, 10);
      if (![1, 2, 3].includes(roundNum)) {
        return res.status(400).json({ msg: 'Invalid round number' });
      }
      query.round = roundNum;
      message = `${gameType} round ${round} leaderboard has been reset`;
    }

    await GameScore.deleteMany(query);
    
    res.json({ msg: message });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/game/visibility
// @desc    Set game visibility
// @access  Private (MC)
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
// @access  Private (MC)
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

