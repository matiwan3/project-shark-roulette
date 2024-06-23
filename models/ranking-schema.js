const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true, // Ensure usernames are unique
    required: true
  },
  score: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Ranking', rankingSchema);
