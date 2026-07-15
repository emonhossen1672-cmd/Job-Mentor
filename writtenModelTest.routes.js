// ============================================
// Written Model Test Routes — রচনামূলক প্রশ্নের মডেল টেস্ট
// ============================================

const express = require('express');
const pool = require('./db');
const router = express.Router();

function checkAdmin(req, res, next) {
  const key = req.headers['x-admin-key'] || req.body.adminKey;
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return res.status(401).send('❌ ভুল বা অনুপস্থিত Admin Key');
  }
  next();
}

// ---------- কাঁচা টেক্সট পার্সার ----------
// ফরম্যাট: ১. প্রশ্ন? (মার্ক: ১০)   অথবা শুধু  ১. প্রশ্ন?
function parseRawEssayQuestions(text) {
  const blocks = text.split(/(?=^\s*[০-৯0-9]+[.।])/gm).map(b => b.trim()).filter(Boolean);
  const questions = [];

  for (const block of blocks) {
    const markMatch = block.match(/\(মার্ক\s*[:：]?\s*([০-৯0-9]+)\)/);
    let questionText = block.replace(/^[০-৯0-9]+[.।]\s*/, '');
    questionText = questionText.replace(/\(মার্ক\s*[:：]?\s*[০-৯0-9]+\)/, '').trim();

    const bnDigits = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
    const toEnDigits = (s) => s.replace(/[০-৯]/g, (d) => bnDigits[d]);
    const marks = markMatch ? parseInt(toEnDigits(markMatch[1])) : 10;

    if (questionText) {
      questions.push({ question_text: questionText, marks });
    }
  }
  return questions;
}

// ---------- আপলোড ফর্ম ----------
router.get('/admin/written-model-test-form', (req, res) => {
  res.send(`
    <html><body style="font-family:sans-serif;padding:20px;">
      <h2>রিটেন মডেল টেস্ট তৈরি করুন</h2>
      <form action="/api/written-model-tests/create" method="POST">
        <p>Admin Key: <input type="password" name="adminKey" required /></p>
        <p>শিরোনাম: <input type="text" name="title" required placeholder="রিটেন মডেল টেস্ট ১" style="width:100%" /></p>
        <p>ক্যাটাগরি:
          <select name="category" required>
            <option value="bcs">বিসিএস</option>
            <option value="primary">প্রাইমারি</option>
            <option value="nibondhon">নিবন্ধন</option>
            <option value="grade_9_20">৯-২০ গ্রেড</option>
          </select>
        </p>
        <p>সময়সীমা (মিনিট): <input type="number" name="duration_minutes" value="90" required /></p>
        <p>প্রশ্নসমূহ (কাঁচা টেক্সট):<br/>
          <textarea name="rawText" rows="15" style="width:100%" placeholder="১. বাংলাদেশের মুক্তিযুদ্ধের পটভূমি আলোচনা করুন। (মার্ক: ২০)

২. একটি দরখাস্ত লিখুন। (মার্ক: ১৫)

৩. অনুচ্ছেদ লিখুন: শিক্ষার গুরুত্ব" required></textarea>
        </p>
        <button type="submit">তৈরি করুন</button>
      </form>
    </body></html>
  `);
});

// ---------- মডেল টেস্ট তৈরি ও প্রশ্ন পার্স করে সেভ ----------
router.post('/written-model-tests/create', checkAdmin, async (req, res) => {
  try {
    const { title, category, duration_minutes, rawText } = req.body;
    if (!title || !rawText) {
      return res.status(400).send('❌ শিরোনাম ও প্রশ্ন আবশ্যক');
    }

    const questions = parseRawEssayQuestions(rawText);
    if (questions.length === 0) {
      return res.status(400).send('❌ কোনো প্রশ্ন পার্স করা যায়নি। ফরম্যাট চেক করুন।');
    }

    const testResult = await pool.query(
      `INSERT INTO written_model_tests (title, category, duration_minutes) VALUES ($1,$2,$3) RETURNING id`,
      [title, category || 'bcs', duration_minutes || 90]
    );
    const modelTestId = testResult.rows[0].id;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await pool.query(
        `INSERT INTO written_model_test_questions (model_test_id, question_text, marks, order_index)
         VALUES ($1,$2,$3,$4)`,
        [modelTestId, q.question_text, q.marks, i]
      );
    }

    res.send(`✅ "${title}" তৈরি হয়েছে — ${questions.length}টি প্রশ্ন যোগ হয়েছে।`);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Error: ' + err.message);
  }
});

// ---------- মডেল টেস্ট লিস্ট (category filter সহ) ----------
router.get('/written-model-tests', async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT t.id, t.title, t.category, t.duration_minutes,
        (SELECT COUNT(*) FROM written_model_test_questions WHERE model_test_id = t.id) AS question_count
      FROM written_model_tests t WHERE 1=1
    `;
    const params = [];
    if (category) { params.push(category); query += ` AND t.category = $${params.length}`; }
    query += ' ORDER BY t.id';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- একটা মডেল টেস্টের সব প্রশ্ন ----------
router.get('/written-model-tests/:id/questions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, question_text, marks FROM written_model_test_questions
       WHERE model_test_id = $1 ORDER BY order_index`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- উত্তর জমা দেওয়া ----------
router.post('/written-model-tests/:id/submit', async (req, res) => {
  try {
    const { student_name, answers } = req.body;
    if (!student_name || !answers) {
      return res.status(400).json({ error: 'নাম ও উত্তর আবশ্যক' });
    }
    const result = await pool.query(
      `INSERT INTO written_model_test_submissions (model_test_id, student_name, answers)
       VALUES ($1,$2,$3) RETURNING id`,
      [req.params.id, student_name, JSON.stringify(answers)]
    );
    res.json({ success: true, submissionId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- Admin: পেন্ডিং জমা তালিকা ----------
router.get('/admin/written-model-test-submissions', checkAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.student_name, s.answers, s.status, s.submitted_at, t.title
       FROM written_model_test_submissions s
       JOIN written_model_tests t ON s.model_test_id = t.id
       WHERE s.status = 'pending' ORDER BY s.submitted_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Admin: নম্বর দেওয়া ----------
router.put('/admin/written-model-test-submissions/:id/score', checkAdmin, async (req, res) => {
  try {
    const { total_score, admin_feedback } = req.body;
    await pool.query(
      `UPDATE written_model_test_submissions SET total_score=$1, admin_feedback=$2, status='reviewed' WHERE id=$3`,
      [total_score, admin_feedback || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Admin: একটা নির্দিষ্ট প্রশ্ন ডিলিট (ভুল/জাঙ্ক প্রশ্ন মুছতে) ----------
router.delete('/admin/written-model-test-questions/:id', checkAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM written_model_test_questions WHERE id = $1', [req.params.id]);
    res.send('✅ প্রশ্ন মুছে ফেলা হয়েছে');
  } catch (err) {
    res.status(500).send('❌ Error: ' + err.message);
  }
});


module.exports = router;
