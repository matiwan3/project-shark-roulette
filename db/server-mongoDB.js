// Author: SuperGoat aka matiwan3 
// To run simply use `node server.js`
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const os = require('os');
const { login_user } = require('../creds');

// app setup
const app = express();
const port = 3000;
const networkInterfaces = os.networkInterfaces();
const localIP = networkInterfaces['Ethernet'][1].address;
const appUri = `http://${localIP}:${port}`;

// MongoDB setup
const client = new MongoClient(login_user, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.json());

app.post('/update-ranking', async (req, res) => {
  const { username, score } = req.body;
  console.log(`[MongoDB] Captured following data: ${username}, ${score}`);

  try {
    await client.connect();
    console.log('[MongoDB] Updating session started');
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

    // Get the top 3 scores sorted in descending order
    const topScores = await collection.find({}).sort({ score: -1 }).limit(3).toArray();

    // Delete records that are not in the top 3
    await collection.deleteMany({
      _id: { $nin: topScores.map(record => record._id) }
    });

    console.log('[MongoDB] Updating session completed');
    res.json(topScores);
  } catch (err) {
    console.error('[MongoDB] Error updating ranking:', err);
    res.status(500).send('[MongoDB] Internal Server Error');
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Running app at: ${appUri}`);
});
