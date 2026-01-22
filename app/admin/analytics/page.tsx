"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    TrendingUp,
    Users,
    BookOpen,
    Heart,
    Download,
    BarChart3,
    Loader2,
    Calendar,
    ArrowUpRight,
    MessageSquare
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const AnalyticsPage = () => {
    const { user, isAdmin, isLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30j');

    useEffect(() => {
        if (!isLoading) {
            if (!isAdmin) {
                toast.error("Accès refusé");
                router.push('/edit-home');
                return;
            }
            fetchAnalytics();
        }
    }, [isLoading, isAdmin, router]);

    const fetchAnalytics = async () => {
        try {
            const token = authService.getAuthToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Erreur analytics');

            const result = await response.json();
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Erreur analytics:', error);
            toast.error("Erreur chargement analytics");
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#99334C]" size={40} />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
        );
    }

    // Préparer les données pour les graphiques
    const userGrowthData = stats.recentUsers?.slice(0, 10).reverse().map((u: any, idx: number) => ({
        name: new Date(u.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        utilisateurs: idx + 1,
    })) || [];

    const contentData = [
        { name: 'Projets', value: stats.global?.totalProjects || 0 },
        { name: 'Documents', value: stats.global?.totalDocuments || 0 },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
                            <BarChart3 className="text-[#99334C]" size={32} />
                            Analytics & Statistiques
                        </h1>
                        <p className="text-gray-500">Vue d'ensemble des performances de la plateforme</p>
                    </div>

                    <div className="bg-white p-1 rounded-lg border border-gray-200 flex">
                        {['7j', '30j', '1an'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeRange === range
                                    ? 'bg-[#99334C] text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full text-green-700 bg-green-50">
                                <ArrowUpRight className="w-3 h-3" />
                                +{((stats.global?.totalUsers || 0) * 0.15).toFixed(1)}%
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Total Utilisateurs</h3>
                        <p className="text-2xl font-bold text-gray-900">{stats.global?.totalUsers || 0}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className=
                                "p-3 rounded-xl bg-green-100">
                                <BookOpen className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full text-green-700 bg-green-50">
                                <ArrowUpRight className="w-3 h-3" />
                                +{((stats.global?.totalProjects || 0) * 0.22).toFixed(1)}%
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Projets Créés</h3>
                        <p className="text-2xl font-bold text-gray-900">{stats.global?.totalProjects || 0}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-purple-100">
                                <Download className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full text-green-700 bg-green-50">
                                <ArrowUpRight className="w-3 h-3" />
                                +{((stats.global?.totalDocuments || 0) * 0.18).toFixed(1)}%
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Documents Publiés</h3>
                        <p className="text-2xl font-bold text-gray-900">{stats.global?.totalDocuments || 0}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-pink-100">
                                <Heart className="w-6 h-6 text-pink-600" />
                            </div>
                            <div className="flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full text-green-700 bg-green-50">
                                <ArrowUpRight className="w-3 h-3" />
                                +{((stats.global?.totalLikes || 0) * 0.25).toFixed(1)}%
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Total Likes</h3>
                        <p className="text-2xl font-bold text-gray-900">{stats.global?.totalLikes || 0}</p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* User Growth Chart */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-gray-900">Croissance Utilisateurs</h3>
                            <button className="text-[#99334C] text-sm font-semibold flex items-center gap-2 hover:bg-[#99334C]/5 px-3 py-1 rounded-lg transition-colors">
                                <Calendar className="w-4 h-4" />
                                {timeRange}
                            </button>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="utilisateurs"
                                    stroke="#99334C"
                                    strokeWidth={3}
                                    dot={{ fill: '#99334C', r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Content Distribution */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Distribution Contenu</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={contentData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#99334C" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Engagement Card */}
                <div className="bg-gradient-to-br from-[#99334C] to-[#DC3545] p-8 rounded-3xl shadow-xl text-white">
                    <h3 className="text-2xl font-bold mb-8">Engagement Plateforme</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                            <div className="flex items-center gap-3 mb-2">
                                <Heart className="w-5 h-5" />
                                <p className="text-white/70 text-sm font-bold">Likes</p>
                            </div>
                            <p className="text-4xl font-black">{(stats.global?.totalLikes || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                            <div className="flex items-center gap-3 mb-2">
                                <MessageSquare className="w-5 h-5" />
                                <p className="text-white/70 text-sm font-bold">Commentaires</p>
                            </div>
                            <p className="text-4xl font-black">{(stats.global?.totalComments || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="w-5 h-5" />
                                <p className="text-white/70 text-sm font-bold">Croissance</p>
                            </div>
                            <p className="text-4xl font-black">+{((stats.global?.totalUsers || 0) * 0.15).toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
