"use client";
import React, { useState, useEffect } from 'react';
import {
  Search, Filter, BookOpen, Download, Eye, Calendar, User, Tag, ChevronLeft, ChevronRight, Star, Clock, Bookmark, BookmarkCheck, TrendingUp, Grid3x3, List, Globe, Users, Loader2, AlertCircle, FileText, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { documentService } from '@/services/documentService';

import toast from 'react-hot-toast';
import { useInView } from 'react-intersection-observer';

const LibraryPage = () => {
  const { ref, inView } = useInView();
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // States restaurés
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [bookmarkedCourses, setBookmarkedCourses] = useState<string[]>([]);
  const router = useRouter();

  // States pour les données dynamiques
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (page === 1) setIsLoading(true);
      setError(null);
      try {
        const { documents, hasMore: moreAvailable } = await documentService.getPublishedDocuments(page, 20);

        setCourses(prev => page === 1 ? documents : [...prev, documents]);
        setHasMore(moreAvailable);
      } catch (err: any) {
        setError(err.message || "Erreur lors de la recuperation des documents.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [page]);

  // Infinite scroll trigger
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [inView, hasMore, isLoading]);

  // Liste prédéfinie de catégories pour le filtrage
  const PREDEFINED_CATEGORIES = [
    "Général", "Informatique", "Mathématiques", "Physique", "Linguistique",
    "Sciences", "Histoire", "Économie", "Droit"
  ];

  // Filtrage local (pour la recherche instantanée sur les éléments chargés)
  // Note: Idéalement, la recherche devrait aussi être faite côté serveur
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.doc_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.author?.toLowerCase().includes(searchQuery.toLowerCase());

    const courseCategory = course.category || 'Général';
    const matchesCategory = selectedCategory === 'all' || courseCategory === selectedCategory;
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const dynamicCategories = Array.from(new Set(courses.map(c => c.category).filter(Boolean))) as string[];
  const categories = ["all", ...Array.from(new Set([...PREDEFINED_CATEGORIES, ...dynamicCategories]))];

  const handleViewCourse = (docId: string) => {
    router.push(`/book-reader?docId=${encodeURIComponent(docId)}`);
  };

  const toggleBookmark = (courseId: string) => {
    setBookmarkedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleDownloadCourse = async (docId: string) => {
    try {
      setDownloadingId(docId);
      const { url, doc_name } = await documentService.downloadDocument(docId);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Échec du téléchargement du fichier source');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = doc_name.endsWith('.pdf') || doc_name.endsWith('.docx') ? doc_name : `${doc_name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Téléchargement terminé !');

    } catch (err) {
      console.error('Erreur telechargement:', err);
      toast.error('Erreur lors du téléchargement: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
    } finally {
      setDownloadingId(null);
    }
  };

  const getLevelColor = (level: string | undefined) => {
    switch (level) {
      case 'Debutant': return 'bg-green-100 text-green-700';
      case 'Intermediaire': return 'bg-blue-100 text-blue-700';
      case 'Avance': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#99334C] to-[#7a283d] text-white overflow-hidden py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Bibliothèque Universitaire
          </h1>
          <div className="flex justify-center mb-8">
            <div className="h-1 w-32 bg-white/50 rounded-full relative">
              <div className="absolute inset-0 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Explorez notre collection de cours, exercices et ressources pédagogiques.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm mt-8 text-white/80">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <FileText className="w-5 h-5" />
              <span>{courses.length} documents chargés</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Globe className="w-5 h-5" />
              <span>Accès gratuit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Barre de recherche et filtres */}
      <section className="py-6 px-6 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-xl w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un cours, un auteur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all cursor-pointer hover:bg-gray-100"
                >
                  <option value="all">Tous les niveaux</option>
                  <option value="Debutant">Débutant</option>
                  <option value="Intermediaire">Intermédiaire</option>
                  <option value="Avance">Avancé</option>
                </select>

                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 h-[46px]">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all h-full ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#99334C]' : 'text-gray-500'}`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all h-full ${viewMode === 'list' ? 'bg-white shadow-sm text-[#99334C]' : 'text-gray-500'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="font-bold text-gray-700">Filtrer par catégories</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === cat
                      ? 'bg-[#99334C] text-white border-[#99334C] shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#99334C]/30 hover:bg-[#99334C]/5'
                      }`}
                  >
                    {cat === 'all' ? 'Toutes les catégories' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grille de cours */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {isLoading && courses.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-12 h-12 text-[#99334C] animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-red-800">Erreur de chargement</h3>
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center h-64 flex flex-col justify-center items-center">
              <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-700">Aucun cours trouvé</h3>
              <p className="text-gray-500">
                {searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Revenez bientôt pour de nouveaux contenus !'}
              </p>
            </div>
          ) : (
            <>
              {/* Résultats */}
              <div className="mb-6 text-sm text-gray-600">
                {filteredCourses.length} résultat{filteredCourses.length > 1 ? 's' : ''} (Total chargé: {courses.length})
              </div>

              {viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCourses.map((course) => (
                    <div key={course.doc_id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 group">
                      <div className="relative h-48 bg-gradient-to-br from-[#99334C]/20 to-[#99334C]/40 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-[#99334C] opacity-50" />
                        </div>
                        <div className="absolute inset-0 bg-[#99334C]/90 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                          <button
                            onClick={() => handleViewCourse(course.doc_id)}
                            className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
                            title="Lire le cours"
                          >
                            <Eye className="w-6 h-6 text-white" />
                          </button>
                          <button
                            onClick={() => handleDownloadCourse(course.doc_id)}
                            disabled={downloadingId === course.doc_id}
                            className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all disabled:opacity-50"
                            title="Télécharger"
                          >
                            {downloadingId === course.doc_id ? (
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            ) : (
                              <Download className="w-6 h-6 text-white" />
                            )}
                          </button>
                        </div>
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getLevelColor(course.level)}`}>
                            {course.level || 'N/A'}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleBookmark(course.doc_id)}
                          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-all"
                        >
                          {bookmarkedCourses.includes(course.doc_id) ? (
                            <BookmarkCheck className="w-4 h-4 text-[#99334C]" />
                          ) : (
                            <Bookmark className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>

                      <div className="p-6">
                        <span className="inline-block px-3 py-1 bg-[#99334C]/10 text-[#99334C] text-xs font-bold rounded-full mb-3">
                          {course.category || 'Non classé'}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#99334C] transition-colors">
                          {course.doc_name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {course.description || 'Aucune description disponible.'}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {course.pages || '?'} pages
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {course.downloaded || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {course.consult || 0}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#99334C]/10 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-[#99334C]" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{course.author || 'Auteur inconnu'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(course.published_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-4">
                  {filteredCourses.map((course) => (
                    <div key={course.doc_id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 p-6 flex gap-6">
                      <div className="w-32 h-32 bg-gradient-to-br from-[#99334C]/20 to-[#99334C]/40 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-10 h-10 text-[#99334C] opacity-60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 bg-[#99334C]/10 text-[#99334C] text-xs font-bold rounded-full">
                                {course.category || 'Non classé'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getLevelColor(course.level)}`}>
                                {course.level || 'N/A'}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-[#99334C] transition-colors">
                              {course.doc_name}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {course.description || 'Aucune description disponible.'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleViewCourse(course.doc_id)}
                              className="px-4 py-2 bg-[#99334C] text-white rounded-lg hover:bg-[#7a283d] transition-all flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Lire
                            </button>
                            <button
                              onClick={() => handleDownloadCourse(course.doc_id)}
                              disabled={downloadingId === course.doc_id}
                              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                              title="Télécharger"
                            >
                              {downloadingId === course.doc_id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Download className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {course.author || 'Auteur inconnu'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(course.published_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {course.pages || '?'} pages
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {course.downloaded || 0} téléchargements
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Infinite Scroll Trigger & Loader */}
              {hasMore && (
                <div ref={ref} className="flex justify-center items-center py-8">
                  {isLoading && <Loader2 className="w-8 h-8 text-[#99334C] animate-spin" />}
                </div>
              )}

              {!hasMore && courses.length > 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Vous avez atteint la fin de la bibliothèque.
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default LibraryPage;
