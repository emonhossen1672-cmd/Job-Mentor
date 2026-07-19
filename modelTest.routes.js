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
  const key = String(req.query.key || '').replace(/"/g, '&quot;');
  res.send(`
    <html><body style="font-family:sans-serif;padding:20px;">
      <h2>মডেল টেস্ট তৈরি করুন</h2>
      <form action="/api/model-tests/create" method="POST">
        <p>Admin Key: <input type="password" name="adminKey" value="${key}" required /></p>
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
        <p>শুরুর তারিখ ও সময় (ঐচ্ছিক — খালি রাখলে "লাইভ" সেকশনে দেখাবে না):<br/>
          <input type="datetime-local" name="scheduled_at" />
        </p>
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
    const { title, category, exam_type, duration_minutes, rawText, scheduled_at } = req.body;
    if (!title || !rawText) {
      return res.status(400).send('❌ শিরোনাম ও প্রশ্ন আবশ্যক');
    }

    const questions = parseRawQuestions(rawText);
    if (questions.length === 0) {
      return res.status(400).send('❌ কোনো প্রশ্ন পার্স করা যায়নি। ফরম্যাট চেক করুন।');
    }

    const testResult = await pool.query(
      `INSERT INTO model_tests (title, category, exam_type, duration_minutes, scheduled_at) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [title, category || 'bcs', exam_type || 'preli', duration_minutes || 60, scheduled_at || null]
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
      SELECT t.id, t.title, t.category, t.exam_type, t.duration_minutes, t.scheduled_at,
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

// ---------- MCQ মডেল টেস্টের উত্তর জমা (সার্ভার-সাইড স্কোরিং) ----------
router.post('/model-tests/:id/submit', async (req, res) => {
  try {
    const { student_name, student_phone, answers } = req.body;
    if (!student_name || !answers) {
      return res.status(400).json({ error: 'নাম ও উত্তর আবশ্যক' });
    }

    const questionsResult = await pool.query(
      'SELECT id, correct_answer FROM model_test_questions WHERE model_test_id = $1',
      [req.params.id]
    );
    const correctMap = {};
    questionsResult.rows.forEach(q => { correctMap[q.id] = q.correct_answer; });

    let score = 0;
    for (const a of answers) {
      if (correctMap[a.question_id] === a.selected) score++;
    }
    const total = questionsResult.rows.length;

    await pool.query(
      `INSERT INTO model_test_submissions (model_test_id, student_name, student_phone, score, total)
       VALUES ($1,$2,$3,$4,$5)`,
      [req.params.id, student_name, student_phone || null, score, total]
    );

    res.json({ success: true, score, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- একজন শিক্ষার্থীর সব ফলাফল (MCQ + রিটেন একসাথে) ----------
router.get('/results', async (req, res) => {
  try {
    const { student_name } = req.query;
    if (!student_name) return res.status(400).json({ error: 'student_name আবশ্যক' });

    const mcqResults = await pool.query(
      `SELECT s.id, s.score, s.total, s.submitted_at, t.title, t.category, 'mcq' as type
       FROM model_test_submissions s
       JOIN model_tests t ON s.model_test_id = t.id
       WHERE s.student_name = $1
       ORDER BY s.submitted_at DESC`,
      [student_name]
    );

    const writtenResults = await pool.query(
      `SELECT s.id, s.total_score, s.status, s.admin_feedback, s.submitted_at, t.title, t.category, 'written' as type
       FROM written_model_test_submissions s
       JOIN written_model_tests t ON s.model_test_id = t.id
       WHERE s.student_name = $1
       ORDER BY s.submitted_at DESC`,
      [student_name]
    );

    res.json({
      mcq: mcqResults.rows,
      written: writtenResults.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/model-tests/:id/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const result = await pool.query(
      `WITH best AS (
         SELECT DISTINCT ON (COALESCE(student_phone, student_name))
           student_name, student_phone, score, total, submitted_at
         FROM model_test_submissions
         WHERE model_test_id = $1
         ORDER BY COALESCE(student_phone, student_name), score DESC, submitted_at ASC
       )
       SELECT student_name, student_phone, score, total, submitted_at,
         RANK() OVER (ORDER BY score DESC) AS rank
       FROM best
       ORDER BY score DESC, submitted_at ASC
       LIMIT $2`,
      [req.params.id, limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- লাইভ ও আসন্ন পরীক্ষার আপডেট (Home পেজের জন্য) ----------
router.get('/live-updates', async (req, res) => {
  try {
    const preli = await pool.query(`
      SELECT id, title, category, exam_type, duration_minutes, scheduled_at, 'mcq' AS type
      FROM model_tests
      WHERE scheduled_at IS NOT NULL
        AND scheduled_at + (duration_minutes || ' minutes')::interval > NOW() - interval '2 hours'
      ORDER BY scheduled_at ASC
      LIMIT 10
    `);

    const written = await pool.query(`
      SELECT id, title, category, 'written' AS exam_type, duration_minutes, scheduled_at, 'written' AS type
      FROM written_model_tests
      WHERE scheduled_at IS NOT NULL
        AND scheduled_at + (duration_minutes || ' minutes')::interval > NOW() - interval '2 hours'
      ORDER BY scheduled_at ASC
      LIMIT 10
    `);

    const all = [...preli.rows, ...written.rows].map(t => {
      const start = new Date(t.scheduled_at);
      const end = new Date(start.getTime() + t.duration_minutes * 60000);
      const now = new Date();
      let status = 'upcoming';
      if (now >= start && now <= end) status = 'live';
      else if (now > end) status = 'ended';
      return { ...t, status };
    }).sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

    res.json(all);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// টেম্পোরারি: scheduled_at কলাম যোগ করার জন্য (একবার রান করে রিমুভ করে দিন)
router.get('/model-tests/add-schedule-column', async (req, res) => {
  try {
    await pool.query(`ALTER TABLE model_tests ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP;`);
    await pool.query(`ALTER TABLE written_model_tests ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP;`);
    res.json({ success: true, message: 'scheduled_at কলাম দুই টেবিলেই যোগ হয়েছে' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
