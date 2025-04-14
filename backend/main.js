const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');  // Import the CORS package
require('dotenv').config();

const app = express();

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

// MySQL pool
const db = mysql.createPool({
  host: process.env.SQL_HOSTNAME,
  user: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DBNAME,
});

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Movie API is running' });
});

// Add a movie
app.post('/movies', async (req, res) => {
  const { name, release_date, genre } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO movies (name, release_date, genre) VALUES (?, ?, ?)',
      [name, release_date, genre]
    );
    res.json({ message: 'Movie added', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add movie' });
  }
});

// Update a movie
app.put('/movies/:id', async (req, res) => {
  const { id } = req.params;
  const { name, release_date, genre } = req.body;
  try {
    await db.execute(
      'UPDATE movies SET name = ?, release_date = ?, genre = ? WHERE id = ?',
      [name, release_date, genre, id]
    );
    res.json({ message: 'Movie updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update movie' });
  }
});

// Delete a movie
app.delete('/movies/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM movies WHERE id = ?', [id]);
    res.json({ message: 'Movie deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

// Get all movies
app.get('/movies', async (req, res) => {
  try {
    const [movies] = await db.execute('SELECT * FROM movies');
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
