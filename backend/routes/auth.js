


const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Secret for JWT (should be in .env in a real app)
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error('!!! FATAL ERROR: JWT_SECRET is not defined.            !!!');
  console.error('!!! The server will run but authentication will fail.  !!!');
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  // process.exit(1); // Temporarily disabled for debugging
}

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
        name: user.name, // Add name to payload
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
