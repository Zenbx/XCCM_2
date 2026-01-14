"use client";

import React, { use } from 'react';
import {
    ArrowLeft,
    Map,
    Clock,
    MousePointer,
    Smartphone,
    Monitor,
    Globe
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function ProjectAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrapping params for Next.js 15+ (using React.use() or async await pattern if server component, 
    // but this is client component so we use React.use() if it was a promise, 
    // actually in standard client component params is just a prop, checking Next.js version... 
    // Next 15 requires awaiting params.
    const { id } = use(params);

    // Mock Data
    const project = {
        id,
        name: "Introduction à l'Intelligence Artificielle",
        views: "32,450",
        avgTime: "12m 30s",
        completion: "68%",
        revenue: "1,200 €"
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">

                {/* Back Button */}
                <Link href="/analytics" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#99334C] mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Retour au Tableau de Bord
                </Link>

                {/* Header */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-[#99334C]/10 text-[#99334C] px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Projet</span>
                                <span className="text-gray-400 text-xs">ID: {id}</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                        </div>
                        <div className="flex gap-4 text-center">
                            <div className="bg-gray-50 px-6 py-3 rounded-xl">
                                <p className="text-gray-500 text-xs uppercase font-bold">Temps Moyen</p>
                                <p className="text-xl font-bold text-gray-900">{project.avgTime}</p>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 rounded-xl">
                                <p className="text-gray-500 text-xs uppercase font-bold">Complétion</p>
                                <p className="text-xl font-bold text-green-600">{project.completion}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Engagement Heatmap Mockup */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6">
                            <MousePointer className="w-5 h-5 text-[#99334C]" />
                            <h3 className="text-lg font-bold text-gray-900">Carte de Chaleur (Clics)</h3>
                        </div>

                        {/* Fake Heatmap Visual */}
                        <div className="aspect-video bg-gray-100 rounded-xl relative overflow-hidden group cursor-crosshair">
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                Prévisualisation du projet...
                            </div>
                            {/* Random Heat Blobs */}
                            <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-red-500/30 blur-xl rounded-full"></div>
                            <div className="absolute bottom-1/3 right-1/3 w-32 h-32 bg-red-500/40 blur-2xl rounded-full"></div>
                            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-red-600/50 blur-lg rounded-full"></div>
                        </div>
                        <p className="mt-4 text-sm text-gray-500 text-center">
                            Les zones rouges indiquent les éléments les plus cliqués par vos étudiants.
                        </p>
                    </div>

                    {/* Demographics & Tech */}
                    <div className="space-y-8">

                        {/* Devices */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Appareils</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                        <Monitor className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-semibold text-gray-700">Desktop</span>
                                            <span className="font-bold text-gray-900">65%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-semibold text-gray-700">Mobile</span>
                                            <span className="font-bold text-gray-900">30%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Geography */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <Globe className="w-5 h-5 text-green-600" />
                                <h3 className="text-lg font-bold text-gray-900">Géographie</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { country: "France", val: "45%" },
                                    { country: "Canada", val: "20%" },
                                    { country: "Belgique", val: "15%" },
                                    { country: "Suisse", val: "10%" }
                                ].map((geo) => (
                                    <div key={geo.country} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                                        <span className="text-gray-600">{geo.country}</span>
                                        <span className="font-bold text-gray-900">{geo.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
