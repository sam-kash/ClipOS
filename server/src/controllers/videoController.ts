import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import Project from '../models/Project.js';
import { extractAudio, burnCaptions, getVideoMetadata, generateSRT } from '../services/videoService.js';
import { generateCaptions } from '../services/aiService.js';

const UPLOADS_DIR = path.resolve('uploads');
const PROCESSED_DIR = path.resolve('processed');

// Ensure directories exist
if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
}

/**
 * Process a video: Extract audio → Transcribe → Burn captions
 */
export const processVideo = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { captionStyle } = req.body;

    try {
        // Get project
        const project = await Project.findById(projectId);
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        if (!project.videoPath) {
            res.status(400).json({ message: 'No video uploaded for this project' });
            return;
        }

        const videoPath = path.join(UPLOADS_DIR, project.videoPath);
        if (!fs.existsSync(videoPath)) {
            res.status(400).json({ message: 'Video file not found' });
            return;
        }

        // Update status to processing
        project.status = 'processing';
        await project.save();

        console.log('🎬 Starting video processing for:', videoPath);

        // Step 1: Get video metadata
        const metadata = await getVideoMetadata(videoPath);
        console.log('📊 Video duration:', metadata.format.duration, 'seconds');

        // Step 2: Extract audio
        const audioPath = path.join(PROCESSED_DIR, `${projectId}_audio.mp3`);
        await extractAudio(videoPath, audioPath);
        console.log('✅ Audio extracted');

        // Step 3: Transcribe with Whisper
        const captions = await generateCaptions(audioPath);
        console.log('✅ Captions generated');

        // Step 4: Save captions as SRT file
        const srtPath = path.join(PROCESSED_DIR, `${projectId}_captions.srt`);
        const srtContent = generateSRT(captions);
        fs.writeFileSync(srtPath, srtContent);
        console.log('✅ SRT file saved');

        // Step 5: Burn captions onto video
        const outputFilename = `${projectId}_captioned.mp4`;
        const outputPath = path.join(PROCESSED_DIR, outputFilename);
        await burnCaptions(videoPath, srtPath, outputPath, captionStyle || 'default');
        console.log('✅ Captions burned onto video');

        // Update project with results
        project.captions = captions;
        project.processedVideoPath = outputFilename;
        project.captionStyle = captionStyle || 'default';
        project.status = 'completed';
        await project.save();

        res.json({
            success: true,
            message: 'Video processed successfully',
            project: {
                id: project._id,
                processedVideoPath: `/processed/${outputFilename}`,
                captions: captions,
                status: 'completed',
            },
        });
    } catch (error: any) {
        console.error('❌ Video processing failed:', error);

        // Update project status to failed
        try {
            await Project.findByIdAndUpdate(projectId, { status: 'failed' });
        } catch (e) { }

        res.status(500).json({
            message: 'Video processing failed',
            error: error.message,
        });
    }
};

/**
 * Upload video to a project
 */
export const uploadVideoToProject = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const file = req.file;

    if (!file) {
        res.status(400).json({ message: 'No video file uploaded' });
        return;
    }

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        // Update project with video path
        project.videoPath = file.filename;
        project.status = 'draft';
        await project.save();

        res.json({
            success: true,
            message: 'Video uploaded successfully',
            videoPath: file.filename,
            project,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get video processing status
 */
export const getProcessingStatus = async (req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        res.json({
            status: project.status,
            videoPath: project.videoPath,
            processedVideoPath: project.processedVideoPath ? `/processed/${project.processedVideoPath}` : null,
            captions: project.captions,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
