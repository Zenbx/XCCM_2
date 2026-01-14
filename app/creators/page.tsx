"use client";

import React from 'react';
import { Award, UserPlus, Users, BookOpen, Star, Trophy } from 'lucide-react';

const CreatorsPage = () => {
    const creators = [
        {
            id: 1,
            name: "Dr. Sophie Martin",
            role: "Expert IA & Data",
            followers: "12k",
            projects: 45,
            rating: 4.9,
            bio: "Professeur en sciences informatiques, passionnée par la démocratisation du savoir technologique.",
            tags: ["Informatique", "IA", "Python"],
            rank: 1
        },
        {
            id: 2,
            name: "Thomas Durand",
            role: "Étudiant Droit",
            followers: "8.5k",
            projects: 120,
            rating: 4.7,
            bio: "Je partage mes fiches de révisions et mes méthodologies pour réussir ses études de droit.",
            tags: ["Droit", "Méthodologie", "L3"],
            rank: 2
        },
        {
            id: 3,
            name: "Marie Curie 2.0",
            role: "Vulgarisatrice",
            followers: "45k",
            projects: 89,
            rating: 4.95,
            bio: "La science expliquée à tous. Physique, Chimie et Biologie sans maux de tête.",
            tags: ["Sciences", "Physique", "Chimie"],
            rank: 3
        },
        {
            id: 4,
            name: "Jean Dupont",
            role: "Formateur Business",
            followers: "5.2k",
            projects: 30,
            rating: 4.6,
            bio: "Entrepreneur en série, je partage mes templates de gestion et finance.",
            tags: ["Business", "Finance", "Startup"],
            rank: 4
        },
        {
            id: 5,
            name: "Emily Clark",
            role: "Designer UX/UI",
            followers: "3.8k",
            projects: 22,
            rating: 4.8,
            bio: "Rendre le beau accessible. Cours de design et templates Figma.",
            tags: ["Design", "Art", "UX"],
            rank: 5
        },
        {
            id: 6,
            name: "Lucas Matheux",
            role: "Prof de Maths",
            followers: "9k",
            projects: 150,
            rating: 4.5,
            bio: "Les maths sont faciles si on a les bons outils.",
            tags: ["Maths", "Lycée", "Prépa"],
            rank: 6
        }
    ];

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
                    {creators.map((creator) => (
                        <div key={creator.id} className="bg-white border boundary-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow relative overflow-hidden group">

                            {/* Rank Badge */}
                            <div className="absolute top-0 right-0 p-4">
                                <span className={`text-6xl font-black opacity-5 group-hover:opacity-10 transition-opacity ${creator.rank <= 3 ? 'text-yellow-500' : 'text-gray-900'}`}>
                                    #{creator.rank}
                                </span>
                            </div>

                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 p-1 mb-4 shadow-inner">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl font-bold text-gray-400">
                                        {creator.name[0]}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-1">{creator.name}</h3>
                                <p className="text-[#99334C] font-medium text-sm mb-4">{creator.role}</p>

                                <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                                    {creator.bio}
                                </p>

                                {/* Stats */}
                                <div className="flex items-center justify-center gap-6 w-full mb-6 pb-6 border-b border-gray-100">
                                    <div className="text-center">
                                        <p className="font-bold text-gray-900">{creator.followers}</p>
                                        <p className="text-xs text-gray-500">Abonnés</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-gray-900">{creator.projects}</p>
                                        <p className="text-xs text-gray-500">Projets</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center gap-1 justify-center">
                                            <span className="font-bold text-gray-900">{creator.rating}</span>
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        </div>
                                        <p className="text-xs text-gray-500">Note</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 justify-center mb-6">
                                    {creator.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <button className="w-full py-3 bg-[#99334C] text-white rounded-xl font-bold hover:bg-[#7a283d] transition-colors flex items-center justify-center gap-2">
                                    <UserPlus className="w-4 h-4" />
                                    Suivre
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default CreatorsPage;
