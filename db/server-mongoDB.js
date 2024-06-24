// Author: SuperGoat aka matiwan3 
// To run simply use `node server.js`
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const os = require('os');
const { login_user } = require('../creds');

// app setup
const app = express();
const port = 3000;

const appUri = `http://localhost:${port}`;
let currentDate = new Date();

let dateTime = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

app.use((req, res, next) => {
  const currentDate = new Date();
  dateTime = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
  next();
});

// MongoDB setup
const client = new MongoClient(login_user, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.json());

app.post('/update-ranking', async (req, res) => {
  const { username, score } = req.body;
  console.log(`[MongoDB at ${dateTime}] Captured following data: ${username}, ${score}`);

  try {
    await client.connect();
    console.log(`[MongoDB at ${dateTime}] Updating session started`);
    const db = client.db('ranking');
    const collection = db.collection('1500');

    // Find if the user already exists
    const existingUser = await collection.findOne({ name: username });

    if (existingUser) {
      // If user exists, update the score if the new score is higher
      if (score > existingUser.score) {
        await collection.updateOne(
          { name: username },
          { $set: { score: score } }
        );
      }
    } else {
      // If user does not exist, insert the new record
      await collection.insertOne({ name: username, score: score });
    }

    // Get the top 10 scores sorted in descending order
    const topScores = await collection.find({}).sort({ score: -1 }).limit(10).toArray();

    // Delete records that are not in the top 10
    await collection.deleteMany({
      _id: { $nin: topScores.map(record => record._id) }
    });

    console.log(`[MongoDB at ${dateTime}] Updating session completed`);
    res.json(topScores);
  } catch (err) {
    console.error(`[MongoDB at ${dateTime}] Error updating ranking:`, err);
    res.status(500).send(`[MongoDB at ${dateTime}] Internal Server Error`);
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`[SERVER at ${dateTime}] Running app at: ${appUri}`);
});
