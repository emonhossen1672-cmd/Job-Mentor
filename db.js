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

// সার্ভার চালু হওয়ার সময় একবার চেক করে প্রয়োজনীয় কলাম যোগ করে দেয় (না থাকলে)
async function ensureColumns() {
  try {
    await pool.query(`
      ALTER TABLE topics ADD COLUMN IF NOT EXISTS category VARCHAR(30) DEFAULT 'bcs'
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category)
    `);
    await pool.query(`
      ALTER TABLE exam_papers ADD COLUMN IF NOT EXISTS category VARCHAR(30) DEFAULT 'bcs'
    `);
    await pool.query(`
      ALTER TABLE exam_papers ADD COLUMN IF NOT EXISTS exam_type VARCHAR(10) DEFAULT 'preli'
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_exam_papers_category ON exam_papers(category)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_exam_papers_exam_type ON exam_papers(exam_type)
    `);
    console.log('✅ সব কলাম নিশ্চিত করা হয়েছে');
  } catch (err) {
    console.error('❌ কলাম যোগ করতে সমস্যা:', err.message);
  }
}

ensureColumns();

module.exports = pool;
