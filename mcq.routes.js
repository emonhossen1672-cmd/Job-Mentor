const express = require("express");
const pool = require("./db");

const router = express.Router();

/* ===========================
   নতুন MCQ যোগ করা
=========================== */
router.post("/", async (req, res) => {
  try {
    const {
      subject,
      chapter,
      topic,
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      explanation,
      difficulty
    } = req.body;

    const result = await pool.query(
      `INSERT INTO mcqs
      (subject, chapter, topic, question,
       option_a, option_b, option_c, option_d,
       correct_answer, explanation, difficulty)

       VALUES
       ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)

       RETURNING *`,
      [
        subject,
        chapter,
        topic,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        explanation,
        difficulty || "Easy"
      ]
    );

    res.status(201).json({
      success: true,
      message: "MCQ Added Successfully",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* ===========================
   সব MCQ দেখা
=========================== */
router.get("/", async (req, res) => {

  const result = await pool.query(
    "SELECT * FROM mcqs ORDER BY id DESC"
  );

  res.json({
    success: true,
    total: result.rows.length,
    data: result.rows
  });

});

module.exports = router;
