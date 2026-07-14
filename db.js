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

// সার্ভার চালু হওয়ার সময় একবার চেক করে category কলাম যোগ করে দেয় (না থাকলে)
async function ensureCategoryColumn() {
  try {
    await pool.query(`
      ALTER TABLE topics ADD COLUMN IF NOT EXISTS category VARCHAR(30) DEFAULT 'bcs'
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category)
    `);
    console.log('✅ topics.category কলাম নিশ্চিত করা হয়েছে');
  } catch (err) {
    console.error('❌ category কলাম যোগ করতে সমস্যা:', err.message);
  }
}

ensureCategoryColumn();
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

// সার্ভার চালু হওয়ার সময় একবার চেক করে category কলাম যোগ করে দেয় (না থাকলে)
async function ensureCategoryColumn() {
  try {
    await pool.query(`
      ALTER TABLE topics ADD COLUMN IF NOT EXISTS category VARCHAR(30) DEFAULT 'bcs'
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category)
    `);
    console.log('✅ topics.category কলাম নিশ্চিত করা হয়েছে');
  } catch (err) {
    console.error('❌ category কলাম যোগ করতে সমস্যা:', err.message);
  }
}

// ⚠️ সাময়িক — সব bcs টপিককে topic_guru তে একবার সরিয়ে দেয়
async function reassignBcsToTopicGuru() {
  try {
    const result = await pool.query(
      `UPDATE topics SET category = 'topic_guru' WHERE category = 'bcs'`
    );
    console.log(`✅ ${result.rowCount}টি টপিক topic_guru তে সরানো হয়েছে`);
  } catch (err) {
    console.error('❌ টপিক সরাতে সমস্যা:', err.message);
  }
}

async function init() {
  await ensureCategoryColumn();
  await reassignBcsToTopicGuru();
}

init();

module.exports = pool;

module.exports = pool;
