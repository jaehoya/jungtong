const mongoose = require('mongoose');

const gameScoreSchema = new mongoose.Schema({
  gameType: {
    type: String,
    required: true,
    enum: ['timing_game', 'fast_hand_game'], // Define possible game types
  },
  round: {
    type: Number,
    required: true,
    min: 1,
    max: 3, // Assuming 3 rounds per game
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const GameScore = mongoose.model('GameScore', gameScoreSchema);

module.exports = GameScore;
