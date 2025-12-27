"use client";
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  Download,
  Share2,
  Trash2,
  Edit3,
  FileText,
  Calendar,
  User,
  FolderOpen,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { projectService, Project } from '@/services/projectService';
import { useAuth } from '@/context/AuthContext';

const EditHomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  const router = useRouter();
  const { user } = useAuth();

  // Templates mockés (sera remplacé par l'API)
  const templates = [
    { id: 1, name: 'Template Vide', type: 'blank', preview: null },
    { id: 2, name: 'Cours Académique', type: 'academic', preview: null },
    { id: 3, name: 'Formation Pro', type: 'professional', preview: null },
    { id: 4, name: 'Guide Personnel', type: 'personal', preview: null },
    { id: 5, name: 'Documentation', type: 'documentation', preview: null },
  ];

  // Charger les projets au montage du composant
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError('');
      const projectsData = await projectService.getAllProjects();
      setProjects(projectsData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des projets');
      console.error('Erreur chargement projets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = async () => {
    if (!newProjectName.trim()) {
      setError('Veuillez entrer un nom de projet');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      const newProject = await projectService.createProject({ pr_name: newProjectName });
      setProjects([newProject, ...projects]);
      setShowCreateModal(false);
      setNewProjectName('');
      // Rediriger vers l'éditeur avec le nouveau projet
      router.push(`/edit?projectId=${newProject.pr_id}`);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du projet');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectTemplate = (templateId: number) => {
    console.log('Template sélectionné:', templateId);
    setShowCreateModal(true);
    // TODO: Pré-remplir avec le template
  };

  const handleEdit = (projectId: string) => {
    router.push(`/edit?projectId=${projectId}`);
  };

  const handleDownload = (projectId: string) => {
    console.log('Télécharger:', projectId);
    // TODO: Implémenter le téléchargement
  };

  const handleShare = (projectId: string) => {
    console.log('Partager:', projectId);
    // TODO: Implémenter le partage
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }

    try {
      await projectService.deleteProject(projectId);
      setProjects(projects.filter(p => p.pr_id !== projectId));
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression du projet');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Filtrer les projets selon la recherche
  const filteredProjects = projects.filter(project =>
    project.pr_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section avec Image de fond */}
      <div className="relative bg-gradient-to-r from-[#99334C]/90 to-[#7a283d]/90 text-white overflow-hidden">
        {/* Image de fond avec overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-bold mb-4">
            Bienvenue {user?.prenom ? `${user.prenom}` : ''} sur <span className="text-white/90">XCCM2</span>
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl">
            Commencez à créer vos cours et compositions dès maintenant
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-[#99334C] px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-3 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Créer une Nouvelle Composition
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Message d'erreur global */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Section Templates */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Créer avec un Template</h2>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className="group relative aspect-[3/4] bg-white border-2 border-gray-200 rounded-2xl hover:border-[#99334C] hover:shadow-xl transition-all overflow-hidden"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  {template.type === 'blank' ? (
                    <Plus className="w-12 h-12 text-gray-300 group-hover:text-[#99334C] transition-colors" />
                  ) : (
                    <FileText className="w-12 h-12 text-gray-300 group-hover:text-[#99334C] transition-colors" />
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {template.name}
                  </p>
                </div>
                <div className="absolute inset-0 bg-[#99334C]/0 group-hover:bg-[#99334C]/10 transition-all" />
              </button>
            ))}
          </div>
        </section>

        {/* Section Toutes mes compositions */}
        <section>
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header du tableau */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Toutes mes compositions</h2>
                
                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher parmi mes projets"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">Filtrer</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-[#99334C] animate-spin" />
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Nom du projet
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4" />
                          Date de modification
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date de création
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Auteur
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg font-medium">
                            {searchQuery ? 'Aucun projet trouvé' : 'Aucune composition pour le moment'}
                          </p>
                          <p className="text-gray-400 mt-2">
                            {searchQuery ? 'Essayez une autre recherche' : 'Créez votre première composition pour commencer'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredProjects.map((project) => (
                        <tr key={project.pr_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#99334C]/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-[#99334C]" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{project.pr_name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-700">{formatDate(project.updated_at)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-700">{formatDate(project.created_at)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-700">{user?.prenom} {user?.nom}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(project.pr_id)}
                                className="p-2 rounded-lg hover:bg-[#99334C]/10 text-[#99334C] transition-all"
                                title="Éditer"
                              >
                                <Edit3 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDownload(project.pr_id)}
                                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all"
                                title="Télécharger"
                              >
                                <Download className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleShare(project.pr_id)}
                                className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-all"
                                title="Partager"
                              >
                                <Share2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(project.pr_id)}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                                title="Supprimer"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer du tableau */}
            {!isLoading && filteredProjects.length > 0 && (
              <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Affichage de <span className="font-semibold">1-{filteredProjects.length}</span> sur{' '}
                  <span className="font-semibold">{projects.length}</span> compositions
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal de création de projet */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Nouveau Projet</h3>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Nom du projet"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] mb-4"
              autoFocus
            />
            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewProjectName('');
                  setError('');
                }}
                disabled={isCreating}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateNew}
                disabled={isCreating}
                className="flex-1 px-4 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditHomePage;