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
import { adminService } from '@/services/adminService';
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
            const data = await adminService.getStats();
            setStats(data);
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
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-gray-900 flex items-center gap-3">
                        <BarChart3 className="text-[#99334C]" size={24} />
                        Analytics & Statistiques
                    </h1>
                    <p className="text-gray-500 font-medium text-xs">Vue d'ensemble des performances de la plateforme.</p>
                </div>

                <div className="bg-white p-1 rounded-lg border border-gray-200 flex">
                    {['7j', '30j', '1an'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${timeRange === range
                                ? 'bg-[#99334C] text-white'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Utilisateurs', val: stats.global?.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', growth: 15 },
                    { label: 'Projets Créés', val: stats.global?.totalProjects, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50', growth: 22 },
                    { label: 'Documents Publiés', val: stats.global?.totalDocuments, icon: Download, color: 'text-purple-600', bg: 'bg-purple-50', growth: 18 },
                    { label: 'Total Engagement', val: (stats.global?.totalLikes || 0) + (stats.global?.totalComments || 0), icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50', growth: 25 },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}>
                                <kpi.icon size={18} />
                            </div>
                            <div className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                +{kpi.growth}%
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{kpi.label}</p>
                        <p className="text-lg font-black text-gray-900 leading-none">{(kpi.val || 0).toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Growth Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Croissance Utilisateurs</h3>
                        <div className="text-[#99334C] text-[10px] font-bold flex items-center gap-1 opacity-70">
                            <Calendar size={12} /> {timeRange}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={userGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f8f8f8" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '10px' }} />
                            <Line
                                type="monotone"
                                dataKey="utilisateurs"
                                stroke="#99334C"
                                strokeWidth={2}
                                dot={{ fill: '#99334C', r: 3 }}
                                activeDot={{ r: 5, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Content Distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Distribution Contenu</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={contentData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f8f8f8" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '10px' }} />
                            <Bar dataKey="value" fill="#99334C" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Engagement Card */}
            <div className="bg-[#36454F] p-6 rounded-xl shadow-sm text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#99334C]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <h3 className="text-sm font-bold mb-6 flex items-center gap-2 relative z-10">
                    <TrendingUp className="text-[#99334C]" size={18} />
                    Indicateurs d'Engagement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                    {[
                        { label: 'Likes', val: stats.global?.totalLikes, icon: Heart },
                        { label: 'Commentaires', val: stats.global?.totalComments, icon: MessageSquare },
                        { label: 'Croissance moyenne', val: `+${((stats.global?.totalUsers || 0) * 0.15).toFixed(1)}%`, icon: TrendingUp },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <item.icon className="w-3.5 h-3.5 text-white/50" />
                                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">{item.label}</p>
                            </div>
                            <p className="text-xl font-black">{(item.val || 0).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
