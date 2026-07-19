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
async function seedSubtopics() {
  const subtopicList = [
    // বাংলা সাহিত্য (topic_id 1)
    { topic_id: 1, name: 'প্রাচীন যুগ', order_index: 1 },
    { topic_id: 1, name: 'মধ্য যুগ', order_index: 2 },
    { topic_id: 1, name: 'আধুনিক যুগ', order_index: 3 },

    // বাংলা ভাষা ও ব্যাকরণ (topic_id 2)
    { topic_id: 2, name: 'ব্যাকরণিক বিষয়', order_index: 1 },
    { topic_id: 2, name: 'বাগধারা ও প্রবাদ', order_index: 2 },
    { topic_id: 2, name: 'ভাষাতত্ত্ব', order_index: 3 },

    // ইংরেজি গ্রামার (topic_id 3)
    { topic_id: 3, name: 'Tense ও Voice', order_index: 1 },
    { topic_id: 3, name: 'Parts of Speech', order_index: 2 },
    { topic_id: 3, name: 'Sentence Structure', order_index: 3 },

    // ইংরেজি সাহিত্য (topic_id 4)
    { topic_id: 4, name: 'Poetry', order_index: 1 },
    { topic_id: 4, name: 'Novel', order_index: 2 },
    { topic_id: 4, name: 'Drama', order_index: 3 },

    // ইংরেজি ভোকাবুলারি (topic_id 5)
    { topic_id: 5, name: 'Synonym', order_index: 1 },
    { topic_id: 5, name: 'Antonym', order_index: 2 },
    { topic_id: 5, name: 'Idioms & Phrases', order_index: 3 },

    // গণিত (topic_id 6)
    { topic_id: 6, name: 'পাটিগণিত', order_index: 1 },
    { topic_id: 6, name: 'বীজগণিত', order_index: 2 },
    { topic_id: 6, name: 'জ্যামিতি', order_index: 3 },

    // মানসিক দক্ষতা (topic_id 7)
    { topic_id: 7, name: 'সংখ্যা ধারা', order_index: 1 },
    { topic_id: 7, name: 'যুক্তি বিশ্লেষণ', order_index: 2 },
    { topic_id: 7, name: 'দিক নির্ণয়', order_index: 3 },

    // বাংলাদেশ (topic_id 8)
    { topic_id: 8, name: 'ইতিহাস ও মুক্তিযুদ্ধ', order_index: 1 },
    { topic_id: 8, name: 'সংবিধান ও রাজনীতি', order_index: 2 },
    { topic_id: 8, name: 'ভূগোল ও অর্থনীতি', order_index: 3 },

    // আন্তর্জাতিক (topic_id 9)
    { topic_id: 9, name: 'আন্তর্জাতিক সংস্থা', order_index: 1 },
    { topic_id: 9, name: 'বিশ্ব রাজনীতি', order_index: 2 },
    { topic_id: 9, name: 'সম্মেলন ও চুক্তি', order_index: 3 },

    // সাধারণ বিজ্ঞান (topic_id 10)
    { topic_id: 10, name: 'পদার্থবিজ্ঞান', order_index: 1 },
    { topic_id: 10, name: 'রসায়ন', order_index: 2 },
    { topic_id: 10, name: 'জীববিজ্ঞান', order_index: 3 },

    // কম্পিউটার ও তথ্যপ্রযুক্তি (topic_id 11)
    { topic_id: 11, name: 'হার্ডওয়্যার ও সফটওয়্যার', order_index: 1 },
    { topic_id: 11, name: 'ইন্টারনেট ও নেটওয়ার্ক', order_index: 2 },
    { topic_id: 11, name: 'প্রোগ্রামিং ধারণা', order_index: 3 },

    // ভূগোল ও পরিবেশ (topic_id 12)
    { topic_id: 12, name: 'বাংলাদেশের ভূগোল', order_index: 1 },
    { topic_id: 12, name: 'বিশ্ব ভূগোল', order_index: 2 },
    { topic_id: 12, name: 'পরিবেশ ও জলবায়ু', order_index: 3 },

    // নৈতিকতা ও সুশাসন (topic_id 13)
    { topic_id: 13, name: 'সুশাসনের উপাদান', order_index: 1 },
    { topic_id: 13, name: 'দুর্নীতি প্রতিরোধ', order_index: 2 },
    { topic_id: 13, name: 'নৈতিক মূল্যবোধ', order_index: 3 },
  ];

  try {
    for (let i = 0; i < subtopicList.length; i++) {
      const s = subtopicList[i];
      const existing = await pool.query(
        'SELECT id FROM subtopics WHERE topic_id = $1 AND name = $2',
        [s.topic_id, s.name]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          'INSERT INTO subtopics (topic_id, name, order_index) VALUES ($1, $2, $3)',
          [s.topic_id, s.name, s.order_index]
        );
      }
    }

    console.log('✅ Subtopics seeded successfully');
    return { success: true };
  } catch (err) {
    console.error('❌ Error seeding subtopics:', err);
    return { success: false, error: err.message };
  }
}
module.exports = { seedTopics, seedSubtopics };
