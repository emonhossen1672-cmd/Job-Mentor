const pool = require('./db');

const topicList = [
  'বাংলা সাহিত্য',
  'বাংলা ভাষা ও ব্যাকরণ',
  'ইংরেজি গ্রামার',
  'ইংরেজি সাহিত্য',
  'ইংরেজি ভোকাবুলারি',
  'গণিত',
  'মানসিক দক্ষতা',
  'বাংলাদেশ',
  'আন্তর্জাতিক',
  'সাধারণ বিজ্ঞান',
  'কম্পিউটার ও তথ্যপ্রযুক্তি',
  'ভূগোল ও পরিবেশ',
  'নৈতিকতা ও সুশাসন'
];

async function seedTopics() {
  try {
    for (let i = 0; i < topicList.length; i++) {
      const existing = await pool.query(
        'SELECT id FROM topics WHERE name = $1',
        [topicList[i]]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          'INSERT INTO topics (name, order_index) VALUES ($1, $2)',
          [topicList[i], i + 1]
        );
      }
    }

    console.log('✅ Topics seeded successfully');
    return { success: true };
  } catch (err) {
    console.error('❌ Error seeding topics:', err);
    return { success: false, error: err.message };
  }
}

module.exports = seedTopics;
