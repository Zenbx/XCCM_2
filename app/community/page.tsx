"use client";

import React, { useState } from 'react';
import {
    Search,
    Heart,
    MessageCircle,
    Share2,
    Eye,
    TrendingUp,
    Clock,
    User,
    Filter
} from 'lucide-react';
import Link from 'next/link';

const CommunityPage = () => {
    const [activeTab, setActiveTab] = useState('tendance');

    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/community/feed`);
                const data = await response.json();
                if (data.success) {
                    setPosts(data.data);
                }
            } catch (error) {
                console.error("Error loading community feed", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeed();
    }, []);

    // Helper to format date
    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "À l'instant";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} j`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 sticky top-[73px] z-30">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Communauté XCCM</h1>
                            <p className="text-gray-500 text-sm">Découvrez les meilleures créations de la semaine</p>
                        </div>

                        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-full md:w-auto">
                            {['tendance', 'nouveautés', 'suivis'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                        ? 'bg-white text-[#99334C] shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Main Feed */}
                    <div className="lg:w-2/3">
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                                    {/* Card Content - Optimized for 'Feed' look */}
                                    <div className="flex flex-col md:flex-row">
                                        {/* Image */}
                                        <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                                                {post.category}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#99334C] to-[#ff9999] flex items-center justify-center text-white text-xs font-bold">
                                                        {post.author[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{post.author}</p>
                                                        <p className="text-xs text-gray-500">{post.authorRole} • {formatTimeAgo(post.timeAgo || post.updated_at)}</p>
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#99334C] transition-colors">{post.title}</h3>
                                                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{post.description}</p>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                                                <div className="flex items-center gap-6">
                                                    <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                                                        <Heart className="w-5 h-5" />
                                                        <span className="text-xs font-medium">{post.likes}</span>
                                                    </button>
                                                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                                                        <MessageCircle className="w-5 h-5" />
                                                        <span className="text-xs font-medium">{post.comments}</span>
                                                    </button>
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <Eye className="w-5 h-5" />
                                                        <span className="text-xs font-medium">{post.views}</span>
                                                    </div>
                                                </div>
                                                <button className="text-gray-400 hover:text-gray-900">
                                                    <Share2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Load More */}
                        <div className="mt-8 text-center">
                            <button className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                                Charger plus de projets
                            </button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-32 space-y-6">

                            {/* Search Box */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">Rechercher</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Mots-clés, auteurs..."
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C]"
                                    />
                                </div>
                            </div>

                            {/* Trending Topics */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-[#99334C]" />
                                    Sujets du moment
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {['#IntelligenceArtificielle', '#Droit', '#Médecine', '#Design', '#Code', '#Marketing'].map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium hover:bg-[#99334C] hover:text-white cursor-pointer transition-colors">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Top Contributors Mini */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900">Top Créateurs</h3>
                                    <Link href="/creators" className="text-xs font-semibold text-[#99334C] hover:underline">Voir tout</Link>
                                </div>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                            <div className="flex-1">
                                                <div className="h-4 w-24 bg-gray-100 rounded mb-1"></div>
                                                <div className="h-3 w-12 bg-gray-50 rounded"></div>
                                            </div>
                                            <button className="px-3 py-1 bg-[#99334C]/10 text-[#99334C] text-xs font-bold rounded-lg hover:bg-[#99334C] hover:text-white transition-colors">
                                                Suivre
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
