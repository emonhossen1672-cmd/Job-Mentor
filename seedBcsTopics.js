// ============================================
// বিসিএস প্রশ্নব্যাংক — ১০টি বিষয় সিড করার স্ক্রিপ্ট
// ============================================
// এই ১০টি topic, category = 'bcs' দিয়ে topics টেবিলে তৈরি হবে।
// এরপর প্রতিটা বিষয়ে আলাদাভাবে প্রশ্ন যোগ করা যাবে —
// bulkUpload_routes.js এর CSV আপলোড ফর্মে topic_name কলামে
// ঠিক এই নামগুলো (নিচে যা লেখা আছে) ব্যবহার করলেই হবে।

const pool = require('./db');

const BCS_SUBJECTS = [
  'বাংলা',
  'ইংরেজি',
  'গণিত',
  'সাধারণ বিজ্ঞান',
  'কম্পিউটার ও তথ্য প্রযুক্তি',
  'ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা',
  'নৈতিকতা, মূল্যবোধ ও সুশাসন',
  'বাংলাদেশ বিষয়াবলী',
  'আন্তর্জাতিক বিষয়াবলী',
  'মানসিক দক্ষতা'
];

async function seedBcsTopics() {
  const results = [];

  for (let i = 0; i < BCS_SUBJECTS.length; i++) {
    const name = BCS_SUBJECTS[i];

    const existing = await pool.query(
      'SELECT id FROM topics WHERE name = $1 AND category = $2',
      [name, 'bcs']
    );

    if (existing.rows.length > 0) {
      results.push({ name, status: 'already exists', id: existing.rows[0].id });
      continue;
    }

    const inserted = await pool.query(
      'INSERT INTO topics (name, order_index, category) VALUES ($1, $2, $3) RETURNING id',
      [name, i + 1, 'bcs']
    );
    results.push({ name, status: 'created', id: inserted.rows[0].id });
  }

  return results;
}

module.exports = { seedBcsTopics };
