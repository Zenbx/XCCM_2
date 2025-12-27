"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Mail, 
  Briefcase, 
  Building2, 
  Calendar,
  Edit3,
  Save,
  X,
  BookOpen,
  Download,
  Eye,
  TrendingUp,
  Award,
  Clock,
  Octagon
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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

  // Données mockées pour les statistiques (à remplacer par l'API)
  const stats = {
    coursCreated: 12,
    coursViews: 3450,
    coursDownloads: 890,
    memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    }) : 'Récemment',
  };

  const recentActivity = [
    { id: 1, action: 'Cours créé', title: 'Introduction au Réseaux', date: '2 jours', type: 'create' },
    { id: 2, action: 'Cours modifié', title: 'Programmation Python', date: '5 jours', type: 'edit' },
    { id: 3, action: 'Cours publié', title: 'Design UX/UI', date: '1 semaine', type: 'publish' },
  ];

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      nom: user?.lastname || '',
      prenom: user?.firstname || '',
      email: user?.email || '',
      profession: user?.occupation || '',
      organisation: user?.org || '',
    });
    setError('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Appel API pour mettre à jour le profil
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mon Compte</h1>
          <p className="text-gray-600">Gérez vos informations personnelles et votre activité</p>
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
              <div className="bg-gradient-to-r from-[#99334C] to-[#7a283d] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold">
                      {user.firstname?.[0]}{user.lastname?.[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{user.firstname} {user.lastname}</h2>
                      <p className="text-white/80">{user.email}</p>
                    </div>
                  </div>
                  
                  {!isEditing && (
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all flex items-center gap-2"
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
                            value={formData.nom}
                            onChange={(e) => setFormData({...formData, nom: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
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
                            value={formData.prenom}
                            onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
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
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
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
                          value={formData.profession}
                          onChange={(e) => setFormData({...formData, profession: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
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
                          value={formData.organisation}
                          onChange={(e) => setFormData({...formData, organisation: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
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

            {/* Activité récente */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-[#99334C]" />
                Activité récente
              </h3>

              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'create' ? 'bg-green-100' :
                      activity.type === 'edit' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {activity.type === 'create' && <BookOpen className="w-5 h-5 text-green-600" />}
                      {activity.type === 'edit' && <Edit3 className="w-5 h-5 text-blue-600" />}
                      {activity.type === 'publish' && <TrendingUp className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.action}</p>
                    </div>
                    <span className="text-sm text-gray-500">Il y a {activity.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne droite - Statistiques */}
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#99334C]" />
                Statistiques
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-[#99334C]/10 to-[#99334C]/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Cours créés</span>
                    <BookOpen className="w-5 h-5 text-[#99334C]" />
                  </div>
                  <p className="text-3xl font-bold text-[#99334C]">{stats.coursCreated}</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Vues totales</span>
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{stats.coursViews.toLocaleString()}</p>
                </div>

                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Téléchargements</span>
                    <Download className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-600">{stats.coursDownloads.toLocaleString()}</p>
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