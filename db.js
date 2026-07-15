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

// সার্ভার চালু হওয়ার সময় একবার চেক করে প্রয়োজনীয় কলাম/টেবিল যোগ করে দেয় (না থাকলে)
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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS model_tests (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(30) DEFAULT 'bcs',
        exam_type VARCHAR(10) DEFAULT 'preli',
        duration_minutes INTEGER DEFAULT 60,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS model_test_questions (
        id SERIAL PRIMARY KEY,
        model_test_id INTEGER REFERENCES model_tests(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_answer VARCHAR(1) NOT NULL,
        explanation TEXT,
        order_index INTEGER DEFAULT 0
      )
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_model_test_questions_test_id ON model_test_questions(model_test_id)
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS written_model_tests (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(30) DEFAULT 'bcs',
        duration_minutes INTEGER DEFAULT 90,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS written_model_test_questions (
        id SERIAL PRIMARY KEY,
        model_test_id INTEGER REFERENCES written_model_tests(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        marks INTEGER DEFAULT 10,
        order_index INTEGER DEFAULT 0
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS written_model_test_submissions (
        id SERIAL PRIMARY KEY,
        model_test_id INTEGER REFERENCES written_model_tests(id) ON DELETE CASCADE,
        student_name VARCHAR(255) NOT NULL,
        answers JSONB NOT NULL,
        total_score INTEGER,
        admin_feedback TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        submitted_at TIMESTAMP DEFAULT NOW()
      )
    `);
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

// সার্ভার চালু হওয়ার সময় একবার চেক করে প্রয়োজনীয় কলাম/টেবিল যোগ করে দেয় (না থাকলে)
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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS model_tests (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(30) DEFAULT 'bcs',
        exam_type VARCHAR(10) DEFAULT 'preli',
        duration_minutes INTEGER DEFAULT 60,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS model_test_questions (
        id SERIAL PRIMARY KEY,
        model_test_id INTEGER REFERENCES model_tests(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_answer VARCHAR(1) NOT NULL,
        explanation TEXT,
        order_index INTEGER DEFAULT 0
      )
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_model_test_questions_test_id ON model_test_questions(model_test_id)
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS written_model_tests (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(30) DEFAULT 'bcs',
        duration_minutes INTEGER DEFAULT 90,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS written_model_test_questions (
        id SERIAL PRIMARY KEY,
        model_test_id INTEGER REFERENCES written_model_tests(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        marks INTEGER DEFAULT 10,
        order_index INTEGER DEFAULT 0
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS written_model_test_submissions (
        id SERIAL PRIMARY KEY,
        model_test_id INTEGER REFERENCES written_model_tests(id) ON DELETE CASCADE,
        student_name VARCHAR(255) NOT NULL,
        answers JSONB NOT NULL,
        total_score INTEGER,
        admin_feedback TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        submitted_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_written_model_test_questions_test_id ON written_model_test_questions(model_test_id)
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS model_test_submissions (
        id SERIAL PRIMARY KEY,
        model_test_id INTEGER REFERENCES model_tests(id) ON DELETE CASCADE,
        student_name VARCHAR(255) NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        submitted_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_model_test_submissions_student ON model_test_submissions(student_name)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_written_model_test_submissions_student ON written_model_test_submissions(student_name)
    `);
    console.log('✅ সব কলাম ও টেবিল নিশ্চিত করা হয়েছে');
  } catch (err) {
    console.error('❌ কলাম/টেবিল যোগ করতে সমস্যা:', err.message);
  }
}

ensureColumns();

module.exports = pool;

    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_written_model_test_questions_test_id ON written_model_test_questions(model_test_id)
    `);
    console.log('✅ সব কলাম ও টেবিল নিশ্চিত করা হয়েছে');
  } catch (err) {
    console.error('❌ কলাম/টেবিল যোগ করতে সমস্যা:', err.message);
  }
}

ensureColumns();

module.exports = pool;
