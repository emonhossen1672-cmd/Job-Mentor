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
    { topic_id: 1, name: 'প্রাচীন যুগ', order_index: 1 },
    { topic_id: 1, name: 'মধ্য যুগ', order_index: 2 },
    { topic_id: 1, name: 'আধুনিক যুগ', order_index: 3 },
    { topic_id: 2, name: 'ব্যাকরণিক বিষয়', order_index: 1 },
    { topic_id: 2, name: 'বাগধারা ও প্রবাদ', order_index: 2 },
    { topic_id: 2, name: 'ভাষাতত্ত্ব', order_index: 3 },
    { topic_id: 3, name: 'Tense ও Voice', order_index: 1 },
    { topic_id: 3, name: 'Parts of Speech', order_index: 2 },
    { topic_id: 3, name: 'Sentence Structure', order_index: 3 },
    { topic_id: 4, name: 'Poetry', order_index: 1 },
    { topic_id: 4, name: 'Novel', order_index: 2 },
    { topic_id: 4, name: 'Drama', order_index: 3 },
    { topic_id: 5, name: 'Synonym', order_index: 1 },
    { topic_id: 5, name: 'Antonym', order_index: 2 },
    { topic_id: 5, name: 'Idioms & Phrases', order_index: 3 },
    { topic_id: 6, name: 'পাটিগণিত', order_index: 1 },
    { topic_id: 6, name: 'বীজগণিত', order_index: 2 },
    { topic_id: 6, name: 'জ্যামিতি', order_index: 3 },
    { topic_id: 7, name: 'সংখ্যা ধারা', order_index: 1 },
    { topic_id: 7, name: 'যুক্তি বিশ্লেষণ', order_index: 2 },
    { topic_id: 7, name: 'দিক নির্ণয়', order_index: 3 },
    { topic_id: 8, name: 'ইতিহাস ও মুক্তিযুদ্ধ', order_index: 1 },
    { topic_id: 8, name: 'সংবিধান ও রাজনীতি', order_index: 2 },
    { topic_id: 8, name: 'ভূগোল ও অর্থনীতি', order_index: 3 },
    { topic_id: 9, name: 'আন্তর্জাতিক সংস্থা', order_index: 1 },
    { topic_id: 9, name: 'বিশ্ব রাজনীতি', order_index: 2 },
    { topic_id: 9, name: 'সম্মেলন ও চুক্তি', order_index: 3 },
    { topic_id: 10, name: 'পদার্থবিজ্ঞান', order_index: 1 },
    { topic_id: 10, name: 'রসায়ন', order_index: 2 },
    { topic_id: 10, name: 'জীববিজ্ঞান', order_index: 3 },
    { topic_id: 11, name: 'হার্ডওয়্যার ও সফটওয়্যার', order_index: 1 },
    { topic_id: 11, name: 'ইন্টারনেট ও নেটওয়ার্ক', order_index: 2 },
    { topic_id: 11, name: 'প্রোগ্রামিং ধারণা', order_index: 3 },
    { topic_id: 12, name: 'বাংলাদেশের ভূগোল', order_index: 1 },
    { topic_id: 12, name: 'বিশ্ব ভূগোল', order_index: 2 },
    { topic_id: 12, name: 'পরিবেশ ও জলবায়ু', order_index: 3 },
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

async function seedSubSubtopics() {
  const data = [
    {
      topicName: 'বাংলা সাহিত্য',
      subtopicName: 'প্রাচীন যুগ',
      children: ['চর্যাপদ', 'চর্যাপদের কবিগণ'],
    },
    {
      topicName: 'বাংলা সাহিত্য',
      subtopicName: 'মধ্য যুগ',
      children: [
        'মঙ্গলকাব্য',
        'বৈষ্ণব পদাবলি',
        'লোকসাহিত্য',
        'মর্সিয়া সাহিত্য',
        'গীতিকা',
        'মধ্যযুগের গুরুত্বপূর্ণ লেখকগণ',
      ],
    },
    {
      topicName: 'বাংলা সাহিত্য',
      subtopicName: 'আধুনিক যুগ',
      children: [
        'ওরা ১১জন',
        'কল্লোল যুগ ও পঞ্চপাণ্ডব',
        'গদ্য সাহিত্যের বিকাশ (গল্প, উপন্যাস, নাটক)',
        'শরৎচন্দ্র চট্টোপাধ্যায়',
        'প্রমথ চৌধুরী',
        'মানিক বন্দ্যোপাধ্যায়',
        'জহির রায়হান',
        'শামসুর রহমান',
        'হুমায়ুন আহমেদ ও হুমায়ুন আজাদ',
        'বাংলা সাহিত্যের গুরুত্বপূর্ণ নারী লেখক',
        'পশ্চিমবঙ্গের গুরুত্বপূর্ণ লেখক',
        'সাহিত্যিক ছদ্মনাম, উপাধি এবং পত্রিকা',
        'ভাষা আন্দোলন ও মুক্তিযুদ্ধভিত্তিক সাহিত্য',
        'বাংলা সাহিত্যের চরিত্র, উক্তি, সংলাপ',
        'আধুনিক যুগের অন্যান্য গুরুত্বপূর্ণ লেখক',
      ],
    },
  ];

  try {
    for (const group of data) {
      const topicRes = await pool.query('SELECT id FROM topics WHERE name = $1', [group.topicName]);
      if (topicRes.rows.length === 0) continue;
      const topicId = topicRes.rows[0].id;

      const subRes = await pool.query(
        'SELECT id FROM subtopics WHERE topic_id = $1 AND name = $2 AND parent_id IS NULL',
        [topicId, group.subtopicName]
      );
      if (subRes.rows.length === 0) continue;
      const parentId = subRes.rows[0].id;

      for (let i = 0; i < group.children.length; i++) {
        const childName = group.children[i];
        const existing = await pool.query(
          'SELECT id FROM subtopics WHERE parent_id = $1 AND name = $2',
          [parentId, childName]
        );
        if (existing.rows.length === 0) {
          await pool.query(
            'INSERT INTO subtopics (topic_id, parent_id, name, order_index) VALUES ($1, $2, $3, $4)',
            [topicId, parentId, childName, i + 1]
          );
        }
      }
    }
    console.log('✅ বাংলা সাহিত্য সাব-সাবটপিক seeded successfully');
    return { success: true };
  } catch (err) {
    console.error('❌ Error seeding sub-subtopics:', err);
    return { success: false, error: err.message };
  }
}

async function seedBanglaGrammarSubtopics() {
  const topicName = 'বাংলা ভাষা ও ব্যাকরণ';
  const oldSubtopicNames = ['ব্যাকরণিক বিষয়', 'বাগধারা ও প্রবাদ', 'ভাষাতত্ত্ব'];

  const newStructure = [
    { name: 'বাংলা ভাষা ও ব্যাকরণ', children: ['ভাষা ও বাংলা ভাষারীতি', 'বাংলা ব্যাকরণ ও এর আলোচ্য বিষয়'] },
    { name: 'ধ্বনিতত্ত্ব', children: ['ধ্বনি ও বর্ণ প্রকরণ', 'ধ্বনি পরিবর্তন', 'ণ-ত্ব ও ষ-ত্ব বিধান', 'সন্ধি'] },
    { name: 'শব্দ প্রকরণ', children: ['শব্দের শ্রেণিবিভাগ', 'শব্দের উৎসমূল', 'ধাতু ও প্রত্যয়', 'লিঙ্গ', 'সংখ্যাবাচক শব্দ', 'দ্বিরুক্ত শব্দ', 'বচন', 'পদাশ্রিত নির্দেশক', 'সমাস', 'উপসর্গ'] },
    { name: 'পদ প্রকরণ', children: ['পদ ও এর শ্রেণিবিভাগ', 'বিশেষ্য, বিশেষণ, সর্বনাম ও অব্যয় পদ', 'ক্রিয়াপদ', 'ক্রিয়ার কাল ও প্রয়োগ', 'অনুসর্গ', 'পদ সংক্রান্ত অন্যান্য'] },
    { name: 'বাক্য প্রকরণ', children: ['বাক্য ও বাক্যের প্রকারভেদ', 'বাক্য ও উক্তির পরিবর্তন', 'কারক ও বিভক্তি', 'বাচ্য ও বাচ্যের পরিবর্তন', 'যতিচিহ্ন', 'প্রয়োগ ও অপপ্রয়োগ', 'বানান ও বাক্য শুদ্ধি', 'ছন্দ ও অলংকার', 'বাক্য সম্পর্কিত বিবিধ'] },
    { name: 'অর্থতত্ত্ব', children: ['বাগধারা ও প্রবাদ প্রবচন', 'সমার্থক শব্দ', 'বিপরীতার্থক শব্দ', 'শব্দজোড়', 'এক কথায় প্রকাশ', 'পরিভাষা'] },
  ];

  try {
    const topicRes = await pool.query('SELECT id FROM topics WHERE name = $1', [topicName]);
    if (topicRes.rows.length === 0) return { success: false, error: 'টপিক পাওয়া যায়নি' };
    const topicId = topicRes.rows[0].id;

    const oldRes = await pool.query(
      'SELECT id FROM subtopics WHERE topic_id = $1 AND name = ANY($2) AND parent_id IS NULL',
      [topicId, oldSubtopicNames]
    );
    for (const row of oldRes.rows) {
      await pool.query('UPDATE mcqs SET subtopic_id = NULL WHERE subtopic_id = $1', [row.id]);
      await pool.query('DELETE FROM subtopics WHERE id = $1', [row.id]);
    }

    for (let i = 0; i < newStructure.length; i++) {
      const group = newStructure[i];
      let subRes = await pool.query(
        'SELECT id FROM subtopics WHERE topic_id = $1 AND name = $2 AND parent_id IS NULL',
        [topicId, group.name]
      );
      let parentId;
      if (subRes.rows.length === 0) {
        const insertRes = await pool.query(
          'INSERT INTO subtopics (topic_id, name, order_index) VALUES ($1, $2, $3) RETURNING id',
          [topicId, group.name, i + 1]
        );
        parentId = insertRes.rows[0].id;
      } else {
        parentId = subRes.rows[0].id;
      }

      for (let j = 0; j < group.children.length; j++) {
        const childName = group.children[j];
        const existing = await pool.query(
          'SELECT id FROM subtopics WHERE parent_id = $1 AND name = $2',
          [parentId, childName]
        );
        if (existing.rows.length === 0) {
          await pool.query(
            'INSERT INTO subtopics (topic_id, parent_id, name, order_index) VALUES ($1, $2, $3, $4)',
            [topicId, parentId, childName, j + 1]
          );
        }
      }
    }

    console.log('✅ বাংলা ভাষা ও ব্যাকরণ সাবটপিক আপডেট সম্পন্ন');
    return { success: true };
  } catch (err) {
    console.error('❌ Error:', err);
    return { success: false, error: err.message };
  }
}

async function seedAllNewSubtopics() {
  const r1 = await seedSubSubtopics();
  const r2 = await seedBanglaGrammarSubtopics();
  return { banglaSahitya: r1, banglaGrammar: r2 };
}

module.exports = { seedTopics, seedSubtopics, seedSubSubtopics, seedBanglaGrammarSubtopics, seedAllNewSubtopics };
