const express = require('express');
const router = express.Router();
const multer = require('multer');

//use memory storage for now
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/vods/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});


const fileType = /mp4|mov|avi|mkv/;//only take video files
const upload = multer({
    storage: storage, limits: { fileSize: 100 * 1024 * 1024 }, // limit to 100 MB
    fileFilter: function (req, file, cb) {
        const extname = fileType.test(file.originalname.toLowerCase());
        const mimetype = fileType.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only video files are allowed!'));
        }
    }
});

router.post('/', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
          return res.status(400).send("No file uploaded.");
        }
        res.json({
          message: "Video uploaded successfully"
        });
      } catch (err) {
        res.status(500).send(err.message);
      }
})

module.exports = router;