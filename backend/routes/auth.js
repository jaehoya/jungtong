


const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Secret for JWT (should be in .env in a real app)
const jwtSecret = process.env.JWT_SECRET; 

// Register
router.post('/register', async (req, res) => {
  const { name, studentId } = req.body;

  try {
    let user = await User.findOne({ studentId });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }


    user = new User({
      name,
      studentId,
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin,
      },
    };

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: 360000 }, // Token expires in 1 hour (for testing)
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { studentId } = req.body;

  try {
    let user = await User.findOne({ studentId });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin,
      },
    };

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
