const express = require('express');
const router = express.Router();
const multer = require('multer');

//use memory storage for now
const storage= multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded' });
    }

    console.log(`Received video file: ${req.file.originalname}, size: ${req.file.size} bytes`);

    //dummy grade function
    const dummyGrade = {
        score: 85,
        feedback: 'Good job! Your video meets most of the criteria.'
    };

    res.json(dummyGrade);
})

module.exports = router;