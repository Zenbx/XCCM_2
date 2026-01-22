"use client";

import React from 'react';
import { Award, UserPlus, Users, BookOpen, Star, Trophy, Eye } from 'lucide-react';

const CreatorsPage = () => {
    const [creators, setCreators] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    // Define API URL with fallback
    const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

    React.useEffect(() => {
        const fetchCreators = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/creators/top`);
                const data = await response.json();
                if (data.success) {
                    setCreators(data.data);
                }
            } catch (error) {
                console.error("Error loading creators", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCreators();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#99334C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Recherche des meilleurs créateurs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] text-white py-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/50">
                            <Trophy className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Top Créateurs</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Découvrez les esprits brillants qui partagent leur savoir sur XCCM.
                        Suivez-les pour ne rien manquer de leurs prochaines publications.
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {creators.map((creator, index) => {
                        const rank = index + 1;
                        return (
                            <div key={creator.id} className="bg-white border boundary-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow relative overflow-hidden group">

                                {/* Rank Badge */}
                                <div className="absolute top-0 right-0 p-4">
                                    <span className={`text-6xl font-black opacity-5 group-hover:opacity-10 transition-opacity ${rank <= 3 ? 'text-yellow-500' : 'text-gray-900'}`}>
                                        #{rank}
                                    </span>
                                </div>

                                <div className="flex flex-col items-center text-center relative z-10">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 p-1 mb-4 shadow-inner overflow-hidden">
                                        {creator.profile_picture ? (
                                            <img
                                                src={`${API_BASE_URL}${creator.profile_picture}`}
                                                alt={creator.name}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl font-bold text-[#99334C]">
                                                {creator.name?.[0]}
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{creator.name}</h3>
                                    <p className="text-[#99334C] font-medium text-sm mb-4">{creator.role}</p>

                                    <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                                        Passionné par la création de contenus pédagogiques de qualité sur XCCM.
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center justify-center gap-6 w-full mb-6 pb-6 border-b border-gray-100">
                                        <div className="text-center">
                                            <p className="font-bold text-gray-900">{creator.stats?.likes || 0}</p>
                                            <p className="text-xs text-gray-500">Likes</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-gray-900">{creator.stats?.projects || 0}</p>
                                            <p className="text-xs text-gray-500">Projets</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center gap-1 justify-center">
                                                <span className="font-bold text-gray-900">{creator.stats?.views || 0}</span>
                                                <Eye className="w-3 h-3 text-blue-500" />
                                            </div>
                                            <p className="text-xs text-gray-500">Vues</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                                        <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">
                                            Créateur Actif
                                        </span>
                                    </div>

                                    <button className="w-full py-3 bg-[#99334C] text-white rounded-xl font-bold hover:bg-[#7a283d] transition-colors flex items-center justify-center gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        Suivre
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

export default CreatorsPage;
