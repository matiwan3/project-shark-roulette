const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Ranking = mongoose.model('Ranking', rankingSchema, 'ranks');

module.exports = Ranking;
