       // ============================================
// Written Exam Routes + AI Evaluation Logic
// ============================================
// প্রয়োজনীয় প্যাকেজ: express, pg (বা তোমার existing db pool), axios
// .env এ থাকতে হবে: ANTHROPIC_API_KEY=sk-ant-...

const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('./db');
// const { requireAuth, requireAdmin } = require('../middleware/auth'); // তোমার existing auth middleware

// ---------- 1. Admin: প্রশ্ন তৈরি ----------
router.post('/admin/written-questions', /* requireAdmin, */ async (req, res) => {
  const { subject, question_text, marks, model_answer, time_limit_minutes, admin_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO written_questions (subject, question_text, marks, model_answer, time_limit_minutes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [subject, question_text, marks || 20, model_answer, time_limit_minutes || 30, admin_id || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'প্রশ্ন তৈরি করা যায়নি' });
  }
});

// ---------- 2. Student: সক্রিয় প্রশ্ন তালিকা ----------
router.get('/written-questions', /* requireAuth, */ async (req, res) => {
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
// এখন কোনো AI মূল্যায়ন হয় না — সরাসরি Admin এর রিভিউ কিউতে যায়
router.post('/written-submissions', /* requireAuth, */ async (req, res) => {
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

// ---------- 4. AI Evaluation function (আপাতত বন্ধ — ANTHROPIC_API_KEY বিলিং একটিভ হলে আনকমেন্ট করে ব্যবহার করবে) ----------
/*
async function evaluateSubmission(submissionId) {
  const subRes = await pool.query(
    `SELECT s.*, q.question_text, q.model_answer, q.marks
     FROM written_submissions s JOIN written_questions q ON s.question_id = q.id
     WHERE s.id = $1`, [submissionId]
  );
  const sub = subRes.rows[0];
  if (!sub) throw new Error('Submission not found');

  const fileContents = [];
  for (const url of sub.image_urls) {
    const fileRes = await axios.get(url, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(fileRes.data).toString('base64');
    const mediaType = fileRes.headers['content-type'] || (sub.file_type === 'pdf' ? 'application/pdf' : 'image/jpeg');
    if (sub.file_type === 'pdf' || mediaType === 'application/pdf') {
      fileContents.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } });
    } else {
      fileContents.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } });
    }
  }

  const prompt = `তুমি একজন বিসিএস/সরকারি চাকরির লিখিত পরীক্ষার খাতা মূল্যায়নকারী। নিচের প্রশ্ন, মডেল উত্তর এবং শিক্ষার্থীর হাতে লেখা উত্তরের ছবি দেখে মূল্যায়ন করো।

প্রশ্ন: ${sub.question_text}
পূর্ণমান: ${sub.marks}
মডেল উত্তর/রুব্রিক: ${sub.model_answer}

শুধুমাত্র নিচের JSON ফরম্যাটে উত্তর দাও, অন্য কোনো টেক্সট নয়:
{
  "score": <সংখ্যা, পূর্ণমানের মধ্যে>,
  "strengths": ["যা ভালো লিখেছে..."],
  "mistakes": [{"point": "কোথায় ভুল করেছে", "explanation": "কেন এটা ভুল/অসম্পূর্ণ"}],
  "model_solution": "সংক্ষিপ্ত সঠিক উত্তর যা শিক্ষার্থী পড়ে শিখতে পারবে",
  "comment": "সামগ্রিক এক লাইনের মন্তব্য"
}`;

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    { model: 'claude-sonnet-5', max_tokens: 2000, messages: [{ role: 'user', content: [...fileContents, { type: 'text', text: prompt }] }] },
    { headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' } }
  );

  let aiText = response.data.content.map(c => c.text || '').join('').trim();
  aiText = aiText.replace(/```json|```/g, '').trim();
  const aiResult = JSON.parse(aiText);

  const evalRes = await pool.query(
    `INSERT INTO written_evaluations (submission_id, ai_score, ai_feedback, final_status)
     VALUES ($1,$2,$3,'ai_evaluated')
     ON CONFLICT (submission_id) DO UPDATE SET ai_score=$2, ai_feedback=$3, final_status='ai_evaluated'
     RETURNING *`,
    [submissionId, aiResult.score, JSON.stringify(aiResult)]
  );
  await pool.query(`UPDATE written_submissions SET status='ai_evaluated' WHERE id=$1`, [submissionId]);
  return evalRes.rows[0];
}
*/

// ---------- 5. Admin: রিভিউ কিউ (যেগুলো এখনো নম্বর দেওয়া হয়নি) ----------
router.get('/admin/written-submissions', /* requireAdmin, */ async (req, res) => {
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
router.put('/admin/written-submissions/:id/approve', /* requireAdmin, */ async (req, res) => {
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
router.get('/written-submissions/:id', /* requireAuth, */ async (req, res) => {
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

module.exports = router;
              
