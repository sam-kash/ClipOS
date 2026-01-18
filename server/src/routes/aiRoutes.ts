import express from 'express';
import { createScript, createCaptions } from '../controllers/aiController.js';

const router = express.Router();

router.post('/script', createScript);
router.post('/captions', createCaptions);

export default router;
