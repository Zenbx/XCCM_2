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
    CircleDashed,
    FileStack
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
            // Handle both { projects: [...] } and direct [...] responses
            const projectsList = Array.isArray(data) ? data : ((data as any)?.projects || []);
            setProjects(projectsList);
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
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <FileStack className="text-[#99334C]" size={24} /> Projets Globaux
                    </h1>
                    <p className="text-xs text-gray-400 font-medium">Surveillez l'intégralité des espaces de travail créés ({projects.length}).</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Projet, auteur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#99334C]/20 outline-none w-64 text-sm shadow-sm transition-all text-gray-600 font-medium"
                        />
                    </div>
                    <button
                        onClick={fetchProjects}
                        className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-[#99334C] transition-all shadow-sm"
                        title="Rafraîchir"
                    >
                        <RefreshCcw size={18} />
                    </button>
                </div>
            </header>

            {/* Table Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-50/30 border-b border-gray-50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Espace de travail</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Propriétaire</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">État Interne</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Création</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Détails</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProjects.length > 0 ? filteredProjects.map((proj) => (
                                <tr key={proj.id} className="hover:bg-gray-50/30 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <Database size={16} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{proj.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{proj.size}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <p className="font-bold text-gray-700 text-xs flex items-center gap-1.5">
                                                <User size={12} className="text-[#99334C]" /> {proj.owner}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-medium truncate max-w-[150px] lowercase">{proj.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${proj.status === 'Published'
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                            {proj.status === 'Published' ? <CheckCircle2 size={10} /> : <CircleDashed size={10} />}
                                            {proj.status === 'Published' ? 'Publié' : 'En Travail'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                            <Calendar size={12} className="text-gray-300" />
                                            {new Date(proj.created).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            className="p-2 text-gray-400 hover:text-[#99334C] hover:bg-[#99334C]/5 rounded-xl transition-all shadow-sm bg-white border border-gray-100"
                                            onClick={() => toast("Aperçu projet bientôt disponible en Admin.")}
                                        >
                                            <ExternalLink size={14} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-xs text-gray-400 italic">
                                        Aucun projet trouvé dans la base de données.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
