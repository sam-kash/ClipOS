import express from 'express';
import {
    createAvatarVideo,
    createVideoFromImage,
    getTaskStatus,
} from '../controllers/skyreelsController.js';

const router = express.Router();

// Create talking avatar video
router.post('/avatar', createAvatarVideo);

// Generate video from image
router.post('/image-to-video', createVideoFromImage);

// Check task status
router.get('/status/:taskId', getTaskStatus);

export default router;
