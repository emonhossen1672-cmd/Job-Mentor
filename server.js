const express = require('express');
const cors = require('cors');
require('dotenv').config();
const examArchiveRoutes = require('./examArchive.routes');
const initExamArchiveDb = require('./initExamArchive');
const initTopicsDb = require('./initTopicsDb');
const topicsRoutes = require('./topics.routes');
const bulkUploadRoutes = require('./bulkUpload.routes');
const { seedTopics } = require('./seedTopics');
const initWrittenExamTables = require('./initWrittenExamDb');
const initMcqTable = require('./initMcqDb');
const writtenExamRoutes = require('./writtenExam.routes');
const uploadRoutes = require('./upload.routes');
const mcqRoutes = require('./mcq.routes');
const modelTestRoutes = require('./modelTest.routes');
const writtenModelTestRoutes = require('./writtenModelTest.routes');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/setup-exam-archive-db', async (req, res) => {
  const result = await initExamArchiveDb();
  if (result.success) {
    res.send('✅ Exam archive table created successfully!');
  } else {
    res.status(500).send('❌ Error: ' + result.error);
  }
});
app.get('/setup-topics-db', async (req, res) => {
  const result = await initTopicsDb();
  if (result.success) {
    res.send('✅ Topics tables created successfully!');
  } else {
    res.status(500).send('❌ Error: ' + result.error);
  }
});
app.get('/seed-topics', async (req, res) => {
  const result = await seedTopics();
  if (result.success) {
    res.send('✅ Topics added successfully!');
  } else {
    res.status(500).send('❌ Error: ' + result.error);
  }
});
app.get('/seed-subtopics', async (req, res) => {
  const { seedSubtopics } = require('./seedTopics');
  const result = await seedSubtopics();
  if (result.success) {
    res.send('✅ Subtopics added successfully!');
  } else {
    res.status(500).send('❌ Error: ' + result.error);
  }
});
app.get('/list-topics', async (req, res) => {
  try {
    const pool = require('./db');
    const result = await pool.query('SELECT id, name, order_index FROM topics ORDER BY order_index');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('❌ Error: ' + err.message);
  }
});
app.get('/', (req, res) => res.send('উত্তরণ ব্যাকএন্ড চলছে ✅'));

app.use('/api', writtenExamRoutes);
app.use('/api', uploadRoutes);
app.use('/', examArchiveRoutes);
app.use('/api', examArchiveRoutes);
app.use('/api', topicsRoutes);
app.use('/api/mcqs', mcqRoutes);
app.use('/', bulkUploadRoutes);
app.use('/api', bulkUploadRoutes);
app.use('/api', modelTestRoutes);
app.use('/api', writtenModelTestRoutes);
const PORT = process.env.PORT || 3000;

initWrittenExamTables()
  .then(() => initMcqTable())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 সার্ভার চলছে পোর্ট ${PORT} এ`);
    });
  });
