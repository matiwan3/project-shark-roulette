const { login_user } = require('../creds');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Ranking = require('../models/ranking-schema');

const app = express();
const port = 3000;

mongoose.connect(login_user, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use(cors());
app.use(express.json());

app.post('/update-ranking', async (req, res) => {
  const { username, score } = req.body;

  try {
    // Find current top 3 rankings
    let currentRankings = await Ranking.find().sort({ score: -1 }).limit(3);

    let foundExistingUser = false;
    for (let i = 0; i < currentRankings.length; i++) {
      if (currentRankings[i].name === username) {
        // Update existing user's score if new score is higher
        if (score > currentRankings[i].score) {
          currentRankings[i].score = score;
        }
        foundExistingUser = true;
        break;
      }
    }

    if (!foundExistingUser) {
      if (currentRankings.length < 3) {
        // If there are less than 3 rankings, add the new user
        currentRankings.push(new Ranking({ name: username, score }));
      } else {
        // If there are already 3 rankings, replace the lowest score if the new score is higher
        currentRankings = currentRankings.sort((a, b) => a.score - b.score);
        if (score > currentRankings[0].score) {
          currentRankings[0] = new Ranking({ name: username, score });
        }
      }
    }

    // Clear and insert updated rankings
    await Ranking.deleteMany({});
    await Ranking.insertMany(currentRankings);

    // Return updated rankings sorted in ascending order
    const finalRankings = await Ranking.find().sort({ score: -1 }).limit(3);
    const response = finalRankings.map((rank, index) => ({
      id: index + 1,
      name: rank.name,
      score: rank.score,
    }));

    console.log('Updated rankings:', response);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

