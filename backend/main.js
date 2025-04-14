const express = require('express');
const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(express.json());

// MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Endpoint 1: Search anime by title
app.get('/anime/search/:title', async (req, res) => {
  const { title } = req.params;
  try {
    const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${title}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error searching anime' });
  }
});

// Endpoint 2: Get top anime
app.get('/anime/top', async (req, res) => {
  try {
    const response = await axios.get('https://api.jikan.moe/v4/top/anime');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching top anime' });
  }
});

// Endpoint 3: Save anime as favorite
app.post('/anime/favorite', async (req, res) => {
  const { mal_id, title, image_url } = req.body;
  try {
    await db.execute(
      'INSERT INTO favorites (mal_id, title, image_url) VALUES (?, ?, ?)',
      [mal_id, title, image_url]
    );
    res.json({ message: 'Anime saved as favorite' });
  } catch (error) {
    res.status(500).json({ error: 'Error saving favorite' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
