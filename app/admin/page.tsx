"use client";

import React from 'react';
import {
    Users,
    FileText,
    TrendingUp,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical,
    Layers,
    Sparkles,
    Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const kpis = [
    { label: 'Utilisateurs Totaux', value: '1,284', change: '+12%', isPositive: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Projets Créés', value: '452', change: '+18.5%', isPositive: true, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Revenus (MTD)', value: '12,450 €', change: '+8.2%', isPositive: true, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Sessions Actives', value: '42', change: '-4%', isPositive: false, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
];

const recentActivity = [
    { id: 1, user: 'Jeff Belekotan', action: 'a créé un nouveau projet', target: 'Introduction à l\'IA', time: 'il y a 2 min', type: 'create' },
    { id: 2, user: 'Raissa Wokmeni', action: 'a supprimé un projet', target: 'Archive 2023', time: 'il y a 15 min', type: 'delete' },
    { id: 3, user: 'Pr Batchakui', action: 'a publié un cours', target: 'Physique II', time: 'il y a 1h', type: 'publish' },
    { id: 4, user: 'System', action: 'Sauvegarde automatique', target: 'Database', time: 'il y a 3h', type: 'system' },
    { id: 5, user: 'Admin', action: 'Nouveau compte créé', target: 'user_8492', time: 'il y a 5h', type: 'admin' },
];

export default function AdminOverview() {
    return (
        <div className="space-y-10">
            {/* Welcome Banner */}
            <div className="relative bg-gradient-to-r from-[#99334C] to-[#7a283d] rounded-[32px] p-8 md:p-12 text-white overflow-hidden shadow-2xl shadow-[#99334C]/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-2 mb-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span className="text-xs font-bold uppercase tracking-wider">XCCM2 Command Center</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                        Bonjour, Administrateur 👋
                    </h1>
                    <p className="text-white/80 text-lg leading-relaxed mb-8">
                        Voici ce qui s'est passé sur votre plateforme aujourd'hui. Tout est sous contrôle.
                    </p>
                    <div className="flex gap-4">
                        <button className="bg-white text-[#99334C] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg hover:shadow-white/20">
                            <Zap className="w-4 h-4" />
                            Générer Rapport
                        </button>
                        <button className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all">
                            Audit Logs
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-[#99334C]/10 transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-4 rounded-2xl ${kpi.bg}`}>
                                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg ${kpi.isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                {kpi.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {kpi.change}
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 font-semibold text-sm mb-1">{kpi.label}</p>
                            <h3 className="text-3xl font-black text-gray-900">{kpi.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Analytics & Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Layers className="w-5 h-5 text-[#99334C]" />
                            Activité Récente
                        </h2>
                        <button className="text-sm font-bold text-[#99334C] hover:underline px-4 py-2 rounded-xl transition-all">
                            Voir tout
                        </button>
                    </div>
                    <div className="px-8 py-2 divide-y divide-gray-50">
                        {recentActivity.map((act) => (
                            <div key={act.id} className="py-6 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg bg-gray-50 text-gray-400 group-hover:bg-[#99334C]/10 group-hover:text-[#99334C] transition-all`}>
                                        {act.user[0]}
                                    </div>
                                    <div>
                                        <p className="text-gray-900 font-bold group-hover:text-[#99334C] transition-all">{act.user}</p>
                                        <p className="text-sm text-gray-500">{act.action} <span className="font-semibold text-gray-700">"{act.target}"</span></p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 text-right">
                                    <span className="text-xs font-bold text-gray-400">{act.time}</span>
                                    <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all text-gray-400">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Platform Health / Usage */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold mb-8">État de la Plateforme</h2>
                        <div className="space-y-8">
                            {[
                                { label: 'Utilisation Stockage', val: 72, color: 'bg-amber-500' },
                                { label: 'Charge Serveur', val: 45, color: 'bg-[#99334C]' },
                                { label: 'Taux Erreurs API', val: 1.2, color: 'bg-green-500' },
                            ].map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span className="text-gray-500">{item.label}</span>
                                        <span className="text-gray-900">{item.val}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.val}%` }}
                                            transition={{ duration: 1, delay: idx * 0.2 }}
                                            className={`h-full ${item.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 bg-[#36454F] rounded-2xl p-6 text-white text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-[#99334C] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
                        <div className="relative z-10">
                            <p className="text-sm font-bold text-white/70 mb-2 uppercase tracking-widest">Abonnement</p>
                            <h4 className="text-2xl font-black mb-1">PRO PLAN</h4>
                            <p className="text-xs mb-6 opacity-60 italic">Renouvellement le 12 Fév. 2026</p>
                            <button className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-transform active:scale-95">
                                Gérer Licence
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
