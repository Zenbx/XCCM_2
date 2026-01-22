"use client";

import React, { use, useEffect, useState } from 'react';
import {
    ArrowLeft,
    Eye,
    Download,
    Heart,
    BookOpen,
    FileText,
    MessageSquare,
    Loader2,
    TrendingUp,
    Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

interface ProjectAnalytics {
    project: {
        id: string;
        name: string;
        created_at: string;
        updated_at: string;
        is_published: boolean;
        description?: string;
        category?: string;
        level?: string;
    };
    stats: {
        parts: number;
        chapters: number;
        documents: number;
        comments: number;
        views: number;
        downloads: number;
        likes: number;
        uniqueViews: number;
    };
    topDocuments: Array<{
        id: string;
        name: string;
        views: number;
        downloads: number;
        likes: number;
    }>;
}

export default function ProjectAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, getAuthToken } = useAuth();
    const router = useRouter();
    const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        fetchAnalytics();
    }, [user, id, router]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();

            const response = await fetch(`${API_BASE_URL}/api/user/projects/${id}/analytics`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    toast.error("Projet non trouvé");
                    router.push('/analytics');
                    return;
                }
                throw new Error('Erreur lors de la récupération des analytics');
            }

            const data = await response.json();
            setAnalytics(data.data);
        } catch (error) {
            console.error('Erreur fetch analytics:', error);
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

    if (!analytics) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Projet non trouvé</p>
                    <Link href="/analytics" className="text-[#99334C] hover:underline font-bold">
                        Retour aux analytics
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="max-w-7xl mx-auto">

                {/* Back Button */}
                <Link
                    href="/analytics"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-[#99334C] mb-8 transition-colors font-semibold"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour aux Analytics
                </Link>

                {/* Header */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-[#99334C]/10 text-[#99334C] px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                                    {analytics.project.is_published ? 'Publié' : 'Brouillon'}
                                </span>
                                {analytics.project.category && (
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-semibold">
                                        {analytics.project.category}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">{analytics.project.name}</h1>
                            {analytics.project.description && (
                                <p className="text-gray-600 mt-2">{analytics.project.description}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar size={16} />
                            <span>Créé le {new Date(analytics.project.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <Eye size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vues</p>
                                <p className="text-2xl font-black text-gray-900">{analytics.stats.views.toLocaleString()}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">{analytics.stats.uniqueViews} vues uniques</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                                <Download size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Téléchargements</p>
                                <p className="text-2xl font-black text-gray-900">{analytics.stats.downloads.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-pink-50 text-pink-600 rounded-lg">
                                <Heart size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Likes</p>
                                <p className="text-2xl font-black text-gray-900">{analytics.stats.likes.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Commentaires</p>
                                <p className="text-2xl font-black text-gray-900">{analytics.stats.comments.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Parties</p>
                                <p className="text-2xl font-black text-gray-900">{analytics.stats.parts}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                <FileText size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chapitres</p>
                                <p className="text-2xl font-black text-gray-900">{analytics.stats.chapters}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Documents</p>
                                <p className="text-2xl font-black text-gray-900">{analytics.stats.documents}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Documents */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Documents les Plus Populaires</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Document</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Vues</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Téléchargements</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Likes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {analytics.topDocuments.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{doc.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-gray-900">{doc.views.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-gray-900">{doc.downloads.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-gray-900">{doc.likes.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                                {analytics.topDocuments.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            Aucun document publié pour ce projet.
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
