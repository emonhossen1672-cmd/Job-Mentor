        const express = require("express");
const pool = require("./db");

const router = express.Router();

/* ===========================
   Admin পাসওয়ার্ড চেক
   (Add / Edit / Delete-এর আগে চলবে)
=========================== */
function checkAdmin(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: ভুল বা অনুপস্থিত admin key"
    });
  }
  next();
}

/* ===========================
   নতুন MCQ যোগ করা
=========================== */
router.post("/", checkAdmin, async (req, res) => {
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

    if (
      !subject ||
      !question ||
      !option_a ||
      !option_b ||
      !option_c ||
      !option_d ||
      !correct_answer
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing"
      });
    }

    const result = await pool.query(
      `INSERT INTO mcqs
      (subject, chapter, topic, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
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
        explanation || "",
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
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ===========================
   সব MCQ দেখা (এখনো ওপেন — ভবিষ্যতে ছাত্রদের জন্য আলাদা রুট বানানো হবে)
=========================== */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM mcqs ORDER BY id DESC"
    );

    res.json({
      success: true,
      total: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ===========================
   একটা নির্দিষ্ট MCQ এডিট করা
=========================== */
router.put("/:id", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
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

    if (
      !subject ||
      !question ||
      !option_a ||
      !option_b ||
      !option_c ||
      !option_d ||
      !correct_answer
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing"
      });
    }

    const result = await pool.query(
      `UPDATE mcqs SET
        subject=$1, chapter=$2, topic=$3, question=$4,
        option_a=$5, option_b=$6, option_c=$7, option_d=$8,
        correct_answer=$9, explanation=$10, difficulty=$11
      WHERE id=$12
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
        explanation || "",
        difficulty || "Easy",
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "MCQ পাওয়া যায়নি" });
    }

    res.json({
      success: true,
      message: "MCQ Updated Successfully",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ===========================
   একটা নির্দিষ্ট MCQ ডিলিট করা
=========================== */
router.delete("/:id", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM mcqs WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "MCQ পাওয়া যায়নি" });
    }

    res.json({
      success: true,
      message: "MCQ Deleted Successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
