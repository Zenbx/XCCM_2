"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Bookmark,
  BookmarkCheck,
  Eye,
  User,
  Calendar,
  Clock,
  Star,
  Menu,
  X,
  Copy,
  Check,
  Plus,
  Lock,
  Unlock,
  FileText,
  List,
  ZoomIn,
  ZoomOut,
  Printer
} from 'lucide-react';

const DocumentReaderPage = () => {
  const [isOwner, setIsOwner] = useState(false); // Simule si l'utilisateur est propriétaire
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [tocOpen, setTocOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('intro');
  const [copiedGranule, setCopiedGranule] = useState(null);
  const [selectedGranules, setSelectedGranules] = useState([]);
  const [showAddToDoc, setShowAddToDoc] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const contentRef = useRef(null);

  // Document simulé
  const courseDocument = {
    id: 1,
    title: "Introduction aux Réseaux Informatiques",
    author: "Dr. Jean Martin",
    authorAvatar: null,
    date: "15 Déc 2024",
    category: "Informatique",
    views: 1250,
    downloads: 340,
    rating: 4.8,
    duration: "12h",
    level: "Débutant",
    description: "Un guide complet sur les fondamentaux des réseaux informatiques, couvrant les protocoles, l'architecture et les meilleures pratiques."
  };

  // Structure du document avec granules
  const documentContent = {
    sections: [
      {
        id: 'intro',
        title: 'Introduction',
        subsections: [
          {
            id: 'intro-1',
            title: 'Qu\'est-ce qu\'un réseau informatique ?',
            granules: [
              {
                id: 'g1',
                type: 'paragraph',
                content: 'Un réseau informatique est un ensemble d\'ordinateurs et de périphériques interconnectés qui peuvent échanger des données et partager des ressources. Les réseaux permettent la communication entre différents appareils, qu\'ils soient dans la même pièce ou à des milliers de kilomètres de distance.'
              },
              {
                id: 'g2',
                type: 'paragraph',
                content: 'Les réseaux informatiques sont essentiels dans notre monde moderne, permettant tout, de la navigation sur Internet à la communication par e-mail, en passant par le streaming vidéo et le cloud computing.'
              }
            ]
          },
          {
            id: 'intro-2',
            title: 'Histoire des réseaux',
            granules: [
              {
                id: 'g3',
                type: 'paragraph',
                content: 'L\'histoire des réseaux informatiques remonte aux années 1960 avec ARPANET, le précurseur d\'Internet. Développé par le département de la Défense des États-Unis, ARPANET a été le premier réseau à utiliser la commutation de paquets.'
              }
            ]
          }
        ]
      },
      {
        id: 'fundamentals',
        title: 'Fondamentaux',
        subsections: [
          {
            id: 'fund-1',
            title: 'Types de réseaux',
            granules: [
              {
                id: 'g4',
                type: 'paragraph',
                content: 'Il existe plusieurs types de réseaux classés selon leur portée géographique :'
              },
              {
                id: 'g5',
                type: 'list',
                content: [
                  'LAN (Local Area Network) : Réseau local couvrant une petite zone comme un bureau ou une maison',
                  'MAN (Metropolitan Area Network) : Réseau métropolitain couvrant une ville',
                  'WAN (Wide Area Network) : Réseau étendu couvrant de grandes distances, comme Internet',
                  'PAN (Personal Area Network) : Réseau personnel pour connecter des appareils personnels'
                ]
              }
            ]
          },
          {
            id: 'fund-2',
            title: 'Topologies de réseau',
            granules: [
              {
                id: 'g6',
                type: 'paragraph',
                content: 'La topologie d\'un réseau décrit la manière dont les appareils sont physiquement ou logiquement connectés. Les topologies communes incluent :'
              },
              {
                id: 'g7',
                type: 'list',
                content: [
                  'Topologie en bus : Tous les appareils partagent un même câble de communication',
                  'Topologie en étoile : Tous les appareils sont connectés à un concentrateur central',
                  'Topologie en anneau : Les appareils sont connectés en boucle fermée',
                  'Topologie maillée : Chaque appareil est connecté à plusieurs autres'
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'protocols',
        title: 'Protocoles réseau',
        subsections: [
          {
            id: 'proto-1',
            title: 'Le modèle OSI',
            granules: [
              {
                id: 'g8',
                type: 'paragraph',
                content: 'Le modèle OSI (Open Systems Interconnection) est un modèle conceptuel qui standardise les fonctions de communication d\'un système de télécommunication. Il est divisé en 7 couches, chacune ayant des responsabilités spécifiques.'
              },
              {
                id: 'g9',
                type: 'paragraph',
                content: 'Ces couches permettent une approche modulaire de la conception des réseaux, où chaque couche fournit des services à la couche supérieure et utilise les services de la couche inférieure.'
              }
            ]
          },
          {
            id: 'proto-2',
            title: 'TCP/IP',
            granules: [
              {
                id: 'g10',
                type: 'paragraph',
                content: 'TCP/IP (Transmission Control Protocol/Internet Protocol) est la suite de protocoles sur laquelle repose Internet. TCP assure la transmission fiable des données, tandis qu\'IP s\'occupe de l\'adressage et du routage.'
              },
              {
                id: 'g11',
                type: 'paragraph',
                content: 'Le protocole TCP établit une connexion entre deux appareils avant de transmettre des données, garantissant que tous les paquets arrivent dans le bon ordre et sans erreur. IP, quant à lui, attribue une adresse unique à chaque appareil sur le réseau.'
              }
            ]
          }
        ]
      }
    ]
  };

  // Fonction pour faire défiler vers une section
  const scrollToSection = (sectionId) => {
    if (typeof window === 'undefined') return;
    const element = window.document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  // Détection de la section active lors du défilement
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      const sections = window.document.querySelectorAll('[data-section]');
      let current = '';

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 100) {
          current = section.getAttribute('data-section');
        }
      });

      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Copier un granule
  const handleCopyGranule = (granuleId, content) => {
    navigator.clipboard.writeText(typeof content === 'string' ? content : content.join('\n'));
    setCopiedGranule(granuleId);
    setTimeout(() => setCopiedGranule(null), 2000);
  };

  // Sélectionner un granule pour l'ajouter à un document
  const toggleGranuleSelection = (granuleId) => {
    setSelectedGranules(prev => 
      prev.includes(granuleId) 
        ? prev.filter(id => id !== granuleId)
        : [...prev, granuleId]
    );
  };

  // Ajouter les granules sélectionnés à un document
  const handleAddToDocument = () => {
    if (selectedGranules.length > 0) {
      setShowAddToDoc(true);
      // TODO: Implémenter la logique d'ajout au document
    }
  };

  // Télécharger le document
  const handleDownload = () => {
    console.log('Téléchargement du document...');
    // TODO: Implémenter la logique de téléchargement
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixe */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Retour et titre */}
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTocOpen(!tocOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all lg:hidden"
                >
                  {tocOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                
                <div>
                  <h1 className="text-xl font-bold text-gray-900 line-clamp-1">
                    {courseDocument.title}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {courseDocument.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {courseDocument.views}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Contrôles de zoom */}
              <div className="hidden md:flex items-center gap-1 border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                  className="p-2 hover:bg-gray-100 transition-all"
                  title="Réduire"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-medium border-x border-gray-300">
                  {fontSize}px
                </span>
                <button
                  onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
                  className="p-2 hover:bg-gray-100 transition-all"
                  title="Agrandir"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {selectedGranules.length > 0 && (
                <button
                  onClick={handleAddToDocument}
                  className="flex items-center gap-2 px-4 py-2 bg-[#99334C] text-white rounded-lg hover:bg-[#7a283d] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline">
                    Ajouter ({selectedGranules.length})
                  </span>
                </button>
              )}

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                title={isBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5 text-[#99334C]" />
                ) : (
                  <Bookmark className="w-5 h-5 text-gray-600" />
                )}
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Télécharger</span>
              </button>

              <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Table des matières */}
        <aside
          className={`${
            tocOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:sticky lg:translate-x-0 top-[73px] left-0 w-80 h-[calc(100vh-73px)] bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 z-40 lg:z-0`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <List className="w-5 h-5" />
                Table des matières
              </h2>
              <button
                onClick={() => setTocOpen(false)}
                className="lg:hidden p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {documentContent.sections.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition-all ${
                      activeSection === section.id
                        ? 'bg-[#99334C] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {section.title}
                  </button>
                  
                  <div className="ml-4 mt-1 space-y-1">
                    {section.subsections.map((subsection) => (
                      <button
                        key={subsection.id}
                        onClick={() => scrollToSection(subsection.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${
                          activeSection === subsection.id
                            ? 'bg-[#99334C]/10 text-[#99334C] font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {subsection.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* Info document */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Informations</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{courseDocument.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{courseDocument.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{courseDocument.rating} / 5</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>{courseDocument.downloads} téléchargements</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenu du document */}
        <main className="flex-1 p-6 lg:p-12" ref={contentRef}>
          <article 
            className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 lg:p-12"
            style={{ fontSize: `${fontSize}px` }}
          >
            {/* En-tête du document */}
            <header className="mb-12 pb-8 border-b border-gray-200">
              <span className="inline-block px-3 py-1 bg-[#99334C]/10 text-[#99334C] text-sm font-bold rounded-full mb-4">
                {courseDocument.category}
              </span>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {courseDocument.title}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {courseDocument.description}
              </p>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#99334C]/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-[#99334C]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{courseDocument.author}</p>
                    <p className="text-sm text-gray-600">{courseDocument.date}</p>
                  </div>
                </div>
              </div>

              {!isOwner && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Document en lecture seule</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Vous pouvez copier des parties de ce document pour les utiliser dans vos propres documents.
                    </p>
                  </div>
                </div>
              )}
            </header>

            {/* Contenu des sections */}
            <div className="prose prose-lg max-w-none">
              {documentContent.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  data-section={section.id}
                  className="mb-12 scroll-mt-24"
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    {section.title}
                  </h2>

                  {section.subsections.map((subsection) => (
                    <div
                      key={subsection.id}
                      id={subsection.id}
                      data-section={subsection.id}
                      className="mb-8 scroll-mt-24"
                    >
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        {subsection.title}
                      </h3>

                      {subsection.granules.map((granule) => (
                        <div
                          key={granule.id}
                          className={`relative group mb-4 p-4 rounded-lg transition-all ${
                            selectedGranules.includes(granule.id)
                              ? 'bg-[#99334C]/5 border-2 border-[#99334C]'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                        >
                          {/* Actions sur le granule */}
                          <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                              onClick={() => handleCopyGranule(granule.id, granule.content)}
                              className="p-2 bg-white border border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 transition-all"
                              title="Copier"
                            >
                              {copiedGranule === granule.id ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                            
                            {!isOwner && (
                              <button
                                onClick={() => toggleGranuleSelection(granule.id)}
                                className={`p-2 border rounded-lg shadow-lg transition-all ${
                                  selectedGranules.includes(granule.id)
                                    ? 'bg-[#99334C] text-white border-[#99334C]'
                                    : 'bg-white border-gray-300 hover:bg-gray-50'
                                }`}
                                title="Ajouter à mon document"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Contenu du granule */}
                          {granule.type === 'paragraph' && (
                            <p className="text-gray-700 leading-relaxed">
                              {granule.content}
                            </p>
                          )}

                          {granule.type === 'list' && (
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                              {granule.content.map((item, index) => (
                                <li key={index} className="leading-relaxed">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </section>
              ))}
            </div>

            {/* Footer du document */}
            <footer className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>© 2024 {courseDocument.author}. Tous droits réservés.</p>
                  <p className="mt-1">Dernière mise à jour : {courseDocument.date}</p>
                </div>
                
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-[#99334C] text-white rounded-lg hover:bg-[#7a283d] transition-all"
                >
                  <Download className="w-5 h-5" />
                  <span>Télécharger le document</span>
                </button>
              </div>
            </footer>
          </article>
        </main>
      </div>

      {/* Modal d'ajout à un document */}
      {showAddToDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Ajouter à un document
            </h3>
            <p className="text-gray-600 mb-6">
              Sélectionnez le document dans lequel vous souhaitez ajouter les {selectedGranules.length} granule(s) sélectionné(s).
            </p>
            
            {/* Liste de documents simulée */}
            <div className="space-y-2 mb-6">
              <button className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#99334C] hover:bg-[#99334C]/5 transition-all text-left">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#99334C]" />
                  <div>
                    <p className="font-medium text-gray-900">Mon cours de réseaux</p>
                    <p className="text-sm text-gray-500">Modifié il y a 2 jours</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#99334C] hover:bg-[#99334C]/5 transition-all text-left">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#99334C]" />
                  <div>
                    <p className="font-medium text-gray-900">Notes TCP/IP</p>
                    <p className="text-sm text-gray-500">Modifié il y a 1 semaine</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddToDoc(false);
                  setSelectedGranules([]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // TODO: Implémenter l'ajout
                  setShowAddToDoc(false);
                  setSelectedGranules([]);
                }}
                className="flex-1 px-4 py-2 bg-[#99334C] text-white rounded-lg hover:bg-[#7a283d] transition-all"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentReaderPage;