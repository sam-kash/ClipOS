'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = 'http://localhost:5000';

export default function CreateProjectPage() {
    const [step, setStep] = useState(1);
    const [topic, setTopic] = useState('');
    const [niche, setNiche] = useState('Tech');
    const [script, setScript] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [projectId, setProjectId] = useState<string | null>(null);
    const router = useRouter();

    const handleGenerateScript = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic for your video');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Create project and generate script via real API
            const res = await fetch(`${API_URL}/api/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: topic,
                    topic,
                    niche,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to generate script');
            }

            setScript(data.project.script);
            setProjectId(data.project._id);
            setStep(2);
        } catch (err: any) {
            setError(err.message || 'Failed to generate script. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateScript = async () => {
        if (!projectId) return;

        try {
            await fetch(`${API_URL}/api/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script }),
            });
            setStep(3);
        } catch (err: any) {
            setError('Failed to save script');
        }
    };

    const handleFinish = () => {
        router.push(`/dashboard/project/${projectId}`);
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

            <div className="p-8">
                <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
                <p className="text-gray-400 mb-8">Generate viral content with AI</p>

                {/* Progress Steps */}
                <div className="flex items-center gap-4 mb-8 max-w-2xl mx-auto">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-400' : 'text-gray-600'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-purple-600' : 'bg-gray-800'}`}>1</div>
                        <span className="hidden sm:block">Idea</span>
                    </div>
                    <div className={`flex-1 h-1 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-800'}`}></div>
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-400' : 'text-gray-600'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-purple-600' : 'bg-gray-800'}`}>2</div>
                        <span className="hidden sm:block">Script</span>
                    </div>
                    <div className={`flex-1 h-1 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-800'}`}></div>
                    <div className={`flex items-center gap-2 ${step >= 3 ? 'text-purple-400' : 'text-gray-600'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-purple-600' : 'bg-gray-800'}`}>3</div>
                        <span className="hidden sm:block">Done</span>
                    </div>
                </div>

                {error && (
                    <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                        {error}
                    </div>
                )}

                <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-xl border border-gray-800">
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">Step 1: What's your video about?</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Video Topic *
                                </label>
                                <textarea
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none min-h-[120px] resize-none"
                                    placeholder="e.g. 5 morning habits that changed my life, How to go viral on TikTok..."
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Content Niche
                                </label>
                                <select
                                    value={niche}
                                    onChange={(e) => setNiche(e.target.value)}
                                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    disabled={loading}
                                >
                                    <option value="Tech">Tech</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Lifestyle">Lifestyle</option>
                                    <option value="Fitness">Fitness</option>
                                    <option value="Education">Education</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Business">Business</option>
                                    <option value="Gaming">Gaming</option>
                                    <option value="Food">Food</option>
                                    <option value="Travel">Travel</option>
                                </select>
                            </div>

                            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                                <p className="text-sm text-blue-300">
                                    💡 <strong>Tip:</strong> Be specific! Instead of "productivity tips", try "5 morning habits that helped me 10x my productivity as a developer"
                                </p>
                            </div>

                            <button
                                onClick={handleGenerateScript}
                                disabled={loading || !topic.trim()}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating with GPT-4...
                                    </span>
                                ) : (
                                    '✨ Generate Script with AI'
                                )}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Step 2: Review & Edit Your Script</h2>
                                <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                                    ~{Math.ceil(script.split(' ').length / 150)} min read
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm">Edit your AI-generated script as needed</p>

                            <textarea
                                value={script}
                                onChange={(e) => setScript(e.target.value)}
                                className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg min-h-[400px] font-mono text-sm leading-relaxed"
                            />

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleUpdateScript}
                                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:opacity-90 transition font-semibold"
                                >
                                    Save & Continue →
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 text-center">
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-2xl font-semibold">Project Created!</h2>
                            <p className="text-gray-400">Your AI-generated script is ready. Now you can upload a video to add captions.</p>

                            <div className="bg-gray-800 p-4 rounded-lg text-left">
                                <h3 className="font-semibold mb-2">{topic}</h3>
                                <p className="text-sm text-gray-400 line-clamp-4">{script}</p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                                >
                                    ← Edit Script
                                </button>
                                <button
                                    onClick={handleFinish}
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 transition font-semibold"
                                >
                                    View Project →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
