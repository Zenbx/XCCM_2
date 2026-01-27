"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Shield,
    Users,
    Database,
    Layout,
    FileText,
    MessageSquare,
    Heart,
    Clock,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { adminService } from '@/services/adminService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Link from 'next/link';

const AdminDashboard = () => {
    const { user, isAdmin, isLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            if (!isAdmin) {
                toast.error("Accès refusé");
                router.push('/edit-home');
                return;
            }
            fetchAdminStats();
        }
    }, [isLoading, isAdmin, router]);

    const fetchAdminStats = async () => {
        try {
            const data = await adminService.getStats();
            setStats(data);
        } catch (error) {
            console.error('Erreur admin stats:', error);
            toast.error("Erreur chargement statistiques");
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
                <Loader2 className="animate-spin text-[#99334C]" size={40} />
            </div>
        );
    }

    const { global, recentUsers, recentProjects } = stats || {};

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-xl flex items-center justify-center shadow-lg shadow-[#99334C]/20">
                            <Shield className="text-white w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin<span className="text-[#99334C]">OS</span> Dashboard</h1>
                    </div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#99334C] rounded-full animate-pulse" />
                        Centre de Contrôle Stratégique • XCCM v2.0
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchAdminStats}
                        className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 text-gray-400 hover:text-[#99334C] transition-all shadow-sm"
                    >
                        <Clock size={18} />
                    </button>
                    <Link href="/admin/analytics" className="px-6 py-3 bg-[#99334C] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#7a283d] transition-all shadow-lg shadow-[#99334C]/20 active:scale-95">
                        Détails Alpha
                    </Link>
                </div>
            </header>

            {/* Core Metrics - Sellable Insights Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Croissance Utilisateurs', val: global?.totalUsers, sub: `+${(global?.totalUsers * 0.12).toFixed(0)} ce mois`, icon: Users, color: '#2563EB', bg: 'bg-blue-50/50', trend: 'up' },
                    { label: 'Espaces Actifs', val: global?.totalProjects, sub: '85% taux de rétention', icon: Database, color: '#059669', bg: 'bg-emerald-50/50', trend: 'up' },
                    { label: 'Indice de Publication', val: global?.totalDocuments, sub: `${((global?.totalDocuments / (global?.totalProjects || 1)) * 100).toFixed(1)}% conversion`, icon: FileText, color: '#7C3AED', bg: 'bg-violet-50/50', trend: 'stable' },
                    { label: 'Volume Social', val: (global?.totalLikes || 0) + (global?.totalComments || 0), sub: 'Impact émotionnel fort', icon: Heart, color: '#E11D48', bg: 'bg-rose-50/50', trend: 'up' },
                ].map((s, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i}
                        className="bg-white p-7 rounded-[26px] border border-gray-100 shadow-sm flex flex-col gap-5 relative overflow-hidden group hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500"
                    >
                        <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                            <s.icon size={22} style={{ color: s.color }} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">{s.label}</p>
                            <p className="text-2xl font-black text-gray-900 leading-none">{(s.val || 0).toLocaleString()}</p>
                            <p className="text-[9px] text-[#99334C] font-bold uppercase tracking-tight mt-3 flex items-center gap-1">
                                {s.trend === 'up' ? '▲' : '●'} {s.sub}
                            </p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-500">
                            <s.icon size={110} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Strategic Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Intelligence (Users) */}
                <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
                        <div className="space-y-1">
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Intelligence Utilisateurs</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Flux d'adhésion Alpha</p>
                        </div>
                        <Link href="/admin/users" className="p-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-400 transition-all">
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="p-4 space-y-2">
                        {recentUsers?.map((u: any) => (
                            <div key={u.user_id} className="flex items-center justify-between p-3.5 hover:bg-gray-50/80 rounded-2xl transition-all group border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 flex items-center justify-center font-black text-gray-400 text-xs shadow-inner group-hover:from-[#99334C]/5 group-hover:text-[#99334C] transition-all duration-500">
                                        {u.firstname?.[0] || u.email[0]}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-900 leading-tight group-hover:text-[#99334C] transition-colors">{u.firstname} {u.lastname}</p>
                                        <p className="text-[10px] text-gray-400 font-bold lowercase truncate max-w-[120px]">{u.email}</p>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(u.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Pulse (Projects) */}
                <div className="lg:col-span-2 bg-[#1A1A1A] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#99334C]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
                    <div className="px-8 py-7 border-b border-white/5 flex items-center justify-between z-10">
                        <div className="space-y-1">
                            <h2 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Pulse Créative
                            </h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Projets en haute activité</p>
                        </div>
                        <Link href="/admin/projects" className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all glass-effect border border-white/10">
                            Volume Global
                        </Link>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 z-10 overflow-y-auto">
                        {recentProjects?.map((p: any) => (
                            <div key={p.pr_id} className="p-5 bg-white/5 border border-white/5 rounded-[22px] hover:bg-white/[0.08] transition-all cursor-pointer group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                        <Database size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-black text-sm truncate leading-none mb-1.5">{p.pr_name}</h3>
                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-tight flex items-center gap-1.5">
                                            <Users size={10} /> {p.owner?.firstname} {p.owner?.lastname}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-emerald-500 font-black text-xs">{(p.stats?.views || 0)}</span>
                                            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Impact</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white font-black text-xs">{(p.stats?.downloads || 0)}</span>
                                            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Usage</span>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-bold">{new Date(p.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
