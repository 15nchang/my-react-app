const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/myapp';

const pool = new Pool({ connectionString });

pool.on('error', (err) => {
  console.error('Unexpected pg Pool error', err);
});

async function init() {
  await pool.query(`CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  )`);
}

init().catch((err) => console.error('DB init error', err));

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { query, pool };
