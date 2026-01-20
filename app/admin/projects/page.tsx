"use client";

import React, { useState } from 'react';
import {
    FileStack,
    Search,
    Filter,
    Trash2,
    Eye,
    User as UserIcon,
    Calendar,
    AlertTriangle,
    MoreVertical,
    ExternalLink,
    ChevronDown,
    Database,
    Terminal,
    RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

const mockProjects = [
    { id: 'p1', name: 'Jeff', owner: 'Jeff Belekotan', email: 'jeff@example.com', created: '2024-01-10', status: 'Corrupted', size: '2.4 MB' },
    { id: 'p2', name: 'Intro IA', owner: 'Jeff Belekotan', email: 'jeff@example.com', created: '2024-01-12', status: 'Active', size: '1.2 MB' },
    { id: 'p3', name: 'Droit Const.', owner: 'Pr Batchakui', email: 'batchakui@polytech.cm', created: '2023-12-05', status: 'Active', size: '4.8 MB' },
    { id: 'p4', name: 'Physique II', owner: 'Pr Batchakui', email: 'batchakui@polytech.cm', created: '2023-12-08', status: 'Published', size: '8.1 MB' },
    { id: 'p5', name: 'Physique Quantique', owner: 'Raissa Wokmeni', email: 'raissa@example.com', created: '2023-11-20', status: 'Active', size: '0.9 MB' },
    { id: 'p6', name: 'Histoire Art', owner: 'Admin', email: 'admin@xccm2.com', created: '2023-01-01', status: 'Active', size: '5.2 MB' },
];

export default function ProjectManagement() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Projets Globaux</h1>
                    <p className="text-gray-500 mt-1 font-semibold">Vision centralisée de toutes les compositions sur la plateforme.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white text-gray-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 border border-gray-100 hover:bg-gray-50 transition-all shadow-sm">
                        <RefreshCw className="w-5 h-5" />
                        Actualiser
                    </button>
                    <button className="bg-[#36454F] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#2c3840] transition-all shadow-lg">
                        <Database className="w-5 h-5" />
                        Nettoyage DB
                    </button>
                </div>
            </div>

            {/* Warning Box for problematic projects */}
            <div className="bg-amber-50 border border-amber-200 rounded-[28px] p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                    <h4 className="text-amber-900 font-bold mb-1">Projets Problématiques Détectés</h4>
                    <p className="text-amber-800/80 text-sm leading-relaxed">
                        Certains projets comme <span className="font-bold">"Jeff"</span> présentent des anomalies de relations (401 Missing Owner).
                        En tant qu'administrateur, vous pouvez forcer leur suppression pour restaurer l'intégrité de la plateforme.
                    </p>
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
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">
                            <Filter className="w-3.5 h-3.5" />
                            Statut:
                        </div>
                        <select className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold outline-none cursor-pointer">
                            <option>Tous</option>
                            <option>Actifs</option>
                            <option>Corrompus</option>
                            <option>Publiés</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Nom du Projet</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Propriétaire</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Taille</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Statut</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {mockProjects.map((proj) => (
                                <tr key={proj.id} className="hover:bg-gray-50/80 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-inner ${proj.status === 'Corrupted' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#99334C]'}`}>
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
                                        <span className="text-xs font-black text-gray-400 uppercase">{proj.size}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${proj.status === 'Active' ? 'bg-blue-50 text-blue-600' :
                                                proj.status === 'Corrupted' ? 'bg-red-50 text-red-600' :
                                                    'bg-green-50 text-green-600'
                                            }`}>
                                            {proj.status === 'Corrupted' && <AlertTriangle className="w-3 h-3" />}
                                            {proj.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2.5 bg-gray-50 hover:bg-white rounded-xl text-gray-400 hover:text-[#99334C] shadow-sm transition-all border border-transparent hover:border-gray-100" title="Ouvrir">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                            <button className="p-2.5 bg-gray-50 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 shadow-sm transition-all border border-transparent hover:border-red-100" title="Supprimer">
                                                <Trash2 className="w-4 h-4" />
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

            {/* Advanced Diagnostics Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-900 rounded-[32px] p-8 text-white">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-green-400" />
                            Console API Directe
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-black tracking-widest uppercase">Live</span>
                    </div>
                    <div className="bg-black/50 rounded-2xl p-4 font-mono text-xs leading-relaxed text-gray-300 h-40 overflow-y-auto border border-white/5">
                        <p className="text-green-400">$ prisma studio initialized...</p>
                        <p className="text-gray-500">[06:14:22] GET /api/admin/projects - 200 OK</p>
                        <p className="text-gray-500">[06:14:45] WARNING: Orphaned Parts found in collection "parts"</p>
                        <p className="text-amber-400">[06:15:02] DELETION PENDING: Project "Jeff" (ID: 65a2...)</p>
                        <p className="text-white animate-pulse">_</p>
                    </div>
                    <button className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all text-white border border-white/10">
                        Exécuter Script de Réparation
                    </button>
                </div>

                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
                    <h3 className="text-xl font-bold mb-6">Répartition par Propriétaire</h3>
                    <div className="space-y-6">
                        {[
                            { name: 'Jeff Belekotan', count: 42, color: 'bg-[#99334C]' },
                            { name: 'Pr Batchakui', count: 28, color: 'bg-blue-600' },
                            { name: 'Raissa Wokmeni', count: 18, color: 'bg-purple-600' },
                            { name: 'Autres', count: 12, color: 'bg-gray-200' },
                        ].map((o, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span className="text-gray-500">{o.name}</span>
                                    <span className="text-gray-900">{o.count}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${o.count}%` }}
                                        className={`h-full ${o.color}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
