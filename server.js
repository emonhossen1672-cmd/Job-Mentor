const express = require('express');
const cors = require('cors');
require('dotenv').config();
const initTopicsDb = require('./initTopicsDb');
const seedTopics = require('./seedTopics');
const initWrittenExamTables = require('./initWrittenExamDb');
const initMcqTable = require('./initMcqDb');
const writtenExamRoutes = require('./writtenExam.routes');
const uploadRoutes = require('./upload.routes');
const mcqRoutes = require('./mcq.routes');
const app = express();
app.use(cors());
app.use(express.json());
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
app.use('/api/mcqs', mcqRoutes);
const PORT = process.env.PORT || 3000;

initWrittenExamTables()
  .then(() => initMcqTable())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 সার্ভার চলছে পোর্ট ${PORT} এ`);
    });
  });
