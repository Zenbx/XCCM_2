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
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="flex flex-col gap-1">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    Vue d'ensemble <span className="text-gray-200 font-light px-2 hidden md:inline">|</span>
                    <span className="text-[10px] bg-[#99334C]/10 text-[#99334C] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Admin Console</span>
                </h1>
                <p className="text-xs text-gray-400 font-medium">Contrôle global de la plateforme XCCM 2.0</p>
            </header>

            {/* Stats Grid - Premium Feel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Utilisateurs', val: global?.totalUsers, icon: Users, color: '#2563EB', bg: 'bg-blue-50/50' },
                    { label: 'Projets', val: global?.totalProjects, icon: Layout, color: '#059669', bg: 'bg-emerald-50/50' },
                    { label: 'Publications', val: global?.totalDocuments, icon: FileText, color: '#7C3AED', bg: 'bg-violet-50/50' },
                    { label: 'Interactions', val: (global?.totalLikes || 0) + (global?.totalComments || 0), icon: Heart, color: '#E11D48', bg: 'bg-rose-50/50' },
                ].map((s, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-all duration-300"
                    >
                        <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                            <s.icon size={20} style={{ color: s.color }} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                            <p className="text-2xl font-black text-gray-900 leading-none">{(s.val || 0).toLocaleString()}</p>
                        </div>
                        {/* Subtle Background Accent */}
                        <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-300">
                            <s.icon size={80} />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                {/* Recent Users - Clean Design */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2.5">
                            <Users size={18} className="text-[#99334C]" /> Inscriptions Récentes
                        </h2>
                        <Link href="/admin/users" className="text-[11px] font-black uppercase tracking-widest text-[#99334C] hover:text-[#7a283d] flex items-center gap-1.5 transition-colors">
                            Gérer <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="p-3 flex-1">
                        {recentUsers?.length > 0 ? (
                            <div className="space-y-1">
                                {recentUsers.map((u: any) => (
                                    <div key={u.user_id} className="flex items-center justify-between p-3 hover:bg-gray-50/80 rounded-xl transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100 flex items-center justify-center font-black text-gray-400 text-xs shadow-sm group-hover:from-[#99334C]/5 group-hover:text-[#99334C] transition-all">
                                                {u.firstname?.[0] || u.email[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 leading-tight">{u.firstname} {u.lastname}</p>
                                                <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{u.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 group-hover:bg-white transition-colors">
                                                {new Date(u.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-60 flex flex-col items-center justify-center text-xs text-gray-400 font-medium italic gap-2">
                                <Users size={32} className="opacity-10" />
                                Aucun utilisateur récent.
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Projects - Modernized */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2.5">
                            <Layout size={18} className="text-[#99334C]" /> Projets Récents
                        </h2>
                        <Link href="/admin/projects" className="text-[11px] font-black uppercase tracking-widest text-[#99334C] hover:text-[#7a283d] flex items-center gap-1.5 transition-colors">
                            Explorer <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="p-3 flex-1">
                        {recentProjects?.length > 0 ? (
                            <div className="space-y-1">
                                {recentProjects.map((p: any) => (
                                    <div key={p.pr_id} className="flex items-center justify-between p-3 hover:bg-gray-50/80 rounded-xl transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[#99334C]/5 text-[#99334C] flex items-center justify-center shadow-sm border border-[#99334C]/10 group-hover:bg-[#99334C] group-hover:text-white transition-all">
                                                <Database size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 leading-tight">{p.pr_name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">Par {p.owner?.firstname} {p.owner?.lastname}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 group-hover:bg-white transition-colors">
                                                {new Date(p.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-60 flex flex-col items-center justify-center text-xs text-gray-400 font-medium italic gap-2">
                                <Layout size={32} className="opacity-10" />
                                Aucun projet récent.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
