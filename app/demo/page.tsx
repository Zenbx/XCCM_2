"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Check, ChevronRight, Laptop, Smartphone, Tablet, Monitor } from 'lucide-react';

const DemoPage = () => {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        {
            title: "Créez votre structure",
            desc: "Définissez vos parties, chapitres et paragraphes en quelques clics.",
            video: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1600"
        },
        {
            title: "Rédigez le contenu",
            desc: "L'éditeur intelligent vous assiste avec des blocs de code, des formules et plus encore.",
            video: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1600"
        },
        {
            title: "Publiez et Partagez",
            desc: "Exportez en PDF, HTML ou partagez un lien public instantanément.",
            video: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1600"
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Sticky Header for Demo */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 py-4 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <span className="font-bold text-xl text-[#99334C]">XCCM Démo</span>
                    <div className="flex gap-4">
                        <Link href="/" className="px-4 py-2 text-gray-600 font-medium hover:text-[#99334C]">Retour à l'accueil</Link>
                        <Link href="/register" className="px-4 py-2 bg-[#99334C] text-white rounded-lg font-bold hover:bg-[#7a283d] transition-colors">Commencer Gratuitement</Link>
                    </div>
                </div>
            </div>

            {/* Hero Interactive */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                            Voir <span className="text-[#99334C]">XCCM</span> en action
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                            Découvrez comment notre éditeur transforme la création de contenu éducatif.
                            Simple, puissant, et conçu pour les enseignants.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">

                        {/* Left: Steps Navigator */}
                        <div className="space-y-4">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    onClick={() => setActiveStep(index)}
                                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${activeStep === index
                                        ? 'bg-white border-[#99334C] shadow-xl scale-105'
                                        : 'bg-gray-50 border-transparent hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${activeStep === index ? 'bg-[#99334C] text-white' : 'bg-gray-300 text-gray-600'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className={`text-xl font-bold mb-2 ${activeStep === index ? 'text-[#99334C]' : 'text-gray-900'}`}>
                                                {step.title}
                                            </h3>
                                            <p className="text-gray-600">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Right: "Screen" Mockup */}
                        <div className="relative">
                            <div className="aspect-[4/3] bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-900 relative">
                                {/* Fake Browser UI */}
                                <div className="bg-gray-800 h-8 flex items-center px-4 gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>

                                {/* Content Switcher */}
                                <div className="relative w-full h-full">
                                    <img
                                        src={steps[activeStep].video}
                                        alt="Demo Preview"
                                        className="w-full h-full object-cover transition-opacity duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <button className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hidden md:block animate-bounce">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-lg">
                                        <Check className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Export terminé</p>
                                        <p className="font-bold text-gray-900">PDF généré !</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Responsive Section */}
            <section className="bg-gray-900 text-white py-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-12">Disponible partout</h2>
                    <div className="flex flex-wrap justify-center gap-12 text-gray-400">
                        <div className="flex flex-col items-center gap-4 hover:text-white transition-colors">
                            <Monitor className="w-16 h-16" />
                            <span className="font-semibold">Desktop</span>
                        </div>
                        <div className="flex flex-col items-center gap-4 hover:text-white transition-colors">
                            <Laptop className="w-16 h-16" />
                            <span className="font-semibold">Laptop</span>
                        </div>
                        <div className="flex flex-col items-center gap-4 hover:text-white transition-colors">
                            <Tablet className="w-16 h-16" />
                            <span className="font-semibold">Tablette</span>
                        </div>
                        <div className="flex flex-col items-center gap-4 hover:text-white transition-colors">
                            <Smartphone className="w-16 h-16" />
                            <span className="font-semibold">Mobile</span>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}

export default DemoPage;
