"use client";

import React, { useState } from 'react';
import {
    Store,
    Layers,
    Star,
    Settings,
    Plus,
    Search,
    BarChart,
    TrendingUp,
    ChevronRight,
    MoreVertical,
    FileText,
    Eye,
    Tag,
    Globe,
    Zap,
    Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function MarketplaceManagement() {
    const [activeTab, setActiveTab] = useState('categories');

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-20 font-sans">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Store className="text-[#99334C]" size={26} />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Marketplace Control</span>
                    </h1>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#99334C] rounded-full animate-pulse" />
                        Curation & Économie de Contenu • Admin OS
                    </p>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Revenu Alpha', val: '€12,450', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Conversion', val: '5.2%', icon: BarChart, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Catégories', val: '18', icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Items Vedettes', val: '5', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((s, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col gap-4 group hover:shadow-md transition-all duration-300"
                    >
                        <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                            <s.icon size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{s.label}</p>
                            <p className="text-xl font-black text-gray-900 leading-none">{s.val}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-3 space-y-2">
                    {[
                        { id: 'categories', label: 'Gestion des Catégories', icon: Layers, desc: 'Hiérarchie et taxonomie' },
                        { id: 'featured', label: 'Produits Vedettes', icon: Star, desc: 'Mise en avant marketplace' },
                        { id: 'analytics', label: 'Métriques Market', icon: BarChart, desc: 'Performance commerciale' },
                        { id: 'settings', label: 'Paramètres Boutique', icon: Settings, desc: 'Commissions et visibilité' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group border ${activeTab === tab.id
                                    ? 'bg-white border-gray-100 shadow-md translate-x-1'
                                    : 'hover:bg-gray-100/50 border-transparent'
                                }`}
                        >
                            <div className={`p-2.5 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-[#99334C] text-white' : 'bg-gray-100 text-gray-400 group-hover:text-gray-600'
                                }`}>
                                <tab.icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-black transition-colors leading-none mb-1 ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-400'
                                    }`}>{tab.label}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight truncate">{tab.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Dynamic Content Area */}
                <div className="lg:col-span-9 space-y-6">
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/20 p-8 min-h-[500px]">
                        {activeTab === 'categories' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-6 border-b border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                                            <Tag size={20} />
                                        </div>
                                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Taxonomie du Marché</h2>
                                    </div>
                                    <button className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200">
                                        Nouvelle Catégorie
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { name: 'Professionnel', count: 450, growth: '+12%', color: 'from-blue-500/10 to-transparent' },
                                        { name: 'Académique', count: 1200, growth: '+5%', color: 'from-purple-500/10 to-transparent' },
                                        { name: 'Juridique', count: 120, growth: '-2%', color: 'from-amber-500/10 to-transparent' },
                                        { name: 'Technique', count: 890, growth: '+25%', color: 'from-rose-500/10 to-transparent' },
                                    ].map((cat, i) => (
                                        <div key={i} className={`p-5 rounded-2xl border border-gray-100 bg-gradient-to-r ${cat.color} group hover:border-[#99334C]/20 transition-all cursor-pointer`}>
                                            <div className="flex items-center justify-between font-black uppercase text-[10px] tracking-widest text-gray-400 mb-2">
                                                <span>Catégorie Active</span>
                                                <span className={cat.growth.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}>{cat.growth}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-black text-gray-900 tracking-tight">{cat.name}</h3>
                                                <span className="text-xs font-black text-gray-400">{cat.count} items</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'featured' && (
                            <div className="space-y-8 flex flex-col items-center justify-center h-full text-center">
                                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-[28px] flex items-center justify-center animate-bounce shadow-xl shadow-amber-100/50">
                                    <Star size={32} fill="currentColor" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Programmation Vedette</h2>
                                    <p className="text-sm text-gray-400 font-medium max-w-md mx-auto mt-2">Gérez les publications qui apparaîtront en première page de la marketplace pour maximiser l'impact visuel.</p>
                                </div>
                                <div className="flex gap-4">
                                    <button className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all hover:bg-black active:scale-95">
                                        Configurer le Carousel
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-8">
                                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                    <Zap size={20} className="text-[#99334C]" /> Paramètres d'Économie Alpha
                                </h2>
                                <div className="space-y-6">
                                    {[
                                        { label: 'Taux de Commission Plateforme', val: '15%', toggle: false },
                                        { label: 'Mode "Marketplace Ouverte"', val: 'Activé', toggle: true },
                                        { label: 'Validation Automatique IA', val: 'Désactivé', toggle: true },
                                        { label: 'Accès Multi-Domaines', val: 'Public', toggle: false },
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                            <div>
                                                <p className="font-black text-gray-900 text-sm tracking-tight">{s.label}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 italic">Dernière modif : Admin Root</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-black text-[#99334C] bg-[#99334C]/5 px-3 py-1 rounded-lg border border-[#99334C]/10">{s.val}</span>
                                                {s.toggle && (
                                                    <div className="w-10 h-6 bg-[#99334C] rounded-full relative shadow-inner">
                                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
