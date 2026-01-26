// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import skyreelsRoutes from './routes/skyreelsRoutes.js';
import path from 'path';
import fs from 'fs';

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Create directories if they don't exist
const uploadsDir = path.resolve('uploads');
const processedDir = path.resolve('processed');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/skyreels', skyreelsRoutes);

// Serve static files
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/processed', express.static(path.join(__dirname, 'processed')));

app.get('/', (req, res) => {
    res.json({
        message: 'ClipOS API is running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            projects: '/api/projects',
            video: '/api/video',
            ai: '/api/ai',
            upload: '/api/upload',
            skyreels: '/api/skyreels',
        },
    });
});

app.listen(PORT, () => {
    console.log(` ClipOS Server running on port ${PORT}`);
    console.log(` Uploads: ${uploadsDir}`);
    console.log(` Processed: ${processedDir}`);
});
