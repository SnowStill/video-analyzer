const express = require('express');
const gradeRouter = require('./routes/grade');

// Create app
const app = express();
app.use(express.json());

// Mount routes
app.use('/grade', gradeRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Video Grader API running on localhost:${PORT}`);
});