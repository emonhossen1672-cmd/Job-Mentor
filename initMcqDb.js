const pool = require('./db');

async function initMcqTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS mcqs (
      id SERIAL PRIMARY KEY,
      subject VARCHAR(100) NOT NULL,
      chapter VARCHAR(100),
      topic VARCHAR(100),
      question TEXT NOT NULL,

      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,

      correct_answer CHAR(1) NOT NULL,
      explanation TEXT,

      difficulty VARCHAR(20) DEFAULT 'Easy',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("✅ MCQ Table Ready");
}

module.exports = initMcqTable;
