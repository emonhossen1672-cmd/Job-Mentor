const express = require('express');
const pool = require('./db');
const router = express.Router();

// সব টপিক লিস্ট (প্রতিটার প্রশ্ন সংখ্যা সহ)
router.get('/topics', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.id, t.name, t.order_index,
        (SELECT COUNT(*) FROM mcqs WHERE topic_id = t.id) AS question_count,
        (SELECT COUNT(*) FROM subtopics WHERE topic_id = t.id) AS subtopic_count
      FROM topics t
      ORDER BY t.order_index
    `);
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

module.exports = router;
