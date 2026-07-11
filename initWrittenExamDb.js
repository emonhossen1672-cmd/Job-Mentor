// অ্যাপ চালু হওয়ার সময় নিজে থেকেই দরকারি টেবিল তৈরি করে নেয়
const pool = require('./db');

async function initWrittenExamTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS written_questions (
        id SERIAL PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        question_text TEXT NOT NULL,
        marks INT NOT NULL DEFAULT 20,
        model_answer TEXT NOT NULL,
        time_limit_minutes INT DEFAULT 30,
        created_by INT REFERENCES admins(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS written_submissions (
        id SERIAL PRIMARY KEY,
        student_id INT NOT NULL REFERENCES users(id),
        question_id INT NOT NULL REFERENCES written_questions(id),
        image_urls TEXT[] NOT NULL,
        file_type VARCHAR(10) NOT NULL DEFAULT 'image',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        submitted_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS written_evaluations (
        id SERIAL PRIMARY KEY,
        submission_id INT NOT NULL UNIQUE REFERENCES written_submissions(id),
        ai_score NUMERIC(5,2),
        ai_feedback JSONB,
        admin_score NUMERIC(5,2),
        admin_comment TEXT,
        final_status VARCHAR(20) NOT NULL DEFAULT 'ai_evaluated',
        evaluated_at TIMESTAMP DEFAULT NOW(),
        approved_at TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_submissions_status ON written_submissions(status);
      CREATE INDEX IF NOT EXISTS idx_submissions_student ON written_submissions(student_id);

      -- টেস্ট করার জন্য একটা ডেমো student ও admin, যদি আগে থেকে না থাকে
      INSERT INTO users (id, name, phone) VALUES (1, 'ডেমো স্টুডেন্ট', '01700000000')
        ON CONFLICT (id) DO NOTHING;
      INSERT INTO admins (id, name, email) VALUES (1, 'Emon', 'admin@uttoron.app')
        ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ সব টেবিল প্রস্তুত আছে');
  } catch (err) {
    console.error('❌ টেবিল তৈরি করতে সমস্যা হয়েছে:', err.message);
  }
}

module.exports = initWrittenExamTables;
