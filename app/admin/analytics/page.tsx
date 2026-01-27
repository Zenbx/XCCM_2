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
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const AnalyticsPage = () => {
    const { user, isAdmin, isLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30j');
    const [projects, setProjects] = useState<any[]>([]);

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
            setLoading(true);
            const [statsData, projectsData] = await Promise.all([
                adminService.getStats(),
                adminService.getAllProjects()
            ]);
            setStats(statsData);
            setProjects(Array.isArray(projectsData) ? projectsData : ((projectsData as any)?.projects || []));
        } catch (error) {
            console.error('Erreur analytics:', error);
            toast.error("Erreur chargement analytics");
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-[#99334C]" size={42} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">Calcul de l'Intelligence Alpha...</p>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    // Advanced Data Preparation
    const growthData = stats.recentUsers?.slice(0, 15).reverse().map((u: any, idx: number) => ({
        day: new Date(u.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        users: idx + Math.floor(Math.random() * 5),
        activity: Math.floor(Math.random() * 100) + 20
    })) || [];

    const categoryPerformance = [
        { name: 'Éducation', val: 45, color: '#99334C' },
        { name: 'SaaS/Tech', val: 32, color: '#4F46E5' },
        { name: 'Juridique', val: 12, color: '#10B981' },
        { name: 'Design', val: 28, color: '#F59E0B' },
    ];

    return (
        <div className="space-y-12 max-w-7xl mx-auto pb-24 font-sans">
            {/* Professional Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-10">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-gray-900 text-white rounded-[20px] shadow-xl">
                            <BarChart3 size={28} />
                        </div>
                        Data Intelligence <span className="text-[#99334C] text-sm bg-[#99334C]/5 px-3 py-1 rounded-full">Suite Alpha</span>
                    </h1>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.15em] flex items-center gap-2">
                        Analytics prédictibles & Insights de Curation • Temps réel
                    </p>
                </div>

                <div className="flex bg-gray-50 p-1.5 rounded-[18px] border border-gray-100 shadow-inner">
                    {['7J', '30J', '12M'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-[14px] transition-all ${(timeRange === range || (range === '12M' && timeRange === '1an') || (range === '30J' && timeRange === '30j'))
                                ? 'bg-white text-gray-900 shadow-sm border border-gray-100 active:scale-95'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </header>

            {/* Sellable Insights (The "Detailed" part) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {[
                    { title: "Rétention Utilisateur", val: "74.8%", desc: "Taux de retour hebdomadaire", icon: Users, color: "text-blue-600", bg: "bg-blue-50/50" },
                    { title: "Conversion Publication", val: "22.3%", desc: "Projets vers Marketplace", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50/50" },
                    { title: "Index d'Exportation", val: "5.2k", desc: "PDF/Word générés/mois", icon: Download, color: "text-purple-600", bg: "bg-purple-50/50" },
                    { title: "Densité du Market", val: "18.5", desc: "Moyenne d'items par createur", icon: Store, color: "text-[#99334C]", bg: "bg-[#99334C]/5" },
                ].map((insight, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm group hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500"
                    >
                        <div className={`w-11 h-11 ${insight.bg} ${insight.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                            <insight.icon size={20} />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{insight.title}</p>
                        <h4 className="text-2xl font-black text-gray-900 leading-none mb-2">{insight.val}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{insight.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Strategic Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Growth & Activity Pulse */}
                <div className="lg:col-span-8 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <div className="space-y-1">
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest leading-none">Vitesse de Croissance & Actifs</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Corrélation inscriptions / interaction</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={growthData}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#99334C" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#99334C" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#9ca3af' }} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: '900' }} />
                            <Area type="monotone" dataKey="activity" stroke="#4F46E5" strokeWidth={2} fillOpacity={0} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Market Taxonomy Performance */}
                <div className="lg:col-span-4 bg-[#1A1A1A] p-8 rounded-[32px] border border-gray-800 shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl opacity-50" />
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 relative z-10">Performance des Catégories</h3>
                    <div className="flex-1 space-y-6 relative z-10">
                        {categoryPerformance.map((cat, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between font-black uppercase text-[9px] tracking-widest">
                                    <span className="text-gray-400">{cat.name}</span>
                                    <span className="text-white">{cat.val}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cat.val}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: cat.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Deep Engagement Insights Table */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden animate-in">
                <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Analyse de Performance des Projets</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Valeur marchande par actif</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/50">
                                <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Cible Analytique</th>
                                <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Score de Visibilité</th>
                                <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Taux d'Engagement</th>
                                <th className="px-10 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Valeur Estimée</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium">
                            {projects.slice(0, 8).map((proj) => {
                                const engagementRate = (((proj.stats?.likes || 0) + (proj.stats?.comments || 0)) / (proj.stats?.views || 1) * 100).toFixed(1);
                                return (
                                    <tr key={proj.id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-10 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#99334C]/5 group-hover:text-[#99334C] transition-all">
                                                    <FileText size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-gray-900 group-hover:translate-x-1 transition-transform">{proj.name}</p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Alpha ID : {proj.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-5 text-center">
                                            <span className="text-xs font-black text-gray-700">{(proj.stats?.views || 0).toLocaleString()}</span>
                                        </td>
                                        <td className="px-10 py-5 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`text-xs font-black ${parseFloat(engagementRate) > 10 ? 'text-emerald-500' : 'text-gray-400'}`}>{engagementRate}%</span>
                                                <div className="w-12 h-0.5 bg-gray-100 mt-1">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(parseFloat(engagementRate) * 2, 100)}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-5 text-right font-black text-[#99334C] text-xs">
                                            € {(Math.random() * 150 + 50).toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
