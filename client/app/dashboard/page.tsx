'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Project {
    _id: string;
    title: string;
    script: string;
    niche: string;
    status: string;
    createdAt: string;
}

const API_URL = 'http://localhost:5000';

export default function DashboardPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token) {
            router.push('/login');
            return;
        }

        if (userData) {
            setUser(JSON.parse(userData));
        }

        // Fetch real projects from API
        fetchProjects();
    }, [router]);

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${API_URL}/api/projects`);
            const data = await res.json();
            if (data.success) {
                setProjects(data.projects);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'processing': return 'bg-yellow-500';
            case 'failed': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Navigation */}
            <nav className="flex justify-between items-center p-6 border-b border-gray-800">
                <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    ClipOS
                </Link>
                <div className="flex items-center gap-4">
                    <span className="text-gray-400">Welcome, {user?.name || 'Creator'}</span>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-gray-400 mt-1">Manage your viral content projects</p>
                    </div>
                    <Link
                        href="/dashboard/create"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition transform active:scale-95"
                    >
                        + New Project
                    </Link>
                </header>

                {/* Quick Actions */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Link href="/dashboard/create" className="p-4 bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl border border-blue-700 hover:border-blue-500 transition">
                        <div className="text-2xl mb-2">✍️</div>
                        <h3 className="font-semibold">Generate Script</h3>
                        <p className="text-sm text-gray-400">AI-powered viral scripts</p>
                    </Link>
                    <Link href="/dashboard/upload" className="p-4 bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl border border-purple-700 hover:border-purple-500 transition">
                        <div className="text-2xl mb-2">📤</div>
                        <h3 className="font-semibold">Upload Video</h3>
                        <p className="text-sm text-gray-400">Add captions & process</p>
                    </Link>
                    <Link href="/dashboard/process" className="p-4 bg-gradient-to-br from-pink-900 to-pink-800 rounded-xl border border-pink-700 hover:border-pink-500 transition">
                        <div className="text-2xl mb-2">🎬</div>
                        <h3 className="font-semibold">Process Video</h3>
                        <p className="text-sm text-gray-400">Full AI pipeline</p>
                    </Link>
                </section>

                {/* Projects Grid */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
                    {loading ? (
                        <div className="text-center py-16">
                            <div className="animate-spin text-4xl mb-4">⏳</div>
                            <p className="text-gray-400">Loading projects...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
                            <div className="text-4xl mb-4">🎬</div>
                            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                            <p className="text-gray-400 mb-4">Create your first viral video project</p>
                            <Link
                                href="/dashboard/create"
                                className="inline-block px-6 py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-500 transition"
                            >
                                Get Started
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <Link
                                    key={project._id}
                                    href={`/dashboard/project/${project._id}`}
                                    className="p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-600 transition cursor-pointer block"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-16 w-16 bg-gray-800 rounded-lg flex items-center justify-center">
                                            <span className="text-2xl">🎥</span>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold">{project.title}</h3>
                                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{project.script}</p>
                                    <div className="flex justify-between items-center mt-4 text-xs text-gray-600">
                                        <span>{project.niche}</span>
                                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
