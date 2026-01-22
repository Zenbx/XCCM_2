"use client";

import React, { useEffect, useState } from 'react';
import {
    FileStack,
    Search,
    Filter,
    Trash2,
    Calendar,
    AlertTriangle,
    MoreVertical,
    ExternalLink,
    Database,
    Terminal,
    RefreshCw,
    Loader2,
    User as UserIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

export default function ProjectManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const token = authService.getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/admin/projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Erreur lors de la récupération des projets');

            const result = await response.json();
            if (result.success) {
                setProjects(result.data.projects || []);
            }
        } catch (error) {
            console.error('Erreur fetch projects:', error);
            toast.error("Erreur lors du chargement des projets");
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#99334C] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Projets Globaux</h1>
                    <p className="text-gray-500 mt-1 font-semibold">Vision centralisée de toutes les compositions sur la plateforme.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchProjects}
                        className="bg-white text-gray-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 border border-gray-100 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Actualiser
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom de projet ou propriétaire..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-semibold text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Nom du Projet</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Propriétaire</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Statut</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProjects.map((proj) => (
                                <tr key={proj.id} className="hover:bg-gray-50/80 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-inner ${proj.is_corrupted ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#99334C]'}`}>
                                                <FileStack className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 font-bold group-hover:text-[#99334C] transition-all">{proj.name}</span>
                                                <span className="text-[10px] text-gray-300 font-mono tracking-tighter">{proj.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                <UserIcon className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-700 leading-tight">{proj.owner}</span>
                                                <span className="text-[10px] text-gray-400 font-semibold">{proj.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(proj.created).toLocaleDateString('fr-FR')}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${proj.status === 'Active' ? 'bg-blue-50 text-blue-600' :
                                            proj.is_corrupted ? 'bg-red-50 text-red-600' :
                                                'bg-green-50 text-green-600'
                                            }`}>
                                            {proj.is_corrupted && <AlertTriangle className="w-3 h-3" />}
                                            {proj.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2.5 bg-gray-50 hover:bg-white rounded-xl text-gray-400 hover:text-[#99334C] shadow-sm transition-all border border-transparent hover:border-gray-100" title="Ouvrir">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                            <button className="p-2.5 bg-gray-50 hover:bg-white rounded-xl text-gray-400 hover:text-gray-900 shadow-sm transition-all border border-transparent hover:border-gray-100">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Hidden diagnostic tools if needed later */}
        </div>
    );
}
