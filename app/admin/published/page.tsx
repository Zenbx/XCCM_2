"use client";

import React, { useEffect, useState } from 'react';
import {
    CheckCircle2,
    Search,
    RefreshCcw,
    Loader2,
    ExternalLink,
    Trash2,
    User,
    Calendar,
    Globe,
    FileText,
    Eye,
    Download
} from 'lucide-react';
import { documentService } from '@/services/documentService';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublishedProjects() {
    const { isAdmin, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isActionInProgress, setIsActionInProgress] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading) {
            if (!isAdmin) {
                toast.error("Accès refusé");
                router.push('/edit-home');
                return;
            }
            fetchPublishedItems();
        }
    }, [authLoading, isAdmin, router]);

    const fetchPublishedItems = async () => {
        try {
            setLoading(true);
            const { documents: docs } = await documentService.getPublishedDocuments(1, 100);
            setDocuments(docs);
        } catch (error) {
            console.error('Erreur fetch published:', error);
            toast.error("Erreur lors du chargement des publications");
        } finally {
            setLoading(false);
        }
    };

    const handleUnpublish = async (docId: string, docName: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir dépublier "${docName}" ? Cette action le retirera de la bibliothèque publique.`)) {
            return;
        }

        try {
            setIsActionInProgress(docId);
            await documentService.unpublishDocument(docId);
            toast.success("Document dépublié avec succès");
            setDocuments(prev => prev.filter(d => d.doc_id !== docId));
        } catch (error) {
            toast.error("Échec de la dépublication");
        } finally {
            setIsActionInProgress(null);
        }
    };

    const filteredDocs = documents.filter(doc =>
        doc.doc_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.author?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="animate-spin text-[#99334C]" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Globe className="text-[#99334C]" size={26} />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Bibliothèque Publique</span>
                    </h1>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Management des Publications Live
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#99334C] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Titre, thématique ou auteur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#99334C]/5 outline-none w-80 text-sm shadow-sm transition-all text-gray-600 font-medium hover:border-gray-200"
                        />
                    </div>
                    <button
                        onClick={fetchPublishedItems}
                        className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 text-gray-400 hover:text-[#99334C] transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        <RefreshCcw size={18} />
                    </button>
                </div>
            </header>

            {/* Content Table */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-50/20 border-b border-gray-50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Snapshot Publié</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Auteur</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Impact Réel</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Contrôle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-gray-600">
                            <AnimatePresence mode="popLayout">
                                {filteredDocs.map((doc) => (
                                    <motion.tr
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={doc.doc_id}
                                        className="hover:bg-gray-50/40 transition-all duration-300 group"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-5 min-w-[300px]">
                                                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-[#99334C]/30 transition-all duration-500 shrink-0">
                                                    {doc.cover_image ? (
                                                        <img src={`${process.env.NEXT_PUBLIC_API_URL}${doc.cover_image}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <FileText size={24} className="text-gray-200 group-hover:text-[#99334C]/30 transition-colors" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <p className="font-black text-gray-900 text-sm truncate tracking-tight group-hover:text-[#99334C] transition-colors">{doc.doc_name}</p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className="text-[9px] font-black text-[#99334C] border border-[#99334C]/10 bg-[#99334C]/5 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                            {doc.category || 'Général'}
                                                        </span>
                                                        <div className="w-1 h-1 bg-gray-200 rounded-full" />
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                                            {doc.pages || 0} Pages • {((doc.doc_size || 0) / 1024).toFixed(1)} KB
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-black text-[10px] shadow-sm">
                                                    {doc.author?.[0] || 'U'}
                                                </div>
                                                <p className="font-black text-gray-700 text-xs tracking-tight">{doc.author}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-[0.1em]">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Published
                                                </span>
                                                <p className="text-[10px] text-gray-400 font-bold flex items-center gap-2">
                                                    <Calendar size={12} className="text-gray-300" />
                                                    {new Date(doc.published_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-black text-gray-800">{doc.consult || 0}</span>
                                                    <span className="text-[8px] text-gray-400 uppercase font-black tracking-widest">Visites</span>
                                                </div>
                                                <div className="w-px h-8 bg-gray-100" />
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-black text-gray-800">{doc.downloaded || 0}</span>
                                                    <span className="text-[8px] text-gray-400 uppercase font-black tracking-widest">Exports</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <a
                                                    href={`/book-reader/${doc.doc_id}`}
                                                    target="_blank"
                                                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm bg-white border border-gray-100 hover:border-blue-100"
                                                    title="Ouvrir le Reader"
                                                >
                                                    <Eye size={18} />
                                                </a>
                                                <button
                                                    disabled={isActionInProgress === doc.doc_id}
                                                    onClick={() => handleUnpublish(doc.doc_id, doc.doc_name)}
                                                    className="p-2.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all shadow-sm bg-white border border-gray-100 hover:border-rose-100 disabled:opacity-50"
                                                    title="Retirer de la vente"
                                                >
                                                    {isActionInProgress === doc.doc_id ? (
                                                        <Loader2 size={18} className="animate-spin text-[#99334C]" />
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredDocs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 flex flex-col items-center justify-center text-center gap-4">
                                        <Globe size={64} className="text-gray-100" />
                                        <div>
                                            <p className="text-sm font-black text-gray-400">Aucune publication active</p>
                                            <p className="text-[11px] text-gray-300 font-bold uppercase tracking-widest mt-1">La bibliothèque est actuellement vide</p>
                                        </div>
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
