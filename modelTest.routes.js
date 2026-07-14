// ============================================
// Model Test Routes — কাঁচা টেক্সট থেকে প্রশ্ন পার্স করে মডেল টেস্ট তৈরি
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
// ফরম্যাট: ১. প্রশ্ন? ক) অপশন ১ খ) অপশন ২ গ) অপশন ৩ ঘ) অপশন ৪ উত্তর: ক
function parseRawQuestions(text) {
  const bnDigits = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
  const toEnDigits = (s) => s.replace(/[০-৯]/g, (d) => bnDigits[d]);

  const blocks = text.split(/(?=^\s*[০-৯0-9]+[.।])/gm).map(b => b.trim()).filter(Boolean);
  const questions = [];

  for (const block of blocks) {
    const qMatch = block.match(/^[০-৯0-9]+[.।]\s*(.+?)(?=ক\))/s);
    const kMatch = block.match(/ক\)\s*(.+?)(?=খ\))/s);
    const khMatch = block.match(/খ\)\s*(.+?)(?=গ\))/s);
    const gMatch = block.match(/গ\)\s*(.+?)(?=ঘ\))/s);
    const ghMatch = block.match(/ঘ\)\s*(.+?)(?=(উত্তর|Answer)\s*[:：])/s);
    const ansMatch = block.match(/(উত্তর|Answer)\s*[:：]\s*([ক-ঘ])/);

    if (qMatch && kMatch && khMatch && gMatch && ghMatch && ansMatch) {
      const answerMap = { 'ক': 'A', 'খ': 'B', 'গ': 'C', 'ঘ': 'D' };
      questions.push({
        question: qMatch[1].trim(),
        option_a: kMatch[1].trim(),
        option_b: khMatch[1].trim(),
        option_c: gMatch[1].trim(),
        option_d: ghMatch[1].trim(),
        correct_answer: answerMap[ansMatch[2]] || 'A'
      });
    }
  }
  return questions;
}

// ---------- আপলোড ফর্ম ----------
router.get('/admin/model-test-form', (req, res) => {
  res.send(`
    <html><body style="font-family:sans-serif;padding:20px;">
      <h2>মডেল টেস্ট তৈরি করুন</h2>
      <form action="/api/model-tests/create" method="POST">
        <p>Admin Key: <input type="password" name="adminKey" required /></p>
        <p>শিরোনাম: <input type="text" name="title" required placeholder="মডেল টেস্ট ১" style="width:100%" /></p>
        <p>সেকশন:
          <select name="exam_type" required>
            <option value="preli">প্রিলি</option>
            <option value="written">রিটেন</option>
          </select>
        </p>
        <p>ক্যাটাগরি:
          <select name="category" required>
            <option value="bcs">বিসিএস</option>
            <option value="primary">প্রাইমারি</option>
            <option value="nibondhon">নিবন্ধন</option>
            <option value="grade_9_20">৯-২০ গ্রেড</option>
          </select>
        </p>
        <p>সময়সীমা (মিনিট): <input type="number" name="duration_minutes" value="60" required /></p>
        <p>প্রশ্নসমূহ (কাঁচা টেক্সট):<br/>
          <textarea name="rawText" rows="15" style="width:100%" placeholder="১. প্রশ্ন?
ক) অপশন১ খ) অপশন২ গ) অপশন৩ ঘ) অপশন৪
উত্তর: ক

২. পরের প্রশ্ন?
..." required></textarea>
        </p>
        <button type="submit">তৈরি করুন</button>
      </form>
    </body></html>
  `);
});

// ---------- মডেল টেস্ট তৈরি ও প্রশ্ন পার্স করে সেভ ----------
router.post('/model-tests/create', checkAdmin, async (req, res) => {
  try {
    const { title, category, exam_type, duration_minutes, rawText } = req.body;
    if (!title || !rawText) {
      return res.status(400).send('❌ শিরোনাম ও প্রশ্ন আবশ্যক');
    }

    const questions = parseRawQuestions(rawText);
    if (questions.length === 0) {
      return res.status(400).send('❌ কোনো প্রশ্ন পার্স করা যায়নি। ফরম্যাট চেক করুন।');
    }

    const testResult = await pool.query(
      `INSERT INTO model_tests (title, category, exam_type, duration_minutes) VALUES ($1,$2,$3,$4) RETURNING id`,
      [title, category || 'bcs', exam_type || 'preli', duration_minutes || 60]
    );
    const modelTestId = testResult.rows[0].id;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await pool.query(
        `INSERT INTO model_test_questions (model_test_id, question, option_a, option_b, option_c, option_d, correct_answer, order_index)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [modelTestId, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, i]
      );
    }

    res.send(`✅ "${title}" তৈরি হয়েছে — ${questions.length}টি প্রশ্ন যোগ হয়েছে।`);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Error: ' + err.message);
  }
});

// ---------- মডেল টেস্ট লিস্ট (category ও exam_type filter সহ) ----------
router.get('/model-tests', async (req, res) => {
  try {
    const { category, exam_type } = req.query;
    let query = `
      SELECT t.id, t.title, t.category, t.exam_type, t.duration_minutes,
        (SELECT COUNT(*) FROM model_test_questions WHERE model_test_id = t.id) AS question_count
      FROM model_tests t WHERE 1=1
    `;
    const params = [];
    if (category) { params.push(category); query += ` AND t.category = $${params.length}`; }
    if (exam_type) { params.push(exam_type); query += ` AND t.exam_type = $${params.length}`; }
    query += ' ORDER BY t.id';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- একটা মডেল টেস্টের সব প্রশ্ন ----------
router.get('/model-tests/:id/questions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, question, option_a, option_b, option_c, option_d, correct_answer
       FROM model_test_questions WHERE model_test_id = $1 ORDER BY order_index`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
