'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = 'http://localhost:5000';

interface Project {
    _id: string;
    title: string;
    script: string;
    niche: string;
    status: string;
    videoPath?: string;
    processedVideoPath?: string;
    captions?: string;
    createdAt: string;
}

export default function ProjectDetailPage() {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [script, setScript] = useState('');
    const [processing, setProcessing] = useState(false);
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        fetchProject();
    }, [params.id]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`${API_URL}/api/projects/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setProject(data.project);
                setScript(data.project.script);
            }
        } catch (error) {
            console.error('Failed to fetch project:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`${API_URL}/api/projects/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script }),
            });
            const data = await res.json();
            if (data.success) {
                setProject(data.project);
            }
        } catch (error) {
            console.error('Failed to save:', error);
        }
        setEditing(false);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            await fetch(`${API_URL}/api/projects/${params.id}`, {
                method: 'DELETE',
            });
            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const handleProcessVideo = async () => {
        if (!project?.videoPath) {
            alert('Please upload a video first');
            return;
        }

        setProcessing(true);
        try {
            const res = await fetch(`${API_URL}/api/video/${params.id}/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ captionStyle: 'bold' }),
            });
            const data = await res.json();

            if (data.success) {
                await fetchProject();
                alert('Video processed successfully! Captions have been burned onto your video.');
            } else {
                alert(`Processing failed: ${data.message}`);
            }
        } catch (error: any) {
            alert(`Processing failed: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p>Loading project...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <p>Project not found</p>
                    <Link href="/dashboard" className="text-purple-400 hover:underline mt-4 block">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Navigation */}
            <nav className="flex justify-between items-center p-6 border-b border-gray-800">
                <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    ClipOS
                </Link>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
                    ← Back to Dashboard
                </Link>
            </nav>

            <div className="p-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold">{project.title}</h1>
                            <span className={`px-3 py-1 text-xs rounded-full ${project.status === 'completed' ? 'bg-green-500' :
                                    project.status === 'processing' ? 'bg-yellow-500' :
                                        project.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                                }`}>
                                {project.status}
                            </span>
                        </div>
                        <p className="text-gray-400">
                            {project.niche} • Created {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setEditing(!editing)}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                        >
                            ✏️ {editing ? 'Cancel' : 'Edit'}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition"
                        >
                            🗑️ Delete
                        </button>
                    </div>
                </div>

                {/* Script Section */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">📝 Script</h2>
                    {editing ? (
                        <div className="space-y-4">
                            <textarea
                                value={script}
                                onChange={(e) => setScript(e.target.value)}
                                className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg min-h-[300px] font-mono text-sm"
                            />
                            <button
                                onClick={handleSave}
                                className="px-6 py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-500 transition"
                            >
                                💾 Save Changes
                            </button>
                        </div>
                    ) : (
                        <div className="whitespace-pre-wrap text-gray-300 bg-gray-800 p-4 rounded-lg font-mono text-sm max-h-[400px] overflow-auto">
                            {project.script}
                        </div>
                    )}
                </div>

                {/* Video Section */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">🎬 Video</h2>

                    {project.processedVideoPath ? (
                        <div className="space-y-4">
                            <div className="bg-black rounded-lg overflow-hidden">
                                <video
                                    src={`${API_URL}${project.processedVideoPath}`}
                                    controls
                                    className="w-full max-h-[400px]"
                                />
                            </div>
                            <a
                                href={`${API_URL}${project.processedVideoPath}`}
                                download
                                className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-semibold hover:opacity-90 transition"
                            >
                                ⬇️ Download Captioned Video
                            </a>
                        </div>
                    ) : project.videoPath ? (
                        <div className="space-y-4">
                            <div className="bg-gray-800 rounded-lg p-4">
                                <p className="text-sm text-gray-400 mb-2">Original video uploaded:</p>
                                <p className="font-mono text-sm">{project.videoPath}</p>
                            </div>
                            <button
                                onClick={handleProcessVideo}
                                disabled={processing}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing with FFmpeg & Whisper...
                                    </span>
                                ) : (
                                    '🔥 Process Video (Add AI Captions)'
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-4">📤</div>
                            <p className="text-gray-400 mb-4">No video uploaded yet</p>
                            <Link
                                href={`/dashboard/upload?projectId=${project._id}`}
                                className="inline-block px-6 py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-500 transition"
                            >
                                Upload Video
                            </Link>
                        </div>
                    )}
                </div>

                {/* Captions Section */}
                {project.captions && (
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">💬 Generated Captions</h2>
                            <button
                                onClick={() => navigator.clipboard.writeText(project.captions || '')}
                                className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition text-sm"
                            >
                                📋 Copy SRT
                            </button>
                        </div>
                        <pre className="whitespace-pre-wrap text-gray-300 bg-gray-800 p-4 rounded-lg font-mono text-sm max-h-[300px] overflow-auto">
                            {project.captions}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
