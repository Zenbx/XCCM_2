"use client";
import React, { useState, useEffect } from 'react';
import {
  Search, Filter, BookOpen, Download, Eye, Calendar, User, Tag, ChevronLeft, ChevronRight, Star, Clock, Bookmark, BookmarkCheck, TrendingUp, Grid3x3, List, Globe, Users, Loader2, AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { projectService, Project } from '@/services/projectService';

const LibraryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarkedCourses, setBookmarkedCourses] = useState<string[]>([]);
  const router = useRouter();

  // États pour les données dynamiques
  const [courses, setCourses] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublishedProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Cette nouvelle méthode doit être créée dans le service
        const publishedProjects = await projectService.getPublishedProjects();
        setCourses(publishedProjects);
      } catch (err: any) {
        setError(err.message || "Erreur lors de la récupération des cours.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublishedProjects();
  }, []);

  const categories = ["Tous", ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))];
  const coursesPerPage = 6;
  const totalPages = Math.ceil(courses.length / coursesPerPage);

  const handleViewCourse = (projectName: string) => {
    router.push(`/book-reader?projectName=${encodeURIComponent(projectName)}`);
  };

  // ... autres fonctions (toggleBookmark, handleDownloadCourse, getLevelColor)
  const toggleBookmark = (courseId: string) => {
    setBookmarkedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleDownloadCourse = (courseId: string) => {
    console.log('Télécharger le cours:', courseId);
    // TODO: Appel API pour télécharger
  };

  const getLevelColor = (level: string | undefined) => {
    switch (level) {
      case 'Débutant': return 'bg-green-100 text-green-700';
      case 'Intermédiaire': return 'bg-blue-100 text-blue-700';
      case 'Avancé': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };


  // Rendu de la page
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ... (Hero Section inchangée) */}
      
      {/* Barre de recherche et filtres */}
      <section className="py-8 px-6 bg-white border-b border-gray-200 shadow-sm">
          {/* ... (barre de recherche inchangée) */}
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
                <AlertCircle className="w-12 h-12 text-red-500 mb-4"/>
                <h3 className="text-xl font-bold text-red-800">Erreur de chargement</h3>
                <p className="text-red-600">{error}</p>
            </div>
          ) : courses.length === 0 ? (
             <div className="text-center h-64 flex flex-col justify-center items-center">
                <BookOpen className="w-12 h-12 text-gray-400 mb-4"/>
                <h3 className="text-xl font-bold text-gray-700">Aucun cours publié</h3>
                <p className="text-gray-500">Revenez bientôt pour de nouveaux contenus !</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courses.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage).map((course) => (
                    <div key={course.pr_id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 group">
                      <div className="relative h-48 bg-gradient-to-br from-[#99334C]/20 to-[#99334C]/40 overflow-hidden">
                         <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-[#99334C] opacity-50" />
                        </div>
                        <div className="absolute inset-0 bg-[#99334C]/90 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                          <button onClick={() => handleViewCourse(course.pr_name)} className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all" title="Voir le cours">
                            <Eye className="w-6 h-6 text-white" />
                          </button>
                        </div>
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getLevelColor(course.level)}`}>
                            {course.level || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <span className="inline-block px-3 py-1 bg-[#99334C]/10 text-[#99334C] text-xs font-bold rounded-full mb-3">
                          {course.category || 'Non classé'}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#99334C] transition-colors">
                          {course.pr_name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {course.description || 'Aucune description disponible.'}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#99334C]/10 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-[#99334C]" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{course.author || 'Auteur inconnu'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(course.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>LIST VIEW</div>
              )}
              {/* ... (Pagination) */}
            </>)}
        </div>
      </section>
      {/* ... (Section Tendances) */}
    </div>
  );
};

export default LibraryPage;
