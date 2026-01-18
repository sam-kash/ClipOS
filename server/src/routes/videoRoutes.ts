import express from 'express';
import upload from '../middleware/upload.js';
import {
    processVideo,
    uploadVideoToProject,
    getProcessingStatus,
} from '../controllers/videoController.js';

const router = express.Router();

// Upload video to a project
router.post('/:projectId/upload', upload.single('video'), uploadVideoToProject);

// Process video (extract audio → transcribe → burn captions)
router.post('/:projectId/process', processVideo);

// Get processing status
router.get('/:projectId/status', getProcessingStatus);

export default router;
