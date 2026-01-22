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
        <div className="space-y-10 pb-20">
            <header>
                <h1 className="text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
                    <Shield className="text-[#99334C]" size={36} /> Vue d'ensemble
                </h1>
                <p className="text-gray-500 font-medium">État général de la plateforme XCCM2.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Utilisateurs', val: global?.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Projets', val: global?.totalProjects, icon: Layout, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Documents', val: global?.totalDocuments, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Interactions', val: (global?.totalLikes || 0) + (global?.totalComments || 0), icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                        <div className={`p-4 ${s.bg} ${s.color} rounded-2xl`}>
                            <s.icon size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                            <p className="text-2xl font-black text-gray-900">{s.val || 0}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Recent Users */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Users size={20} className="text-[#99334C]" /> Dernières Inscriptions
                        </h2>
                        <Link href="/admin/users" className="text-sm font-bold text-[#99334C] hover:underline flex items-center gap-1">
                            Voir tout <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="p-4 flex-1">
                        {recentUsers?.length > 0 ? (
                            <div className="space-y-2">
                                {recentUsers.map((u: any) => (
                                    <div key={u.user_id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-500 uppercase">
                                                {u.firstname?.[0] || u.email[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{u.firstname} {u.lastname}</p>
                                                <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 font-bold flex items-center gap-1 justify-end">
                                                <Clock size={12} /> {new Date(u.created_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-40 flex items-center justify-center text-gray-400 font-medium italic">
                                Aucun utilisateur récent.
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Projects */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Layout size={20} className="text-[#99334C]" /> Projets Récents
                        </h2>
                        <Link href="/admin/projects" className="text-sm font-bold text-[#99334C] hover:underline flex items-center gap-1">
                            Voir tout <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="p-4 flex-1">
                        {recentProjects?.length > 0 ? (
                            <div className="space-y-2">
                                {recentProjects.map((p: any) => (
                                    <div key={p.pr_id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#99334C]/5 text-[#99334C] flex items-center justify-center">
                                                <Database size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{p.pr_name}</p>
                                                <p className="text-xs text-gray-400 font-medium">Par {p.owner?.firstname} {p.owner?.lastname}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 font-bold flex items-center gap-1 justify-end">
                                                <Clock size={12} /> {new Date(p.created_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-40 flex items-center justify-center text-gray-400 font-medium italic">
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
