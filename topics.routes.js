const express = require('express');
const pool = require('./db');
const router = express.Router();

// সব টপিক লিস্ট (প্রতিটার প্রশ্ন সংখ্যা সহ) — এখন category filter সহ
router.get('/topics', async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT t.id, t.name, t.order_index, t.category,
        (SELECT COUNT(*) FROM mcqs WHERE topic_id = t.id) AS question_count,
        (SELECT COUNT(*) FROM subtopics WHERE topic_id = t.id) AS subtopic_count
      FROM topics t
    `;
    const params = [];
    if (category) {
      query += ' WHERE t.category = $1';
      params.push(category);
    }
    query += ' ORDER BY t.order_index';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// একটা টপিকের সব সাবটপিক
router.get('/topics/:topicId/subtopics', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, s.name, s.order_index,
        (SELECT COUNT(*) FROM mcqs WHERE subtopic_id = s.id) AS question_count
      FROM subtopics s
      WHERE s.topic_id = $1
      ORDER BY s.order_index
    `, [req.params.topicId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// একটা সাবটপিকের সব প্রশ্ন
router.get('/subtopics/:subtopicId/mcqs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM mcqs WHERE subtopic_id = $1 ORDER BY id',
      [req.params.subtopicId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ⚠️ সাময়িক migration route — একবার চালানোর পর ফাইল থেকে মুছে ফেলবেন
router.post('/topics/migrate-category', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    await pool.query(`ALTER TABLE topics ADD COLUMN IF NOT EXISTS category VARCHAR(30) DEFAULT 'bcs'`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category)`);
    res.json({ success: true, message: 'Migration done' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
