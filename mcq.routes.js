const express = require('express');

const router = express.Router();

// সব MCQ দেখার API
router.get('/', async (req, res) => {
  res.json({
    success: true,
    message: 'All MCQs API Working',
    data: []
  });
});

// একটি MCQ দেখার API
router.get('/:id', async (req, res) => {
  res.json({
    success: true,
    id: req.params.id
  });
});

// নতুন MCQ যোগ করার API
router.post('/', async (req, res) => {
  res.json({
    success: true,
    message: 'MCQ Added Successfully',
    body: req.body
  });
});

// MCQ আপডেট করার API
router.put('/:id', async (req, res) => {
  res.json({
    success: true,
    message: 'MCQ Updated Successfully',
    id: req.params.id
  });
});

// MCQ ডিলিট করার API
router.delete('/:id', async (req, res) => {
  res.json({
    success: true,
    message: 'MCQ Deleted Successfully',
    id: req.params.id
  });
});

module.exports = router;
