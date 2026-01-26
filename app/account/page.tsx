"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  User, Mail, X,
  Briefcase,
  Building2,
  Calendar,
  Edit3,
  Save,
  Award, BookOpen, Eye, Download, TrendingUp, Box, Clock,
  ChevronRight, LogOut, Settings, Plus, Layout, Heart, Trash2, FileText, Globe, ExternalLink, Loader2, EyeOff
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/lib/cookies';
import { vaultService, VaultItem } from '@/services/vaultService';
import { authService } from '@/services/authService';
import { getAuthHeaders } from '@/lib/apiHelper';
import { documentService } from '@/services/documentService';
import { projectService } from '@/services/projectService';
import toast from 'react-hot-toast';
import Link from 'next/link';
import ConfirmationModal from '@/components/ConfirmationModal';

const AccountPage = () => {
  const { user, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
    occupation: user?.occupation || '',
    org: user?.org || '',
  });

  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Synchroniser le formulaire quand les données utilisateur arrivent
  React.useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        occupation: user.occupation || '',
        org: user.org || '',
      });
    }
  }, [user, isEditing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5 Mo");
        return;
      }
      setNewProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // State pour les statistiques
  const [stats, setStats] = useState({
    coursCreated: 0,
    coursViews: 0,
    coursDownloads: 0,
    likes: 0,
    recentActivities: [] as any[],
    memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    }) : 'Récemment',
  });

  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [loadingVault, setLoadingVault] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [activeTab, setActiveTab] = useState<'activity' | 'publications'>('activity');
  const [userDocuments, setUserDocuments] = useState<any[]>([]);
  const [isDeletingDoc, setIsDeletingDoc] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<{ id: string, name: string } | null>(null);

  // Fetch stats on mount
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = authService.getAuthToken();
        if (!token) return;

        const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

        const response = await fetch(`${API_BASE_URL}/api/user/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-user-id': user?.user_id || ''
          }
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setStats(prev => ({
            ...prev,
            coursCreated: data.data.totalCoursesCreated,
            coursViews: data.data.totalViewsOnPublishedCourses,
            coursDownloads: data.data.totalDownloadsOnPublishedCourses,
            likes: data.data.totalLikesOnPublishedCourses,
            recentActivities: data.data.recentActivities || [],
            memberSince: data.data.createdAt ? new Date(data.data.createdAt).toLocaleDateString('fr-FR', {
              month: 'long',
              year: 'numeric'
            }) : prev.memberSince,
          }));
        }
      } catch (error) {
        console.error("Error loading stats", error);
        // Ne pas afficher d'erreur visible pour l'utilisateur, garder les valeurs par défaut
      }
    };
    if (user) {
      fetchStats();
      fetchVault();
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      if (!user?.user_id) return;

      const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');
      const response = await fetch(`${API_BASE_URL}/api/users/${user.user_id}`);
      const data = await response.json();

      if (data.success) {
        // Re-construct the list from projects with snapshots
        const docs = data.data.projects.flatMap((p: any) =>
          (p.documents || []).map((d: any) => ({
            ...d,
            project_name: p.pr_name,
            category: p.category
          }))
        ).sort((a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

        setUserDocuments(docs);
      }
    } catch (err) {
      console.error("Error fetching documents", err);
    }
  };

  const handleDeletePublication = (docId: string, docName: string) => {
    setDocToDelete({ id: docId, name: docName });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;

    setIsDeleteModalOpen(false);
    setIsDeletingDoc(docToDelete.id);
    try {
      await documentService.deleteDocument(docToDelete.id);
      toast.success(`"${docToDelete.name}" a été retiré de la bibliothèque`);
      fetchDocuments();
    } catch (err) {
      toast.error("Erreur lors de la dépublication");
    } finally {
      setIsDeletingDoc(null);
      setDocToDelete(null);
    }
  };

  const fetchVault = async () => {
    try {
      setLoadingVault(true);
      const items = await vaultService.getVaultItems();
      setVaultItems(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVault(false);
    }
  };

  const handleRemoveFromVault = async (id: string) => {
    try {
      await vaultService.removeFromVault(id);
      setVaultItems(prev => prev.filter(i => i.id !== id));
      toast.success("Élément retiré du coffre-fort");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression");
    }
  };

  // Mock activity (could be replaced by API if needed, but keeping simple for now)


  /* ... handlers ... */
  // (Handlers kept as is)
  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      lastname: user?.lastname || '',
      firstname: user?.firstname || '',
      email: user?.email || '',
      occupation: user?.occupation || '',
      org: user?.org || '',
    });
    setNewProfilePicture(null);
    setPreviewUrl(null);
    setError('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = getCookie('auth_token');
      if (!token) throw new Error("Non authentifié");

      const updateData = new FormData();
      updateData.append('firstname', formData.firstname);
      updateData.append('lastname', formData.lastname);
      // updateData.append('email', formData.email); // Email update restricted for now
      updateData.append('occupation', formData.occupation);
      updateData.append('org', formData.org);

      if (newProfilePicture) {
        updateData.append('profile_picture', newProfilePicture);
      }

      const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': (getAuthHeaders() as Record<string, string>).Authorization,
          // Pas de Content-Type pour FormData
        },
        body: updateData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la mise à jour');
      }

      await refreshUser();
      setIsEditing(false);
      setSuccess('Profil mis à jour avec succès !');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublicProfile = () => {
    if (user?.user_id) {
      router.push(`/profile/${user.user_id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#99334C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const displayedActivities = showAllActivity
    ? stats.recentActivities
    : stats.recentActivities.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 md:py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Mon Compte</h1>
            <p className="text-gray-600">Gérez vos informations personnelles et votre activité</p>
          </div>
          <button
            onClick={handlePublicProfile}
            className="w-full md:w-auto px-4 py-2.5 text-[#99334C] border border-[#99334C] rounded-xl hover:bg-[#99334C] hover:text-white transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <Eye className="w-4 h-4" />
            Voir mon profil public
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne gauche - Profil */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte Profil */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

              {/* Header de la carte */}
              <div className="bg-gradient-to-r from-[#99334C] to-[#7a283d] p-4 md:p-6 text-white">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="relative group">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden border-2 border-white/50">
                        {(previewUrl || user.profile_picture) ? (
                          <img
                            src={previewUrl || `${process.env.NEXT_PUBLIC_API_URL}${user.profile_picture}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{user.firstname?.[0]}{user.lastname?.[0]}</span>
                        )}
                      </div>

                      {isEditing && (
                        <label htmlFor="profile-update" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit3 className="w-6 h-6 text-white" />
                        </label>
                      )}
                      <input
                        type="file"
                        id="profile-update"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{user.firstname} {user.lastname}</h2>
                      <p className="text-white/80">{user.email}</p>
                    </div>
                  </div>

                  {!isEditing && (
                    <button
                      onClick={handleEdit}
                      className="w-full sm:w-auto px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Modifier</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Contenu de la carte */}
              <div className="p-6 space-y-6">
                {isEditing ? (
                  // Mode édition
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nom
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.lastname}
                            onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Prénom
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.firstname}
                            onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Profession
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.occupation}
                          onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                          placeholder="Enseignant, Formateur..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Organisation
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.org}
                          onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                          placeholder="Nom de votre établissement"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 bg-[#99334C] text-white py-3 rounded-xl font-semibold hover:bg-[#7a283d] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Enregistrement...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            <span>Enregistrer</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-5 h-5" />
                        <span>Annuler</span>
                      </button>
                    </div>
                  </>
                ) : (
                  // Mode lecture
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <User className="w-5 h-5 text-[#99334C]" />
                        <div>
                          <p className="text-sm text-gray-500">Nom complet</p>
                          <p className="font-semibold text-gray-900">{user.firstname} {user.lastname}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Mail className="w-5 h-5 text-[#99334C]" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-semibold text-gray-900">{user.email}</p>
                        </div>
                      </div>

                      {user.occupation && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                          <Briefcase className="w-5 h-5 text-[#99334C]" />
                          <div>
                            <p className="text-sm text-gray-500">Profession</p>
                            <p className="font-semibold text-gray-900">{user.occupation}</p>
                          </div>
                        </div>
                      )}

                      {user.org && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                          <Building2 className="w-5 h-5 text-[#99334C]" />
                          <div>
                            <p className="text-sm text-gray-500">Organisation</p>
                            <p className="font-semibold text-gray-900">{user.org}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Calendar className="w-5 h-5 text-[#99334C]" />
                        <div>
                          <p className="text-sm text-gray-500">Membre depuis</p>
                          <p className="font-semibold text-gray-900">{stats.memberSince}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs System */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 w-fit rounded-xl mb-6">
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-6 py-2.5 rounded-lg font-bold transition-all ${activeTab === 'activity' ? 'bg-white text-[#99334C] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Activité & Coffre-fort
              </button>
              <button
                onClick={() => setActiveTab('publications')}
                className={`px-6 py-2.5 rounded-lg font-bold transition-all ${activeTab === 'publications' ? 'bg-white text-[#99334C] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Mes Projets Publiés
              </button>
            </div>

            {activeTab === 'activity' ? (
              <div className="space-y-6">
                {/* Activité récente */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-[#99334C]" />
                    Activité récente
                  </h3>

                  <div className="space-y-4">
                    {displayedActivities.length > 0 ? (
                      <>
                        {displayedActivities.map((activity, index) => (
                          <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'project' ? 'bg-blue-100' :
                              activity.type === 'comment' ? 'bg-green-100' :
                                activity.type === 'like' ? 'bg-red-100' : 'bg-purple-100'
                              }`}>
                              {activity.type === 'project' && <Briefcase className="w-5 h-5 text-blue-600" />}
                              {activity.type === 'comment' && <Mail className="w-5 h-5 text-green-600" />}
                              {activity.type === 'like' && <Eye className="w-5 h-5 text-red-600" />}
                              {activity.type === 'invitation' && <Mail className="w-5 h-5 text-purple-600" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-900">{activity.title}</p>
                              <p className="text-xs text-gray-500">{activity.description}</p>
                            </div>
                            <div className="text-xs text-gray-400 whitespace-nowrap">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        ))}

                        {stats.recentActivities.length > 5 && (
                          <button
                            onClick={() => setShowAllActivity(!showAllActivity)}
                            className="w-full py-2.5 text-sm font-semibold text-[#99334C] hover:bg-[#99334C]/5 rounded-xl transition-all border border-[#99334C]/20 flex items-center justify-center gap-2"
                          >
                            {showAllActivity ? 'Voir moins' : 'Voir plus'}
                            <ChevronRight className={`w-4 h-4 transition-transform ${showAllActivity ? '-rotate-90' : 'rotate-90'}`} />
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Aucune activité récente.</p>
                    )}
                  </div>
                </div>

                {/* Mon Coffre-fort */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Box className="w-6 h-6 text-[#99334C]" />
                    Mon Coffre-fort
                  </h3>

                  {loadingVault ? (
                    <div className="text-center py-4 text-gray-400">Chargement...</div>
                  ) : (
                    <div className="space-y-4">
                      {vaultItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {vaultItems.map((item) => (
                            <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:border-[#99334C]/30 hover:bg-[#99334C]/5 transition-all group relative">
                              <button
                                onClick={() => handleRemoveFromVault(item.id)}
                                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                title="Retirer du coffre-fort"
                              >
                                <Trash2 size={16} />
                              </button>

                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm text-[#99334C] shrink-0">
                                  {item.type === 'part' && <span className="text-xs font-bold">PT</span>}
                                  {item.type === 'chapter' && <span className="text-xs font-bold">CH</span>}
                                  {item.type === 'paragraph' && <span className="text-xs font-bold">PA</span>}
                                  {item.type === 'notion' && <span className="text-xs font-bold">NO</span>}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-800 line-clamp-1 pr-6">{item.title}</h4>
                                  <p className="text-xs text-gray-500 mt-1">
                                    De : {item.source_doc_name || 'Inconnu'}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">
                                    Ajouté le {new Date(item.added_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                          <Box className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 font-medium">Votre coffre-fort est vide.</p>
                          <p className="text-xs text-gray-400 mt-1">Collectez des granules depuis vos lectures pour les retrouver ici.</p>
                          <button
                            onClick={() => router.push('/library')}
                            className="mt-4 px-4 py-2 text-sm text-[#99334C] font-medium hover:underline"
                          >
                            Aller à la bibliothèque
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Mes Publications Management Section */
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 min-h-[400px]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-[#99334C]" />
                    Gestion de vos projets en bibliothèque
                  </h3>
                  <span className="px-3 py-1 bg-[#99334C]/10 text-[#99334C] text-xs font-bold rounded-full">
                    {userDocuments.length} SNAPSHOTS
                  </span>
                </div>

                {userDocuments.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <FileText className="w-8 h-8 text-gray-300" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">Aucune publication</h4>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">Vous n'avez pas encore publié de versions de vos projets dans la bibliothèque publique.</p>
                    <button
                      onClick={() => router.push('/edit-home')}
                      className="px-6 py-2.5 bg-[#99334C] text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      Aller à mes projets
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userDocuments.map((doc) => (
                      <div key={doc.doc_id} className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-4">
                        <div className="w-12 h-16 bg-[#99334C]/5 rounded-lg flex items-center justify-center shrink-0 border border-[#99334C]/5">
                          <FileText className="w-6 h-6 text-[#99334C]/40" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 truncate">{doc.doc_name}</h4>
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-black rounded uppercase">
                              {doc.format || 'pdf'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1 font-medium"><BookOpen size={13} /> {doc.project_name}</span>
                            <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(doc.published_at).toLocaleDateString()}</span>
                            <span className="text-[#99334C]/60 italic font-medium">{doc.category || 'Général'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 px-6 md:border-x border-gray-50">
                          <div className="text-center">
                            <p className="text-sm font-black text-gray-900">{doc.consult || 0}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Vues</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-black text-gray-900">{doc.downloaded || 0}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">DL</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/book-reader?docId=${doc.doc_id}`}
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all group"
                            title="Voir dans la bibliothèque"
                          >
                            <ExternalLink size={20} className="group-hover:scale-110 transition-transform" />
                          </Link>
                          <button
                            onClick={() => handleDeletePublication(doc.doc_id, doc.doc_name)}
                            disabled={isDeletingDoc === doc.doc_id}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 font-bold text-sm"
                            title="Retirer de la bibliothèque"
                          >
                            {isDeletingDoc === doc.doc_id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <>
                                <EyeOff size={16} />
                                <span>Dépublier</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Custom Confirmation Modal for Unpublishing */}
            <ConfirmationModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              onConfirm={handleConfirmDelete}
              title="Dépublier le projet"
              message={`Êtes-vous sûr de vouloir retirer "${docToDelete?.name}" de la bibliothèque publique ? Cette version ne sera plus visible par les autres utilisateurs.`}
              confirmLabel="Dépublier maintenant"
              cancelLabel="Garder en ligne"
              isDanger={true}
              isLoading={!!isDeletingDoc}
            />
          </div>

          {/* Colonne droite - Statistiques */}
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#99334C]" />
                Statistiques
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                <div className="p-4 bg-gradient-to-br from-[#99334C]/10 to-[#99334C]/5 rounded-xl text-center sm:text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Mes Projets</span>
                    <BookOpen className="w-5 h-5 text-[#99334C]" />
                  </div>
                  <p className="text-3xl font-bold text-[#99334C]">{stats.coursCreated}</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl text-center sm:text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Vues totales</span>
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{stats.coursViews.toLocaleString()}</p>
                </div>

                <div className="p-4 bg-green-50 rounded-xl text-center sm:text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Téléchargements</span>
                    <Download className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-600">{stats.coursDownloads.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-pink-50 rounded-xl text-center sm:text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Likes reçus</span>
                    <Heart className="w-5 h-5 text-pink-600" />
                  </div>
                  <p className="text-3xl font-bold text-pink-600">{stats.likes.toLocaleString()}</p>
                </div>
              </div>
            </div>


            {/* Badge */}
            <div className="bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-bold">Membre Actif</h3>
                  <p className="text-white/80 text-sm">Contributeur régulier</p>
                </div>
              </div>
              <p className="text-white/90 text-sm">
                Continuez à créer et partager du contenu de qualité pour débloquer de nouveaux badges !
              </p>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/edit-home')}
                  className="w-full px-4 py-3 bg-[#99334C] text-white rounded-xl font-semibold hover:bg-[#7a283d] transition-all"
                >
                  Créer un cours
                </button>
                <button
                  onClick={() => router.push('/settings')}
                  className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Paramètres
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;