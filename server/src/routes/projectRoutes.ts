import express from 'express';
import {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
} from '../controllers/projectController.js';

const router = express.Router();

// Create project with AI script
router.post('/', createProject);

// Get all projects
router.get('/', getProjects);

// Get single project
router.get('/:id', getProject);

// Update project
router.put('/:id', updateProject);

// Delete project
router.delete('/:id', deleteProject);

export default router;
