const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Ranking = require('./models/ranking'); // Import your MongoDB model

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Endpoint to add a new ranking
app.post('/rankings', async (req, res) => {
  try {
    const { playerName, score } = req.body;

    // Create a new ranking document
    const newRanking = new Ranking({ playerName, score });

    // Save the ranking document to MongoDB
    await newRanking.save();

    // Respond with the saved ranking object
    res.status(201).json(newRanking);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: 'Error saving ranking', error });
  }
});

// Endpoint to get leaderboard rankings
app.get('/rankings', async (req, res) => {
  try {
    // Fetch rankings from MongoDB, sort by score descending, limit to 10
    const rankings = await Ranking.find().sort({ score: -1 }).limit(10);
    res.json(rankings);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: 'Error fetching rankings', error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
