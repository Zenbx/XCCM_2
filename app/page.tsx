"use client";
import React, { useState } from 'react';
import { BookOpen, Users, GraduationCap, Sparkles, FileText, Share2, Zap, Star, ArrowRight, Check } from 'lucide-react';

// Couleurs définies : 
// Principal: #99334C | Fond Footer: #36454F | Accent: #99334C/30%

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('organizations');

  const tabs = [
    { id: 'organizations', label: 'Pour les Organisations', icon: Users },
    { id: 'home', label: 'Pour la Maison', icon: BookOpen },
    { id: 'education', label: 'Pour l\'Education', icon: GraduationCap },
  ];

  const testimonials = [
    {
      name: "Jeff Belekotan",
      role: "Responsable Formation",
      company: "TechCorp",
      content: "XCCM 2 a transformé notre approche de la formation. Nous avons réduit de 60% le temps de création de nos modules.",
      rating: 5
    },
    {
      name: "Pr Batchakui",
      role: "Professeur",
      company: "Ecole Nationale Supérieure Polytechnique de Yaoundé",
      content: "Un outil intuitif qui me permet de me concentrer sur le contenu plutôt que sur la mise en forme. Mes élèves adorent !",
      rating: 5
    },
    {
      name: "Raissa Wokmeni",
      role: "Formatrice Indépendante",
      company: "SL Consulting",
      content: "La meilleure plateforme pour partager mes connaissances. Interface claire et fonctionnalités puissantes.",
      rating: 5
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* --- SECTION HERO --- */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#99334C]/10 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#99334C]" />
            <span className="text-sm font-semibold text-[#99334C]">Nouvelle version disponible</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Créer vos cours <span className="text-[#99334C]">facilement</span> et <br />
            <span className="text-[#99334C]">partagez</span> vos connaissances
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            XCCM 2 est votre outil de création pédagogique moderne, structuré et centré sur l'utilisateur.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-[#99334C] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#7a283d] transition-all shadow-lg flex items-center gap-2">
              Commencer <ArrowRight className="w-4 h-4" />
            </button>
            <button className="border-2 border-[#99334C] text-[#99334C] px-8 py-3 rounded-full font-semibold hover:bg-[#99334C]/10 transition-all">
              En savoir plus
            </button>
          </div>
        </div>
      </section>

      {/* --- Zone d'Image avec Fond --- */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="relative w-full aspect-video md:aspect-[16/7] bg-gradient-to-br from-[#99334C]/10 to-[#99334C]/30 rounded-[32px] overflow-hidden flex items-center justify-center p-6 md:p-12">
          {/* Motif de fond */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, #99334C 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
          </div>

          {/* Image de l'interface flottante */}
          <div className="relative w-full h-full max-w-4xl shadow-2xl rounded-xl overflow-hidden border-4 border-white transform hover:scale-[1.02] transition-transform duration-500 bg-white">
            <div className="h-8 bg-gray-100 border-b flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="p-8 space-y-4">
              <div className="h-6 w-3/4 bg-[#99334C]/20 rounded animate-pulse" />
              <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse delay-75" />
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="h-32 bg-[#99334C]/10 rounded-xl border-2 border-[#99334C]/20" />
                <div className="h-32 bg-[#99334C]/10 rounded-xl border-2 border-[#99334C]/20" />
                <div className="h-32 bg-[#99334C]/10 rounded-xl border-2 border-[#99334C]/20" />
              </div>
            </div>
          </div>
        </div>
      </div>

     {/* --- SECTION INTERACTIVE STYLE MICROSOFT --- */}
      <section className="w-full px-4 md:px-12 pb-20">
        <div className="max-w-[1400px] mx-auto">
          
          {/* Barre d'onglets */}
          <div className="flex w-full mb-0 overflow-hidden">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-3 py-6 text-lg md:text-xl font-bold transition-all duration-300 border-t border-l border-r border-transparent ${
                    activeTab === tab.id 
                      ? "bg-white text-[#99334C] rounded-t-2xl shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)] z-10" 
                      : "bg-[#99334C]/10 text-[#99334C]/50 hover:bg-[#99334C]/20 rounded-t-2xl mt-2"
                  }`}
                >
                  <IconComponent className="w-6 h-6" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contenu principal */}
          <div className="bg-white w-full rounded-b-3xl rounded-tr-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-8 md:p-16 min-h-[500px] relative overflow-hidden">
            
            {/* Décoration d'arrière-plan */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#99334C]/5 to-transparent pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative z-10">
              
              {/* Texte descriptif */}
              <div className="flex-1 text-left">
                <span className="inline-block px-4 py-1 rounded-full bg-[#99334C]/10 text-[#99334C] text-sm font-bold mb-6">
                  Vision du projet
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                  Débloquez la productivité avec <span className="text-[#99334C]">XCCM 2</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-10">
                  {activeTab === 'organizations' && "Optimisez la formation de vos collaborateurs avec des parcours structurés et une gestion centralisée des connaissances."}
                  {activeTab === 'home' && "Créez vos propres guides personnels ou partagez votre passion avec une communauté mondiale depuis chez vous."}
                  {activeTab === 'education' && "Simplifiez la production de cours académiques. Idéal pour les enseignants cherchant à réduire la charge cognitive."}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <button className="bg-[#99334C] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-[#99334C]/30 transition-all flex items-center gap-2">
                    Découvrir les fonctionnalités <Zap className="w-5 h-5" />
                  </button>
                  <button className="flex items-center gap-2 text-[#99334C] font-bold hover:underline py-4 px-2">
                    Voir la documentation <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Zone visuelle dynamique */}
              <div className="flex-1 w-full relative">
                <div className="relative aspect-video bg-gradient-to-br from-[#99334C]/20 to-[#99334C]/40 rounded-[32px] flex items-center justify-center p-8 overflow-hidden group">
                  
                  {/* Motif géométrique en fond */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'linear-gradient(45deg, transparent 48%, #99334C 48%, #99334C 52%, transparent 52%)',
                      backgroundSize: '30px 30px'
                    }} />
                  </div>

                  {/* Carte d'aperçu flottante */}
                  <div className="relative w-full h-full bg-white shadow-2xl rounded-2xl overflow-hidden transform group-hover:scale-105 transition-transform duration-700 border border-white/50">
                    <div className="h-6 bg-gray-50 border-b flex items-center px-3 gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-300" />
                      <div className="w-2 h-2 rounded-full bg-yellow-300" />
                      <div className="w-2 h-2 rounded-full bg-green-300" />
                    </div>
                    <div className="p-4 flex flex-col gap-4">
                       <div className="h-4 w-3/4 bg-gray-100 rounded" />
                       <div className="h-4 w-1/2 bg-gray-50 rounded" />
                       <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="h-20 bg-[#99334C]/5 rounded-xl border border-[#99334C]/10 flex items-center justify-center text-[#99334C] font-bold text-xs">
                            Aperçu {activeTab}
                          </div>
                          <div className="h-20 bg-gray-50 rounded-xl" />
                       </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION FEATURES --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Fonctionnalités puissantes</h2>
          <p className="text-xl text-gray-600">Tout ce dont vous avez besoin pour créer des contenus exceptionnels</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border border-gray-200 rounded-3xl p-8 hover:border-[#99334C]/50 transition-all group hover:shadow-xl">
            <div className="bg-[#99334C]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#99334C] transition-all">
              <FileText className="w-6 h-6 text-[#99334C] group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Pour la Composition</h3>
            <p className="text-gray-600">Structurez vos idées en parties, chapitres et notions de manière hiérarchique et logique.</p>
          </div>
          
          <div className="border border-gray-200 rounded-3xl p-8 hover:border-[#99334C]/50 transition-all group hover:shadow-xl">
            <div className="bg-[#99334C]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#99334C] transition-all">
              <BookOpen className="w-6 h-6 text-[#99334C] group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Pour les Cours</h3>
            <p className="text-gray-600">Accédez à une bibliothèque complète et diffusez vos contenus en un seul clic.</p>
          </div>

          <div className="border border-gray-200 rounded-3xl p-8 hover:border-[#99334C]/50 transition-all group hover:shadow-xl">
            <div className="bg-[#99334C]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#99334C] transition-all">
              <Share2 className="w-6 h-6 text-[#99334C] group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Partage Simplifié</h3>
            <p className="text-gray-600">Partagez vos créations avec votre équipe ou le monde entier en quelques secondes.</p>
          </div>

          <div className="border border-gray-200 rounded-3xl p-8 hover:border-[#99334C]/50 transition-all group hover:shadow-xl">
            <div className="bg-[#99334C]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#99334C] transition-all">
              <Zap className="w-6 h-6 text-[#99334C] group-hover:text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Performance Optimale</h3>
            <p className="text-gray-600">Interface rapide et réactive pour une expérience de création fluide.</p>
          </div>
        </div>
      </section>

      {/* --- SECTION TESTIMONIALS --- */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-[#99334C]/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ils nous font confiance</h2>
            <p className="text-xl text-gray-600">Découvrez ce que nos utilisateurs disent de XCCM 2</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#99334C] text-[#99334C]" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="border-t pt-4">
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-[#99334C] font-semibold">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION CTA "PRÊT À VOUS LANCER" --- */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-[40px] p-12 md:p-16 text-center text-white relative overflow-hidden">
            {/* Décoration de fond */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
                backgroundSize: '40px 40px'
              }} />
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Prêt à vous lancer ?</h2>
              <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
                Rejoignez des milliers d'utilisateurs qui créent déjà des contenus exceptionnels avec XCCM 2
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button className="bg-white text-[#99334C] px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                  Commencer gratuitement <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all">
                  Planifier une démo
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>Gratuit pour commencer</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>Sans carte bancaire</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>Support 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;