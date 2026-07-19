const express = require('express');
const pool = require('./db');
const router = express.Router();

// সব টপিক লিস্ট (প্রশ্ন সংখ্যা, সাবটপিক সংখ্যা, লাইক ও প্রগ্রেস সহ) — category filter সহ
router.get('/topics', async (req, res) => {
  try {
    const { category, uid } = req.query;
    let query = `
      SELECT t.id, t.name, t.order_index, t.category,
        (SELECT COUNT(*) FROM mcqs WHERE topic_id = t.id) AS question_count,
        (SELECT COUNT(*) FROM subtopics WHERE topic_id = t.id) AS subtopic_count,
        (SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id) AS like_count,
        ${uid ? `(SELECT COUNT(*) FROM topic_likes WHERE topic_id = t.id AND user_uid = $${category ? 2 : 1}) AS is_liked,` : `0 AS is_liked,`}
        ${uid ? `(SELECT COUNT(*) FROM viewed_questions vq JOIN mcqs m ON vq.mcq_id = m.id WHERE m.topic_id = t.id AND vq.user_uid = $${category ? 2 : 1}) AS viewed_count` : `0 AS viewed_count`}
      FROM topics t
    `;
    const params = [];
    if (category) {
      query += ' WHERE t.category = $1';
      params.push(category);
    }
    if (uid) params.push(uid);
    query += ' ORDER BY t.order_index';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// একটা টপিক লাইক/আনলাইক টগল করা
router.post('/topics/:topicId/like', async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: 'uid প্রয়োজন' });
    const existing = await pool.query(
      'SELECT id FROM topic_likes WHERE user_uid = $1 AND topic_id = $2',
      [uid, req.params.topicId]
    );
    let liked;
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM topic_likes WHERE user_uid = $1 AND topic_id = $2', [uid, req.params.topicId]);
      liked = false;
    } else {
      await pool.query('INSERT INTO topic_likes (user_uid, topic_id) VALUES ($1, $2)', [uid, req.params.topicId]);
      liked = true;
    }
    const countRes = await pool.query('SELECT COUNT(*) FROM topic_likes WHERE topic_id = $1', [req.params.topicId]);
    res.json({ liked, like_count: parseInt(countRes.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// একটা টপিকের সব সাবটপিক (শুধু টপ-লেভেল, parent_id NULL) — লাইক ও প্রগ্রেস সহ
router.get('/topics/:topicId/subtopics', async (req, res) => {
  try {
    const { uid } = req.query;
    const result = await pool.query(`
      SELECT s.id, s.name, s.order_index,
        (SELECT COUNT(*) FROM mcqs WHERE subtopic_id = s.id) AS question_count,
        (SELECT COUNT(*) FROM subtopics WHERE parent_id = s.id) AS subtopic_count,
        (SELECT COUNT(*) FROM subtopic_likes WHERE subtopic_id = s.id) AS like_count,
        ${uid ? `(SELECT COUNT(*) FROM subtopic_likes WHERE subtopic_id = s.id AND user_uid = $2) AS is_liked,` : `0 AS is_liked,`}
        ${uid ? `(SELECT COUNT(*) FROM viewed_questions vq JOIN mcqs m ON vq.mcq_id = m.id WHERE m.subtopic_id = s.id AND vq.user_uid = $2) AS viewed_count` : `0 AS viewed_count`}
      FROM subtopics s
      WHERE s.topic_id = $1 AND s.parent_id IS NULL
      ORDER BY s.order_index
    `, uid ? [req.params.topicId, uid] : [req.params.topicId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// একটা সাবটপিকের ভেতরের সাব-সাবটপিক (৩য় লেভেল) — লাইক ও প্রগ্রেস সহ
router.get('/subtopics/:subtopicId/subtopics', async (req, res) => {
  try {
    const { uid } = req.query;
    const result = await pool.query(`
      SELECT s.id, s.name, s.order_index,
        (SELECT COUNT(*) FROM mcqs WHERE subtopic_id = s.id) AS question_count,
        (SELECT COUNT(*) FROM subtopic_likes WHERE subtopic_id = s.id) AS like_count,
        ${uid ? `(SELECT COUNT(*) FROM subtopic_likes WHERE subtopic_id = s.id AND user_uid = $2) AS is_liked,` : `0 AS is_liked,`}
        ${uid ? `(SELECT COUNT(*) FROM viewed_questions vq JOIN mcqs m ON vq.mcq_id = m.id WHERE m.subtopic_id = s.id AND vq.user_uid = $2) AS viewed_count` : `0 AS viewed_count`}
      FROM subtopics s
      WHERE s.parent_id = $1
      ORDER BY s.order_index
    `, uid ? [req.params.subtopicId, uid] : [req.params.subtopicId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// একটা সাবটপিক লাইক/আনলাইক টগল করা
router.post('/subtopics/:subtopicId/like', async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: 'uid প্রয়োজন' });
    const existing = await pool.query(
      'SELECT id FROM subtopic_likes WHERE user_uid = $1 AND subtopic_id = $2',
      [uid, req.params.subtopicId]
    );
    let liked;
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM subtopic_likes WHERE user_uid = $1 AND subtopic_id = $2', [uid, req.params.subtopicId]);
      liked = false;
    } else {
      await pool.query('INSERT INTO subtopic_likes (user_uid, subtopic_id) VALUES ($1, $2)', [uid, req.params.subtopicId]);
      liked = true;
    }
    const countRes = await pool.query('SELECT COUNT(*) FROM subtopic_likes WHERE subtopic_id = $1', [req.params.subtopicId]);
    res.json({ liked, like_count: parseInt(countRes.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// একটা টপিকের প্রশ্ন — পেজিনেশন সহ (All Questions বাটন)
router.get('/topics/:topicId/mcqs', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize) || 50);
    const offset = (page - 1) * pageSize;

    const countRes = await pool.query('SELECT COUNT(*) FROM mcqs WHERE topic_id = $1', [req.params.topicId]);
    const totalCount = parseInt(countRes.rows[0].count);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const result = await pool.query(
      'SELECT * FROM mcqs WHERE topic_id = $1 ORDER BY id LIMIT $2 OFFSET $3',
      [req.params.topicId, pageSize, offset]
    );
    res.json({ data: result.rows, page, pageSize, totalCount, totalPages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// একটা টপিক থেকে র‍্যান্ডম কুইজ (Random Quiz বাটন)
router.get('/topics/:topicId/random-quiz', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const result = await pool.query(
      'SELECT * FROM mcqs WHERE topic_id = $1 ORDER BY RANDOM() LIMIT $2',
      [req.params.topicId, limit]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// একটা সাবটপিকের প্রশ্ন — পেজিনেশন সহ
router.get('/subtopics/:subtopicId/mcqs', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize) || 50);
    const offset = (page - 1) * pageSize;

    const countRes = await pool.query('SELECT COUNT(*) FROM mcqs WHERE subtopic_id = $1', [req.params.subtopicId]);
    const totalCount = parseInt(countRes.rows[0].count);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const result = await pool.query(
      'SELECT * FROM mcqs WHERE subtopic_id = $1 ORDER BY id LIMIT $2 OFFSET $3',
      [req.params.subtopicId, pageSize, offset]
    );
    res.json({ data: result.rows, page, pageSize, totalCount, totalPages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// একটা সাবটপিক থেকে র‍্যান্ডম কুইজ
router.get('/subtopics/:subtopicId/random-quiz', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const result = await pool.query(
      'SELECT * FROM mcqs WHERE subtopic_id = $1 ORDER BY RANDOM() LIMIT $2',
      [req.params.subtopicId, limit]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// একটা প্রশ্ন "দেখা হয়েছে" হিসেবে চিহ্নিত করা (প্রগ্রেস ট্র্যাকিং)
router.post('/mcqs/:mcqId/mark-viewed', async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: 'uid প্রয়োজন' });
    await pool.query(
      'INSERT INTO viewed_questions (user_uid, mcq_id) VALUES ($1, $2) ON CONFLICT (user_uid, mcq_id) DO NOTHING',
      [uid, req.params.mcqId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// একসাথে অনেকগুলো প্রশ্ন "দেখা হয়েছে" মার্ক করা (Mark all as read বাটন)
router.post('/mcqs/mark-viewed-bulk', async (req, res) => {
  try {
    const { uid, ids } = req.body;
    if (!uid || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'uid ও ids প্রয়োজন' });
    }
    const values = ids.map((_, i) => `($1, $${i + 2})`).join(',');
    await pool.query(
      `INSERT INTO viewed_questions (user_uid, mcq_id) VALUES ${values} ON CONFLICT (user_uid, mcq_id) DO NOTHING`,
      [uid, ...ids]
    );
    res.json({ success: true, marked: ids.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
