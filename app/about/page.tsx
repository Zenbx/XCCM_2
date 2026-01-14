"use client";
import React, { useState, useEffect, useRef } from 'react';
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
import router from 'next/router';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/services/locales';

const AboutPage = () => {
  const [contactForm, setContactForm] = useState({
    nom: '',
    email: '',
    sujet: '',
    message: ''
  });

  const { language } = useLanguage();
  const t = translations[language] ?? translations.fr;

  // Gestion des animations au scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
        }
      });
    }, observerOptions);

    // Observer tous les éléments avec la classe 'animate-on-scroll'
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleContactSubmit = () => {
    console.log('Contact form:', contactForm);
    // TODO: Appel API pour envoyer le message
  };

  const teamMembers = [
    {
      name: "BELEKOTAN II JEFF NICHOSS",
      pseudo: "Zenbx__",
      email: "jeffbelekotan@gmail.com",
      github: "https://github.com/Zenbx__"
    },
    {
      name: "NZIELEU NGNOULAYE M. NATHAN",
      pseudo: "Natech23__",
      email: "nathan.nzieleu@gmail.com",
      github: "https://github.com/Natech23__"
    },

    {
      name: "BISSECK CHALVI NATHANAEL",
      pseudo: "HinaSejaru124__",
      email: "bissecknathanael@gmail.com",
      github: "https://github.com/HinaSejaru124__"
    },
    {
      name: "WOKMENI RAÏSSA",
      pseudo: "w-raissa__",
      email: "rwokmeni@gmail.com",
      github: "https://github.com/w-raissa__"
    },
    {
      name: "TAGNE SOUOP THOMAS DISNEY",
      pseudo: "Override__",
      email: "tstdtomson@gmail.com",
      github: "https://github.com/Override__"
    },
    {
      name: "FOFACK ALEMDJOU HENRI JOËL",
      pseudo: "ALEMDJOU__",
      email: "fofackhenri36@gmail.com",
      github: "https://github.com/ALEMDJOU__"
    },
    {
      name: "ELOUNDOU NGOUMA THOMAS",
      pseudo: "Thomas26__",
      email: "thomaseloundou3@gmail.com",
      github: "https://github.com/Thomas26__"
    },
    {
      name: "TOMO MBIANDA ANGELA KATIA",
      pseudo: "Angela Sevilla__",
      email: "sevillaangela73@gmail.com",
      github: "https://github.com/AngelaSevilla__"
    },
    {
      name: "MAGNE ISABELLE CHRIST",
      pseudo: "Isa-Christ",
      email: null,
      github: "https://github.com/Isa-Christ"
    },
    {
      name: "WATONN JEUTA IVANA",
      pseudo: "Waton-Ivana__",
      email: "watonjeutaivana@gmail.com",
      github: "https://github.com/Waton-Ivana__"
    },
    {
      name: "AYISSI ODILE",
      pseudo: "AyissiOdile__",
      email: "ayissiodile@gmail.com",
      github: "https://github.com/Waton-Ivana__"
    },
    {
      name: "MOGOU ULRICH",
      pseudo: " ",
      email: "ayissiodile@gmail.com",
      github: "https://github.com/Waton-Ivana__"
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
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scroll-horizontal {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-on-scroll {
          opacity: 0;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-scroll-horizontal {
          animation: scroll-horizontal 40s linear infinite;
        }

        .animate-scroll-horizontal:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Hero Section */}
      <section id="hero" className="relative bg-gradient-to-br from-[#99334C] to-[#7a283d] text-white overflow-hidden py-20">
        {/* Motif de fond */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {t.about.hero.title}
          </h1>

          {/* Soulignement décoratif */}
          <div className="flex justify-center mb-8">
            <div className="h-1 w-32 bg-white/50 rounded-full relative">
              <div className="absolute inset-0 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>

          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            {t.about.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Section Présentation Générale */}
      <section id="presentation" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t.about.presentation.title}
            </h2>
            <div className="w-20 h-1 bg-[#99334C] mx-auto rounded-full"></div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100 animate-on-scroll">
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
              <p>
                <span className="text-[#99334C] font-bold text-xl">XCCM 2</span> {t.about.presentation.intro}
              </p>

              <p>
                {t.about.presentation.paragraph}
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {t.about.features.map((feature, index) => {
                  const IconComponent = features[index]?.icon || BookOpen;
                  return (
                    <div key={index} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#99334C]/50 transition-all">
                      <div className="w-12 h-12 bg-[#99334C]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-6 h-6 text-[#99334C]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.desc}</p>
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
      <section id="vision" className="py-20 px-6 bg-gradient-to-b from-white to-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <div className="inline-flex items-center gap-2 bg-[#99334C]/10 px-4 py-2 rounded-full mb-4">
              <Target className="w-5 h-5 text-[#99334C]" />
              <span className="text-sm font-semibold text-[#99334C]">{t.about.vision.title}</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t.about.vision.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.about.vision.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {t.about.values.map((value, index) => {
              const IconComponent = values[index]?.icon || Lightbulb;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 group animate-on-scroll" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 animate-on-scroll">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  {t.about.vision.ambitionTitle}
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {t.about.vision.ambitionParagraph1}
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {t.about.vision.ambitionParagraph2}
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
      <section id="equipe" className="py-20 px-6 scroll-mt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <div className="inline-flex items-center gap-2 bg-[#99334C]/10 px-4 py-2 rounded-full mb-4">
              <Users className="w-5 h-5 text-[#99334C]" />
              <span className="text-sm font-semibold text-[#99334C]">{t.about.team.title}</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t.about.team.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.about.team.subtitle}
            </p>
          </div>

          {/* Défilement horizontal automatique */}
          <div className="relative animate-on-scroll">
            <div className="overflow-hidden">
              <div className="flex gap-6 animate-scroll-horizontal">
                {[...teamMembers, ...teamMembers].map((member, index) => (
                  <div key={index} className="flex-shrink-0 w-80 bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 group">
                    {/* Photo de profil placeholder */}
                    <div className="relative h-48 bg-gradient-to-br from-[#99334C]/20 to-[#99334C]/40 flex items-center justify-center overflow-hidden">
                      <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Users className="w-10 h-10 text-white" />
                      </div>
                      {/* Overlay au hover */}
                      <div className="absolute inset-0 bg-[#99334C]/90 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                        {member.email && (
                          <a href={`mailto:${member.email}`} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all" title={t.about.contact.email}>
                            <Mail className="w-5 h-5 text-white" />
                          </a>
                        )}
                        {member.github && (
                          <a href={member.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all" title="GitHub">
                            <Github className="w-5 h-5 text-white" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-[#99334C] font-semibold mb-2 text-sm">{member.pseudo}</p>
                      {member.email && (
                        <p className="text-gray-600 text-xs truncate">{member.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Contact */}
      <section id="contact" className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <div className="inline-flex items-center gap-2 bg-[#99334C]/10 px-4 py-2 rounded-full mb-4">
              <Mail className="w-5 h-5 text-[#99334C]" />
              <span className="text-sm font-semibold text-[#99334C]">{t.about.contact.sectionLabel}</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t.about.contact.heading}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.about.contact.subtitle}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulaire */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 animate-on-scroll">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{t.about.contact.formTitle}</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.about.contact.name}
                  </label>
                  <input
                    type="text"
                    value={contactForm.nom}
                    onChange={(e) => setContactForm({ ...contactForm, nom: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                    placeholder={t.about.contact.namePlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.about.contact.email}
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                    placeholder={t.about.contact.emailPlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.about.contact.subject}
                  </label>
                  <input
                    type="text"
                    value={contactForm.sujet}
                    onChange={(e) => setContactForm({ ...contactForm, sujet: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                    placeholder={t.about.contact.subjectPlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.about.contact.message}
                    </label>
                    <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all resize-none"
                    placeholder={t.about.contact.messagePlaceholder}
                  />
                </div>

                <button
                  onClick={handleContactSubmit}
                  className="w-full bg-[#99334C] text-white py-3 rounded-xl font-semibold hover:bg-[#7a283d] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  {t.about.contact.send}
                </button>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="space-y-6 animate-on-scroll" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-3xl p-8 text-white shadow-xl">
                <h3 className="text-2xl font-bold mb-6">{t.about.contact.infoTitle}</h3>

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
                <h4 className="text-xl font-bold text-gray-900 mb-4">{t.about.contact.hoursTitle}</h4>
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
          <div className="bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-[40px] p-12 text-center text-white relative overflow-hidden animate-on-scroll">
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
              <button
                onClick={() => router.push('/login')}
                className="bg-white text-[#99334C] px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
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