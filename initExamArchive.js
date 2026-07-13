const pool = require('./db');

async function initExamArchiveDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exam_papers (
        id SERIAL PRIMARY KEY,
        institution_name VARCHAR(255) NOT NULL,
        exam_title VARCHAR(500) NOT NULL,
        post_name VARCHAR(255),
        exam_date DATE,
        file_url TEXT NOT NULL,
        file_type VARCHAR(10) NOT NULL DEFAULT 'pdf',
        subject_tag VARCHAR(100),
        uploaded_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_exam_papers_institution ON exam_papers(institution_name);
    `);
    console.log('✅ Exam archive table ready');
    return { success: true };
  } catch (err) {
    console.error('❌ Error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = initExamArchiveDb;
