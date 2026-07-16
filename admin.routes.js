// ============================================
// Admin Hub — সব admin ফর্মের কেন্দ্রীয় প্রবেশদ্বার
// ============================================

const express = require('express');
const pool = require('./db');
const router = express.Router();

function esc(str) {
  return String(str || '').replace(/"/g, '&quot;');
}

router.get('/admin', (req, res) => {
  const key = req.query.key;

  if (!key || key !== process.env.ADMIN_KEY) {
    return res.send(`
      <html><body style="font-family:sans-serif;padding:20px;">
        <h2>Job Mentor — Admin</h2>
        <form method="GET">
          <input type="password" name="key" placeholder="Admin Key" required style="padding:10px;width:100%;max-width:300px;font-size:16px;" />
          <button type="submit" style="padding:10px 20px;font-size:16px;margin-top:10px;display:block;">প্রবেশ করুন</button>
        </form>
      </body></html>
    `);
  }

  const k = esc(key);
  res.send(`
    <html><body style="font-family:sans-serif;padding:20px;max-width:600px;margin:0 auto;">
      <h2>🎯 Job Mentor — Admin Dashboard</h2>

      <h3>📘 প্রিলি — MCQ</h3>
      <p><a href="/api/admin/bulk-upload-form?key=${k}">➤ CSV দিয়ে বাল্ক MCQ আপলোড</a></p>
      <p><a href="/api/admin/model-test-form?key=${k}">➤ MCQ মডেল টেস্ট তৈরি করুন</a></p>

      <h3>✍️ রিটেন</h3>
      <p><a href="/api/admin/written-questions-form?key=${k}">➤ বিষয়ভিত্তিক রচনামূলক প্রশ্ন যোগ করুন</a></p>
      <p><a href="/api/admin/written-model-test-form?key=${k}">➤ রিটেন মডেল টেস্ট তৈরি করুন</a></p>
      <p><a href="/api/admin/written-model-test-review?key=${k}">➤ রিটেন মডেল টেস্ট জমা রিভিউ ও নম্বর দিন</a></p>

      <h3>📄 প্রশ্নপত্র আর্কাইভ</h3>
      <p><a href="/api/admin/upload-exam-paper-form?key=${k}">➤ প্রশ্নপত্র (PDF/ছবি) আপলোড</a></p>

      <h3>🔗 দ্রুত লিংক (ডেটা দেখতে)</h3>
      <p><a href="/api/topics">➤ সব টপিক (JSON)</a></p>
      <p><a href="/api/model-tests">➤ সব MCQ মডেল টেস্ট (JSON)</a></p>
      <p><a href="/api/written-model-tests">➤ সব রিটেন মডেল টেস্ট (JSON)</a></p>
      <p><a href="/api/exam-papers">➤ সব প্রশ্নপত্র (JSON)</a></p>
    </body></html>
  `);
});

// ---------- বিষয়ভিত্তিক রচনামূলক প্রশ্ন যোগ করার ফর্ম ----------
router.get('/admin/written-questions-form', (req, res) => {
  const key = esc(req.query.key);
  res.send(`
    <html><body style="font-family:sans-serif;padding:20px;">
      <h2>বিষয়ভিত্তিক রচনামূলক প্রশ্ন যোগ করুন</h2>
      <form action="/api/admin/written-questions" method="POST">
        <p>Admin Key: <input type="password" name="adminKey" value="${key}" required style="width:100%;padding:8px;" /></p>
        <p>বিষয়:
          <select name="subject" required style="padding:8px;">
            <option value="বাংলা">বাংলা</option>
            <option value="ইংরেজি">ইংরেজি</option>
            <option value="গণিত">গণিত</option>
            <option value="সাধারণ জ্ঞান">সাধারণ জ্ঞান</option>
          </select>
        </p>
        <p>প্রশ্ন:<br/>
          <textarea name="question_text" rows="4" style="width:100%;padding:8px;" required></textarea>
        </p>
        <p>মার্ক: <input type="number" name="marks" value="20" style="padding:8px;" /></p>
        <p>সময়সীমা (মিনিট): <input type="number" name="time_limit_minutes" value="30" style="padding:8px;" /></p>
        <p>মডেল উত্তর (নমুনা/গাইডলাইন):<br/>
          <textarea name="model_answer" rows="6" style="width:100%;padding:8px;" required></textarea>
        </p>
        <button type="submit" style="padding:10px 20px;">যোগ করুন</button>
      </form>
    </body></html>
  `);
});

module.exports = router;
