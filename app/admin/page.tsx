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
        <div className="space-y-6">

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Utilisateurs', val: global?.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Projets', val: global?.totalProjects, icon: Layout, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Documents', val: global?.totalDocuments, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Engagement', val: (global?.totalLikes || 0) + (global?.totalComments || 0), icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`p-3 ${s.bg} ${s.color} rounded-lg`}>
                            <s.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                            <p className="text-lg font-black text-gray-900 leading-none">{(s.val || 0).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Users size={16} className="text-[#99334C]" /> Dernières Inscriptions
                        </h2>
                        <Link href="/admin/users" className="text-xs font-bold text-[#99334C] hover:underline flex items-center gap-1">
                            Voir tout <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="p-2 flex-1">
                        {recentUsers?.length > 0 ? (
                            <div className="space-y-1">
                                {recentUsers.map((u: any) => (
                                    <div key={u.user_id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs uppercase">
                                                {u.firstname?.[0] || u.email[0]}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900 leading-tight">{u.firstname} {u.lastname}</p>
                                                <p className="text-[10px] text-gray-400 font-medium leading-tight">{u.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 justify-end">
                                                <Clock size={10} /> {new Date(u.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-40 flex items-center justify-center text-xs text-gray-400 font-medium italic">
                                Aucun utilisateur récent.
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Projects */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Layout size={16} className="text-[#99334C]" /> Projets Récents
                        </h2>
                        <Link href="/admin/projects" className="text-xs font-bold text-[#99334C] hover:underline flex items-center gap-1">
                            Voir tout <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="p-2 flex-1">
                        {recentProjects?.length > 0 ? (
                            <div className="space-y-1">
                                {recentProjects.map((p: any) => (
                                    <div key={p.pr_id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#99334C]/5 text-[#99334C] flex items-center justify-center">
                                                <Database size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900 leading-tight">{p.pr_name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium leading-tight">Par {p.owner?.firstname} {p.owner?.lastname}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 justify-end">
                                                <Clock size={10} /> {new Date(p.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-40 flex items-center justify-center text-xs text-gray-400 font-medium italic">
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
