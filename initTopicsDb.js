const pool = require('./db');

async function initTopicsDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS topics (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        order_index INTEGER DEFAULT 0
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subtopics (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        order_index INTEGER DEFAULT 0
      );
    `);

    await pool.query(`
      ALTER TABLE subtopics ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES subtopics(id) ON DELETE CASCADE;
    `);

    await pool.query(`
      ALTER TABLE mcqs ADD COLUMN IF NOT EXISTS topic_id INTEGER REFERENCES topics(id);
    `);

    await pool.query(`
      ALTER TABLE mcqs ADD COLUMN IF NOT EXISTS subtopic_id INTEGER REFERENCES subtopics(id);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        mcq_id INTEGER REFERENCES mcqs(id),
        is_read BOOLEAN DEFAULT false,
        is_favorite BOOLEAN DEFAULT false,
        read_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Topics DB initialized successfully');
    return { success: true };
  } catch (err) {
    console.error('❌ Error initializing topics DB:', err);
    return { success: false, error: err.message };
  }
}

module.exports = initTopicsDb;
