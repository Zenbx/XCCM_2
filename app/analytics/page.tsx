"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    BarChart3,
    TrendingUp,
    Eye,
    Download,
    Heart,
    BookOpen,
    FileText,
    Loader2,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';
import Link from 'next/link';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

interface ProjectStats {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    is_published: boolean;
    description?: string;
    category?: string;
    level?: string;
    stats: {
        parts: number;
        documents: number;
        comments: number;
        views: number;
        downloads: number;
        likes: number;
        uniqueViews: number;
    };
}

export default function UserAnalyticsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<ProjectStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        fetchProjects();
    }, [user, router]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const token = authService.getAuthToken();

            const response = await fetch(`${API_BASE_URL}/api/user/projects`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des projets');
            }

            const data = await response.json();
            setProjects(data.data?.projects || []);
        } catch (error) {
            console.error('Erreur fetch projects:', error);
            toast.error("Erreur lors du chargement des analytics");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#99334C]" size={40} />
            </div>
        );
    }

    // Calculate global stats
    const globalStats = projects.reduce((acc, proj) => ({
        totalProjects: acc.totalProjects + 1,
        totalDocuments: acc.totalDocuments + proj.stats.documents,
        totalViews: acc.totalViews + proj.stats.views,
        totalDownloads: acc.totalDownloads + proj.stats.downloads,
        totalLikes: acc.totalLikes + proj.stats.likes,
        totalComments: acc.totalComments + proj.stats.comments,
    }), {
        totalProjects: 0,
        totalDocuments: 0,
        totalViews: 0,
        totalDownloads: 0,
        totalLikes: 0,
        totalComments: 0,
    });

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <BarChart3 className="text-[#99334C]" size={32} />
                        Mes Analytics
                    </h1>
                    <p className="text-gray-600">Vue d'ensemble des performances de vos projets</p>
                </div>

                {/* Global Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <BookOpen size={24} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Projets Totaux</p>
                        <p className="text-3xl font-black text-gray-900">{globalStats.totalProjects}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                <FileText size={24} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Documents Publiés</p>
                        <p className="text-3xl font-black text-gray-900">{globalStats.totalDocuments}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <Eye size={24} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Vues Totales</p>
                        <p className="text-3xl font-black text-gray-900">{globalStats.totalViews.toLocaleString()}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                                <Download size={24} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Téléchargements</p>
                        <p className="text-3xl font-black text-gray-900">{globalStats.totalDownloads.toLocaleString()}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-pink-50 text-pink-600 rounded-lg">
                                <Heart size={24} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Likes Totales</p>
                        <p className="text-3xl font-black text-gray-900">{globalStats.totalLikes.toLocaleString()}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Engagement</p>
                        <p className="text-3xl font-black text-gray-900">{globalStats.totalComments}</p>
                    </div>
                </div>

                {/* Projects Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Performance par Projet</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Projet</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Vues</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Téléchargements</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Likes</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Documents</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-gray-900">{project.name}</p>
                                                <p className="text-sm text-gray-500">{project.category || 'Sans catégorie'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-gray-900">{project.stats.views.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-gray-900">{project.stats.downloads.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-gray-900">{project.stats.likes.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-gray-900">{project.stats.documents}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/analytics/project/${project.id}`}
                                                className="inline-flex items-center gap-2 text-[#99334C] hover:text-[#7a283d] font-bold transition-colors"
                                            >
                                                Détails
                                                <ArrowRight size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {projects.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            Aucun projet trouvé. Créez votre premier projet pour voir vos analytics apparaître ici.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
