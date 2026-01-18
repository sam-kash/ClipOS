import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    script: {
        type: String,
        default: '',
    },
    niche: {
        type: String,
        default: 'general',
    },
    status: {
        type: String,
        enum: ['draft', 'processing', 'completed', 'failed'],
        default: 'draft',
    },
    videoPath: {
        type: String,
    },
    processedVideoPath: {
        type: String,
    },
    captions: {
        type: String,
    },
    captionStyle: {
        type: String,
        enum: ['default', 'bold', 'minimal', 'colorful'],
        default: 'default',
    },
}, {
    timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
