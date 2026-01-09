
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({ dest: uploadsDir });

app.get('/api/items', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, title, description, created_at FROM items ORDER BY created_at DESC'
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('GET /api/items error', err);
    return res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', async (req, res) => {
  const { title, description } = req.body || {};
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    const result = await db.query(
      'INSERT INTO items (title, description) VALUES ($1, $2) RETURNING id, title, description, created_at',
      [title.trim(), description || null]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/items error', err);
    return res.status(500).json({ error: 'Failed to create item' });
  }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File is required' });
  return res.json({ filename: req.file.filename, originalname: req.file.originalname, url: `/uploads/${req.file.filename}` });
});

app.use('/uploads', express.static(uploadsDir));

app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend listening on ${port}`));
