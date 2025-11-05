const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const GameScore = require('../models/GameScore');
const User = require('../models/User');

// @route   POST api/admin/users
// @desc    Add a new user
// @access  Admin
router.post('/users', [auth, admin], async (req, res) => {
  const { name, studentId, isAdmin } = req.body;

  try {
    let user = await User.findOne({ studentId });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      studentId,
      isAdmin: isAdmin || false,
    });

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/leaderboard
// @desc    Clear leaderboard
// @access  Admin
router.delete('/leaderboard', [auth, admin], async (req, res) => {
  try {
    await GameScore.deleteMany({});
    res.json({ msg: 'Leaderboard cleared' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
