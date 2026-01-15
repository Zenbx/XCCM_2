"use client";
import React, { useState, useEffect } from 'react';
import {
  Search, Filter, BookOpen, Download, Eye, Calendar, User, Tag, ChevronLeft, ChevronRight, Star, Clock, Bookmark, BookmarkCheck, TrendingUp, Grid3x3, List, Globe, Users, Loader2, AlertCircle, FileText, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { documentService } from '@/services/documentService';

const LibraryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarkedCourses, setBookmarkedCourses] = useState<string[]>([]);
  const router = useRouter();

  // States pour les donnees dynamiques
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublishedDocuments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const documents = await documentService.getPublishedDocuments();
        setCourses(documents);
      } catch (err: any) {
        setError(err.message || "Erreur lors de la recuperation des documents.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublishedDocuments();
  }, []);

  // Filtrer les cours par categorie et recherche
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.doc_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))];
  const coursesPerPage = 6;
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

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

      // Appeler l'API pour obtenir l'URL et incrementer le compteur
      const { url, doc_name } = await documentService.downloadDocument(docId);

      // Telecharger le fichier
      const link = document.createElement('a');
      link.href = url;
      link.download = doc_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Toast de succes
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-bottom';
      toast.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> Telechargement lance !';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);

    } catch (err) {
      console.error('Erreur telechargement:', err);
      alert('Erreur lors du telechargement: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
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

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-16 px-6 bg-gradient-to-br from-[#99334C] to-[#7a283d] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Bibliotheque</h1>
              <p className="text-white/80">Explorez nos cours publies</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>{courses.length} documents</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span>Acces gratuit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Barre de recherche et filtres */}
      <section className="py-6 px-6 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Recherche */}
            <div className="relative flex-1 max-w-xl w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un cours, un auteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
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

            {/* Filtres */}
            <div className="flex items-center gap-4">
              {/* Categories */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#99334C] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat === 'all' ? 'Tous' : cat}
                  </button>
                ))}
              </div>

              {/* Vue */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grille de cours */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
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
              <h3 className="text-xl font-bold text-gray-700">Aucun cours trouve</h3>
              <p className="text-gray-500">
                {searchQuery ? 'Essayez avec d\'autres mots-cles' : 'Revenez bientot pour de nouveaux contenus !'}
              </p>
            </div>
          ) : (
            <>
              {/* Resultats */}
              <div className="mb-6 text-sm text-gray-600">
                {filteredCourses.length} resultat{filteredCourses.length > 1 ? 's' : ''}
              </div>

              {viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCourses.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage).map((course) => (
                    <div key={course.doc_id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 group">
                      {/* Image/Header */}
                      <div className="relative h-48 bg-gradient-to-br from-[#99334C]/20 to-[#99334C]/40 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-[#99334C] opacity-50" />
                        </div>
                        {/* Hover overlay avec boutons */}
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
                            title="Telecharger"
                          >
                            {downloadingId === course.doc_id ? (
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            ) : (
                              <Download className="w-6 h-6 text-white" />
                            )}
                          </button>
                        </div>
                        {/* Badge niveau */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getLevelColor(course.level)}`}>
                            {course.level || 'N/A'}
                          </span>
                        </div>
                        {/* Bookmark */}
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

                      {/* Content */}
                      <div className="p-6">
                        <span className="inline-block px-3 py-1 bg-[#99334C]/10 text-[#99334C] text-xs font-bold rounded-full mb-3">
                          {course.category || 'Non classe'}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#99334C] transition-colors">
                          {course.doc_name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {course.description || 'Aucune description disponible.'}
                        </p>

                        {/* Stats */}
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

                        {/* Footer */}
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
                /* Liste View */
                <div className="space-y-4">
                  {filteredCourses.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage).map((course) => (
                    <div key={course.doc_id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 p-6 flex gap-6">
                      {/* Thumbnail */}
                      <div className="w-32 h-32 bg-gradient-to-br from-[#99334C]/20 to-[#99334C]/40 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-10 h-10 text-[#99334C] opacity-60" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 bg-[#99334C]/10 text-[#99334C] text-xs font-bold rounded-full">
                                {course.category || 'Non classe'}
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

                          {/* Actions */}
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
                              title="Telecharger"
                            >
                              {downloadingId === course.doc_id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Download className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Meta */}
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
                            {course.downloaded || 0} telechargements
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'bg-[#99334C] text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
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
