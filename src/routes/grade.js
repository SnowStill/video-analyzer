const express = require('express');
const router = express.Router();
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(fmpegInstaller.path);

//-------------------------Multer setup for video upload-------------------------
//define storage for the videos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/vods/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

//filter to only accept video files
const fileType = /mp4|mov|avi|mkv/;
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

// -------------------------Frame extraction function-------------------------
function extractFrames(videoPath, outputDir, fps = 1) {
    return new Promise((resolve, reject) => {

        if (!fs.existsSync(outputDir)){
            fs.mkdirSync(outputDir, { recursive: true });
        }

        ffmpeg(videoPath)
            .outputOptions([
                `-vf fps=${fps}`
            ])
            .output(`${outputDir}/frame-%04d.png`)
            .on('end', () => {
                resolve();
            })
            .on('error', (err) => {
                reject(err);
            })
            .run();
    });
}

//-------------------------Video grading function-------------------------
async function gradeVideo(videoPath) {

    const outputDir = 'src/frames/' + path.basename(videoPath, path.extname(videoPath));

    try{
        await extractFrames(videoPath, outputDir, 1); // Extract 1 frame per second
        return {
            grade: 4.3,
            aiGenerated: true,
            explanation: "nice",
            keyActions: [
                {
                    keyActionName: "Content Matches Task Description",
                    grade: 5,
                    details: "good"
                },
                {
                    keyActionName: "Relevant to Specific Brand",
                    grade: 3.6,
                    details: "bad"
                }
            ]
        }; // Example grade
    }
    catch (err){
        throw new Error(`Error grading video: ${err.message}`);
    }
    finally{
        // Clean up extracted frames
        try {
            if(fs.existsSync(outputDir)){
                fs.rmSync(outputDir, { recursive: true });
                //console.log(`Cleaned up frames at: ${outputDir}`);
            }
        }
        catch (cleanupErr) {
            console.error(`Error cleaning up frames: ${cleanupErr.message}`);
        }

        //clean up uploaded video
        try {
            if(fs.existsSync(videoPath)){
                fs.unlinkSync(videoPath);
                //console.log(`Deleted uploaded video: ${videoPath}`);
            }
        }
        catch (videoCleanupErr) {
            console.error(`Error deleting uploaded video: ${videoCleanupErr.message}`);
        }
    }
}


//-------------------------Routes-------------------------


// POST /grade/ - the endpoint to upload a video file
router.post('/', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
          return res.status(400).send("No file uploaded.");
        }
        const videoPath = req.file.path;
        // Grade the video
        const gradeResult = await gradeVideo(videoPath);
        res.json(gradeResult);
      } catch (err) {
        res.status(500).send(err.message);
      }
})

module.exports = router;