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
  PenLine,
  FileText,
  Calendar,
  User,
  FolderOpen,
  Loader2,
  AlertCircle,
  X,
  BookTemplate,
  Globe,
  Users,
  ArrowRight,
  Star,
  CheckCircle,
  TrendingUp,
  GraduationCap,
  Code,
  Briefcase,
  Calculator
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { projectService, Project } from '@/services/projectService';
import { structureService, getProjectStructureOptimized } from '@/services/structureService';
import { invitationService } from '@/services/invitationService';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { TEMPLATE_DATA, GENERIC_TEMPLATE } from '@/app/templates/TemplateData';

const EditHomePage = () => {
  // --- États Globaux ---
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterType, setFilterType] = useState<'all' | 'owned' | 'accepted' | 'pending'>('all');

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

  // --- États Modale Écrasement ---
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);
  const [creatingTemplateId, setCreatingTemplateId] = useState<number | null>(null);

  const [downloadingProjectId, setDownloadingProjectId] = useState<string | null>(null);

  const router = useRouter();
  const { user } = useAuth();

  // Templates (Top 4)
  const templates = [
    {
      id: 1,
      name: "Cours Universitaire Standard",
      description: "Structure complète pour un cours universitaire avec introduction, chapitres théoriques, exercices et conclusion.",
      category: "Informatique",
      icon: GraduationCap,
      parts: 5,
      chapters: 12,
      difficulty: "Intermédiaire",
      rating: 4.8,
      downloads: 1240,
      author: "XCCM2 Team"
    },
    {
      id: 2,
      name: "Tutoriel Pratique",
      description: "Template pour créer des tutoriels step-by-step avec exercices pratiques et projets.",
      category: "Informatique",
      icon: Code,
      parts: 3,
      chapters: 8,
      difficulty: "Débutant",
      rating: 4.9,
      downloads: 2100,
      author: "XCCM2 Team"
    },
    {
      id: 3,
      name: "Formation Professionnelle",
      description: "Structure adaptée pour des formations professionnelles avec études de cas et mises en situation.",
      category: "Business",
      icon: Briefcase,
      parts: 4,
      chapters: 10,
      difficulty: "Intermédiaire",
      rating: 4.7,
      downloads: 890,
      author: "XCCM2 Team"
    },
    {
      id: 4,
      name: "Cours de Mathématiques",
      description: "Template spécialisé pour cours de maths avec théorèmes, démonstrations et exercices corrigés.",
      category: "Mathématiques",
      icon: Calculator,
      parts: 6,
      chapters: 15,
      difficulty: "Avancé",
      rating: 4.6,
      downloads: 750,
      author: "XCCM2 Team"
    },
    {
      id: 5,
      name: "Guide Utilisateur XCCM2",
      description: "Structure officielle pour documenter le flux utilisateur de l'application. Idéal pour vos captures d'écran.",
      category: "Documentation",
      icon: BookTemplate,
      parts: 3,
      chapters: 7,
      difficulty: "Débutant",
      rating: 5.0,
      downloads: 1,
      author: "Moi"
    }
  ];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const projectsData = await projectService.getAllProjects();
      setProjects(projectsData);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du chargement des projets');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Logique de Création ---
  const handleCreateNew = async (overwrite: boolean = false) => {
    if (newProjectName.trim().length < 3) {
      toast.error('Le nom du projet doit contenir au moins 3 caractères');
      return;
    }
    try {
      setIsCreating(true);
      const newProject = await projectService.createProject({
        pr_name: newProjectName,
        overwrite
      });

      if (overwrite) {
        setProjects(prev => prev.filter(p => p.pr_name !== newProjectName));
      }

      setProjects(prev => [newProject, ...prev]);
      setShowCreateModal(false);
      setShowOverwriteModal(false);
      setNewProjectName('');
      router.push(`/edit?projectName=${encodeURIComponent(newProject.pr_name)}`);
    } catch (err: any) {
      if (err.message && err.message.includes('409') || err.message.includes('déjà')) {
        setShowCreateModal(false);
        setShowOverwriteModal(true);
      } else {
        toast.error(err.message || 'Erreur création');
      }
    } finally {
      setIsCreating(false);
    }
  };

  // --- Logique de Création par Template ---
  const handleUseTemplate = async (templateId: number, templateName: string) => {
    if (creatingTemplateId) return;

    try {
      setCreatingTemplateId(templateId);
      const timestamp = Date.now();
      const newProjectName = `${templateName} ${timestamp}`;
      const newProject = await projectService.createProject({ pr_name: newProjectName });

      const structure = TEMPLATE_DATA[templateId] || GENERIC_TEMPLATE;

      for (let i = 0; i < structure.parts.length; i++) {
        const partData = structure.parts[i];
        await structureService.createPart(newProject.pr_name, {
          part_title: partData.title,
          part_intro: partData.intro,
          part_number: i + 1
        });

        if (partData.chapters) {
          for (let j = 0; j < partData.chapters.length; j++) {
            const chapData = partData.chapters[j];
            await structureService.createChapter(newProject.pr_name, partData.title, {
              chapter_title: chapData.title,
              chapter_number: j + 1
            });

            if (chapData.paragraphs) {
              for (let k = 0; k < chapData.paragraphs.length; k++) {
                const paraData = chapData.paragraphs[k];
                const newPara = await structureService.createParagraph(newProject.pr_name, partData.title, chapData.title, {
                  para_name: paraData.name,
                  para_number: k + 1
                });

                // --- Création des Notions si définies dans le template ---
                if (paraData.notions) {
                  for (let l = 0; l < paraData.notions.length; l++) {
                    const notionData = paraData.notions[l];
                    await structureService.createNotion(
                      newProject.pr_name,
                      partData.title,
                      chapData.title,
                      newPara.para_name, // Utiliser le vrai nom créé
                      {
                        notion_name: notionData.name,
                        notion_number: l + 1,
                        notion_content: notionData.content || ''
                      }
                    );
                  }
                }
              }
            }
          }
        }
      }

      toast.success('Projet créé avec succès !');
      router.push(`/edit?projectName=${encodeURIComponent(newProject.pr_name)}`);

    } catch (error: any) {
      console.error("Error creating template project:", error);
      toast.error("Erreur commande :" + (error.message || "Erreur inconnue"));
    } finally {
      setCreatingTemplateId(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-100 text-green-700';
      case 'Intermédiaire': return 'bg-amber-100 text-amber-700';
      case 'Avancé': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // --- Logique de Suppression ---
  const clickDelete = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    const idToDelete = projectToDelete.pr_id;
    const nameToDelete = projectToDelete.pr_name;

    try {
      setIsDeleting(true);
      await projectService.deleteProject(nameToDelete);
      setProjects(prevProjects => prevProjects.filter(p => p.pr_id !== idToDelete));
      setShowDeleteModal(false);
      setProjectToDelete(null);
      toast.success('Projet supprimé');
    } catch (err: any) {
      console.error("Erreur suppression:", err);
      toast.error(err.message || 'Erreur lors de la suppression');
      if (err.message && err.message.includes('not found')) {
        loadProjects();
        setShowDeleteModal(false);
      }
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

  const confirmRename = async () => {
    if (!projectToRename || renameValue.trim().length < 3) {
      toast.error('Le nom du projet doit contenir au moins 3 caractères');
      return;
    }
    try {
      setIsRenaming(true);
      await projectService.updateProject(projectToRename.pr_name, { pr_name: renameValue });
      setProjects(prev => prev.map(p =>
        p.pr_id === projectToRename.pr_id
          ? { ...p, pr_name: renameValue, updated_at: new Date().toISOString() }
          : p
      ));
      setShowRenameModal(false);
      setProjectToRename(null);
      toast.success('Projet renommé');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du renommage');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDownloadProject = async (projectName: string, projectId: string) => {
    try {
      setDownloadingProjectId(projectId);

      const token = (`; ${document.cookie}`).split(`; auth_token=`).pop()?.split(';').shift();
      if (!token) throw new Error('Non authentifié');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/projects/${encodeURIComponent(projectName)}/export?format=pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'exportation');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Exportation PDF réussie');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'exportation');
    } finally {
      setDownloadingProjectId(null);
    }
  };

  const [processingInvitationId, setProcessingInvitationId] = useState<string | null>(null);

  const handleAcceptInvitation = async (token: string, projectId: string) => {
    try {
      setProcessingInvitationId(projectId);
      await invitationService.acceptInvitation(token);
      toast.success('Invitation acceptée !');
      loadProjects(); // Recharger la liste
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'acceptation");
    } finally {
      setProcessingInvitationId(null);
    }
  };

  const handleDeclineInvitation = async (token: string, projectId: string) => {
    try {
      setProcessingInvitationId(projectId);
      await invitationService.declineInvitation(token);
      toast.success('Invitation refusée');
      loadProjects(); // Recharger la liste
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du refus");
    } finally {
      setProcessingInvitationId(null);
    }
  };

  // --- Navigation ---
  const handleOpenEditor = (projectName: string) => {
    router.push(`/edit?projectName=${encodeURIComponent(projectName)}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.pr_name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'all') return true;
    if (filterType === 'owned') return project.owner_id === user?.user_id;
    if (filterType === 'accepted') return project.invitation_status === 'Accepted';
    if (filterType === 'pending') return project.invitation_status === 'Pending';
    return true;
  });

  const pendingCount = projects.filter(p => p.invitation_status === 'Pending').length;

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

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-[#99334C] px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-3 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Créer une Nouvelle Composition
            </button>
            {/* Removed "Parcourir les Modèles" button as requested */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Section Templates (Nouveau Design) */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Créer avec un Template</h2>
            <Link
              href="/templates"
              className="group flex items-center gap-2 text-[#99334C] font-semibold hover:text-[#7a283d] transition-colors"
            >
              Voir plus
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => {
              const IconComponent = template.icon;
              return (
                <div
                  key={template.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all group flex flex-col"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#99334C]/10 to-[#99334C]/5 p-5 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-[#99334C] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-gray-700">{template.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1" title={template.name}>{template.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-bold ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{template.description}</p>

                    {/* Stats Compact */}
                    <div className="flex justify-between items-center mb-4 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                      <span className="font-medium">{template.parts} Parties</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="font-medium">{template.chapters} Chapitres</span>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleUseTemplate(template.id, template.name)}
                      disabled={creatingTemplateId !== null}
                      className="w-full bg-white border-2 border-[#99334C] text-[#99334C] hover:bg-[#99334C] hover:text-white py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-md"
                    >
                      {creatingTemplateId === template.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {creatingTemplateId === template.id ? 'Création...' : 'Utiliser ce modèle'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section Tableau */}
        <section>
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Toutes mes compositions</h2>

                {/* Filtres */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filterType === 'all'
                      ? 'bg-[#99334C] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setFilterType('owned')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filterType === 'owned'
                      ? 'bg-[#99334C] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Mes Projets
                  </button>
                  <button
                    onClick={() => setFilterType('accepted')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${filterType === 'accepted'
                      ? 'bg-[#99334C] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Partagés
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setFilterType('pending')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${filterType === 'pending'
                        ? 'bg-[#99334C] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      En attente
                    </button>
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white">
                        {pendingCount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative flex-1 min-w-[250px] max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C]"
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
                        <tr
                          key={project.pr_id}
                          onClick={() => project.invitation_status !== 'Pending' && handleOpenEditor(project.pr_name)}
                          className={clsx(
                            "hover:bg-gray-50 transition-colors group",
                            project.invitation_status !== 'Pending' ? "cursor-pointer" : "cursor-default"
                          )}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#99334C]/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-[#99334C]" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900">{project.pr_name}</span>
                                {project.invitation_status && (
                                  <span className={clsx(
                                    "text-[10px] font-bold uppercase tracking-wider w-fit px-1.5 py-0.5 rounded",
                                    project.invitation_status === 'Pending' ? "bg-amber-100 text-amber-600" :
                                      project.invitation_status === 'Accepted' ? "bg-green-100 text-green-600" :
                                        "bg-red-100 text-red-600"
                                  )}>
                                    {project.invitation_status === 'Pending' ? 'Invitation en attente' :
                                      project.invitation_status === 'Accepted' ? 'Partagé avec vous' :
                                        'Refusé'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{formatDate(project.updated_at)}</td>
                          <td className="px-6 py-4 text-gray-600">{formatDate(project.created_at)}</td>
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              {project.invitation_status === 'Pending' ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (project.invitation_token) handleAcceptInvitation(project.invitation_token, project.pr_id);
                                    }}
                                    disabled={processingInvitationId === project.pr_id}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-all shadow-sm disabled:opacity-50"
                                  >
                                    {processingInvitationId === project.pr_id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-3 h-3" />
                                    )}
                                    Accepter
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (project.invitation_token) handleDeclineInvitation(project.invitation_token, project.pr_id);
                                    }}
                                    disabled={processingInvitationId === project.pr_id}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                                  >
                                    <X className="w-3 h-3" />
                                    Refuser
                                  </button>
                                </div>
                              ) : (
                                <>
                                  {/* Bouton Renommer */}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); clickRename(project); }}
                                    className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-all"
                                    title="Renommer"
                                  >
                                    <PenLine className="w-5 h-5" />
                                  </button>

                                  {/* Bouton Télécharger */}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDownloadProject(project.pr_name, project.pr_id); }}
                                    disabled={downloadingProjectId === project.pr_id}
                                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all disabled:opacity-50"
                                    title="Télécharger (PDF)"
                                  >
                                    {downloadingProjectId === project.pr_id ? (
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                      <Download className="w-5 h-5" />
                                    )}
                                  </button>

                                  {/* Bouton Supprimer */}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); clickDelete(project); }}
                                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </>
                              )}
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
              placeholder="Ex: Ma Super Composition"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#99334C] outline-none"
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-500 mb-6">
              Minimum 3 caractères. Lettres, chiffres, espaces, points, tirets et underscores autorisés.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 placeholder-gray-400 rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleCreateNew(false)}
                disabled={isCreating || newProjectName.trim().length < 3}
                className="flex-1 px-4 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#99334C] outline-none"
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-500 mb-6">
              Minimum 3 caractères.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRenameModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 placeholder-gray-400 rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmRename}
                disabled={isRenaming || renameValue.trim().length < 3}
                className="flex-1 px-4 py-3 bg-[#99334C] text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer <span className="font-semibold text-gray-900">"{projectToDelete.pr_name}"</span> ?
              <br />Cette action est irréversible.
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

      {/* --- MODALE ÉCRASEMENT --- */}
      {showOverwriteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Projet existant</h3>
            <p className="text-gray-600 text-center mb-6">
              Un projet nommé <span className="font-semibold text-gray-900">"{newProjectName}"</span> existe déjà.
              Voulez-vous le remplacer ? Cette action supprimera tout le contenu du projet actuel.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOverwriteModal(false);
                  setShowCreateModal(true);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={() => handleCreateNew(true)}
                disabled={isCreating}
                className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-medium flex justify-center items-center gap-2"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Remplacer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditHomePage;