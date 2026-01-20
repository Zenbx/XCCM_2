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
  Heart
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const PublicProfilePage = () => {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`);
        const data = await response.json();

        if (data.success) {
          setProfile(data.data);
        } else {
          setError(data.message || 'Impossible de charger le profil');
        }
      } catch (err) {
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

  const { user, stats, projects } = profile;

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
                      {user.profile_picture ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${user.profile_picture}`}
                          alt={`${user.firstname} ${user.lastname}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-5xl font-bold text-gray-400">
                          {user.firstname?.[0]}{user.lastname?.[0]}
                        </div>
                      )}
                    </div>
                  </div>
                  {user.org && (
                    <div className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg border border-gray-100" title={user.org}>
                      <Building2 className="w-5 h-5 text-[#99334C]" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 pt-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex flex-col items-center md:items-start">
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{user.firstname} {user.lastname}</h1>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-600">
                        {user.occupation && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                            <Briefcase className="w-4 h-4" />
                            {user.occupation}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Membre depuis {new Date(user.memberSince).toLocaleDateString()}</span>
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

        {/* Public Projects */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#99334C]" />
            Cours publiés
          </h2>

          {projects.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
              <p className="text-gray-500">Cet utilisateur n'a pas encore publié de cours.</p>
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
                        <div className="bg-green-100 text-green-700 p-1 rounded-full"><Eye className="w-3 h-3" /></div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#99334C] transition-colors line-clamp-1">
                      <Link href={`/book-reader?docId=${project.documents?.[0]?.doc_id || ''}`} className="focus:outline-none">
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
                          <span className="font-semibold">{project.views}</span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                          <Heart className="w-4 h-4 text-pink-500" />
                          <span className="font-semibold">{project.likes}</span>
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs font-medium">
                        Mis à jour le {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PublicProfilePage;
