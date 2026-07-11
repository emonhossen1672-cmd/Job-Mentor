const express = require('express');
const cors = require('cors');
require('dotenv').config();

const initWrittenExamTables = require('./initWrittenExamDb');
const initMcqTable = require('./initMcqDb');
const writtenExamRoutes = require('./writtenExam.routes');
const uploadRoutes = require('./upload.routes');
const mcqRoutes = require('./mcq.routes');
const app = express();
app.use(cors());
app.use(express.json());

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
