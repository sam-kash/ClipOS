'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const API_URL = 'http://localhost:5000';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedPath, setUploadedPath] = useState('');
    const [projectId, setProjectId] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get projectId from URL if provided
    const urlProjectId = searchParams.get('projectId');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
            if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(mp4|mov|avi|mkv)$/i)) {
                setError('Please select a valid video file (MP4, MOV, AVI, MKV)');
                return;
            }
            setFile(selectedFile);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        const targetProjectId = urlProjectId || projectId;
        if (!targetProjectId) {
            setError('Please enter a Project ID');
            return;
        }

        setUploading(true);
        setError('');
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('video', file);

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 300);

            const res = await fetch(`${API_URL}/api/video/${targetProjectId}/upload`, {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Upload failed');
            }

            setUploadedPath(data.videoPath);

            // Redirect to project page after short delay
            setTimeout(() => {
                router.push(`/dashboard/project/${targetProjectId}`);
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to upload video');
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            setError('');
        }
    };

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

            <div className="p-8 max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Upload Video</h1>
                <p className="text-gray-400 mb-8">Upload your video to process with AI captions</p>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                        {error}
                    </div>
                )}

                {!uploadedPath ? (
                    <div className="space-y-6">
                        {/* Project ID Input */}
                        {!urlProjectId && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Project ID *
                                </label>
                                <input
                                    type="text"
                                    value={projectId}
                                    onChange={(e) => setProjectId(e.target.value)}
                                    placeholder="Enter project ID from dashboard"
                                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    disabled={uploading}
                                />
                                <p className="text-gray-600 text-sm mt-2">
                                    Tip: Create a project first, then upload video to it
                                </p>
                            </div>
                        )}

                        {urlProjectId && (
                            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                                <p className="text-sm text-green-300">
                                    ✅ Uploading to project: <code className="bg-gray-800 px-2 py-1 rounded">{urlProjectId}</code>
                                </p>
                            </div>
                        )}

                        {/* Drop Zone */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${file ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700 hover:border-purple-500'
                                }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*,.mp4,.mov,.avi,.mkv"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <div className="text-5xl mb-4">{file ? '✅' : '📤'}</div>
                            <h3 className="text-xl font-semibold mb-2">
                                {file ? file.name : 'Drop your video here'}
                            </h3>
                            <p className="text-gray-400">
                                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'or click to browse'}
                            </p>
                            <p className="text-gray-600 text-sm mt-4">
                                Supported: MP4, MOV, AVI, MKV (max 500MB)
                            </p>
                        </div>

                        {/* Upload Progress */}
                        {uploading && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Upload Button */}
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading || (!urlProjectId && !projectId)}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Uploading...' : '🚀 Upload Video'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center space-y-6 bg-gray-900 p-8 rounded-xl border border-gray-800">
                        <div className="text-6xl">✅</div>
                        <h2 className="text-2xl font-semibold">Upload Complete!</h2>
                        <p className="text-gray-400">Your video has been uploaded. Redirecting to project...</p>

                        <div className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">File:</p>
                            <p className="font-mono text-sm">{uploadedPath}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
