import { Request, Response } from 'express';
import Project from '../models/Project.js';
import { generateScript } from '../services/aiService.js';

// Create a new project with AI-generated script
export const createProject = async (req: Request, res: Response) => {
    const { title, topic, niche, userId } = req.body;

    try {
        // Generate script using AI
        const script = await generateScript(topic || title, niche || 'general');

        const project = await Project.create({
            userId: userId || '000000000000000000000000', // Temp: should come from auth
            title: title || topic,
            script,
            niche: niche || 'general',
            status: 'draft',
        });

        res.status(201).json({
            success: true,
            project,
        });
    } catch (error: any) {
        console.error('Create project error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all projects for a user
export const getProjects = async (req: Request, res: Response) => {
    const { userId } = req.query;

    try {
        const projects = await Project.find(
            userId ? { userId } : {}
        ).sort({ createdAt: -1 });

        res.json({ success: true, projects });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get single project
export const getProject = async (req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        res.json({ success: true, project });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Update project
export const updateProject = async (req: Request, res: Response) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        res.json({ success: true, project });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Delete project
export const deleteProject = async (req: Request, res: Response) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        res.json({ success: true, message: 'Project deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
