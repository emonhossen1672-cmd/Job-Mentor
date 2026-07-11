// PostgreSQL কানেকশন
// Render.com এ PostgreSQL ডাটাবেজ তৈরি করলে ওরা একটা "Internal Database URL" দেয়,
// সেটাই DATABASE_URL হিসেবে .env এ (Render dashboard এর Environment ট্যাবে) বসাতে হবে

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected DB error:', err);
});

module.exports = pool;
