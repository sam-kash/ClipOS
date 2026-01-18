import { Request, Response } from 'express';
import { generateScript, generateCaptions } from '../services/aiService.js';

export const createScript = async (req: Request, res: Response) => {
    const { topic, niche } = req.body;
    try {
        const script = await generateScript(topic, niche || 'general');
        res.json({ script });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createCaptions = async (req: Request, res: Response) => {
    // In a real app, logic would be: Video upload -> Extract Audio -> Transcribe.
    // Here we assume audioPath is passed or derived from a previous upload ID.
    // For MVP, lets just mock it or expect a local path key (unsafe but ok for mvp)
    const { audioPath } = req.body;
    try {
        const captions = await generateCaptions(audioPath);
        res.json({ captions });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
