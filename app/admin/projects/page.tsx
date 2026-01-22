"use client";

import React, { useEffect, useState } from 'react';
import {
    Layout,
    Search,
    RefreshCcw,
    Loader2,
    Database,
    ExternalLink,
    Calendar,
    User,
    CheckCircle2,
    CircleDashed
} from 'lucide-react';
import { authService } from '@/services/authService';
import { adminService } from '@/services/adminService';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProjectManagement() {
    const { isAdmin, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!isAdmin) {
                toast.error("Accès refusé");
                router.push('/edit-home');
                return;
            }
            fetchProjects();
        }
    }, [authLoading, isAdmin, router]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllProjects();
            setProjects(data.projects || []);
        } catch (error) {
            console.error('Erreur fetch projects:', error);
            toast.error("Erreur lors du chargement des projets");
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(proj =>
        proj.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proj.owner?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="animate-spin text-[#99334C]" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Layout className="text-[#99334C]" size={32} /> Projets de la Plateforme
                    </h1>
                    <p className="text-gray-500 font-medium">{projects.length} projets actifs ont été détectés.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchProjects}
                        className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-600 transition-all shadow-sm"
                        title="Rafraîchir"
                    >
                        <RefreshCcw size={20} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher un projet..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#99334C]/20 outline-none w-64 shadow-sm transition-all"
                        />
                    </div>
                </div>
            </header>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Nom du Projet</th>
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Propriétaire</th>
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">État</th>
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Création</th>
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Détails</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProjects.map((proj) => (
                                <tr key={proj.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <Database size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{proj.name}</p>
                                                <p className="text-xs text-gray-400 font-medium">{proj.size}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="font-bold text-gray-700 flex items-center gap-2">
                                                <User size={14} className="text-gray-400" /> {proj.owner}
                                            </p>
                                            <p className="text-xs text-gray-400">{proj.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${proj.status === 'Published'
                                            ? 'bg-green-50 text-green-600 border border-green-100'
                                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                            {proj.status === 'Published' ? <CheckCircle2 size={12} /> : <CircleDashed size={12} />}
                                            {proj.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-gray-500 font-medium flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {new Date(proj.created).toLocaleDateString('fr-FR')}
                                        </p>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2.5 text-[#99334C] hover:bg-[#99334C]/5 rounded-xl transition-colors border border-transparent hover:border-[#99334C]/10">
                                            <ExternalLink size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
