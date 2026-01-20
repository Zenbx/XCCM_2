"use client";

import React from 'react';
import { Accessibility, Eye, Keyboard, Monitor, Volume2, Contrast, Type, MousePointer, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const AccessibilitePage = () => {
  const conformityItems = [
    { label: "Contrastes de couleurs suffisants", status: "compliant", description: "Ratio de contraste de 4.5:1 minimum pour le texte normal" },
    { label: "Navigation au clavier", status: "compliant", description: "Toutes les fonctionnalités accessibles sans souris" },
    { label: "Structuration sémantique HTML", status: "compliant", description: "Utilisation appropriée des balises HTML5" },
    { label: "Textes alternatifs pour les images", status: "partial", description: "En cours d'amélioration pour toutes les images décoratives" },
    { label: "Labels pour les formulaires", status: "compliant", description: "Tous les champs de formulaire sont correctement labelisés" },
    { label: "Ordre de tabulation logique", status: "compliant", description: "Navigation cohérente dans toute l'application" },
    { label: "États focus visibles", status: "compliant", description: "Indicateurs visuels clairs lors de la navigation au clavier" },
    { label: "Compatibilité lecteurs d'écran", status: "partial", description: "Optimisation en cours pour NVDA et JAWS" },
    { label: "Responsive design", status: "compliant", description: "Interface adaptée à tous les types d'écrans" },
    { label: "Vidéos avec sous-titres", status: "not-applicable", description: "Pas de contenu vidéo pour le moment" }
  ];

  const features = [
    {
      icon: Keyboard,
      title: "Navigation au clavier",
      description: "Toute la plateforme est navigable uniquement avec le clavier. Utilisez Tab, Entrée et les touches fléchées.",
      shortcuts: [
        { keys: "Tab", action: "Naviguer entre les éléments" },
        { keys: "Entrée", action: "Activer l'élément sélectionné" },
        { keys: "Échap", action: "Fermer les modals et overlays" },
        { keys: "Flèches", action: "Naviguer dans les menus" }
      ]
    },
    {
      icon: Eye,
      title: "Contrastes optimisés",
      description: "Nous utilisons des ratios de contraste conformes aux normes WCAG AA pour garantir une lisibilité maximale.",
      details: [
        "Contraste minimum de 4.5:1 pour le texte normal",
        "Contraste minimum de 3:1 pour le texte de grande taille",
        "Couleur principale #99334C testée pour l'accessibilité"
      ]
    },
    {
      icon: Type,
      title: "Tailles de texte ajustables",
      description: "Vous pouvez agrandir le texte jusqu'à 200% sans perte de contenu ou de fonctionnalité.",
      details: [
        "Utilisation d'unités relatives (rem, em)",
        "Zoom navigateur entièrement supporté",
        "Mise en page responsive qui s'adapte"
      ]
    },
    {
      icon: Monitor,
      title: "Compatibilité navigateurs",
      description: "La plateforme fonctionne sur tous les navigateurs modernes et leurs versions récentes.",
      browsers: ["Chrome", "Firefox", "Safari", "Edge"]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'not-applicable':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Conforme</span>;
      case 'partial':
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">Partiellement conforme</span>;
      case 'not-applicable':
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">Non applicable</span>;
      default:
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Non conforme</span>;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#99334C] to-[#7a283d] text-white overflow-hidden py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Accessibility className="w-16 h-16" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">
            Déclaration d'Accessibilité
          </h1>
          <div className="flex justify-center mb-8">
            <div className="h-1 w-32 bg-white/50 rounded-full relative">
              <div className="absolute inset-0 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed text-center">
            XCCM 2 s'engage à rendre sa plateforme accessible à tous les utilisateurs,
            quel que soit leur handicap ou leur situation.
          </p>
        </div>
      </section>

      {/* Contenu Principal */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Introduction */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre engagement</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              XCCM 2 s'engage à garantir l'accessibilité numérique de sa plateforme éducative
              pour toutes les personnes, y compris celles en situation de handicap.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nous améliorons continuellement l'expérience utilisateur pour tous et appliquons
              les standards d'accessibilité pertinents, notamment les <strong>Règles pour l'accessibilité
              des contenus Web (WCAG) 2.1</strong> au niveau AA.
            </p>
            <div className="mt-6 p-4 bg-[#99334C]/5 border-l-4 border-[#99334C] rounded-r-xl">
              <p className="text-gray-700 font-semibold">
                Niveau de conformité : <span className="text-[#99334C]">WCAG 2.1 niveau AA (partiellement conforme)</span>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Date de la déclaration : 13 janvier 2026
              </p>
            </div>
          </div>

          {/* État de conformité */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-[#99334C]/10 to-[#99334C]/5 p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">État de conformité</h2>
            </div>

            <div className="p-6 md:p-8">
              <p className="text-gray-700 mb-6">
                Cette déclaration d'accessibilité s'applique à l'ensemble de la plateforme XCCM 2.
                Voici l'état de conformité détaillé pour chaque critère WCAG :
              </p>

              <div className="space-y-3">
                {conformityItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-bold text-gray-900">{item.label}</h3>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fonctionnalités d'accessibilité */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Fonctionnalités d'accessibilité</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#99334C]/10 rounded-xl flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-[#99334C]" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                    </div>

                    <p className="text-gray-700 mb-4">{feature.description}</p>

                    {feature.shortcuts && (
                      <div className="space-y-2">
                        {feature.shortcuts.map((shortcut, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">
                              {shortcut.keys}
                            </kbd>
                            <span className="text-sm text-gray-600">{shortcut.action}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {feature.details && (
                      <ul className="space-y-2">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {feature.browsers && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {feature.browsers.map((browser, idx) => (
                          <span key={idx} className="px-3 py-1 bg-[#99334C]/10 text-[#99334C] rounded-full text-sm font-semibold">
                            {browser}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Limitations connues */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <AlertCircle className="w-7 h-7 text-amber-600" />
              Limitations connues
            </h2>

            <p className="text-gray-700 mb-6">
              Malgré nos efforts, certaines parties de la plateforme présentent encore des limitations d'accessibilité :
            </p>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-amber-600 font-bold mt-1">•</span>
                <div>
                  <strong className="text-gray-900">Éditeur de texte riche :</strong>
                  <span className="text-gray-700"> L'éditeur WYSIWYG peut présenter des difficultés avec certains lecteurs d'écran. Nous travaillons sur une version alternative en mode texte.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 font-bold mt-1">•</span>
                <div>
                  <strong className="text-gray-900">Drag-and-drop :</strong>
                  <span className="text-gray-700"> Les fonctionnalités de glisser-déposer ne sont pas encore entièrement accessibles au clavier. Des alternatives sont en cours de développement.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 font-bold mt-1">•</span>
                <div>
                  <strong className="text-gray-900">Images décoratives :</strong>
                  <span className="text-gray-700"> Certaines images décoratives peuvent manquer de textes alternatifs appropriés. Nous effectuons un audit complet.</span>
                </div>
              </li>
            </ul>

            <p className="text-gray-700 mt-6 italic">
              Ces limitations sont identifiées et feront l'objet de correctifs dans les prochaines mises à jour de la plateforme.
            </p>
          </div>

          {/* Technologies utilisées */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Technologies utilisées</h2>

            <p className="text-gray-700 mb-6">
              L'accessibilité de XCCM 2 repose sur les technologies suivantes :
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2">Technologies Web</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• HTML5 sémantique</li>
                  <li>• CSS3 avec unités relatives</li>
                  <li>• JavaScript (React 19)</li>
                  <li>• ARIA (Accessible Rich Internet Applications)</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2">Compatibilité</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Navigateurs modernes (dernières versions)</li>
                  <li>• Lecteurs d'écran (NVDA, JAWS, VoiceOver)</li>
                  <li>• Outils de zoom navigateur</li>
                  <li>• Navigation au clavier complète</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Retours et contact */}
          <div className="bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-3xl p-8 md:p-12 text-white">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Signaler un problème d'accessibilité</h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Si vous rencontrez un problème d'accessibilité sur notre plateforme ou si vous
                avez des suggestions d'amélioration, nous serions ravis de vous entendre.
              </p>

              <div className="space-y-4 max-w-md mx-auto text-left bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div>
                  <h3 className="font-bold mb-2">Moyens de contact :</h3>
                  <ul className="space-y-2 text-white/90">
                    <li>• Email : <a href="mailto:accessibilite@xccm2.com" className="underline hover:text-white">accessibilite@xccm2.com</a></li>
                    <li>• Formulaire de contact : <a href="/about#contact" className="underline hover:text-white">Nous contacter</a></li>
                    <li>• Téléphone : +237 6XX XXX XXX</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <p className="text-sm text-white/80">
                    Nous nous efforçons de répondre à toutes les demandes dans un délai de 5 jours ouvrables.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href="/about#contact"
                  className="inline-block bg-white text-[#99334C] px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Signaler un problème
                </a>
              </div>
            </div>
          </div>

          {/* Amélioration continue */}
          <div className="mt-12 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Amélioration continue</h3>
            <p className="text-gray-700">
              L'accessibilité est un processus continu. Nous effectuons régulièrement des audits d'accessibilité
              et mettons à jour cette déclaration en conséquence. Notre objectif est d'atteindre une conformité
              totale WCAG 2.1 niveau AA d'ici la fin de l'année 2026.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccessibilitePage;
