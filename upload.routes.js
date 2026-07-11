// ============================================
// File Upload Route — ছবি/PDF আপলোড করে URL রিটার্ন করে
// ============================================
// প্রয়োজনীয় প্যাকেজ:
//   npm install multer cloudinary multer-storage-cloudinary
// .env এ থাকতে হবে:
//   CLOUDINARY_CLOUD_NAME=...
//   CLOUDINARY_API_KEY=...
//   CLOUDINARY_API_SECRET=...
//
// Cloudinary ফ্রি টায়ারে PDF সহ যেকোনো ফাইল রাখা যায়, তাই এটাই সবচেয়ে সহজ সমাধান
// (ইতিমধ্যে অন্য কোনো স্টোরেজ ব্যবহার করলে শুধু storage অংশটা বদলালেই হবে)

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
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
      folder: 'uttoron/written_answers',
      resource_type: isPdf ? 'raw' : 'image', // PDF হলে raw, ছবি হলে image
      allowed_formats: isPdf ? ['pdf'] : ['jpg', 'jpeg', 'png', 'webp']
    };
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB প্রতি ফাইল
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('শুধু ছবি (jpg/png/webp) অথবা PDF আপলোড করা যাবে'));
  }
});

// ---------- ছবি (একাধিক) বা PDF (একটি) আপলোড ----------
// form-data key: "files" — একাধিক ফাইল হলে multiple পাঠাবে
router.post('/upload/written-answer', /* requireAuth, */ upload.array('files', 6), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'কোনো ফাইল পাওয়া যায়নি' });
    }
    const urls = req.files.map(f => f.path); // Cloudinary URL
    const file_type = req.files[0].mimetype === 'application/pdf' ? 'pdf' : 'image';
    res.json({ urls, file_type });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'আপলোড ব্যর্থ হয়েছে' });
  }
});

// multer এর ফাইল-সাইজ/টাইপ এরর সুন্দর মেসেজে দেখানোর জন্য
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes('আপলোড')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
