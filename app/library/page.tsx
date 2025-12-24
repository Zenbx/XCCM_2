"use client";
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  Tag,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  Grid3x3,
  List
} from 'lucide-react';

const LibraryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarkedCourses, setBookmarkedCourses] = useState([]);

  // Données mockées - à remplacer par l'API
  const courses = [
    {
      id: 1,
      title: "Introduction au Réseaux Informatiques",
      description: "Découvrez les fondamentaux des réseaux, protocoles TCP/IP, architecture client-serveur et bien plus encore.",
      author: "Dr. Jean Martin",
      authorAvatar: null,
      date: "15 Déc 2024",
      category: "Informatique",
      tags: ["Réseaux", "TCP/IP", "Informatique"],
      image: null,
      views: 1250,
      downloads: 340,
      rating: 4.8,
      level: "Débutant",
      duration: "12h"
    },
    {
      id: 2,
      title: "Programmation Python Avancée",
      description: "Maîtrisez les concepts avancés de Python : POO, décorateurs, métaprogrammation et optimisation.",
      author: "Marie Dubois",
      authorAvatar: null,
      date: "20 Déc 2024",
      category: "Programmation",
      tags: ["Python", "POO", "Développement"],
      image: null,
      views: 2100,
      downloads: 580,
      rating: 4.9,
      level: "Avancé",
      duration: "20h"
    },
    {
      id: 3,
      title: "Design UX/UI Moderne",
      description: "Apprenez à créer des interfaces utilisateur intuitives et esthétiques avec les dernières tendances.",
      author: "Sophie Laurent",
      authorAvatar: null,
      date: "10 Déc 2024",
      category: "Design",
      tags: ["UX", "UI", "Design"],
      image: null,
      views: 890,
      downloads: 245,
      rating: 4.7,
      level: "Intermédiaire",
      duration: "15h"
    },
    {
      id: 4,
      title: "Marketing Digital et SEO",
      description: "Stratégies efficaces pour améliorer votre présence en ligne et optimiser votre référencement.",
      author: "Thomas Petit",
      authorAvatar: null,
      date: "18 Déc 2024",
      category: "Marketing",
      tags: ["SEO", "Marketing", "Digital"],
      image: null,
      views: 1540,
      downloads: 420,
      rating: 4.6,
      level: "Intermédiaire",
      duration: "10h"
    },
    {
      id: 5,
      title: "Intelligence Artificielle et Machine Learning",
      description: "Explorez les algorithmes d'apprentissage automatique et leurs applications pratiques.",
      author: "Dr. Jean Martin",
      authorAvatar: null,
      date: "22 Déc 2024",
      category: "IA",
      tags: ["IA", "ML", "Data Science"],
      image: null,
      views: 3200,
      downloads: 890,
      rating: 5.0,
      level: "Avancé",
      duration: "25h"
    },
    {
      id: 6,
      title: "Gestion de Projet Agile",
      description: "Méthodes agiles, Scrum, Kanban et outils pour gérer efficacement vos projets.",
      author: "Marie Dubois",
      authorAvatar: null,
      date: "14 Déc 2024",
      category: "Management",
      tags: ["Agile", "Scrum", "Gestion"],
      image: null,
      views: 1670,
      downloads: 510,
      rating: 4.7,
      level: "Intermédiaire",
      duration: "8h"
    },
    {
      id: 7,
      title: "Cybersécurité : Fondamentaux",
      description: "Protégez vos systèmes contre les menaces modernes avec les meilleures pratiques de sécurité.",
      author: "Thomas Petit",
      authorAvatar: null,
      date: "16 Déc 2024",
      category: "Sécurité",
      tags: ["Sécurité", "Cybersécurité", "Protection"],
      image: null,
      views: 2450,
      downloads: 720,
      rating: 4.9,
      level: "Intermédiaire",
      duration: "18h"
    },
    {
      id: 8,
      title: "Développement Web Full Stack",
      description: "Créez des applications web complètes avec React, Node.js, et MongoDB.",
      author: "Sophie Laurent",
      authorAvatar: null,
      date: "12 Déc 2024",
      category: "Développement",
      tags: ["Web", "React", "Node.js"],
      image: null,
      views: 2890,
      downloads: 650,
      rating: 4.8,
      level: "Avancé",
      duration: "30h"
    },
    {
      id: 9,
      title: "Analyse de Données avec Excel",
      description: "Maîtrisez les tableaux croisés dynamiques, formules avancées et visualisations.",
      author: "Dr. Jean Martin",
      authorAvatar: null,
      date: "19 Déc 2024",
      category: "Bureautique",
      tags: ["Excel", "Analyse", "Données"],
      image: null,
      views: 1120,
      downloads: 380,
      rating: 4.5,
      level: "Débutant",
      duration: "6h"
    }
  ];

  const categories = [
    "Tous",
    "Informatique",
    "Programmation",
    "Design",
    "Marketing",
    "IA",
    "Management",
    "Sécurité",
    "Développement",
    "Bureautique"
  ];

  const coursesPerPage = 6;
  const totalPages = Math.ceil(courses.length / coursesPerPage);

  const toggleBookmark = (courseId) => {
    setBookmarkedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleViewCourse = (courseId) => {
    console.log('Voir le cours:', courseId);
    // TODO: Navigation vers la page du cours
  };

  const handleDownloadCourse = (courseId) => {
    console.log('Télécharger le cours:', courseId);
    // TODO: Appel API pour télécharger
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'Débutant': return 'bg-green-100 text-green-700';
      case 'Intermédiaire': return 'bg-blue-100 text-blue-700';
      case 'Avancé': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#99334C] to-[#7a283d] text-white overflow-hidden py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-semibold">Bibliothèque</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Consultez et exploitez des milliers de<br />documents gratuitement
          </h1>
          
          <p className="text-lg text-white/90 max-w-3xl mx-auto mb-8">
            Notre plateforme vous propose un catalogue riche, organisé et pratique. 
            Trouvez le contenu pédagogique parfait pour vos besoins.
          </p>

          {/* Statistiques */}
          <div className="flex flex-wrap justify-center gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">{courses.length}+</p>
              <p className="text-white/80 text-sm">Cours disponibles</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">50K+</p>
              <p className="text-white/80 text-sm">Téléchargements</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">4.8★</p>
              <p className="text-white/80 text-sm">Note moyenne</p>
            </div>
          </div>
        </div>
      </section>

      {/* Barre de recherche et filtres */}
      <section className="py-8 px-6 bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Recherche */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un cours, un auteur, un sujet..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
              />
            </div>

            {/* Filtres et vue */}
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="hidden sm:inline font-medium text-gray-700">Filtrer</span>
              </button>

              <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-all ${viewMode === 'grid' ? 'bg-[#99334C] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-all ${viewMode === 'list' ? 'bg-[#99334C] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Catégories */}
          <div className="flex gap-2 overflow-x-auto mt-6 pb-2">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category.toLowerCase())}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.toLowerCase()
                    ? 'bg-[#99334C] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grille de cours */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 group">
                  {/* Image du cours */}
                  <div className="relative h-48 bg-gradient-to-br from-[#99334C]/20 to-[#99334C]/40 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-[#99334C] opacity-50" />
                    </div>
                    
                    {/* Overlay avec actions au hover */}
                    <div className="absolute inset-0 bg-[#99334C]/90 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleViewCourse(course.id)}
                        className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
                        title="Voir le cours"
                      >
                        <Eye className="w-6 h-6 text-white" />
                      </button>
                      <button
                        onClick={() => handleDownloadCourse(course.id)}
                        className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
                        title="Télécharger"
                      >
                        <Download className="w-6 h-6 text-white" />
                      </button>
                    </div>

                    {/* Badge niveau */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getLevelColor(course.level)}`}>
                        {course.level}
                      </span>
                    </div>

                    {/* Bookmark */}
                    <button
                      onClick={() => toggleBookmark(course.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all"
                    >
                      {bookmarkedCourses.includes(course.id) ? (
                        <BookmarkCheck className="w-5 h-5 text-[#99334C]" />
                      ) : (
                        <Bookmark className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>

                  {/* Contenu de la carte */}
                  <div className="p-6">
                    {/* Catégorie */}
                    <span className="inline-block px-3 py-1 bg-[#99334C]/10 text-[#99334C] text-xs font-bold rounded-full mb-3">
                      {course.category}
                    </span>

                    {/* Titre */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#99334C] transition-colors">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Métadonnées */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{course.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{course.downloads}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{course.rating}</span>
                    </div>

                    {/* Auteur et date */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#99334C]/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-[#99334C]" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{course.author}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{course.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Vue Liste */
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 group">
                  <div className="flex gap-6">
                    {/* Image miniature */}
                    <div className="relative w-48 h-32 bg-gradient-to-br from-[#99334C]/20 to-[#99334C]/40 rounded-xl overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-[#99334C] opacity-50" />
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getLevelColor(course.level)}`}>
                          {course.level}
                        </span>
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="inline-block px-3 py-1 bg-[#99334C]/10 text-[#99334C] text-xs font-bold rounded-full mb-2">
                            {course.category}
                          </span>
                          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#99334C] transition-colors">
                            {course.title}
                          </h3>
                        </div>
                        <button
                          onClick={() => toggleBookmark(course.id)}
                          className="p-2 hover:bg-gray-50 rounded-lg transition-all"
                        >
                          {bookmarkedCourses.includes(course.id) ? (
                            <BookmarkCheck className="w-6 h-6 text-[#99334C]" />
                          ) : (
                            <Bookmark className="w-6 h-6 text-gray-400" />
                          )}
                        </button>
                      </div>

                      <p className="text-gray-600 mb-4">
                        {course.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {course.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{course.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{course.views} vues</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{course.rating}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewCourse(course.id)}
                            className="px-4 py-2 bg-[#99334C] text-white rounded-lg hover:bg-[#7a283d] transition-all flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Voir</span>
                          </button>
                          <button
                            onClick={() => handleDownloadCourse(course.id)}
                            className="px-4 py-2 border-2 border-[#99334C] text-[#99334C] rounded-lg hover:bg-[#99334C]/10 transition-all flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            <span>Télécharger</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                  currentPage === index + 1
                    ? 'bg-[#99334C] text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Section Tendances */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Cours populaires</h2>
              <p className="text-gray-600">Les plus consultés cette semaine</p>
            </div>
            <TrendingUp className="w-8 h-8 text-[#99334C]" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course, index) => (
              <div key={course.id} className="bg-white rounded-xl p-6 shadow-lg border-2 border-[#99334C]/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#99334C] text-white rounded-full flex items-center justify-center font-bold text-xl">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500">{course.author}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {course.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {course.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LibraryPage;