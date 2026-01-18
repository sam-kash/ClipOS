'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CaptionsPage() {
    const [audioPath, setAudioPath] = useState('');
    const [captions, setCaptions] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateCaptions = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:5000/api/ai/captions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioPath: audioPath || 'demo.mp3' }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to generate captions');
            }

            setCaptions(typeof data.captions === 'string' ? data.captions : JSON.stringify(data.captions, null, 2));
        } catch (err: any) {
            setError(err.message || 'Failed to generate captions');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(captions);
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
                <h1 className="text-3xl font-bold mb-2">Auto Captions</h1>
                <p className="text-gray-400 mb-8">Generate captions for your video using Whisper AI</p>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                        {error}
                    </div>
                )}

                <div className="space-y-6 bg-gray-900 p-8 rounded-xl border border-gray-800">
                    {!captions ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Audio/Video Path (optional)
                                </label>
                                <input
                                    type="text"
                                    value={audioPath}
                                    onChange={(e) => setAudioPath(e.target.value)}
                                    placeholder="uploads/your-video.mp4"
                                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    disabled={loading}
                                />
                                <p className="text-gray-600 text-sm mt-2">
                                    Leave empty to use demo audio
                                </p>
                            </div>

                            <button
                                onClick={handleGenerateCaptions}
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating Captions...
                                    </span>
                                ) : (
                                    '💬 Generate Captions with Whisper AI'
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Generated Captions</h2>
                                <button
                                    onClick={handleCopyToClipboard}
                                    className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition text-sm"
                                >
                                    📋 Copy
                                </button>
                            </div>

                            <textarea
                                value={captions}
                                onChange={(e) => setCaptions(e.target.value)}
                                className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg min-h-[400px] font-mono text-sm"
                            />

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setCaptions('')}
                                    className="flex-1 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                                >
                                    Generate New
                                </button>
                                <Link
                                    href="/dashboard"
                                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:opacity-90 transition text-center font-semibold"
                                >
                                    ✅ Done
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
