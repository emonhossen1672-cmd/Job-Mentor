// ============================================
// Exam Paper Archive — প্রতিষ্ঠানভিত্তিক পরীক্ষার প্রশ্নপত্র আপলোড
// ============================================

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const pool = require('./db');
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isPdf = file.mimetype === 'application/pdf';
    return {
      folder: 'uttoron/exam_papers',
      resource_type: isPdf ? 'raw' : 'image',
      allowed_formats: isPdf ? ['pdf'] : ['jpg', 'jpeg', 'png', 'webp'],
      format: isPdf ? 'pdf' : undefined
    };
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

// ---------- আপলোড ফর্ম ----------
router.get('/admin/upload-exam-paper-form', (req, res) => {
  res.send(`
    <html><body style="font-family:sans-serif;padding:20px;">
      <h2>প্রশ্নপত্র আপলোড</h2>
      <form action="/api/exam-papers/upload" method="POST" enctype="multipart/form-data">
        <p>Admin Key: <input type="password" name="adminKey" required /></p>
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
        <p>প্রতিষ্ঠানের নাম: <input type="text" name="institution_name" required placeholder="যেমন: বাংলাদেশ ব্যাংক" /></p>
        <p>পরীক্ষার শিরোনাম: <input type="text" name="exam_title" required placeholder="যেমন: সিনিয়র অফিসার নিয়োগ ২০২৫" /></p>
        <p>পদের নাম: <input type="text" name="post_name" placeholder="ঐচ্ছিক" /></p>
        <p>পরীক্ষার তারিখ: <input type="date" name="exam_date" /></p>
        <p>বিষয় ট্যাগ: <input type="text" name="subject_tag" placeholder="যেমন: বাংলা, গণিত (ঐচ্ছিক)" /></p>
        <p>ফাইল (ছবি/PDF): <input type="file" name="file" accept="image/*,application/pdf" required /></p>
        <button type="submit">Upload</button>
      </form>
    </body></html>
  `);
});

// ---------- আপলোড প্রসেস ----------
router.post('/exam-papers/upload', upload.single('file'), async (req, res) => {
  try {
    if (req.body.adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).send('❌ ভুল Admin Key');
    }
    if (!req.file) {
      return res.status(400).send('❌ কোনো ফাইল পাওয়া যায়নি');
    }

    const { institution_name, exam_title, post_name, exam_date, subject_tag, category, exam_type } = req.body;
    const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';

    await pool.query(
      `INSERT INTO exam_papers (institution_name, exam_title, post_name, exam_date, file_url, file_type, subject_tag, category, exam_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [institution_name, exam_title, post_name || null, exam_date || null, req.file.path, fileType, subject_tag || null, category || 'bcs', exam_type || 'preli']
    );

    res.send('✅ প্রশ্নপত্র সফলভাবে আপলোড হয়েছে!');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Error: ' + err.message);
  }
});

// ---------- সব প্রশ্নপত্রের লিস্ট (category ও exam_type filter সহ) ----------
router.get('/exam-papers', async (req, res) => {
  try {
    const { category, exam_type } = req.query;
    let query = 'SELECT * FROM exam_papers WHERE 1=1';
    const params = [];
    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    if (exam_type) {
      params.push(exam_type);
      query += ` AND exam_type = $${params.length}`;
    }
    query += ' ORDER BY institution_name, exam_date DESC NULLS LAST';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- একটা নির্দিষ্ট প্রতিষ্ঠানের প্রশ্নপত্র ----------
router.get('/exam-papers/institution/:name', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM exam_papers WHERE institution_name = $1 ORDER BY exam_date DESC NULLS LAST',
      [req.params.name]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
