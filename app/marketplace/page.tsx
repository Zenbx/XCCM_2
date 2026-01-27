"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Star, Download, Users, TrendingUp, X, Eye, BookOpen, Layers, Layout, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { marketplaceService, MarketplaceItem } from '@/services/marketplaceService';
import { vaultService } from '@/services/vaultService';
import toast from 'react-hot-toast';
import { MarketplaceViewer } from '@/components/Marketplace/MarketplaceViewer';

const MarketplacePage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [selectedGranule, setSelectedGranule] = useState<MarketplaceItem | null>(null);
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const categories = [
        { id: 'all', label: 'Tous les granules', icon: <Layers size={16} /> },
        { id: 'part', label: 'Parties', icon: <BookOpen size={16} /> },
        { id: 'chapter', label: 'Chapitres', icon: <Layers size={16} /> },
        { id: 'paragraph', label: 'Paragraphes', icon: <Layout size={16} /> },
        { id: 'notion', label: 'Notions', icon: <MessageSquare size={16} /> },
    ];

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setIsLoading(true);
            const data = await marketplaceService.getItems();
            setItems(data);
        } catch (err: any) {
            setError(err.message || 'Erreur de chargement');
            toast.error('Impossible de charger le marketplace');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (item: MarketplaceItem) => {
        if (downloadingId) return;
        setDownloadingId(item.id);
        try {
            // 1. Record download
            await marketplaceService.recordDownload(item.id);

            // 2. Add to Vault
            await vaultService.addToVault({
                type: item.type,
                title: item.title,
                original_id: item.id, // Using marketplace ID as original ID reference
                content: item.content,
                source_doc_name: `Marketplace - ${item.seller.firstname} ${item.seller.lastname}`
            });

            toast.success('Ajouté à votre Coffre-fort !');
        } catch (err: any) {
            toast.error('Erreur lors du téléchargement');
            console.error(err);
        } finally {
            setDownloadingId(null);
        }
    };

    const filteredItems = useMemo(() => {
        return items.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || p.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [items, searchTerm, filterType]);

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col">
            {/* NO Header here - already in RootLayout */}

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
                {/* Hero Section */}
                <section className="mb-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#99334C]/10 text-[#99334C] rounded-full text-sm font-bold mb-6"
                        >
                            <TrendingUp size={16} />
                            <span>Communauté : Partagez vos ressources pédagogiques</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-6"
                        >
                            Le Marketplace des <span className="text-[#99334C]">Granules</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-600 mb-8"
                        >
                            Explorez des milliers de briques pédagogiques (Parties, Chapitres, Notions) prêtes à l'emploi.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="relative max-w-xl group"
                        >
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6 transition-colors group-focus-within:text-[#99334C]" />
                            <input
                                type="text"
                                placeholder="Rechercher une notion, un chapitre, un auteur..."
                                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-100 rounded-2xl shadow-lg shadow-gray-200/50 outline-none focus:border-[#99334C] focus:ring-4 focus:ring-[#99334C]/5 transition-all text-lg"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", damping: 20, delay: 0.2 }}
                        className="hidden lg:flex flex-col gap-4"
                    >
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-full bg-[#99334C]/10 flex items-center justify-center text-[#99334C] mb-4">
                                <Layers size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900">{items.length > 0 ? `+${items.length * 15}` : '...'}</h2>
                            <p className="text-gray-500 font-medium">Granules partagés</p>
                        </div>
                    </motion.div>
                </section>

                {/* Categories & Filter Bar */}
                <section className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100 pb-8">
                    <div className="flex gap-4 overflow-x-auto w-full md:w-auto pb-4 md:pb-0 no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setFilterType(cat.id)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${filterType === cat.id
                                    ? 'bg-[#99334C] text-white shadow-lg shadow-[#99334C]/30'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                                    }`}
                            >
                                {cat.icon}
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 font-medium">Trier par:</span>
                        <select className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[#99334C]">
                            <option>Les plus populaires</option>
                            <option>Mieux notés</option>
                            <option>Nouveautés</option>
                        </select>
                    </div>
                </section>

                {/* Products Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-12 h-12 text-[#99334C] animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h3>
                        <p className="text-gray-500">{error}</p>
                        <button onClick={fetchItems} className="mt-4 text-[#99334C] font-bold hover:underline">Réessayer</button>
                    </div>
                ) : (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredItems.map((product) => (
                            <motion.div
                                key={product.id}
                                whileHover={{ y: -8 }}
                                className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl hover:shadow-2xl transition-all group flex flex-col"
                            >
                                <div className="p-8 flex-1">
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="bg-[#99334C]/10 text-[#99334C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {product.type}
                                        </span>
                                        <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                                            {product.rating ? (
                                                <><Star size={14} fill="currentColor" /> {product.rating}</>
                                            ) : (
                                                <span className="text-gray-400 text-xs font-normal">Nouveau</span>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#99334C] transition-colors line-clamp-1">
                                        {product.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                                        {product.description || 'Aucune description disponible.'}
                                    </p>

                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                            <Users size={16} />
                                        </div>
                                        <span className="text-xs text-gray-500 font-bold">{product.seller.firstname} {product.seller.lastname}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {product.tags.slice(0, 3).map((tag, i) => (
                                            <span key={i} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-1 rounded-md">{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-8 pt-0 mt-auto">
                                    <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
                                        <button
                                            onClick={() => setSelectedGranule(product)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#99334C]/10 hover:text-[#99334C] transition-all"
                                        >
                                            <Eye size={18} /> Voir
                                        </button>
                                        <button
                                            onClick={() => handleDownload(product)}
                                            disabled={downloadingId === product.id}
                                            className="flex items-center justify-center gap-2 bg-[#99334C] text-white px-5 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#99334C]/20 disabled:opacity-50"
                                        >
                                            {downloadingId === product.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {filteredItems.length === 0 && (
                            <div className="col-span-full py-20 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 text-gray-300 mb-4">
                                    <Search size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun granule trouvé</h3>
                                <p className="text-gray-500">Essayez d'autres termes de recherche ou changez de catégorie.</p>
                            </div>
                        )}
                    </section>
                )}
            </main>

            {/* Content Preview Modal */}
            <AnimatePresence>
                {selectedGranule && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedGranule(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div>
                                    <span className="bg-[#99334C]/10 text-[#99334C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 inline-block">
                                        {selectedGranule.type}
                                    </span>
                                    <h2 className="text-2xl font-black text-gray-900">{selectedGranule.title}</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedGranule(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="p-10 overflow-y-auto flex-1 bg-[#FDFCFB]">
                                <MarketplaceViewer
                                    content={selectedGranule.content || selectedGranule.description}
                                    type={selectedGranule.type as any}
                                />
                            </div>

                            <div className="p-8 border-t border-gray-100 bg-white flex items-center justify-between">
                                <div className="text-sm">
                                    <span className="text-gray-400">Auteur:</span>
                                    <span className="ml-1 font-bold text-gray-900">{selectedGranule.seller.firstname} {selectedGranule.seller.lastname}</span>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedGranule(null)}
                                        className="px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                                    >
                                        Fermer
                                    </button>
                                    <button
                                        onClick={() => handleDownload(selectedGranule)}
                                        disabled={downloadingId === selectedGranule.id}
                                        className="bg-[#99334C] text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#99334C]/20 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {downloadingId === selectedGranule.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                        Télécharger
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* NO Footer here - already in RootLayout */}
        </div>
    );
};

export default MarketplacePage;
