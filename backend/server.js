
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const db = require('./db');
const es = require('./elasticsearch');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({ dest: uploadsDir, limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB limit
const BACKEND_URL = process.env.BACKEND_URL || ''

app.get('/api/items', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '0', 10);
    const limit = 10;
    const offset = page * limit;
    const result = await db.query(
      'SELECT id, title, description, created_at, file_location, processing, status FROM items ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    const countResult = await db.query('SELECT COUNT(*) as total FROM items');
    const total = parseInt(countResult.rows[0].total, 10);
    return res.json({ items: result.rows, total, page, limit });
  } catch (err) {
    console.error('GET /api/items error', err);
    return res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.get('/api/items/search', async (req, res) => {
  const { q, page } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  try {
    const query = q.trim();
    const pageNum = parseInt(page || '0', 10);
    const limit = 10;
    
    // Use Elasticsearch for search
    const { items, total } = await es.searchItems(query, pageNum, limit);
    return res.json({ items, total, page: pageNum, limit });
  } catch (err) {
    console.error('GET /api/items/search error', err);
    return res.status(500).json({ error: 'Search failed' });
  }
});

app.post('/api/items', async (req, res) => {
  const { title, description } = req.body || {};
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    const result = await db.query(
      'INSERT INTO items (title, description, file_location) VALUES ($1, $2, $3) RETURNING id, title, description, created_at, file_location',
      [title.trim(), description || null, null]
    );
    const item = result.rows[0];
    // Index in Elasticsearch
    await es.indexItem(item);
    return res.status(201).json(item);
  } catch (err) {
    console.error('POST /api/items error', err);
    return res.status(500).json({ error: 'Failed to create item' });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File is required' });

  const title = (req.body && req.body.title) ? String(req.body.title).trim() : req.file.originalname
  const fileLocationPath = `/uploads/${req.file.filename}`
  const fileLocation = BACKEND_URL ? `${BACKEND_URL}${fileLocationPath}` : fileLocationPath

  // insert placeholder row indicating processing
  let created
  try {
    const insert = await db.query(
      'INSERT INTO items (title, description, file_location, processing, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, description, created_at, file_location, processing, status',
      [title || req.file.originalname, null, fileLocation, true, 'queued']
    )
    created = insert.rows[0]
    // Index placeholder in Elasticsearch
    await es.indexItem(created)
  } catch (err) {
    console.error('DB insert placeholder error', err)
    return res.status(500).json({ error: 'Failed to save upload placeholder' })
  }

  // background extraction to avoid blocking response
  ;(async function extractAndUpdate() {
    let extracted = null
    try {
      const stream = fs.createReadStream(req.file.path)
      const tikaRes = await axios.put('http://localhost:9998/tika', stream, {
        headers: { 'Content-Type': 'application/octet-stream' },
        responseType: 'text',
        timeout: 30000,
      })
      extracted = String(tikaRes.data || '').trim()
      // strip HTML/XML tags and decode entities
      extracted = extracted.replace(/<[^>]+>/g, '') // remove all tags
      extracted = extracted.replace(/&[#a-z0-9]+;/gi, '') // remove HTML entities like &#0; and &nbsp;
      extracted = extracted.replace(/\s+/g, ' ').trim() // collapse whitespace
      // filter out metadata: remove lines that are key-value pairs (metadata fields)
      const lines = extracted.split(/[\n;]/) // split by newline or semicolon
      const contentLines = lines.filter(line => {
        const trimmed = line.trim()
        // skip empty lines and metadata patterns like "Author: ...", "Created: ...", etc.
        if (!trimmed) return false
        if (/^[A-Za-z\s]+:\s*/.test(trimmed)) return false
        // skip mailto and other protocol links
        if (/^(mailto|http|https):/.test(trimmed)) return false
        return true
      })
      extracted = contentLines.join('\n').trim()
      // sanitize and truncate
      extracted = extracted.replace(/[\x00-\x08\x0B-\x1F]/g, '')
      if (extracted.length > 100000) extracted = extracted.slice(0, 100000) + '\n\n[truncated]'

      await db.query('UPDATE items SET description=$1, processing=$2, status=$3 WHERE id=$4', [extracted, false, 'done', created.id])
      
      // Update Elasticsearch index
      await es.updateItem(created.id, {
        description: extracted,
        processing: false,
        status: 'done'
      })
    } catch (err) {
      console.error('Background extraction error', err && err.message ? err.message : err)
      try {
        await db.query('UPDATE items SET processing=$1, status=$2 WHERE id=$3', [false, 'failed', created.id])
      } catch (e) {
        console.error('Failed to update item status after extraction error', e)
      }
    }
  })()

  return res.status(202).json(created)
})

app.use('/uploads', express.static(uploadsDir));

app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.get('/api/items/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10)
  if (!id) return res.status(400).json({ error: 'Invalid id' })
  try {
    const result = await db.query('SELECT id, title, description, created_at, file_location, processing, status FROM items WHERE id=$1', [id])
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' })
    return res.json(result.rows[0])
  } catch (err) {
    console.error('GET /api/items/:id error', err)
    return res.status(500).json({ error: 'Failed to fetch item' })
  }
})
const port = process.env.PORT || 4000;

// Initialize Elasticsearch index
es.initIndex().then(() => {
  app.listen(port, () => console.log(`Backend listening on ${port}`));
});
