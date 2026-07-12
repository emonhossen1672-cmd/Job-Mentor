 // ============================================
// Written Exam Routes + AI Evaluation Logic
// ============================================
// প্রয়োজনীয় প্যাকেজ: express, pg (বা তোমার existing db pool), axios
// .env এ থাকতে হবে: ANTHROPIC_API_KEY=sk-ant-...

const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('./db');

// ---------- Admin পাসওয়ার্ড চেক ----------
function checkAdmin(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized: ভুল বা অনুপস্থিত admin key' });
  }
  next();
}

// ---------- 1. Admin: প্রশ্ন তৈরি ----------
router.post('/admin/written-questions', checkAdmin, async (req, res) => {
  const { subject, question_text, marks, model_answer, time_limit_minutes, admin_id } = req.body;
  if (!subject || !question_text || !model_answer) {
    return res.status(400).json({ error: 'subject, question_text এবং model_answer আবশ্যক' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO written_questions (subject, question_text, marks, model_answer, time_limit_minutes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [subject, question_text, marks || 20, model_answer, time_limit_minutes || 30, admin_id || 1]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'প্রশ্ন তৈরি করা যায়নি' });
  }
});

// ---------- 1b. Admin: সব প্রশ্নের তালিকা (সক্রিয়/নিষ্ক্রিয় সব) ----------
router.get('/admin/written-questions', checkAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM written_questions ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'প্রশ্ন তালিকা লোড করা যায়নি' });
  }
});

// ---------- 1c. Admin: প্রশ্ন এডিট করা ----------
router.put('/admin/written-questions/:id', checkAdmin, async (req, res) => {
  const { id } = req.params;
  const { subject, question_text, marks, model_answer, time_limit_minutes, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE written_questions SET
        subject = COALESCE($1, subject),
        question_text = COALESCE($2, question_text),
        marks = COALESCE($3, marks),
        model_answer = COALESCE($4, model_answer),
        time_limit_minutes = COALESCE($5, time_limit_minutes),
        is_active = COALESCE($6, is_active)
       WHERE id = $7 RETURNING *`,
      [subject, question_text, marks, model_answer, time_limit_minutes, is_active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'প্রশ্ন পাওয়া যায়নি' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'আপডেট করা যায়নি' });
  }
});

// ---------- 1d. Admin: প্রশ্ন ডিলিট করা ----------
router.delete('/admin/written-questions/:id', checkAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM written_questions WHERE id=$1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'প্রশ্ন পাওয়া যায়নি' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ডিলিট করা যায়নি' });
  }
});

// ---------- 2. Student: সক্রিয় প্রশ্ন তালিকা ----------
router.get('/written-questions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, subject, question_text, marks, time_limit_minutes
       FROM written_questions WHERE is_active = true ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'প্রশ্ন লোড করা যায়নি' });
  }
});

// ---------- 3. Student: উত্তর জমা (ছবি অথবা PDF) ----------
router.post('/written-submissions', async (req, res) => {
  const { student_id, question_id, image_urls, file_type } = req.body;
  if (!image_urls || image_urls.length === 0) {
    return res.status(400).json({ error: 'অন্তত একটি ছবি বা PDF আবশ্যক' });
  }
  try {
    const submission = await pool.query(
      `INSERT INTO written_submissions (student_id, question_id, image_urls, file_type, status)
       VALUES ($1,$2,$3,$4,'pending') RETURNING *`,
      [student_id, question_id, image_urls, file_type || 'image']
    );
    res.json({ submission: submission.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'উত্তর জমা দেওয়া যায়নি' });
  }
});

// ---------- 5. Admin: রিভিউ কিউ (যেগুলো এখনো নম্বর দেওয়া হয়নি) ----------
router.get('/admin/written-submissions', checkAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id as submission_id, s.image_urls, s.file_type, s.status, u.name as student_name,
              q.subject, q.question_text, q.marks
       FROM written_submissions s
       LEFT JOIN written_questions q ON s.question_id = q.id
       JOIN users u ON s.student_id = u.id
       WHERE s.status = 'pending'
       ORDER BY s.submitted_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'তালিকা লোড করা যায়নি' });
  }
});

// ---------- 6. Admin: নম্বর ও মন্তব্য দিয়ে চূড়ান্ত করা ----------
router.put('/admin/written-submissions/:id/approve', checkAdmin, async (req, res) => {
  const { id } = req.params;
  const { admin_score, admin_comment } = req.body;
  if (admin_score === undefined) {
    return res.status(400).json({ error: 'নম্বর আবশ্যক' });
  }
  try {
    await pool.query(
      `INSERT INTO written_evaluations (submission_id, admin_score, admin_comment, final_status, approved_at)
       VALUES ($1,$2,$3,'approved',NOW())
       ON CONFLICT (submission_id) DO UPDATE SET admin_score=$2, admin_comment=$3, final_status='approved', approved_at=NOW()`,
      [id, admin_score, admin_comment || null]
    );
    await pool.query(`UPDATE written_submissions SET status='approved' WHERE id=$1`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'সংরক্ষণ করা যায়নি' });
  }
});

// ---------- 7. Student: নিজের ফলাফল দেখা ----------
router.get('/written-submissions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT s.*, q.question_text, q.marks, q.subject, e.admin_score, e.admin_comment, e.final_status
       FROM written_submissions s
       LEFT JOIN written_questions q ON s.question_id = q.id
       LEFT JOIN written_evaluations e ON e.submission_id = s.id
       WHERE s.id = $1`, [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'পাওয়া যায়নি' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ফলাফল লোড করা যায়নি' });
  }
});

// ---------- 7b. Student: নিজের সব জমার তালিকা (ফলাফল ট্যাবের জন্য) ----------
router.get('/written-submissions', async (req, res) => {
  const { student_id } = req.query;
  if (!student_id) return res.status(400).json({ error: 'student_id আবশ্যক' });
  try {
    const result = await pool.query(
      `SELECT s.id, s.status, s.submitted_at, q.subject, q.question_text, q.marks, e.admin_score
       FROM written_submissions s
       LEFT JOIN written_questions q ON s.question_id = q.id
       LEFT JOIN written_evaluations e ON e.submission_id = s.id
       WHERE s.student_id = $1
       ORDER BY s.submitted_at DESC`,
      [student_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'তালিকা লোড করা যায়নি' });
  }
});

module.exports = router;
