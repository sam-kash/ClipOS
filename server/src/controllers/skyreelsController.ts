import { Request, Response } from 'express';
import {
    generateTalkingAvatar,
    generateVideoFromImage,
    checkTaskStatus,
} from '../services/skyreelsService.js';

/**
 * Create a talking avatar video
 * POST /api/skyreels/avatar
 * Body: { text: string, avatarImageUrl?: string }
 */
export const createAvatarVideo = async (req: Request, res: Response) => {
    const { text, avatarImageUrl } = req.body;

    if (!text) {
        res.status(400).json({ error: 'Text is required' });
        return;
    }

    try {
        const result = await generateTalkingAvatar(text, avatarImageUrl);
        res.json(result);
    } catch (error: any) {
        console.error('[SkyReels] Avatar creation error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Generate video from an image
 * POST /api/skyreels/image-to-video
 * Body: { prompt: string, imageUrl: string }
 */
export const createVideoFromImage = async (req: Request, res: Response) => {
    const { prompt, imageUrl } = req.body;

    if (!prompt || !imageUrl) {
        res.status(400).json({ error: 'Prompt and imageUrl are required' });
        return;
    }

    try {
        const result = await generateVideoFromImage(prompt, imageUrl);
        res.json(result);
    } catch (error: any) {
        console.error('[SkyReels] Video generation error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Check the status of a video generation task
 * GET /api/skyreels/status/:taskId
 */
export const getTaskStatus = async (req: Request, res: Response) => {
    const taskId = req.params.taskId as string;

    if (!taskId) {
        res.status(400).json({ error: 'Task ID is required' });
        return;
    }

    try {
        const result = await checkTaskStatus(taskId);
        res.json(result);
    } catch (error: any) {
        console.error('[SkyReels] Status check error:', error.message);
        res.status(500).json({ error: error.message });
    }
};
