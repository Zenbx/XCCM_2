"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { projectService } from '@/services/projectService';
import { structureService } from '@/services/structureService';
import { useAuth } from '@/context/AuthContext';
import { TEMPLATE_DATA, GENERIC_TEMPLATE } from './TemplateData';
import {
  BookTemplate,
  Search,
  Filter,
  Download,
  Eye,
  Star,
  BookOpen,
  GraduationCap,
  Code,
  Palette,
  Microscope,
  Calculator,
  Globe,
  Music,
  Heart,
  Briefcase,
  CheckCircle,
  TrendingUp,
  Users,
  Loader2
} from 'lucide-react';

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: any;
  parts: number;
  chapters: number;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  rating: number;
  downloads: number;
  author: string;
  preview?: string;
}

const TemplatesPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth(); // Auth protection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Tous');
  const [creatingTemplateId, setCreatingTemplateId] = useState<number | null>(null);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const categories = [
    { name: 'Tous', icon: BookOpen, color: 'gray' },
    { name: 'Informatique', icon: Code, color: 'blue' },
    { name: 'Sciences', icon: Microscope, color: 'green' },
    { name: 'Mathématiques', icon: Calculator, color: 'purple' },
    { name: 'Langues', icon: Globe, color: 'orange' },
    { name: 'Arts', icon: Palette, color: 'pink' },
    { name: 'Musique', icon: Music, color: 'indigo' },
    { name: 'Médecine', icon: Heart, color: 'red' },
    { name: 'Business', icon: Briefcase, color: 'amber' }
  ];

  const templates: Template[] = [
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
      name: "Apprentissage des Langues",
      description: "Structure pour cours de langue avec vocabulaire, grammaire, dialogues et exercices.",
      category: "Langues",
      icon: Globe,
      parts: 4,
      chapters: 12,
      difficulty: "Débutant",
      rating: 4.8,
      downloads: 1560,
      author: "XCCM2 Team"
    },
    {
      id: 6,
      name: "Cours de Sciences",
      description: "Template pour sciences expérimentales avec hypothèses, protocoles et analyses de résultats.",
      category: "Sciences",
      icon: Microscope,
      parts: 5,
      chapters: 10,
      difficulty: "Intermédiaire",
      rating: 4.5,
      downloads: 620,
      author: "XCCM2 Team"
    },
    {
      id: 7,
      name: "Atelier Créatif",
      description: "Structure pour ateliers artistiques avec projets créatifs et galerie de réalisations.",
      category: "Arts",
      icon: Palette,
      parts: 3,
      chapters: 6,
      difficulty: "Débutant",
      rating: 4.9,
      downloads: 980,
      author: "XCCM2 Team"
    },
    {
      id: 8,
      name: "Cours de Médecine",
      description: "Template pour cours médicaux avec anatomie, pathologies, diagnostics et traitements.",
      category: "Médecine",
      icon: Heart,
      parts: 7,
      chapters: 18,
      difficulty: "Avancé",
      rating: 4.7,
      downloads: 1120,
      author: "XCCM2 Team"
    },
    {
      id: 9,
      name: "Mini-Cours Express",
      description: "Structure condensée pour cours rapides et introductions de 1-2 heures.",
      category: "Informatique",
      icon: TrendingUp,
      parts: 2,
      chapters: 4,
      difficulty: "Débutant",
      rating: 4.6,
      downloads: 1850,
      author: "XCCM2 Team"
    }
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'Tous' || template.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant':
        return 'bg-green-100 text-green-700';
      case 'Intermédiaire':
        return 'bg-amber-100 text-amber-700';
      case 'Avancé':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleUseTemplate = async (templateId: number, templateName: string) => {
    if (creatingTemplateId) return; // Prevent double click

    try {
      setCreatingTemplateId(templateId);

      // 1. Create the project
      // Note: In a real app, we might ask for a specific name via a modal.
      // Here we append a timestamp to make it unique and identifiable.
      const newProjectName = `${templateName} - ${new Date().toLocaleDateString('fr-FR')}`;
      const newProject = await projectService.createProject({ pr_name: newProjectName });

      // 2. Get Structure Data
      const structure = TEMPLATE_DATA[templateId] || GENERIC_TEMPLATE;

      // 3. Create Structure (Parts -> Chapters -> Paragraphs)
      // We do this sequentially to respect order and dependency, though Promise.all could be used for parallel sibling creation.

      for (let i = 0; i < structure.parts.length; i++) {
        const partData = structure.parts[i];

        // Create Part
        await structureService.createPart(newProject.pr_name, {
          part_title: partData.title,
          part_intro: partData.intro,
          part_number: i + 1
        });

        // Create Chapters for this Part
        if (partData.chapters) {
          for (let j = 0; j < partData.chapters.length; j++) {
            const chapData = partData.chapters[j];
            await structureService.createChapter(newProject.pr_name, partData.title, {
              chapter_title: chapData.title,
              chapter_number: j + 1
            });

            // Create Paragraphs for this Chapter
            if (chapData.paragraphs) {
              for (let k = 0; k < chapData.paragraphs.length; k++) {
                const paraData = chapData.paragraphs[k];
                await structureService.createParagraph(newProject.pr_name, partData.title, chapData.title, {
                  para_name: paraData.name,
                  para_number: k + 1
                });
              }
            }
          }
        }
      }

      // 4. Redirect to Editor
      router.push(`/edit?projectName=${encodeURIComponent(newProject.pr_name)}`);

    } catch (error: any) {
      console.error("Error creating template project:", error);
      alert("Erreur lors de la création du projet : " + (error.message || "Erreur inconnue"));
    } finally {
      setCreatingTemplateId(null);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-[#99334C]" /></div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#99334C] to-[#7a283d] text-white overflow-hidden py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <BookTemplate className="w-16 h-16" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">
            Bibliothèque de Templates
          </h1>
          <div className="flex justify-center mb-8">
            <div className="h-1 w-32 bg-white/50 rounded-full relative">
              <div className="absolute inset-0 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed text-center">
            Gagnez du temps avec nos templates prêts à l'emploi.
            Structures professionnelles pour tous types de cours.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-12 px-6 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un template..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all text-gray-900"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-700">Catégories</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isActive = selectedCategory === category.name;
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${isActive
                        ? 'bg-[#99334C] text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-[#99334C] hover:text-[#99334C]'
                      }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-700">Niveau de difficulté</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {['Tous', 'Débutant', 'Intermédiaire', 'Avancé'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedDifficulty(level)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${selectedDifficulty === level
                      ? 'bg-[#99334C] text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-[#99334C] hover:text-[#99334C]'
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Results Count */}
          <div className="mb-8 flex items-center justify-between">
            <p className="text-gray-600">
              <span className="font-bold text-gray-900">{filteredTemplates.length}</span> template{filteredTemplates.length > 1 ? 's' : ''} trouvé{filteredTemplates.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-20">
              <BookTemplate className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun template trouvé</h3>
              <p className="text-gray-600">Essayez de modifier vos filtres de recherche</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                const IconComponent = template.icon;
                return (
                  <div
                    key={template.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all group"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#99334C]/10 to-[#99334C]/5 p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-[#99334C] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-semibold text-gray-700">{template.rating}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(template.difficulty)}`}>
                          {template.difficulty}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                          {template.category}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                      <p className="text-gray-700 mb-6 line-clamp-3">{template.description}</p>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                          <p className="text-2xl font-bold text-[#99334C] mb-1">{template.parts}</p>
                          <p className="text-xs text-gray-600">Parties</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                          <p className="text-2xl font-bold text-[#99334C] mb-1">{template.chapters}</p>
                          <p className="text-xs text-gray-600">Chapitres</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                          <p className="text-2xl font-bold text-[#99334C] mb-1">{template.downloads}</p>
                          <p className="text-xs text-gray-600">Utilisé</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUseTemplate(template.id, template.name)}
                          disabled={creatingTemplateId !== null}
                          className="flex-1 bg-[#99334C] text-white py-3 rounded-xl font-semibold hover:bg-[#7a283d] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {creatingTemplateId === template.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-5 h-5" />
                          )}
                          {creatingTemplateId === template.id ? 'Création...' : 'Utiliser'}
                        </button>
                        <button
                          className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Author */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>Par {template.author}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-[40px] p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
                backgroundSize: '40px 40px'
              }} />
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Vous ne trouvez pas le template idéal ?
              </h3>
              <p className="text-xl text-white/90 mb-8">
                Créez votre propre structure de cours à partir de zéro
              </p>
              <button
                onClick={() => router.push('/edit-home')}
                className="bg-white text-[#99334C] px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Créer un cours personnalisé
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TemplatesPage;
