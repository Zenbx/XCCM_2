"use client";

import React, { useState, useEffect } from 'react';
import {
    LayoutTemplate,
    Search,
    Plus,
    Filter,
    FileText,
    Eye,
    Edit3,
    Trash2,
    Globe,
    Lock,
    RefreshCcw,
    CheckCircle2,
    Layers,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';

export default function TemplateManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllTemplates();
            setTemplates(data);
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast.error("Échec du chargement des modèles");
        } finally {
            setLoading(false);
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20 font-sans">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <LayoutTemplate className="text-[#99334C]" size={26} />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Catalogue de Templates</span>
                    </h1>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#99334C] rounded-full" />
                        Standardisation & Structures de Documents • {templates.length} modèles réels
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchTemplates}
                        className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 text-gray-400 transition-all shadow-sm"
                    >
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#99334C] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Rechercher un modèle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#99334C]/5 outline-none w-72 text-sm shadow-sm transition-all text-gray-600 font-medium hover:border-gray-200"
                        />
                    </div>
                </div>
            </header>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Utilisation Totale', val: '4,590', icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Taux de Conversion', val: '24%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Nouveaux ce mois', val: '12', icon: Plus, color: 'text-[#99334C]', bg: 'bg-[#99334C]/5' },
                ].map((m, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white p-5 rounded-[22px] border border-gray-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all duration-300"
                    >
                        <div className={`w-12 h-12 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <m.icon size={22} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{m.label}</p>
                            <p className="text-xl font-black text-gray-900">{m.val}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filteredTemplates.map((item, i) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.05 }}
                            key={item.id}
                            className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500 flex flex-col"
                        >
                            {/* Visual Preview Placeholder */}
                            <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden flex items-center justify-center p-8">
                                <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-2 group-hover:scale-110 transition-transform duration-700">
                                    <div className="h-2 w-2/3 bg-gray-100 rounded-full" />
                                    <div className="h-2 w-full bg-gray-50 rounded-full" />
                                    <div className="h-2 w-5/6 bg-gray-50 rounded-full" />
                                    <div className="pt-4 grid grid-cols-2 gap-2">
                                        <div className="aspect-video bg-gray-50 rounded-md" />
                                        <div className="aspect-video bg-gray-50 rounded-md" />
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <div className={`p-1.5 rounded-lg backdrop-blur-md bg-white/80 shadow-sm border border-white ${item.is_public ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {item.is_public ? <Globe size={14} /> : <Lock size={14} />}
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-[#99334C]/0 group-hover:bg-[#99334C]/5 transition-colors duration-500" />
                            </div>

                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col gap-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-[#99334C] uppercase tracking-widest leading-none">
                                        {item.category || 'Général'}
                                    </p>
                                    <h3 className="font-black text-gray-900 leading-tight group-hover:text-[#99334C] transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">Par {item.creator?.firstname} {item.creator?.lastname}</p>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-900 leading-none">{new Date(item.created_at).toLocaleDateString('fr-FR')}</span>
                                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Créé le</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                            onClick={() => toast("Mode édition soon")}
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            onClick={() => toast("Action réservée")}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Empty State */}
                {filteredTemplates.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center gap-4 bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100">
                        <LayoutTemplate size={48} className="text-gray-200" />
                        <div>
                            <p className="text-sm font-black text-gray-400">Aucun template trouvé</p>
                            <p className="text-[11px] text-gray-300 font-bold uppercase tracking-widest mt-1">Élargissez vos critères de recherche</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
