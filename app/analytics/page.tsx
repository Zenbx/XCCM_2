"use client";

import React, { useState } from 'react';
import {
    BarChart2,
    TrendingUp,
    Users,
    Eye,
    Download,
    DollarSign,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';

const AnalyticsPage = () => {
    const [timeRange, setTimeRange] = useState('30j');

    // Mock Global Stats
    const stats = [
        {
            label: "Revenus Totaux",
            value: "4,250.00 €",
            change: "+12.5%",
            isPositive: true,
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-100"
        },
        {
            label: "Vues Totales",
            value: "145.2k",
            change: "+24.1%",
            isPositive: true,
            icon: Eye,
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            label: "Téléchargements",
            value: "12,450",
            change: "-2.3%",
            isPositive: false,
            icon: Download,
            color: "text-purple-600",
            bg: "bg-purple-100"
        },
        {
            label: "Nouveaux Abonnés",
            value: "450",
            change: "+5.4%",
            isPositive: true,
            icon: Users,
            color: "text-orange-600",
            bg: "bg-orange-100"
        },
    ];

    // Mock Chart Data (Using CSS heights)
    const chartData = [35, 45, 30, 60, 75, 50, 65, 80, 70, 90, 85, 100];
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Tableau de Bord</h1>
                        <p className="text-gray-500">Analysez vos performances et vos revenus.</p>
                    </div>

                    <div className="bg-white p-1 rounded-lg border border-gray-200 flex">
                        {['7j', '30j', '1an', 'Tout'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeRange === range
                                        ? 'bg-[#99334C] text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                        <Icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${stat.isPositive ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                                        {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {stat.change}
                                    </div>
                                </div>
                                <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.label}</h3>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Chart Section */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-gray-900">Évolution des Vues</h3>
                            <button className="text-[#99334C] text-sm font-semibold flex items-center gap-2 hover:bg-[#99334C]/5 px-3 py-1 rounded-lg transition-colors">
                                <Calendar className="w-4 h-4" />
                                Derniers 30 jours
                            </button>
                        </div>

                        {/* Custom CSS Bar Chart */}
                        <div className="h-64 flex items-end justify-between gap-2 md:gap-4">
                            {chartData.map((value, i) => (
                                <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-pointer">
                                    <div
                                        className="w-full bg-[#99334C]/10 rounded-t-lg relative group-hover:bg-[#99334C]/20 transition-all"
                                        style={{ height: `${value}%` }}
                                    >
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-[#99334C] rounded-t-lg transition-all duration-1000 ease-out"
                                            style={{ height: '0%', animation: `growChart 1s forwards ${i * 0.1}s` }}
                                        ></div>

                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {value * 124} vues
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 hidden md:block">J-{12 - i}</span>
                                </div>
                            ))}
                        </div>

                        <style jsx>{`
               @keyframes growChart {
                 from { height: 0%; }
                 to { height: 100%; }
               }
            `}</style>

                    </div>

                    {/* Top Projects */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Mieux Performants</h3>
                        <div className="space-y-6">
                            {[
                                { name: "Introduction IA", views: "32k", revenue: "1,200 €" },
                                { name: "Droit Const.", views: "28k", revenue: "850 €" },
                                { name: "Physique Quantique", views: "24k", revenue: "920 €" },
                                { name: "Histoire Art", views: "18k", revenue: "450 €" },
                            ].map((project, i) => (
                                <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer" onClick={() => window.location.href = `/analytics/project/${i}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-400">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 line-clamp-1">{project.name}</p>
                                            <p className="text-xs text-gray-500">{project.views} vues</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{project.revenue}</p>
                                        <ArrowUpRight className="w-3 h-3 text-green-500 inline ml-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                            Voir tous les projets
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
