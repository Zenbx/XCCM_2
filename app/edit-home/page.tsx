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
  Edit3, // Pour ouvrir l'éditeur
  PenLine, // Nouveau : Pour renommer
  FileText,
  Calendar,
  User,
  FolderOpen,
  Loader2,
  AlertCircle,
  X // Pour fermer les modales
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { projectService, Project } from '@/services/projectService';
import { useAuth } from '@/context/AuthContext';

const EditHomePage = () => {
  // --- États Globaux ---
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // --- États Modale Création ---
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // --- États Modale Suppression ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- États Modale Renommage ---
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [projectToRename, setProjectToRename] = useState<Project | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  
  const router = useRouter();
  const { user } = useAuth();

  // Templates mockés
  const templates = [
    { id: 1, name: 'Template Vide', type: 'blank', preview: null },
    { id: 2, name: 'Cours Académique', type: 'academic', preview: null },
    { id: 3, name: 'Formation Pro', type: 'professional', preview: null },
    { id: 4, name: 'Guide Personnel', type: 'personal', preview: null },
    { id: 5, name: 'Documentation', type: 'documentation', preview: null },
  ];

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
    } finally {
      setIsLoading(false);
    }
  };

  // --- Logique de Création ---
  const handleCreateNew = async () => {
    if (!newProjectName.trim()) {
      setError('Veuillez entrer un nom de projet');
      return;
    }
    try {
      setIsCreating(true);
      setError('');
      const newProject = await projectService.createProject({ pr_name: newProjectName });
      // Mise à jour optimiste ou basée sur la réponse
      setProjects(prev => [newProject, ...prev]);
      setShowCreateModal(false);
      setNewProjectName('');
      router.push(`/edit?projectId=${newProject.pr_id}`);
    } catch (err: any) {
      setError(err.message || 'Erreur création');
    } finally {
      setIsCreating(false);
    }
  };

  // --- Logique de Suppression ---
  const clickDelete = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      setIsDeleting(true);
      await projectService.deleteProject(projectToDelete.pr_id);
      
      // Mise à jour de l'UI : on filtre la liste actuelle pour retirer l'ID supprimé
      setProjects(prevProjects => prevProjects.filter(p => p.pr_id !== projectToDelete.pr_id));
      
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Logique de Renommage ---
  const clickRename = (project: Project) => {
    setProjectToRename(project);
    setRenameValue(project.pr_name);
    setShowRenameModal(true);
  };

 // Dans EditHomePage.tsx, fonction confirmRename

const confirmRename = async () => {
    if (!projectToRename || !renameValue.trim()) return;

    try {
      setIsRenaming(true);
      
      // CORRECTION ICI : On passe le nom actuel (projectToRename.pr_name) comme premier argument
      // car l'API est définie sur /api/projects/{pr_name}
      await projectService.updateProject(projectToRename.pr_name, { pr_name: renameValue });

      // Mise à jour de l'UI locale
      setProjects(prevProjects => prevProjects.map(p => 
        p.pr_id === projectToRename.pr_id 
          ? { ...p, pr_name: renameValue, updated_at: new Date().toISOString() } 
          : p
      ));

      setShowRenameModal(false);
      setProjectToRename(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du renommage');
    } finally {
      setIsRenaming(false);
    }
};

  // --- Navigation ---
  const handleOpenEditor = (projectId: string) => {
    router.push(`/edit?projectId=${projectId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const filteredProjects = projects.filter(project =>
    project.pr_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#99334C]/90 to-[#7a283d]/90 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-bold mb-4">
            Bienvenue {user?.firstname ? `${user.firstname}` : ''} sur <span className="text-white/90">XCCM2</span>
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Section Templates (identique à avant) */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Créer avec un Template</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setShowCreateModal(true)}
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
                  <p className="text-sm font-semibold text-gray-900 truncate">{template.name}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Section Tableau */}
        <section>
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Toutes mes compositions</h2>
                <div className="relative flex-1 min-w-[250px] max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C]"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-[#99334C] animate-spin" />
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Nom du projet</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Modification</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Création</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                          Aucun projet trouvé
                        </td>
                      </tr>
                    ) : (
                      filteredProjects.map((project) => (
                        <tr key={project.pr_id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#99334C]/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-[#99334C]" />
                              </div>
                              <span className="font-semibold text-gray-900">{project.pr_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{formatDate(project.updated_at)}</td>
                          <td className="px-6 py-4 text-gray-600">{formatDate(project.created_at)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* Bouton Ouvrir Éditeur */}
                              <button
                                onClick={() => handleOpenEditor(project.pr_id)}
                                className="p-2 rounded-lg hover:bg-[#99334C]/10 text-[#99334C] transition-all"
                                title="Ouvrir dans l'éditeur"
                              >
                                <Edit3 className="w-5 h-5" />
                              </button>
                              
                              {/* Bouton Renommer (Nouveau) */}
                              <button
                                onClick={() => clickRename(project)}
                                className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-all"
                                title="Renommer"
                              >
                                <PenLine className="w-5 h-5" />
                              </button>

                              {/* Bouton Télécharger */}
                              <button
                                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all"
                                title="Télécharger"
                              >
                                <Download className="w-5 h-5" />
                              </button>

                              {/* Bouton Supprimer */}
                              <button
                                onClick={() => clickDelete(project)}
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
          </div>
        </section>
      </div>

      {/* --- MODALE CRÉATION --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl scale-100 transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Nouveau Projet</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Nom du projet"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 placeholder-gray-400 rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateNew}
                disabled={isCreating}
                className="flex-1 px-4 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] flex justify-center items-center gap-2"
              >
                {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALE RENOMMAGE (Nouvelle) --- */}
      {showRenameModal && projectToRename && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Renommer le projet</h3>
              <button onClick={() => setShowRenameModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4 text-sm">Entrez le nouveau nom pour ce projet.</p>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] mb-6"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRenameModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 placeholder-gray-400 rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmRename}
                disabled={isRenaming}
                className="flex-1 px-4 py-3 bg-[#99334C] text-white rounded-xl hover:bg-amber-700 flex justify-center items-center gap-2"
              >
                {isRenaming ? 'Enregistrement...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALE SUPPRESSION (Personnalisée) --- */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-l-4 border-red-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer <span className="font-semibold text-gray-900">"{projectToDelete.pr_name}"</span> ? 
              <br/>Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 placeholder-gray-400 rounded-xl hover:bg-gray-50 text-gray-700 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-[#99334C] text-white rounded-xl hover:bg-red-700 font-medium flex justify-center items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </>
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