// ============================================
// Bulk CSV Upload — একসাথে অনেক MCQ প্রশ্ন আপলোড
// ============================================
// CSV কলাম অর্ডার (হেডার সহ):
// topic_name,subtopic_name,question,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty
//
// উদাহরণ:
// topic_name,subtopic_name,question,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty
// বাংলা সাহিত্য,প্রাচীন যুগ,চর্যাপদের রচয়িতা কারা?,সিদ্ধাচার্যগণ,মধ্যযুগের কবি,আধুনিক কবি,কেউ নয়,A,চর্যাপদ সিদ্ধাচার্যদের রচনা,Medium

const express = require('express');
const multer = require('multer');
const pool = require('./db');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// সাধারণ CSV পার্সার — কমা এবং ডাবল-কোট সাপোর্ট করে
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') { field += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { field += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { row.push(field); field = ''; }
      else if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (char === '\r') { /* skip */ }
      else { field += char; }
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.length > 1 || r[0] !== '');
}

// ---------- আপলোড ফর্ম (ব্রাউজারে দেখা যাবে) ----------
router.get('/admin/bulk-upload-form', (req, res) => {
  res.send(`
    <html><body style="font-family:sans-serif;padding:20px;">
      <h2>MCQ Bulk Upload (CSV)</h2>
      <form action="/api/bulk-upload-mcqs" method="POST" enctype="multipart/form-data">
        <p>Admin Key: <input type="password" name="adminKey" required /></p>
        <p>CSV File: <input type="file" name="csvFile" accept=".csv" required /></p>
        <button type="submit">Upload</button>
      </form>
    </body></html>
  `);
});

// ---------- CSV আপলোড ও প্রসেস ----------
router.post('/bulk-upload-mcqs', upload.single('csvFile'), async (req, res) => {
  try {
    if (req.body.adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).send('❌ ভুল Admin Key');
    }
    if (!req.file) {
      return res.status(400).send('❌ কোনো CSV ফাইল পাওয়া যায়নি');
    }

    const text = req.file.buffer.toString('utf-8');
    const rows = parseCSV(text);
    const header = rows[0].map(h => h.trim());
    const dataRows = rows.slice(1);

    let inserted = 0;
    let skipped = [];

    for (let i = 0; i < dataRows.length; i++) {
      const r = dataRows[i];
      if (r.length < header.length) { skipped.push(i + 2); continue; }

      const rowObj = {};
      header.forEach((h, idx) => rowObj[h] = (r[idx] || '').trim());

      // টপিক ID খুঁজে বের করা
      const topicRes = await pool.query('SELECT id FROM topics WHERE name = $1', [rowObj.topic_name]);
      if (topicRes.rows.length === 0) { skipped.push(`${i + 2} (topic not found: ${rowObj.topic_name})`); continue; }
      const topicId = topicRes.rows[0].id;

      let subtopicId = null;
      if (rowObj.subtopic_name) {
        const subRes = await pool.query(
          'SELECT id FROM subtopics WHERE topic_id = $1 AND name = $2',
          [topicId, rowObj.subtopic_name]
        );
        if (subRes.rows.length > 0) subtopicId = subRes.rows[0].id;
      }

      await pool.query(
        `INSERT INTO mcqs (subject, chapter, topic, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, topic_id, subtopic_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          rowObj.topic_name, rowObj.subtopic_name || '', rowObj.subtopic_name || '',
          rowObj.question, rowObj.option_a, rowObj.option_b, rowObj.option_c, rowObj.option_d,
          rowObj.correct_answer, rowObj.explanation || '', rowObj.difficulty || 'Easy',
          topicId, subtopicId
        ]
      );
      inserted++;
    }

    res.send(`✅ সফল! ${inserted}টা প্রশ্ন যোগ হয়েছে। বাদ পড়েছে: ${skipped.length ? skipped.join(', ') : 'কোনোটি না'}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Error: ' + err.message);
  }
});

module.exports = router;
