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
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-gray-900 flex items-center gap-3">
                        <Layout className="text-[#99334C]" size={24} /> Projets de la Plateforme
                    </h1>
                    <p className="text-gray-500 font-medium text-xs">{projects.length} projets actifs.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchProjects}
                        className="p-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 text-gray-600 transition-all shadow-sm"
                        title="Rafraîchir"
                    >
                        <RefreshCcw size={16} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-3 py-2 bg-white border border-gray-100 rounded-lg focus:ring-2 focus:ring-[#99334C]/20 outline-none w-56 text-sm shadow-sm transition-all"
                        />
                    </div>
                </div>
            </header>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Projet</th>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Propriétaire</th>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">État</th>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProjects.length > 0 ? filteredProjects.map((proj) => (
                                <tr key={proj.id} className="hover:bg-gray-50/20 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <Database size={16} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-xs">{proj.name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">{proj.size}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <p className="font-bold text-gray-700 text-xs flex items-center gap-1.5">
                                                <User size={12} className="text-gray-400" /> {proj.owner}
                                            </p>
                                            <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{proj.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${proj.status === 'Published'
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {proj.status === 'Published' ? <CheckCircle2 size={10} /> : <CircleDashed size={10} />}
                                            {proj.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-gray-500 font-bold text-xs flex items-center gap-1.5">
                                            <Calendar size={12} className="text-gray-300" />
                                            {new Date(proj.created).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="p-1.5 text-[#99334C] hover:bg-[#99334C]/5 rounded-lg transition-colors shadow-sm">
                                            <ExternalLink size={14} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-xs text-gray-400 italic">
                                        Aucun projet trouvé.
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
