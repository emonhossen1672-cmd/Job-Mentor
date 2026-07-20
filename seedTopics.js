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
      const existing = await pool.query('SELECT id FROM topics WHERE name = $1', [topicList[i]]);
      if (existing.rows.length === 0) {
        await pool.query('INSERT INTO topics (name, order_index) VALUES ($1, $2)', [topicList[i], i + 1]);
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
      const existing = await pool.query('SELECT id FROM subtopics WHERE topic_id = $1 AND name = $2', [s.topic_id, s.name]);
      if (existing.rows.length === 0) {
        await pool.query('INSERT INTO subtopics (topic_id, name, order_index) VALUES ($1, $2, $3)', [s.topic_id, s.name, s.order_index]);
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
    { topicName: 'বাংলা সাহিত্য', subtopicName: 'প্রাচীন যুগ', children: ['চর্যাপদ', 'চর্যাপদের কবিগণ'] },
    { topicName: 'বাংলা সাহিত্য', subtopicName: 'মধ্য যুগ', children: ['মঙ্গলকাব্য', 'বৈষ্ণব পদাবলি', 'লোকসাহিত্য', 'মর্সিয়া সাহিত্য', 'গীতিকা', 'মধ্যযুগের গুরুত্বপূর্ণ লেখকগণ'] },
    { topicName: 'বাংলা সাহিত্য', subtopicName: 'আধুনিক যুগ', children: ['ওরা ১১জন', 'কল্লোল যুগ ও পঞ্চপাণ্ডব', 'গদ্য সাহিত্যের বিকাশ (গল্প, উপন্যাস, নাটক)', 'শরৎচন্দ্র চট্টোপাধ্যায়', 'প্রমথ চৌধুরী', 'মানিক বন্দ্যোপাধ্যায়', 'জহির রায়হান', 'শামসুর রহমান', 'হুমায়ুন আহমেদ ও হুমায়ুন আজাদ', 'বাংলা সাহিত্যের গুরুত্বপূর্ণ নারী লেখক', 'পশ্চিমবঙ্গের গুরুত্বপূর্ণ লেখক', 'সাহিত্যিক ছদ্মনাম, উপাধি এবং পত্রিকা', 'ভাষা আন্দোলন ও মুক্তিযুদ্ধভিত্তিক সাহিত্য', 'বাংলা সাহিত্যের চরিত্র, উক্তি, সংলাপ', 'আধুনিক যুগের অন্যান্য গুরুত্বপূর্ণ লেখক'] },
  ];
  try {
    for (const group of data) {
      const topicRes = await pool.query('SELECT id FROM topics WHERE name = $1', [group.topicName]);
      if (topicRes.rows.length === 0) continue;
      const topicId = topicRes.rows[0].id;
      const subRes = await pool.query('SELECT id FROM subtopics WHERE topic_id = $1 AND name = $2 AND parent_id IS NULL', [topicId, group.subtopicName]);
      if (subRes.rows.length === 0) continue;
      const parentId = subRes.rows[0].id;
      for (let i = 0; i < group.children.length; i++) {
        const childName = group.children[i];
        const existing = await pool.query('SELECT id FROM subtopics WHERE parent_id = $1 AND name = $2', [parentId, childName]);
        if (existing.rows.length === 0) {
          await pool.query('INSERT INTO subtopics (topic_id, parent_id, name, order_index) VALUES ($1,$2,$3,$4)', [topicId, parentId, childName, i + 1]);
        }
      }
    }
    console.log('✅ বাংলা সাহিত্য সাব-সাবটপিক seeded');
    return { success: true };
  } catch (err) {
    console.error('❌ Error:', err);
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
  return replaceSubtopics(topicName, oldSubtopicNames, newStructure);
}

// ---------- জেনেরিক ফাংশন: পুরনো সাবটপিক মুছে/রেখে নতুন সাবটপিক ও সাব-সাবটপিক বসানো ----------
async function replaceSubtopics(topicName, oldNames, newStructure) {
  try {
    const topicRes = await pool.query('SELECT id FROM topics WHERE name = $1', [topicName]);
    if (topicRes.rows.length === 0) return { success: false, error: `টপিক পাওয়া যায়নি: ${topicName}` };
    const topicId = topicRes.rows[0].id;

    if (oldNames && oldNames.length > 0) {
      const oldRes = await pool.query(
        'SELECT id FROM subtopics WHERE topic_id = $1 AND name = ANY($2) AND parent_id IS NULL',
        [topicId, oldNames]
      );
      for (const row of oldRes.rows) {
        await pool.query('UPDATE mcqs SET subtopic_id = NULL WHERE subtopic_id = $1', [row.id]);
        await pool.query('DELETE FROM subtopics WHERE id = $1', [row.id]);
      }
    }

    for (let i = 0; i < newStructure.length; i++) {
      const group = newStructure[i];
      let subRes = await pool.query('SELECT id FROM subtopics WHERE topic_id = $1 AND name = $2 AND parent_id IS NULL', [topicId, group.name]);
      let parentId;
      if (subRes.rows.length === 0) {
        const insertRes = await pool.query('INSERT INTO subtopics (topic_id, name, order_index) VALUES ($1,$2,$3) RETURNING id', [topicId, group.name, i + 1]);
        parentId = insertRes.rows[0].id;
      } else {
        parentId = subRes.rows[0].id;
      }
      if (group.children && group.children.length > 0) {
        for (let j = 0; j < group.children.length; j++) {
          const childName = group.children[j];
          const existing = await pool.query('SELECT id FROM subtopics WHERE parent_id = $1 AND name = $2', [parentId, childName]);
          if (existing.rows.length === 0) {
            await pool.query('INSERT INTO subtopics (topic_id, parent_id, name, order_index) VALUES ($1,$2,$3,$4)', [topicId, parentId, childName, j + 1]);
          }
        }
      }
    }
    return { success: true };
  } catch (err) {
    console.error(`❌ Error replacing subtopics for ${topicName}:`, err);
    return { success: false, error: err.message };
  }
}

// ---------- ব্যাচ ২: ইংরেজি গ্রামার, গণিত, মানসিক দক্ষতা, বাংলাদেশ, ভূগোল ও পরিবেশ, নৈতিকতা ও সুশাসন, কম্পিউটার ও তথ্যপ্রযুক্তি ----------
async function seedBatch2Subtopics() {
  const topicsData = [
    {
      topicName: 'ইংরেজি গ্রামার',
      oldNames: ['Tense ও Voice', 'Parts of Speech', 'Sentence Structure'],
      newStructure: [
        { name: 'Parts of Speech', children: ['Noun', 'Pronoun', 'Verb', 'Adjective and Adverb', 'Preposition, Conjunction, Interjection', 'Usage of Various Parts of Speech', 'Interchange of Parts of Speech'] },
        { name: 'Idioms and Phrases', children: ['Idioms and Phrases', 'Classification of Phrase', 'Proverbs'] },
        { name: 'Tense', children: [] },
        { name: 'Clause', children: ['Principal Clause', 'Noun Clause', 'Adjective Clause', 'Verbal and Adverbial Clause'] },
        { name: 'Voice, Narration, Degree', children: [] },
        { name: 'Sentence Correction', children: ['Subject-Verb Agreement', 'Other Fill in the Blanks', 'Sentence Correction'] },
        { name: 'Composition', children: [] },
        { name: 'Sentence and Transformation', children: ['Simple, Complex, Compound', 'Voice', 'Degree', 'Translation', 'Tag Question'] },
      ],
    },
    {
      topicName: 'গণিত',
      oldNames: [],
      newStructure: [
        { name: 'পাটিগণিত', children: ['বাস্তব সংখ্যা, গড়, ভগ্নাংশ, লসাগু ও গসাগু', 'শতকরা, সরল ও যৌগিক মুনাফা, লাভ-ক্ষতি', 'অংশীদারী হিসাব, অনুপাত ও সমানুপাত', 'বয়স ও পরিমাপ সংক্রান্ত', 'নৌকা, ট্রেন, সময় ও গতিবেগ', 'কাজ, নল ও চৌবাচ্চা'] },
        { name: 'বীজগণিত', children: ['বীজগাণিতিক সূত্রাবলী ও প্রয়োগ', 'বহুপদী উৎপাদক', 'সরল দ্বিপদী সমীকরণ এবং সরল সহসমীকরণ', 'সরল ও দ্বিপদী অসমতা', 'সূচক ও লগারিদম', 'ধারা', 'সেট, ফাংশন ও ভেনচিত্র', 'বিন্যাস ও সমাবেশ', 'পরিসংখ্যান ও সম্ভাব্যতা'] },
        { name: 'জ্যামিতি', children: ['রেখা, কোণ, বৃত্ত', 'ত্রিভুজ সংক্রান্ত সমস্যা', 'চতুর্ভুজ সংক্রান্ত', 'পীথাগোরাসের উপপাদ্য ও বহুভুজ', 'ত্রিকোণমিতি', 'পরিমিতি'] },
      ],
    },
    {
      topicName: 'মানসিক দক্ষতা',
      oldNames: ['সংখ্যা ধারা', 'যুক্তি বিশ্লেষণ', 'দিক নির্ণয়'],
      newStructure: [
        { name: 'ভাষাগত ও যৌক্তিক বিচার', children: [] },
        { name: 'সমস্যা সমাধান', children: [] },
        { name: 'বানান ও ভাষা', children: [] },
        { name: 'যান্ত্রিক দক্ষতা', children: [] },
        { name: 'স্থানাঙ্ক সম্পর্ক', children: [] },
        { name: 'সংখ্যাগত ক্ষমতা', children: [] },
        { name: 'বিমূর্ত যুক্তি', children: [] },
      ],
    },
    {
      topicName: 'বাংলাদেশ',
      oldNames: ['ইতিহাস ও মুক্তিযুদ্ধ', 'সংবিধান ও রাজনীতি', 'ভূগোল ও অর্থনীতি'],
      newStructure: [
        { name: 'বাংলাদেশের জাতীয় বিষয়াবলী', children: [] },
        { name: 'কৃষিজ সম্পদ', children: [] },
        { name: 'বাংলাদেশের অর্থনীতি', children: [] },
        { name: 'শিল্প ও বাণিজ্য', children: [] },
        { name: 'জনমিতিক বিষয়সমূহ', children: [] },
        { name: 'সংবিধান', children: [] },
        { name: 'রাজনৈতিক ব্যবস্থা', children: [] },
        { name: 'সরকার ব্যবস্থা', children: [] },
        { name: 'জাতীয় অর্জন ও অন্যান্য', children: [] },
        { name: 'অর্থনৈতিক সমীক্ষা, বাজেট ও অন্যান্য', children: [] },
        { name: 'সাম্প্রতিক বিষয়াবলী', children: [] },
      ],
    },
    {
      topicName: 'ভূগোল ও পরিবেশ',
      oldNames: ['বাংলাদেশের ভূগোল', 'বিশ্ব ভূগোল', 'পরিবেশ ও জলবায়ু'],
      newStructure: [
        { name: 'বাংলাদেশ ও বৈশ্বিক ভৌগোলিক অঞ্চল, সীমানা, আর্থসামাজিক', children: [] },
        { name: 'অঞ্চলভিত্তিক ভৌত পরিবেশ, সম্পদের বন্টন ও গুরুত্ব', children: [] },
        { name: 'বাংলাদেশ ও বৈশ্বিক পরিবেশ: প্রকৃতি ও সম্পদ বন্টনের প্রধান চ্যালেঞ্জ', children: [] },
        { name: 'আবহাওয়া ও জলবায়ুর নিয়ামকসমূহ', children: [] },
        { name: 'প্রাকৃতিক দুর্যোগ ও ব্যবস্থাপনা', children: [] },
        { name: 'বৃহত্তম, ক্ষুদ্রতম, উচ্চতম, গভীরতম, প্রশস্ততম', children: [] },
        { name: 'নদী, হ্রদ, মহাসাগর, সাগর', children: [] },
        { name: 'প্রণালী, সীমারেখা ও অন্যান্য ভৌগোলিক বিষয়', children: [] },
      ],
    },
    {
      topicName: 'নৈতিকতা ও সুশাসন',
      oldNames: ['সুশাসনের উপাদান', 'দুর্নীতি প্রতিরোধ', 'নৈতিক মূল্যবোধ'],
      newStructure: [
        { name: 'নৈতিকতা', children: [] },
        { name: 'মূল্যবোধ', children: [] },
        { name: 'সুশাসন', children: [] },
        { name: 'নৈতিকতা, মূল্যবোধ, সুশাসন সম্পর্কিত বই ও লেখক', children: [] },
        { name: 'বিবিধ', children: [] },
      ],
    },
    {
      topicName: 'কম্পিউটার ও তথ্যপ্রযুক্তি',
      oldNames: ['হার্ডওয়্যার ও সফটওয়্যার', 'ইন্টারনেট ও নেটওয়ার্ক', 'প্রোগ্রামিং ধারণা'],
      newStructure: [
        { name: 'কম্পিউটার', children: ['কম্পিউটারের অঙ্গ সংগঠন ও পেরিফেরালস', 'কম্পিউটার প্রোগ্রাম ও প্রোগ্রামিং ল্যাঙ্গুয়েজ', 'দৈনন্দিন জীবনে কম্পিউটার', 'কম্পিউটার অপারেটিং সিস্টেম', 'কম্পিউটারের ইতিহাস', 'কম্পিউটারের প্রকারভেদ', 'কম্পিউটার নম্বর সিস্টেম ও লজিক গেট', 'ডাটাবেজ সিস্টেম', 'কম্পিউটারে শর্টকাট কমান্ড', 'বিবিধ বিষয়'] },
        { name: 'তথ্য প্রযুক্তি', children: ['ইন্টারনেট সংক্রান্ত', 'কম্পিউটার ও সেলুলার নেটওয়ার্কিং সিস্টেম ও ডাটা কমিউনিকেশন', 'দৈনন্দিন জীবনে তথ্য প্রযুক্তি', 'ক্লায়েন্ট সার্ভার ও ক্লাউড কম্পিউটিং', 'মোবাইল প্রযুক্তি ও এর বৈশিষ্ট্য', 'সোশ্যাল নেটওয়ার্কিং ও তথ্য প্রযুক্তির বড় প্রতিষ্ঠান', 'রোবোটিক্স ও সাইবার অপরাধ', 'তথ্য প্রযুক্তি সংক্রান্ত বিবিধ'] },
      ],
    },
  ];

  const results = {};
  for (const t of topicsData) {
    results[t.topicName] = await replaceSubtopics(t.topicName, t.oldNames, t.newStructure);
  }
  return results;
}

async function seedAllNewSubtopics() {
  const r1 = await seedSubSubtopics();
  const r2 = await seedBanglaGrammarSubtopics();
  return { banglaSahitya: r1, banglaGrammar: r2 };
}

module.exports = { seedTopics, seedSubtopics, seedSubSubtopics, seedBanglaGrammarSubtopics, seedBatch2Subtopics, seedAllNewSubtopics };
