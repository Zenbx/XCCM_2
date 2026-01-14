"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Briefcase,
  Building2,
  Calendar,
  BookOpen,
  Download,
  Eye,
  Star,
  MapPin,
  Award,
  TrendingUp,
  Users,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  occupation: string;
  org: string;
  bio?: string;
  location?: string;
  website?: string;
  created_at: string;
}

interface Course {
  id: number;
  project_name: string;
  description: string;
  views: number;
  downloads: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

const ProfilePage = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'courses' | 'about'>('courses');

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError('');

      // TODO: Remplacer par l'API réelle
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`);
      // const data = await response.json();

      // Données mockées pour la démo
      const mockProfile: UserProfile = {
        id: parseInt(userId),
        firstname: "Jean",
        lastname: "Dupont",
        email: "jean.dupont@example.com",
        occupation: "Enseignant",
        org: "Université de Douala",
        bio: "Passionné d'éducation numérique et de pédagogie innovante. Je crée des cours interactifs pour rendre l'apprentissage plus accessible et engageant.",
        location: "Douala, Cameroun",
        website: "https://jeandupont.com",
        created_at: "2024-06-15T10:00:00Z"
      };

      const mockCourses: Course[] = [
        {
          id: 1,
          project_name: "Introduction à Python",
          description: "Cours complet pour débutants en programmation Python",
          views: 2450,
          downloads: 680,
          rating: 4.8,
          created_at: "2024-09-10T10:00:00Z",
          updated_at: "2025-01-05T14:30:00Z"
        },
        {
          id: 2,
          project_name: "Bases de données relationnelles",
          description: "Maîtriser SQL et la conception de bases de données",
          views: 1890,
          downloads: 520,
          rating: 4.6,
          created_at: "2024-10-20T10:00:00Z",
          updated_at: "2024-12-15T16:45:00Z"
        },
        {
          id: 3,
          project_name: "Design UX/UI moderne",
          description: "Principes et pratiques du design d'interface utilisateur",
          views: 3200,
          downloads: 890,
          rating: 4.9,
          created_at: "2024-11-05T10:00:00Z",
          updated_at: "2026-01-10T11:20:00Z"
        }
      ];

      setProfile(mockProfile);
      setCourses(mockCourses);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement du profil");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#99334C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profil introuvable</h2>
          <p className="text-gray-600 mb-6">
            Le profil demandé n'existe pas ou a été supprimé.
          </p>
          <button
            onClick={() => router.push('/library')}
            className="bg-[#99334C] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#7a283d] transition-all"
          >
            Retour à la bibliothèque
          </button>
        </div>
      </div>
    );
  }

  const stats = {
    coursesPublished: courses.length,
    totalViews: courses.reduce((sum, course) => sum + course.views, 0),
    totalDownloads: courses.reduce((sum, course) => sum + course.downloads, 0),
    avgRating: courses.length > 0
      ? (courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1)
      : "N/A"
  };

  const memberSince = new Date(profile.created_at).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Profile */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-48 bg-gradient-to-r from-[#99334C] to-[#7a283d] relative">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
                backgroundSize: '40px 40px'
              }} />
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-16 relative">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center text-4xl font-bold text-[#99334C] border-4 border-white">
                  {profile.firstname[0]}{profile.lastname[0]}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 mt-16 md:mt-0 md:pt-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {profile.firstname} {profile.lastname}
                </h1>

                <div className="flex flex-wrap gap-4 mb-4">
                  {profile.occupation && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-5 h-5" />
                      <span>{profile.occupation}</span>
                    </div>
                  )}
                  {profile.org && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-5 h-5" />
                      <span>{profile.org}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                  <Calendar className="w-4 h-4" />
                  <span>Membre depuis {memberSince}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button className="bg-[#99334C] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#7a283d] transition-all flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Contacter
                  </button>
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-2 border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Site web
                    </a>
                  )}
                </div>
              </div>

              {/* Stats Cards - Desktop */}
              <div className="hidden lg:flex flex-col gap-3">
                <div className="bg-gradient-to-br from-[#99334C]/10 to-[#99334C]/5 rounded-xl p-4 text-center min-w-[140px]">
                  <p className="text-3xl font-bold text-[#99334C] mb-1">{stats.coursesPublished}</p>
                  <p className="text-sm text-gray-600">Cours publiés</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center min-w-[140px]">
                  <p className="text-3xl font-bold text-blue-600 mb-1">{stats.totalViews.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Vues totales</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 lg:hidden">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center">
            <BookOpen className="w-6 h-6 text-[#99334C] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#99334C] mb-1">{stats.coursesPublished}</p>
            <p className="text-xs text-gray-600">Cours</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center">
            <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600 mb-1">{stats.totalViews.toLocaleString()}</p>
            <p className="text-xs text-gray-600">Vues</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center">
            <Download className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600 mb-1">{stats.totalDownloads.toLocaleString()}</p>
            <p className="text-xs text-gray-600">Téléchargements</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center">
            <Star className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-500 mb-1">{stats.avgRating}</p>
            <p className="text-xs text-gray-600">Note moyenne</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('courses')}
                className={`flex-1 px-6 py-4 font-semibold transition-all ${
                  activeTab === 'courses'
                    ? 'text-[#99334C] border-b-2 border-[#99334C] bg-[#99334C]/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Cours publiés ({courses.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`flex-1 px-6 py-4 font-semibold transition-all ${
                  activeTab === 'about'
                    ? 'text-[#99334C] border-b-2 border-[#99334C] bg-[#99334C]/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  <span>À propos</span>
                </div>
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Tab: Cours */}
            {activeTab === 'courses' && (
              <div>
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun cours publié pour le moment</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <div key={course.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-[#99334C]/10 rounded-xl flex items-center justify-center group-hover:bg-[#99334C] transition-all">
                            <BookOpen className="w-6 h-6 text-[#99334C] group-hover:text-white transition-all" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-semibold text-gray-700">{course.rating}</span>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {course.project_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {course.description}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{course.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            <span>{course.downloads.toLocaleString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => router.push(`/book-reader?course=${course.project_name}`)}
                          className="w-full bg-[#99334C] text-white py-2.5 rounded-xl font-semibold hover:bg-[#7a283d] transition-all"
                        >
                          Consulter le cours
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: À propos */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                {profile.bio && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Biographie</h3>
                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Statistiques</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-[#99334C]/10 to-[#99334C]/5 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Cours publiés</span>
                        <BookOpen className="w-5 h-5 text-[#99334C]" />
                      </div>
                      <p className="text-3xl font-bold text-[#99334C]">{stats.coursesPublished}</p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Vues totales</span>
                        <Eye className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-3xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Téléchargements</span>
                        <Download className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-3xl font-bold text-green-600">{stats.totalDownloads.toLocaleString()}</p>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Note moyenne</span>
                        <Star className="w-5 h-5 text-amber-500" />
                      </div>
                      <p className="text-3xl font-bold text-amber-500">{stats.avgRating}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Informations</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Briefcase className="w-5 h-5 text-[#99334C]" />
                      <div>
                        <p className="text-sm text-gray-500">Profession</p>
                        <p className="font-semibold text-gray-900">{profile.occupation || "Non renseignée"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Building2 className="w-5 h-5 text-[#99334C]" />
                      <div>
                        <p className="text-sm text-gray-500">Organisation</p>
                        <p className="font-semibold text-gray-900">{profile.org || "Non renseignée"}</p>
                      </div>
                    </div>

                    {profile.location && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <MapPin className="w-5 h-5 text-[#99334C]" />
                        <div>
                          <p className="text-sm text-gray-500">Localisation</p>
                          <p className="font-semibold text-gray-900">{profile.location}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Calendar className="w-5 h-5 text-[#99334C]" />
                      <div>
                        <p className="text-sm text-gray-500">Membre depuis</p>
                        <p className="font-semibold text-gray-900">{memberSince}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
