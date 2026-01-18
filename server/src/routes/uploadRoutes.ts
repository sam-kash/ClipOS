import express from 'express';
import { uploadVideo } from '../controllers/uploadController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/', upload.single('video'), uploadVideo);

export default router;
