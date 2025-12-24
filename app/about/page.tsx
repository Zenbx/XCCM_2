"use client";
import React, { useState } from 'react';
import { 
  BookOpen, 
  Target, 
  Users, 
  Lightbulb, 
  Shield, 
  Zap,
  Mail,
  Phone,
  MapPin,
  Send,
  Linkedin,
  Github,
  Twitter,
  Heart,
  Sparkles,
  Award,
  TrendingUp
} from 'lucide-react';

const AboutPage = () => {
  const [contactForm, setContactForm] = useState({
    nom: '',
    email: '',
    sujet: '',
    message: ''
  });

  const handleContactSubmit = () => {
    console.log('Contact form:', contactForm);
    // TODO: Appel API pour envoyer le message
  };

  const teamMembers = [
    {
      name: "Marie Dubois",
      role: "Chef de Projet",
      image: null,
      description: "Passionnée par l'éducation numérique",
      linkedin: "#",
      twitter: "#"
    },
    {
      name: "Jean Martin",
      role: "Développeur Full Stack",
      image: null,
      description: "Expert en architectures web modernes",
      linkedin: "#",
      github: "#"
    },
    {
      name: "Sophie Laurent",
      role: "Designer UX/UI",
      image: null,
      description: "Créatrice d'expériences utilisateur intuitives",
      linkedin: "#",
      twitter: "#"
    },
    {
      name: "Thomas Petit",
      role: "Expert Pédagogique",
      image: null,
      description: "15 ans d'expérience en ingénierie pédagogique",
      linkedin: "#"
    }
  ];

  const features = [
    {
      icon: BookOpen,
      title: "Création Simplifiée",
      description: "Créez des cours structurés avec une interface intuitive"
    },
    {
      icon: Target,
      title: "Organisation Hiérarchique",
      description: "Organisez vos contenus en parties, chapitres et notions"
    },
    {
      icon: Zap,
      title: "Publication Rapide",
      description: "Publiez et partagez vos cours en un clic"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Travaillez en équipe sur vos projets pédagogiques"
    }
  ];

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Repousser les limites de l'éducation numérique"
    },
    {
      icon: Heart,
      title: "Accessibilité",
      description: "Rendre l'éducation accessible à tous"
    },
    {
      icon: Shield,
      title: "Qualité",
      description: "Garantir une expérience utilisateur irréprochable"
    },
    {
      icon: TrendingUp,
      title: "Évolution",
      description: "S'adapter aux besoins de l'enseignement moderne"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#99334C] to-[#7a283d] text-white overflow-hidden py-20">
        {/* Motif de fond */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Découvrez notre projet</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            À propos de XCCM2
          </h1>
          
          {/* Soulignement décoratif */}
          <div className="flex justify-center mb-8">
            <div className="h-1 w-32 bg-white/50 rounded-full relative">
              <div className="absolute inset-0 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>

          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Une plateforme éducative numérique conçue pour faciliter la création, 
            l'organisation et la publication de contenus pédagogiques en ligne.
          </p>
        </div>
      </section>

      {/* Section Présentation Générale */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Présentation générale
            </h2>
            <div className="w-20 h-1 bg-[#99334C] mx-auto rounded-full"></div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100">
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
              <p>
                <span className="text-[#99334C] font-bold text-xl">XCCM 2</span> est une plateforme 
                éducative numérique conçue pour faciliter la création, l'organisation et la publication 
                de contenus pédagogiques en ligne. Elle s'adresse aux enseignants, formateurs et créateurs 
                de contenus souhaitant structurer leurs cours de manière claire, intuitive et accessible.
              </p>

              <p>
                Pensée dans une logique de <strong>système auteur</strong>, la plateforme permet de concevoir 
                des cours modulaires, organisés par parties, chapitres et notions, tout en offrant une 
                expérience utilisateur fluide et cohérente. XCCM 2 met l'accent sur la <strong>simplicité 
                d'utilisation</strong> afin de rendre la production de contenus pédagogiques accessible, 
                même sans compétences techniques avancées.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#99334C]/50 transition-all">
                      <div className="w-12 h-12 bg-[#99334C]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-6 h-6 text-[#99334C]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#99334C]/5 border-l-4 border-[#99334C] p-6 rounded-r-xl mt-8">
                <p className="text-gray-700 italic">
                  "Développé dans le cadre d'un projet d'<strong>Interaction Homme‑Machine (IHM)</strong>, 
                  XCCM 2 place l'utilisateur au centre de la conception, en mettant l'accent sur l'ergonomie, 
                  la simplicité d'usage et la qualité de l'expérience utilisateur."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Vision */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#99334C]/10 px-4 py-2 rounded-full mb-4">
              <Target className="w-5 h-5 text-[#99334C]" />
              <span className="text-sm font-semibold text-[#99334C]">Notre vision</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Vision du projet
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transformer la manière dont les contenus pédagogiques sont créés et partagés
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Notre ambition
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  À travers XCCM 2, l'ambition est de proposer une <strong>plateforme éducative moderne</strong> qui 
                  valorise la structuration du savoir, favorise l'autonomie des auteurs et améliore l'expérience 
                  d'apprentissage des utilisateurs finaux.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  XCCM 2 se positionne ainsi comme un <strong>outil pédagogique fiable, évolutif et centré sur l'humain</strong>, 
                  répondant aux besoins actuels de l'enseignement numérique.
                </p>
              </div>
              <div className="w-full md:w-1/3">
                <div className="bg-gradient-to-br from-[#99334C]/10 to-[#99334C]/5 rounded-2xl p-8 text-center">
                  <Award className="w-16 h-16 text-[#99334C] mx-auto mb-4" />
                  <p className="text-4xl font-bold text-[#99334C] mb-2">100%</p>
                  <p className="text-gray-600 font-semibold">Centré utilisateur</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section L'équipe */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#99334C]/10 px-4 py-2 rounded-full mb-4">
              <Users className="w-5 h-5 text-[#99334C]" />
              <span className="text-sm font-semibold text-[#99334C]">Qui sommes-nous</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Notre équipe
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des passionnés d'éducation et de technologie réunis pour créer la meilleure expérience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 group">
                {/* Photo de profil placeholder */}
                <div className="relative h-64 bg-gradient-to-br from-[#99334C]/20 to-[#99334C]/40 flex items-center justify-center overflow-hidden">
                  <div className="w-24 h-24 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  {/* Overlay au hover */}
                  <div className="absolute inset-0 bg-[#99334C]/90 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                    {member.linkedin && (
                      <a href={member.linkedin} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                        <Linkedin className="w-5 h-5 text-white" />
                      </a>
                    )}
                    {member.github && (
                      <a href={member.github} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                        <Github className="w-5 h-5 text-white" />
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                        <Twitter className="w-5 h-5 text-white" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-[#99334C] font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Contact */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#99334C]/10 px-4 py-2 rounded-full mb-4">
              <Mail className="w-5 h-5 text-[#99334C]" />
              <span className="text-sm font-semibold text-[#99334C]">Contactez-nous</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nous contacter
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une question ? Une suggestion ? N'hésitez pas à nous écrire
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulaire */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={contactForm.nom}
                    onChange={(e) => setContactForm({...contactForm, nom: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sujet
                  </label>
                  <input
                    type="text"
                    value={contactForm.sujet}
                    onChange={(e) => setContactForm({...contactForm, sujet: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                    placeholder="Objet de votre message"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all resize-none"
                    placeholder="Écrivez votre message ici..."
                  />
                </div>

                <button
                  onClick={handleContactSubmit}
                  className="w-full bg-[#99334C] text-white py-3 rounded-xl font-semibold hover:bg-[#7a283d] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Envoyer le message
                </button>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-3xl p-8 text-white shadow-xl">
                <h3 className="text-2xl font-bold mb-6">Informations de contact</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Email</p>
                      <p className="text-white/80">contact@xccm2.com</p>
                      <p className="text-white/80">support@xccm2.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Téléphone</p>
                      <p className="text-white/80">+237 6XX XXX XXX</p>
                      <p className="text-white/80 text-sm">Lun-Ven, 9h-18h</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Localisation</p>
                      <p className="text-white/80">Douala, Cameroun</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/20">
                  <p className="font-semibold mb-4">Suivez-nous</p>
                  <div className="flex gap-3">
                    <a href="#" className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-all">
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-all">
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-all">
                      <Github className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Horaires d'ouverture</h4>
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span>Lundi - Vendredi</span>
                    <span className="font-semibold">9h - 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi</span>
                    <span className="font-semibold">10h - 14h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche</span>
                    <span className="text-red-500 font-semibold">Fermé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-[40px] p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
                backgroundSize: '40px 40px'
              }} />
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Prêt à révolutionner votre enseignement ?
              </h3>
              <p className="text-xl text-white/90 mb-8">
                Rejoignez XCCM 2 et créez des contenus pédagogiques exceptionnels
              </p>
              <button className="bg-white text-[#99334C] px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                Commencer maintenant
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;