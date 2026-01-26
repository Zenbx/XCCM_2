"use client";

import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  Building2,
  Calendar,
  BookOpen,
  Eye,
  TrendingUp,
  Award,
  Loader2,
  AlertCircle,
  Heart,
  FileText,
  Trash2,
  ExternalLink,
  Settings
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { documentService } from '@/services/documentService';
import toast from 'react-hot-toast';

const PublicProfilePage = () => {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'publications'>('projects');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { user: authUser } = useAuth();
  const isOwner = authUser?.user_id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
        const data = await response.json();

        if (data.success) {
          setProfile(data.data);
        } else {
          setError(data.message || 'Impossible de charger le profil');
        }
      } catch (err) {
        console.error("Erreur loading profile:", err);
        setError('Erreur lors du chargement du profil');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#99334C] animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profil introuvable</h1>
        <p className="text-gray-600 mb-6">{error || "Cet utilisateur n'existe pas ou le profil est privé."}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] transition-colors"
        >
          Retour
        </button>
      </div>
    );
  }

  const { user: profileUser, stats, projects } = profile;

  // Flatten documents from all projects for the publications tab
  const allDocuments = projects.flatMap((p: any) =>
    (p.documents || []).map((d: any) => ({
      ...d,
      project_name: p.pr_name,
      category: p.category
    }))
  ).sort((a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  const handleDeletePublication = async (docId: string, docName: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la publication "${docName}" ? Cette action est irréversible.`)) {
      return;
    }

    setIsDeleting(docId);
    try {
      await documentService.deleteDocument(docId);
      toast.success("Publication supprimée");

      // Refresh profile data
      const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
      const data = await response.json();
      if (data.success) setProfile(data.data);

    } catch (err) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Premium Profile Header */}
        <div className="relative mb-12">
          {/* Background decoration */}
          <div className="absolute inset-0 h-48 md:h-64 bg-gradient-to-r from-[#99334C] via-[#7a283d] to-[#4a1825] rounded-3xl shadow-lg transform md:-skew-y-1"></div>

          <div className="relative pt-12 md:pt-20 px-4 sm:px-12">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
                {/* Avatar with Ring */}
                <div className="relative -mt-16 md:-mt-20">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-2 bg-white shadow-2xl ring-4 ring-[#99334C]/10">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 relative">
                      {profileUser.profile_picture ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${profileUser.profile_picture}`}
                          alt={`${profileUser.firstname} ${profileUser.lastname}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-5xl font-bold text-gray-400">
                          {profileUser.firstname?.[0]}{profileUser.lastname?.[0]}
                        </div>
                      )}
                    </div>
                  </div>
                  {profileUser.org && (
                    <div className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg border border-gray-100" title={profileUser.org}>
                      <Building2 className="w-5 h-5 text-[#99334C]" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 pt-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex flex-col items-center md:items-start">
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{profileUser.firstname} {profileUser.lastname}</h1>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-600">
                        {profileUser.occupation && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                            <Briefcase className="w-4 h-4" />
                            {profileUser.occupation}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Membre depuis {new Date(profileUser.memberSince).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards (Glassmorphism) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mt-8">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-100 flex flex-col items-center justify-center transition-transform hover:scale-105">
                      <span className="text-2xl md:text-3xl font-bold text-blue-900">{stats.totalProjects}</span>
                      <span className="text-xs md:text-sm font-medium text-blue-700 mt-1 flex items-center gap-1">
                        <BookOpen className="w-4 h-4" /> Projets
                      </span>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-100 flex flex-col items-center justify-center transition-transform hover:scale-105">
                      <span className="text-2xl md:text-3xl font-bold text-green-900">{stats.totalViews}</span>
                      <span className="text-xs md:text-sm font-medium text-green-700 mt-1 flex items-center gap-1">
                        <Eye className="w-4 h-4" /> Vues
                      </span>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-2xl border border-pink-100 flex flex-col items-center justify-center transition-transform hover:scale-105 col-span-2 sm:col-span-1">
                      <span className="text-2xl md:text-3xl font-bold text-pink-900">{stats.totalLikes}</span>
                      <span className="text-xs md:text-sm font-medium text-pink-700 mt-1 flex items-center gap-1">
                        <Heart className="w-4 h-4" /> J'aime
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 p-1 bg-gray-100 w-fit rounded-xl">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-2.5 rounded-lg font-bold transition-all ${activeTab === 'projects' ? 'bg-white text-[#99334C] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Projets d'édition
          </button>
          <button
            onClick={() => setActiveTab('publications')}
            className={`px-6 py-2.5 rounded-lg font-bold transition-all ${activeTab === 'publications' ? 'bg-white text-[#99334C] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Documents publiés
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'projects' ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#99334C]" />
                Mes cours ({projects.length})
              </h2>

              {projects.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
                  <p className="text-gray-500">Aucun projet en cours d'édition.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {projects.map((project: any) => (
                    <div key={project.pr_id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300">
                      <div className="h-2 bg-gradient-to-r from-[#99334C] to-[#7a283d]"></div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <span className="inline-block px-3 py-1 bg-[#99334C]/5 text-[#99334C] text-xs font-bold rounded-full tracking-wide uppercase">
                            {project.category || 'Général'}
                          </span>
                          {project.is_published && (
                            <div className="bg-green-100 text-green-700 p-1 rounded-full" title="Publié"><Eye className="w-3 h-3" /></div>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#99334C] transition-colors line-clamp-1">
                          <Link href={isOwner ? `/edit?projectName=${encodeURIComponent(project.pr_name)}` : `/book-reader?docId=${project.documents?.[0]?.doc_id || ''}`} className="focus:outline-none">
                            <span className="absolute inset-0 z-0"></span>
                            {project.pr_name}
                          </Link>
                        </h3>

                        <p className="text-gray-600 text-sm mb-6 line-clamp-2 h-10">
                          {project.description || 'Aucune description disponible pour ce projet.'}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-sm">
                          <div className="flex items-center gap-4 text-gray-500">
                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                              <Eye className="w-4 h-4" />
                              <span className="font-semibold">{project.views || 0}</span>
                            </span>
                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                              <Heart className="w-4 h-4 text-pink-500" />
                              <span className="font-semibold">{project.likes || 0}</span>
                            </span>
                          </div>
                          <span className="text-gray-400 text-xs font-medium">
                            {new Date(project.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-[#99334C]" />
                  Publications ({allDocuments.length})
                </h2>
              </div>

              {allDocuments.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucune publication</h3>
                  <p className="text-gray-500 max-w-xs mx-auto">Vous n'avez pas encore publié de documents à partir de vos projets.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allDocuments.map((doc: any) => (
                    <div key={doc.doc_id} className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4 md:items-center">
                      {/* Thumbnail/Icon */}
                      <div className="w-12 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border border-gray-100 shrink-0">
                        <FileText className="w-6 h-6 text-[#99334C]/40" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 truncate">{doc.doc_name}</h3>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase tracking-wider">
                            {doc.format || 'pdf'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {doc.project_name}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(doc.published_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1 font-medium text-[#99334C]/60 italic">{doc.category || 'Général'}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 px-4 md:border-x border-gray-50">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-gray-900">{doc.consult || 0}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-medium">Vues</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-gray-900">{doc.downloaded || 0}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-medium">Dl</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/book-reader?docId=${doc.doc_id}`}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="Voir dans la bibliothèque"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </Link>
                        {isOwner && (
                          <button
                            disabled={isDeleting === doc.doc_id}
                            onClick={() => handleDeletePublication(doc.doc_id, doc.doc_name)}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors disabled:opacity-50"
                            title="Supprimer la publication"
                          >
                            {isDeleting === doc.doc_id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default PublicProfilePage;
