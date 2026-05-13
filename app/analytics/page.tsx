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
    ArrowRight,
    Flame
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

// ─── Engagement Heatmap ───────────────────────────────────────────────────────

function heatColor(ratio: number): string {
    if (ratio === 0)    return '#f3f4f6';
    if (ratio < 0.25)  return '#fef9c3';
    if (ratio < 0.5)   return '#fde68a';
    if (ratio < 0.75)  return '#fb923c';
    if (ratio < 0.9)   return '#ef4444';
    return '#991b1b';
}

function EngagementHeatmap({ projects }: { projects: ProjectStats[] }) {
    const [tooltip, setTooltip] = useState<{ proj: ProjectStats; x: number; y: number } | null>(null);

    const scored = projects.map(p => ({
        proj: p,
        score: p.stats.views + p.stats.downloads * 2 + p.stats.likes * 3,
    }));
    const maxScore = Math.max(1, ...scored.map(s => s.score));
    const top5 = [...scored].sort((a, b) => b.score - a.score).slice(0, 5);

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
            <div className="flex items-center gap-2 mb-5">
                <Flame size={20} className="text-[#99334C]" />
                <h2 className="text-xl font-bold text-gray-900">Carte Thermique d'Engagement</h2>
                <span className="text-xs text-gray-400 ml-2">Score = vues + téléchargements ×2 + likes ×3</span>
            </div>

            {/* Heatmap grid */}
            <div className="flex flex-wrap gap-2 mb-4">
                {scored.map(({ proj, score }) => {
                    const ratio = score / maxScore;
                    return (
                        <div
                            key={proj.id}
                            className="w-10 h-10 rounded-lg cursor-pointer transition-transform hover:scale-125 hover:z-10 shadow-sm"
                            style={{ backgroundColor: heatColor(ratio) }}
                            onMouseEnter={(e) => setTooltip({ proj, x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setTooltip(null)}
                            onMouseMove={(e) => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null)}
                        />
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1 mb-6">
                <span className="text-[10px] text-gray-400 mr-1">Moins</span>
                {[0, 0.2, 0.4, 0.6, 0.8, 1].map(r => (
                    <div key={r} className="w-5 h-3 rounded-sm" style={{ backgroundColor: heatColor(r) }} />
                ))}
                <span className="text-[10px] text-gray-400 ml-1">Plus</span>
            </div>

            {/* Top 5 bar chart */}
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Top 5 Projets par Engagement</p>
                <div className="space-y-2">
                    {top5.map(({ proj, score }) => (
                        <div key={proj.id} className="flex items-center gap-3">
                            <span className="text-sm text-gray-700 w-40 truncate font-medium" title={proj.name}>{proj.name}</span>
                            <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${Math.round((score / maxScore) * 100)}%`,
                                        backgroundColor: heatColor(score / maxScore),
                                    }}
                                />
                            </div>
                            <span className="text-xs font-bold text-gray-500 w-10 text-right">{score}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl"
                    style={{ top: tooltip.y - 90, left: tooltip.x + 14 }}
                >
                    <p className="font-bold mb-1 max-w-[160px] truncate">{tooltip.proj.name}</p>
                    <p>👁 {tooltip.proj.stats.views} vues</p>
                    <p>⬇ {tooltip.proj.stats.downloads} téléchargements</p>
                    <p>❤ {tooltip.proj.stats.likes} likes</p>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Erreur lors de la récupération des projets');
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

    const globalStats = projects.reduce((acc, proj) => ({
        totalProjects:   acc.totalProjects + 1,
        totalDocuments:  acc.totalDocuments + proj.stats.documents,
        totalViews:      acc.totalViews + proj.stats.views,
        totalDownloads:  acc.totalDownloads + proj.stats.downloads,
        totalLikes:      acc.totalLikes + proj.stats.likes,
        totalComments:   acc.totalComments + proj.stats.comments,
    }), { totalProjects: 0, totalDocuments: 0, totalViews: 0, totalDownloads: 0, totalLikes: 0, totalComments: 0 });

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
                    {[
                        { label: 'Projets Totaux',     value: globalStats.totalProjects,                    icon: <BookOpen size={24} />,    bg: 'bg-blue-50',   text: 'text-blue-600' },
                        { label: 'Documents Publiés',  value: globalStats.totalDocuments,                   icon: <FileText size={24} />,    bg: 'bg-purple-50', text: 'text-purple-600' },
                        { label: 'Vues Totales',       value: globalStats.totalViews.toLocaleString(),       icon: <Eye size={24} />,         bg: 'bg-green-50',  text: 'text-green-600' },
                        { label: 'Téléchargements',    value: globalStats.totalDownloads.toLocaleString(),   icon: <Download size={24} />,    bg: 'bg-amber-50',  text: 'text-amber-600' },
                        { label: 'Likes',              value: globalStats.totalLikes.toLocaleString(),       icon: <Heart size={24} />,       bg: 'bg-pink-50',   text: 'text-pink-600' },
                        { label: 'Engagement',         value: globalStats.totalComments,                    icon: <TrendingUp size={24} />,  bg: 'bg-indigo-50', text: 'text-indigo-600' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <div className={`inline-flex p-3 rounded-lg ${stat.bg} ${stat.text} mb-3`}>{stat.icon}</div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Engagement Heatmap */}
                {projects.length > 0 && <EngagementHeatmap projects={projects} />}

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
                                            <p className="font-bold text-gray-900">{project.name}</p>
                                            <p className="text-sm text-gray-500">{project.category || 'Sans catégorie'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-900">{project.stats.views.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-900">{project.stats.downloads.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-900">{project.stats.likes.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-900">{project.stats.documents}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/analytics/project/${project.id}`}
                                                className="inline-flex items-center gap-2 text-[#99334C] hover:text-[#7a283d] font-bold transition-colors"
                                            >
                                                Détails <ArrowRight size={16} />
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
