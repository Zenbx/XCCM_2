"use client";

import React, { useState, useRef, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Loader2, AlertCircle, Bot, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Custom Hooks
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useSynapseSync } from '@/hooks/useSynapseSync';
import { useEditorCommands } from '@/hooks/useEditorCommands';
import { useSocraticAnalysis } from '@/hooks/useSocraticAnalysis';
import { useEditorState } from './hooks/useEditorState';
import { useEditorModals } from './hooks/useEditorModals';
import { useEditorHistory } from '@/hooks/useEditorHistory'; // ✅ Added

// Components
import TableOfContents from '@/components/Editor/TableOfContents';
import EditorToolbar from '@/components/Editor/EditorToolBar';
import EditorArea from '@/components/Editor/EditorArea';
import RightPanel from '@/components/Editor/RightPanel';
import ShareOverlay from '@/components/Editor/ShareOverlay';
import EditorHeader from './components/EditorHeader';
import CreationModals from './components/Modals/CreationModals';
import DeleteModal from './components/Modals/DeleteModal';
import EditorSkeletonView from './components/EditorSkeletonView';
import PublishToMarketplaceModal from '@/components/Editor/PublishToMarketplaceModal';

// Services & Utils
import { structureService } from '@/services/structureService';
import { commentService } from '@/services/commentService';
import '../../styles/view-transitions.css';
import OnboardingModal, { OnboardingStep } from '@/components/Onboarding/OnboardingModal';
import { BookOpen, LayoutGrid, FileEdit, PanelRight, ClipboardList, Wand2 } from 'lucide-react';

const EDITOR_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    icon: <FileEdit className="w-6 h-6" />,
    title: "Votre Éditeur de Contenu",
    description: "Bienvenue dans l'éditeur XCCM2 ! C'est ici que vous créez et structurez vos cours. Votre projet est organisé en Parties > Chapitres > Paragraphes > Notions.",
    accentColor: '#99334C',
  },
  {
    icon: <LayoutGrid className="w-6 h-6" />,
    title: "Barre d'Outils",
    description: "La barre d'outils en haut vous permet de créer des parties, chapitres, paragraphes et notions. Vous y trouverez aussi les options de formatage, sauvegarde et publication.",
    accentColor: '#8b5cf6',
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Table des Matières",
    description: "Le panneau de gauche affiche la structure de votre cours. Cliquez sur un élément pour y naviguer, faites un clic droit pour accéder aux options (renommer, supprimer, déplacer).",
    accentColor: '#22c55e',
  },
  {
    icon: <FileEdit className="w-6 h-6" />,
    title: "Zone d'Édition",
    description: "La zone centrale est votre espace d'écriture. Écrivez le contenu de chaque notion avec un éditeur riche : gras, italique, listes, code, images, et plus encore.",
    accentColor: '#3b82f6',
  },
  {
    icon: <PanelRight className="w-6 h-6" />,
    title: "Panneaux Latéraux",
    description: "Le panneau droit donne accès à des outils avancés : commentaires, historique des modifications, propriétés du document, et le panneau d'exercices.",
    accentColor: '#f59e0b',
  },
  {
    icon: <ClipboardList className="w-6 h-6" />,
    title: "Exercices & IA",
    description: "🎯 Créez des exercices (QCU, QCM, code, texte à trous...) directement depuis le panneau Exercices. 🤖 L'assistant IA vous aide à améliorer votre contenu.",
    accentColor: '#ec4899',
  },
];

const XCCM2Editor = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectName = searchParams.get('projectName');
  const t = useTranslations('editor');
  const tc = useTranslations('common');
  const { user: authUser } = useAuth();

  // Core State Hook
  const {
    projectData,
    comments, setComments,
    structure, setStructure,
    isLoading, setIsLoading,
    isSaving, setIsSaving,
    isImporting,
    error,
    currentContext, setCurrentContext,
    editorContent, setEditorContent,
    hasUnsavedChanges, setHasUnsavedChanges,
    textFormat, setTextFormat,
    loadProject,
    fetchComments, // ✅ Needed for real-time
    handleUpdateProjectSettings
  } = useEditorState(projectName);

  // History Hook
  const { addAction, undo, redo, canUndo, canRedo } = useEditorHistory(50); // ✅ Track structural changes

  // Feedback States
  const [pulsingId, setPulsingId] = useState<string | null>(null);
  const [pendingGranule, setPendingGranule] = useState<{ type: 'part' | 'chapter' | 'paragraph' | 'notion'; content: string } | null>(null);
  const [participantCount, setParticipantCount] = useState(1); // ✅ Added for Smart Sync
  const [isMobileTOCOpen, setIsMobileTOCOpen] = useState(false); // ✅ Responsive state
  const [saveError, setSaveError] = useState<string | null>(null); // ✅ Fine error handling

  // Marketplace Modal State
  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
  const [marketplaceGranule, setMarketplaceGranule] = useState<{
    type: string;
    title: string;
    content?: string;
  } | null>(null);

  // Modals Hook
  const {
    showPartModal, setShowPartModal,
    showChapterModal, setShowChapterModal,
    showParagraphModal, setShowParagraphModal,
    showNotionModal, setShowNotionModal,
    modalContext,
    partFormData, setPartFormData,
    chapterFormData, setChapterFormData,
    paragraphFormData, setParagraphFormData,
    notionFormData, setNotionFormData,
    isCreatingPart, isCreatingChapter, isCreatingParagraph, isCreatingNotion,
    deleteModalConfig,
    handleCreatePart, handleCreateChapter, handleCreateParagraph, handleCreateNotion,
    confirmCreatePart, confirmCreateChapter, confirmCreateParagraph, confirmCreateNotion,
    handleDelete, confirmDelete, setDeleteModalConfig
  } = useEditorModals(projectName, structure, setStructure, loadProject, setPendingGranule, setPulsingId, addAction); // ✅ Pass addAction

  // --- Handlers Editor ---
  const handleInsertImage = () => {
    if (!tiptapEditor) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const img = `<img src="${event.target.result}" style="max-width: 100%; height: auto; display: block; margin: 20px auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />`;
            tiptapEditor.chain().focus().insertContent(img).run();
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Mock Granules for ImportPanel (Strict & Rich Hierarchy: Part > Chapter > Paragraph > Notion)
  const [importableGranules, setImportableGranules] = useState<any[]>([
    {
      id: 'g1',
      type: 'part',
      content: 'Partie 1: Design System & UI',
      icon: 'Folder',
      author: 'Equipe XCCM',
      introduction: 'Cette partie explore les bases des systèmes de design modernes...',
      children: [
        {
          id: 'c1',
          type: 'chapter',
          content: 'Chapitre A: Identité Visuelle',
          icon: 'Book',
          children: [
            {
              id: 'p1',
              type: 'paragraph',
              content: 'Logotype & Symboles',
              icon: 'FileText',
              children: [
                {
                  id: 'n1',
                  type: 'notion',
                  content: 'Boutons Tactiles',
                  icon: 'File',
                  previewContent: 'Le bouton tactile doit avoir un retour haptique visuel...'
                }
              ]
            }
          ]
        },
        {
          id: 'c2',
          type: 'chapter',
          content: 'Chapitre B: Composants Tactiles',
          icon: 'Book',
          children: [
            {
              id: 'p2',
              type: 'paragraph',
              content: 'Saisie de Données',
              icon: 'FileText',
              children: [
                {
                  id: 'n2',
                  type: 'notion',
                  content: 'Inputs Modernes',
                  icon: 'File',
                  previewContent: 'Les champs de saisie doivent être optimisés pour le toucher.'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g3',
      type: 'part',
      content: 'Partie 3: Stratégie Pédagogique',
      icon: 'Folder',
      author: 'Expert EdTech',
      introduction: 'Méthodologies avancées pour la création de parcours d\'apprentissage captivants.',
      children: [
        {
          id: 'c3',
          type: 'chapter',
          content: 'Chapitre 1: Engagement de l\'Apprenant',
          icon: 'Book',
          children: [
            {
              id: 'p3',
              type: 'paragraph',
              content: 'Mécanismes de Gamification',
              icon: 'FileText',
              children: [
                { id: 'n3', type: 'notion', content: 'Récompenses Immédiates', icon: 'File', previewContent: 'L\'importance du feedback visuel instantané.' },
                { id: 'n4', type: 'notion', content: 'Progression Narrative', icon: 'File', previewContent: 'Transformer le cours en une aventure.' },
                { id: 'n5', type: 'notion', content: 'Tableaux de Classement', icon: 'File', previewContent: 'Utiliser la saine compétition.' }
              ]
            },
            {
              id: 'p4',
              type: 'paragraph',
              content: 'Interactivité Cognitive',
              icon: 'FileText',
              children: [
                { id: 'n6', type: 'notion', content: 'Zones Réactives', icon: 'File', previewContent: 'Encourager l\'exploration par le clic.' },
                { id: 'n7', type: 'notion', content: 'Auto-évaluation', icon: 'File', previewContent: 'Quizz rapides intégrés au contenu.' }
              ]
            }
          ]
        }
      ]
    }
  ]);

  const handleDragStart = (e: React.DragEvent, granule: any) => {
    e.dataTransfer.setData('granule', JSON.stringify(granule));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // NOUVEAU: Création récursive (Poupées Russes) avec ciblage amélioré
  // NOUVEAU: Création récursive (Poupées Russes) avec ciblage amélioré
  const handleDropGranule = async (granule: any, targetType?: string, targetId?: string, targetParentId?: string | null) => {
    if (!projectName) return;
    console.log("Dropping granule with target:", { granule, targetType, targetId, targetParentId });

    const toastId = toast.loading(`Importation de "${granule.content}"...`);
    setPendingGranule({ type: granule.type, content: granule.content });

    try {
      // Résolution du contexte de drop
      let dropPartTitle = '';
      let dropChapterTitle = '';
      let dropParaName = '';

      if (targetType === 'part') {
        const part = structure.find(p => p.part_id === targetId) || structure.find(p => p.part_title === currentContext?.partTitle);
        dropPartTitle = part?.part_title || currentContext?.partTitle || (structure[0]?.part_title) || '';
        if (granule.type === 'notion') {
          const firstChap = part?.chapters?.[0];
          dropChapterTitle = firstChap?.chapter_title || '';
          dropParaName = firstChap?.paragraphs?.[0]?.para_name || '';
        }
      } else if (targetType === 'chapter') {
        const part = structure.find(p => p.part_id === targetParentId) || structure.find(p => p.part_title === currentContext?.partTitle);
        dropPartTitle = part?.part_title || currentContext?.partTitle || '';
        const chapter = part?.chapters?.find(c => c.chapter_id === targetId);
        dropChapterTitle = chapter?.chapter_title || currentContext?.chapterTitle || '';
        if (granule.type === 'notion') {
          dropParaName = chapter?.paragraphs?.[0]?.para_name || '';
        }
      } else if (targetType === 'paragraph') {
        let found = false;
        for (const p of structure) {
          const ch = p.chapters?.find(c => c.chapter_id === targetParentId);
          if (ch) {
            dropPartTitle = p.part_title;
            dropChapterTitle = ch.chapter_title;
            dropParaName = ch.paragraphs?.find(pa => pa.para_id === targetId)?.para_name || '';
            found = true;
            break;
          }
        }
        if (!found) {
          dropPartTitle = currentContext?.partTitle || '';
          dropChapterTitle = currentContext?.chapterTitle || '';
          dropParaName = currentContext?.paraName || '';
        }
      }

      // FALLBACK GLOBAL: Si toujours rien, on prend le contexte actuel ou le premier élément
      if (!dropPartTitle && structure.length > 0) {
        dropPartTitle = currentContext?.partTitle || structure[0].part_title;
        const partObj = structure.find(p => p.part_title === dropPartTitle) || structure[0];
        dropPartTitle = partObj.part_title; // Ensure we have the actual name from the object

        if (!dropChapterTitle) {
          dropChapterTitle = currentContext?.chapterTitle || partObj.chapters?.[0]?.chapter_title || '';
        }

        if (!dropParaName && dropChapterTitle) {
          const chapObj = partObj.chapters?.find(c => c.chapter_title === dropChapterTitle) || partObj.chapters?.[0];
          dropParaName = currentContext?.paraName || chapObj?.paragraphs?.[0]?.para_name || '';
        }
      }

      console.log("[Drop Context Resolved]", { dropPartTitle, dropChapterTitle, dropParaName });

      // Tracking du premier granule Notion pour sélection automatique
      let firstNotionToSelect: {
        partTitle: string;
        chapterTitle: string;
        paraName: string;
        notionName: string;
      } | null = null;

      const trackFirstNotion = (pTitle: string, cTitle: string, paName: string, nName: string) => {
        if (!firstNotionToSelect) {
          firstNotionToSelect = { partTitle: pTitle, chapterTitle: cTitle, paraName: paName, notionName: nName };
        }
      };

      // --- DÉTECTION DE CONTENU SÉRIALISÉ (MARKETPLACE) ---
      let effectiveData = granule;
      if (granule.previewContent && (granule.previewContent.startsWith('{') || granule.previewContent.startsWith('['))) {
        try {
          effectiveData = JSON.parse(granule.previewContent);
        } catch (e) {
          console.warn("[Drop] Failed to parse previewContent as JSON");
        }
      }

      if (granule.type === 'part') {
        const nextPartNum = structure.length + 1;
        const newPart = await structureService.createPart(projectName, {
          part_title: effectiveData.part_title || effectiveData.content,
          part_number: nextPartNum,
          part_intro: effectiveData.part_intro || effectiveData.introduction || ''
        });
        setPulsingId(newPart.part_id);

        const chapters = effectiveData.chapters || effectiveData.children;
        if (chapters) {
          for (let i = 0; i < chapters.length; i++) {
            const chap = chapters[i];
            const newChapter = await structureService.createChapter(projectName, newPart.part_title, {
              chapter_title: chap.chapter_title || chap.content,
              chapter_number: i + 1
            });
            await recurseChapter(newPart.part_title, newChapter.chapter_title, chap);
          }
        }
      } else if (granule.type === 'chapter') {
        const parentPart = dropPartTitle || currentContext?.partTitle || structure[structure.length - 1]?.part_title || (structure.length > 0 ? structure[0].part_title : "Partie 1");
        const partObj = structure.find(p => p.part_title.toLowerCase().trim() === parentPart.toLowerCase().trim());
        const nextChapNum = (partObj?.chapters?.length || 0) + 1;

        const newChapter = await structureService.createChapter(projectName, parentPart, {
          chapter_title: effectiveData.chapter_title || effectiveData.content,
          chapter_number: nextChapNum
        });
        setPulsingId(newChapter.chapter_id);
        await recurseChapter(parentPart, newChapter.chapter_title, effectiveData);
      } else if (granule.type === 'paragraph') {
        const parentPart = dropPartTitle || currentContext?.partTitle || structure[structure.length - 1]?.part_title || (structure.length > 0 ? structure[0].part_title : "Partie 1");
        const partObj = structure.find(p => p.part_title.toLowerCase().trim() === parentPart.toLowerCase().trim());
        const parentChapter = dropChapterTitle || currentContext?.chapterTitle || partObj?.chapters?.[0]?.chapter_title || "Chapitre 1";
        const chapObj = partObj?.chapters?.find(c => c.chapter_title.toLowerCase().trim() === parentChapter.toLowerCase().trim());
        const nextParaNum = (chapObj?.paragraphs?.length || 0) + 1;

        const newPara = await structureService.createParagraph(projectName, parentPart, parentChapter, {
          para_name: effectiveData.para_name || effectiveData.content,
          para_number: nextParaNum
        });
        setPulsingId(newPara.para_id);
        await recurseParagraph(parentPart, parentChapter, newPara.para_name, effectiveData);
      } else if (granule.type === 'notion') {
        const rawPart = dropPartTitle || currentContext?.partTitle || (structure.length > 0 ? structure[0].part_title : "Partie 1");
        let partObj = structure.find(p => p.part_title.toLowerCase().trim() === rawPart.toLowerCase().trim()) || structure[0];

        // SÉCURITÉ: Si on n'a vraiment aucune structure, on crée une partie par défaut
        if (!partObj) {
          const newP = await structureService.createPart(projectName, { part_title: "Partie 1", part_number: 1 });
          partObj = { ...newP, chapters: [] };
        }
        const parentPart = partObj.part_title;

        // RÉSOLUTION CHAPITRE (ou création auto)
        let chapObj = partObj.chapters?.find(c => c.chapter_title.toLowerCase().trim() === (dropChapterTitle || currentContext?.chapterTitle || "").toLowerCase().trim()) || partObj.chapters?.[0];

        if (!chapObj) {
          console.log("[Import] No chapter found, creating default...");
          chapObj = await structureService.createChapter(projectName, parentPart, { chapter_title: "Chapitre 1", chapter_number: 1 });
          chapObj.paragraphs = [];
        }
        const parentChapter = chapObj.chapter_title;

        // RÉSOLUTION PARAGRAPHE (ou création auto)
        let paraObj = chapObj.paragraphs?.find(p => p.para_name.toLowerCase().trim() === (dropParaName || currentContext?.paraName || "").toLowerCase().trim()) || chapObj.paragraphs?.[0];

        if (!paraObj) {
          console.log("[Import] No paragraph found, creating default...");
          paraObj = await structureService.createParagraph(projectName, parentPart, parentChapter, { para_name: "Paragraphe 1", para_number: 1 });
        }
        const parentPara = paraObj.para_name;

        const nextNotionNum = (paraObj?.notions?.length || 0) + 1;
        const notionName = effectiveData.notion_name || effectiveData.content || "Nouvelle Notion";

        await structureService.createNotion(projectName, parentPart, parentChapter, parentPara, {
          notion_name: notionName,
          notion_content: effectiveData.notion_content || effectiveData.previewContent || '',
          notion_number: nextNotionNum
        });
        trackFirstNotion(parentPart, parentChapter, parentPara, notionName);
      }

      async function recurseChapter(pTitle: string, cTitle: string, chapData: any) {
        const paragraphs = chapData.paragraphs || chapData.children;
        if (paragraphs) {
          for (let j = 0; j < paragraphs.length; j++) {
            const para = paragraphs[j];
            const newPara = await structureService.createParagraph(projectName!, pTitle, cTitle, {
              para_name: para.para_name || para.content,
              para_number: j + 1
            });
            await recurseParagraph(pTitle, cTitle, newPara.para_name, para);
          }
        }
      }

      async function recurseParagraph(pTitle: string, cTitle: string, paName: string, paraData: any) {
        const notions = paraData.notions || paraData.children;
        if (notions) {
          for (let k = 0; k < notions.length; k++) {
            const notion = notions[k];
            const notionName = notion.notion_name || notion.content;
            await structureService.createNotion(projectName!, pTitle, cTitle, paName, {
              notion_name: notionName,
              notion_content: notion.notion_content || notion.previewContent || '',
              notion_number: k + 1
            });
            trackFirstNotion(pTitle, cTitle, paName, notionName);
          }
        }
      }

      const updatedStructure = await loadProject(true);
      setPendingGranule(null);
      toast.success('Importation réussie !', { id: toastId });
      setTimeout(() => setPulsingId(null), 1000);

      // ✅ Sélection automatique de la première notion importée
      if (firstNotionToSelect && updatedStructure) {
        const { partTitle, chapterTitle, paraName, notionName } = firstNotionToSelect;
        const part = updatedStructure.find((p: any) => p.part_title === partTitle);
        const chap = part?.chapters?.find((c: any) => c.chapter_title === chapterTitle);
        const para = chap?.paragraphs?.find((pa: any) => pa.para_name === paraName);
        const notion = para?.notions?.find((n: any) => n.notion_name === notionName);

        if (notion) {
          const selectUpdate = async () => {
            // CRITIQUE: Ne PAS attendre la sauvegarde (ferait freezer 4s)
            if (hasUnsavedChanges) handleSave(true); // Background save, pas d'await

            setCurrentContext({
              type: 'notion',
              projectName: projectName!,
              partTitle,
              chapterTitle,
              paraName,
              notionName,
              notion
            });
            setEditorContent(notion.notion_content || '');
            setHasUnsavedChanges(false);
          };
          // @ts-ignore
          if (document.startViewTransition) document.startViewTransition(selectUpdate);
          else await selectUpdate();
        }
      }

    } catch (err: any) {
      console.error("Drop error:", err);
      setPendingGranule(null);
      toast.error("Échec de l'importation: " + (err.message || "Erreur inconnue"), { id: toastId });
    }
  };

  // States remaining in component
  const [rightPanel, setRightPanel] = useState<string | null>(null);
  const [showShareOverlay, setShowShareOverlay] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [tiptapEditor, setTiptapEditor] = useState<any>(null);
  const lastSaveTimestamp = useRef<number>(0); // ✅ Prevent transition race conditions
  const isSavingInProgress = useRef<boolean>(false); // ✅ Prevent save concurrency
  const contextVersionRef = useRef<number>(0); // ✅ Prevent stale saves during rapid navigation

  const editorRef = useRef<HTMLDivElement>(null);

  // Handlers pour la structure (TOC)
  const handleRenameGranule = async (type: string, id: string, newTitle: string) => {
    if (!projectName) return;
    try {
      const oldTitle = type === 'part' ? structure.find(p => p.part_id === id)?.part_title :
        type === 'chapter' ? structure.find(p => p.chapters?.some(c => c.chapter_id === id))?.chapters?.find(c => c.chapter_id === id)?.chapter_title :
          type === 'paragraph' ? structure.find(p => p.chapters?.some(c => c.paragraphs?.some(pa => pa.para_id === id)))?.chapters?.flatMap(c => c.paragraphs || []).find(pa => pa.para_id === id)?.para_name :
            structure.find(p => p.chapters?.some(c => c.paragraphs?.some(pa => pa.notions?.some(n => n.notion_id === id))))?.chapters?.flatMap(c => c.paragraphs || []).flatMap(pa => pa.notions || []).find(n => n.notion_id === id)?.notion_name;

      // ✅ UUID-based rename — immunisé aux renommages
      const renameField = type === 'part' ? 'part_title' 
        : type === 'chapter' ? 'chapter_title'
        : type === 'paragraph' ? 'para_name'
        : 'notion_name';
      await structureService.updateGranuleById(projectName, id, { [renameField]: newTitle });

      // ✅ Track history for rename
      if (oldTitle) {
        const renameField = type === 'part' ? 'part_title' 
          : type === 'chapter' ? 'chapter_title'
          : type === 'paragraph' ? 'para_name'
          : 'notion_name';
        addAction({
          type: 'rename',
          description: `Renommer "${oldTitle}" en "${newTitle}"`,
          undo: async () => {
            await structureService.updateGranuleById(projectName!, id, { [renameField]: oldTitle });
            await loadProject(true);
          },
          redo: async () => {
            await structureService.updateGranuleById(projectName!, id, { [renameField]: newTitle });
            await loadProject(true);
          }
        });
      }

      loadProject(true);
    } catch (err: any) {
      toast.error("Impossible de renommer l'élément");
    }
  };

  const handleReorderGranule = async (type: string, parentId: string | null, items: any[]) => {
    if (!projectName) return;

    // 1. Mise à jour OPTIMISTE de la structure (UI instantanée)
    const previousStructure = [...structure];
    setStructure(prev => {
      if (type === 'part') return items; // Simple remplacement pour les parties

      return prev.map(part => {
        // Cas Chapitres (parent = Part)
        if (type === 'chapter' && part.part_id === parentId) {
          return { ...part, chapters: items };
        }

        // Cas Paragraphes/Notions (on doit chercher plus profond)
        return {
          ...part,
          chapters: part.chapters?.map(chapter => {
            if (type === 'paragraph' && chapter.chapter_id === parentId) {
              return { ...chapter, paragraphs: items };
            }
            if (type === 'notion' && chapter.paragraphs) {
              return {
                ...chapter,
                paragraphs: chapter.paragraphs.map(para => {
                  if (para.para_id === parentId) return { ...para, notions: items };
                  return para;
                })
              };
            }
            return chapter;
          })
        };
      });
    });

    try {
      console.log(`[Reorder] Bulk syncing ${items.length} ${type}s...`);

      // Préparer les items pour l'API Bulk
      const bulkItems = items.map((item, idx) => ({
        id: item.part_id || item.chapter_id || item.para_id || item.notion_id,
        number: idx + 1
      }));

      await structureService.reorderGranules(projectName, type as any, bulkItems);

      // Rechargement silencieux pour assurer la cohérence finale
      await loadProject(true);
    } catch (err: any) {
      console.error("[Reorder] Bulk sync failed, rolling back:", err);
      toast.error("Échec du réordonnancement");
      setStructure(previousStructure); // Rollback
      await loadProject(true);
    }
  };

  const handleMoveGranule = async (type: string, itemId: string, newParentId: string) => {
    if (!projectName) return;

    // 1. Mise à jour OPTIMISTE (mouvement entre parents)
    const previousStructure = [...structure];

    // On utilise un helper local pour simuler le move dans l'arbre React
    // (Note: moveInTree est disponible dans TableOfContents, on peut soit le dupliquer soit faire une logique simplifiée ici)
    setStructure(prev => {
      // Logique de move simplifiée : Trouver l'item, le retirer de son ancien parent, l'ajouter au nouveau
      let itemToMove: any = null;

      // Phase A : Extraction + Nettoyage
      const cleanStructure = prev.map(part => {
        if (type === 'chapter' && part.chapters?.find(c => c.chapter_id === itemId)) {
          itemToMove = part.chapters.find(c => c.chapter_id === itemId);
          return { ...part, chapters: part.chapters.filter(c => c.chapter_id !== itemId) };
        }
        return {
          ...part,
          chapters: part.chapters?.map(chapter => {
            if (type === 'paragraph' && chapter.paragraphs?.find(p => p.para_id === itemId)) {
              itemToMove = chapter.paragraphs.find(p => p.para_id === itemId);
              return { ...chapter, paragraphs: chapter.paragraphs.filter(p => p.para_id !== itemId) };
            }
            return {
              ...chapter,
              paragraphs: chapter.paragraphs?.map(para => {
                if (type === 'notion' && para.notions?.find(n => n.notion_id === itemId)) {
                  itemToMove = para.notions.find(n => n.notion_id === itemId);
                  return { ...para, notions: para.notions.filter(n => n.notion_id !== itemId) };
                }
                return para;
              })
            };
          })
        };
      });

      if (!itemToMove) return prev;

      // Phase B : Insertion dans le nouveau parent
      return cleanStructure.map(part => {
        if (type === 'chapter' && part.part_id === newParentId) {
          return { ...part, chapters: [...(part.chapters || []), itemToMove] };
        }
        return {
          ...part,
          chapters: part.chapters?.map(chapter => {
            if (type === 'paragraph' && chapter.chapter_id === newParentId) {
              return { ...chapter, paragraphs: [...(chapter.paragraphs || []), itemToMove] };
            }
            return {
              ...chapter,
              paragraphs: chapter.paragraphs?.map(para => {
                if (type === 'notion' && para.para_id === newParentId) {
                  return { ...para, notions: [...(para.notions || []), itemToMove] };
                }
                return para;
              })
            };
          })
        };
      });
    });

    try {
      await structureService.moveGranule(projectName, type as any, itemId, newParentId);
      await loadProject(true);

      // ✅ Track history for move
      addAction({
        type: 'move',
        description: `Déplacer ${type}`,
        undo: async () => { await loadProject(true); },
        redo: async () => { await loadProject(true); }
      });
    } catch (err: any) {
      console.error("[Move] Failed:", err);
      toast.error("Échec du déplacement");
      setStructure(previousStructure);
      await loadProject(true);
    }
  };

  const handlePublishToMarketplace = (type: string, id: string, title: string) => {
    let content = '';

    if (type === 'notion') {
      const notion = structure.flatMap(p => p.chapters || [])
        .flatMap(c => c.paragraphs || [])
        .flatMap(pa => pa.notions || [])
        .find(n => n.notion_id === id);
      content = notion?.notion_content || '';
    } else if (type === 'part') {
      const part = structure.find(p => p.part_id === id);
      if (part) content = JSON.stringify(part);
    } else if (type === 'chapter') {
      const chapter = structure.flatMap(p => p.chapters || []).find(c => c.chapter_id === id);
      if (chapter) content = JSON.stringify(chapter);
    } else if (type === 'paragraph') {
      const para = structure.flatMap(p => p.chapters || []).flatMap(c => c.paragraphs || []).find(p => p.para_id === id);
      if (para) content = JSON.stringify(para);
    }

    setMarketplaceGranule({ type, title, content });
    setShowMarketplaceModal(true);
  };

  // Socratic AI
  const {
    feedback: socraticFeedback,
    analyzeDebounced,
    setFeedback: setSocraticFeedback,
    bloomScore,
    isAnalyzing,
    analyzeContent
  } = useSocraticAnalysis(currentContext?.type === 'notion' ? currentContext.notion?.notion_id : null);

  const mappedSocraticFeedback = useMemo(() => socraticFeedback.map(f => ({
    id: f.id,
    from: f.sentenceStart,
    to: f.sentenceEnd,
    color: f.highlightColor,
    severity: f.severity,
    comment: f.comment
  })), [socraticFeedback]);

  const dismissFeedback = (id: string) => {
    setSocraticFeedback(prev => prev.filter(f => f.id !== id));
  };

  // Synapse Collaboration
  const synapseDocId = useMemo(() => {
    if (!currentContext) return '';
    if (currentContext.type === 'notion' && currentContext.notion?.notion_id) return `notion-${currentContext.notion.notion_id}`;
    if (currentContext.type === 'part' && currentContext.part?.part_id) return `part-${currentContext.part.part_id}`;
    return '';
  }, [currentContext]);

  const {
    connectedUsers,
    localClientId,
    provider,
    yDoc,
    connectionStatus: synapseStatus,
    reconnect: synapseReconnect,
  } = useSynapseSync({
    documentId: synapseDocId,
    userId: authUser?.user_id || 'anonymous',
    userName: `${authUser?.firstname || 'L’Auteur'} ${authUser?.lastname || ''}`.trim(),
    serverUrl: process.env.NEXT_PUBLIC_HOCUSPOCUS_URL || 'ws://localhost:1234',
    enabled: true // ✅ Always active to ensure seeding and stability
  });

  const collaborationData = useMemo(() => {
    if (!synapseDocId || !provider || !yDoc) return undefined;
    return {
      provider,
      documentId: synapseDocId,
      username: `${authUser?.firstname || 'L’Auteur'} ${authUser?.lastname || ''}`.trim(),
      userColor: '#99334C', // Default color
      colors: ['#99334C', '#2563EB', '#10B981', '#F59E0B'],
      yDoc
    };
  }, [synapseDocId, provider, yDoc, authUser]);

  // Action: Save
  const handleSave = async (isAuto = false) => {
    if (!currentContext || !projectName) return;
    if (isSavingInProgress.current) {
      console.log("[Save] Skip: save already in progress");
      return;
    }

    setSaveError(null); // Clear previous errors

    // ✅ CRDT FIX: If Hocuspocus is managing this Notion via CRDT, skip HTTP save
    // Hocuspocus onStoreDocument handles persistence automatically
    const isCrdtManaged = currentContext.type === 'notion' && synapseDocId && provider && synapseStatus === 'connected';

    if (isCrdtManaged) {
      console.log(`[Save] Skipping HTTP save for Notion (CRDT managed by Hocuspocus)`);
      // Still update the local structure state for UI consistency
      if (currentContext.notionName) {
        setStructure(prev => prev.map(part => {
          if (part.part_title === currentContext.partTitle) {
            return {
              ...part,
              chapters: part.chapters?.map(chapter => {
                if (chapter.chapter_title === currentContext.chapterTitle) {
                  return {
                    ...chapter,
                    paragraphs: chapter.paragraphs?.map(para => {
                      if (para.para_name === currentContext.paraName) {
                        return {
                          ...para,
                          notions: para.notions?.map(notion =>
                            notion.notion_name === currentContext.notionName
                              ? { ...notion, notion_content: editorContent }
                              : notion
                          )
                        };
                      }
                      return para;
                    })
                  };
                }
                return chapter;
              })
            };
          }
          return part;
        }));
      }
      setHasUnsavedChanges(false);
      if (!isAuto) toast.success('☁️ Syncé en temps réel');
      return;
    }

    // ✅ Capture context version to detect stale saves
    const saveVersion = contextVersionRef.current;

    console.log(`[Save] Saving ${currentContext.type} "${currentContext.notionName || currentContext.partTitle}"...`, { isAuto, contentLength: editorContent.length });
    try {
      isSavingInProgress.current = true;
      // Auto-save ne bloque PAS l'interface
      if (!isAuto) setIsSaving(true);

      // ✅ Guard: Abort if context changed during save prep
      if (contextVersionRef.current !== saveVersion) {
        console.log('[Save] Context changed during save, aborting stale save');
        return;
      }

      if (currentContext.type === 'notion' && currentContext.notion?.notion_id) {
        console.log(`[Save] Updating Notion by UUID: ${currentContext.notion.notion_id}`);
        await structureService.updateGranuleById(projectName, currentContext.notion.notion_id, { notion_content: editorContent });
        lastSaveTimestamp.current = Date.now(); // ✅ Update cooldown

        // CRITIQUE: Mettre à jour structure directement pour éviter perte de contenu
        setStructure(prev => prev.map(part => {
          if (part.part_title === currentContext.partTitle) {
            return {
              ...part,
              chapters: part.chapters?.map(chapter => {
                if (chapter.chapter_title === currentContext.chapterTitle) {
                  return {
                    ...chapter,
                    paragraphs: chapter.paragraphs?.map(para => {
                      if (para.para_name === currentContext.paraName) {
                        return {
                          ...para,
                          notions: para.notions?.map(notion =>
                            notion.notion_name === currentContext.notionName
                              ? { ...notion, notion_content: editorContent }
                              : notion
                          )
                        };
                      }
                      return para;
                    })
                  };
                }
                return chapter;
              })
            };
          }
          return part;
        }));

      } else if (currentContext.type === 'part' && currentContext.part?.part_id) {
        await structureService.updateGranuleById(projectName, currentContext.part.part_id, { part_intro: editorContent });

        // CRITIQUE: Mettre à jour structure directement
        setStructure(prev => prev.map(part =>
          part.part_title === currentContext.partTitle
            ? { ...part, part_intro: editorContent }
            : part
        ));
      }

      setHasUnsavedChanges(false);
      setSaveError(null);
      if (!isAuto) toast.success('Sauvegardé !');
    } catch (err: any) {
      console.error("[Save] Error:", err);
      setSaveError(err.message || "Erreur de sauvegarde. Vérifiez votre connexion.");
      if (!isAuto) toast.error(err.message || "Erreur de sauvegarde");
    } finally {
      isSavingInProgress.current = false;
      if (!isAuto) setIsSaving(false);
    }
  };

  // Commands Hook
  useEditorCommands({
    onSave: () => handleSave(),
    onPreview: () => router.push(`/preview?projectName=${projectName}`),
    onShare: () => setShowShareOverlay(true),
    onExport: () => router.push(`/preview?projectName=${projectName}`),
    onToggleZen: () => setIsZenMode(prev => !prev),
  });

  // Real-time Structure sync
  const handleStructureChange = useCallback((event: string) => {
    console.log(`[Realtime] Received event: ${event}`);
    if (event === 'NOTION_UPDATED' || event === 'STRUCTURE_CHANGED') {
      console.log('[Realtime] Reloading structure...');
      loadProject(true); // Silencieux structure update
    } else if (event === 'COMMENT_ADDED') {
      console.log('[Realtime] Fetching comments...');
      fetchComments(); // ✅ Direct comment refresh
      toast.success('💬 Nouveau commentaire', { icon: '💬' });
    }
  }, [loadProject, fetchComments]);

  useRealtimeSync({
    projectName: projectData?.pr_name || projectName || '',
    enabled: !!(projectData?.pr_name || projectName),
    onStructureChange: handleStructureChange,
    onPresenceChange: (count) => setParticipantCount(count) // ✅ Track participants
  });

  // Lifecycle
  useEffect(() => { loadProject(); }, [projectName]);

  // Content External Sync - FIXÉ pour ne pas écraser le contenu de l'utilisateur
  useEffect(() => {
    if (!structure || structure.length === 0) return;
    if (currentContext?.type === 'notion' && currentContext.notionName) {
      const findNotion = () => {
        for (const part of structure) {
          for (const chapter of part.chapters || []) {
            for (const para of chapter.paragraphs || []) {
              const found = para.notions?.find(n => n.notion_id === currentContext.notion?.notion_id);
              if (found) return found;
            }
          }
        }
        return null;
      };
      const foundNotion = findNotion();
      if (foundNotion) {
        // CRITIQUE: Ne jamais écraser le contenu si l'utilisateur est en train d'éditer
        // On sync seulement si c'est un changement externe ET qu'on n'a pas de modifications locales
        // AJOUT: Cooldown de 3 secondes après une sauvegarde locale pour éviter les données "outdated" du serveur
        const isCooldownActive = (Date.now() - lastSaveTimestamp.current) < 3000;
        const isSignificantChange = foundNotion.notion_content !== editorContent;
        const shouldSync = isSignificantChange && !hasUnsavedChanges && !isSaving && !isCooldownActive;

        if (shouldSync) {
          console.log('[Content Sync] Updating from external change', { cooldown: isCooldownActive });
          setEditorContent(foundNotion.notion_content || '');
        }
      }
    }
    else if (currentContext?.type === 'part' && currentContext.partTitle) {
      const foundPart = structure.find(p => p.part_id === currentContext.part?.part_id);
      if (foundPart) {
        const isSignificantChange = foundPart.part_intro !== editorContent;
        const shouldSync = isSignificantChange && !hasUnsavedChanges && !isSaving;

        if (shouldSync) {
          console.log('[Content Sync] Updating part intro from external change');
          setEditorContent(foundPart.part_intro || '');
        }
      }
    }
  }, [structure]);


  // Socratic Debounce
  useEffect(() => {
    if (editorContent && editorContent.length > 50 && !isImporting) analyzeDebounced(editorContent);
  }, [editorContent, analyzeDebounced, isImporting]);

  // AUTO-SAVE: Debounced automatic save every 5 seconds of inactivity
  useEffect(() => {
    if (hasUnsavedChanges && !isSaving && !isImporting) {
      const timer = setTimeout(() => {
        console.log("Auto-saving...");
        handleSave(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [editorContent, hasUnsavedChanges, isSaving, isImporting]);

  // ✅ Global Shortcuts for structural Undo/Redo
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Don't interfere if typing in an input/textarea (let native handling happen for text)
      if (['INPUT', 'TEXTAREA'].includes((e.target as any).tagName)) return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y' || (e.shiftKey && e.key === 'Z')) {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [undo, redo]);

  // Resizing Logic - Exclusive to TOC Sidebar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      if (e.clientX >= 200 && e.clientX <= 600) {
        setSidebarWidth(e.clientX);
      }
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  if (isLoading && !projectData) return <EditorSkeletonView />;

  if (error && !projectData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => router.push('/edit-home')} className="px-6 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] transition-all">Retour</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white overflow-hidden selection:bg-[#99334C]/10 w-full max-w-[100vw]">
      {/* 1. Sidebar TOC - Desktop (Sticky) & Mobile (Drawer) */}
      <AnimatePresence>
        {!isZenMode && (isMobileTOCOpen || sidebarWidth > 0) && (
          <>
            {/* Mobile Backdrop */}
            {isMobileTOCOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileTOCOpen(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60] lg:hidden"
              />
            )}

            <motion.aside
              initial={isMobileTOCOpen ? { x: -320 } : false}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ width: `${sidebarWidth}px` }}
              className={`
                h-full flex flex-col border-r border-gray-100 bg-gray-50/30 shrink-0 z-[70]
                fixed lg:relative lg:flex inset-y-0 left-0
                ${isMobileTOCOpen ? 'flex shadow-2xl' : 'hidden lg:flex'}
              `}
            >
              <div className="lg:hidden absolute right-4 top-4 z-10">
                <button
                  onClick={() => setIsMobileTOCOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-[#99334C] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <TableOfContents
                projectName={projectName || ''}
                structure={structure}
                width={sidebarWidth}
                onSelectNotion={async (ctx) => {
                  const update = async () => {
                    if (hasUnsavedChanges) await handleSave(true);
                    // Lookup ancestor IDs for robust TOC highlight
                    const part = structure.find(p => p.part_title === ctx.partTitle);
                    const chapter = part?.chapters?.find(c => c.chapter_title === ctx.chapterTitle);
                    const paragraph = chapter?.paragraphs?.find(pa => pa.para_name === ctx.paraName);
                    contextVersionRef.current++;
                    setCurrentContext({
                      type: 'notion',
                      projectName: projectData?.pr_name || '',
                      partTitle: ctx.partTitle,
                      chapterTitle: ctx.chapterTitle,
                      chapterId: chapter?.chapter_id,
                      paraName: ctx.paraName,
                      paraId: paragraph?.para_id,
                      notionName: ctx.notionName,
                      notion: ctx.notion,
                      part: part || null,
                      chapter: chapter,
                      paragraph: paragraph
                    });
                    setEditorContent(ctx.notion.notion_content || '');
                    setHasUnsavedChanges(false);
                    setIsMobileTOCOpen(false); // ✅ Auto-close on mobile
                  };
                  // @ts-ignore
                  if (document.startViewTransition) document.startViewTransition(update);
                  else await update();
                }}
                onSelectPart={async (ctx) => {
                  const update = async () => {
                    if (hasUnsavedChanges) await handleSave(true);
                    contextVersionRef.current++;
                    setCurrentContext({
                      type: 'part',
                      projectName: projectData?.pr_name || '',
                      partTitle: ctx.partTitle,
                      part: ctx.part
                    });
                    setEditorContent(ctx.part.part_intro || '');
                    setHasUnsavedChanges(false);
                    setIsMobileTOCOpen(false); // ✅ Auto-close on mobile
                  };
                  // @ts-ignore
                  if (document.startViewTransition) document.startViewTransition(update);
                  else await update();
                }}
                onSelectChapter={async (pName, cTitle, cId) => {
                  const update = async () => {
                    if (hasUnsavedChanges) await handleSave(true);
                    const part = structure.find(p => p.part_title === pName);
                    const chapter = part?.chapters?.find(c => c.chapter_id === cId);

                    contextVersionRef.current++;
                    setCurrentContext({
                      type: 'chapter',
                      projectName: projectData?.pr_name || '',
                      partTitle: pName,
                      chapterTitle: cTitle,
                      chapterId: cId,
                      chapter: chapter,
                      part: part || null
                    });
                    setEditorContent(chapter?.chapter_intro || '');
                    setHasUnsavedChanges(false);
                    setIsMobileTOCOpen(false); // ✅ Auto-close on mobile
                  };
                  // @ts-ignore
                  if (document.startViewTransition) document.startViewTransition(update);
                  else await update();
                }}
                onSelectParagraph={async (pName, cTitle, paName, paId) => {
                  const update = async () => {
                    if (hasUnsavedChanges) await handleSave(true);
                    const part = structure.find(p => p.part_title === pName);
                    const chapter = part?.chapters?.find(c => c.chapter_title === cTitle);
                    const paragraph = chapter?.paragraphs?.find(pa => pa.para_id === paId);

                    contextVersionRef.current++;
                    setCurrentContext({
                      type: 'paragraph',
                      projectName: projectData?.pr_name || '',
                      partTitle: pName,
                      chapterTitle: cTitle,
                      chapterId: chapter?.chapter_id,
                      paraName: paName,
                      paraId: paId,
                      paragraph: paragraph,
                      part: part || null,
                      chapter: chapter
                    });
                    setEditorContent(paragraph?.para_intro || '');
                    setHasUnsavedChanges(false);
                    setIsMobileTOCOpen(false); // ✅ Auto-close on mobile
                  };
                  // @ts-ignore
                  if (document.startViewTransition) document.startViewTransition(update);
                  else await update();
                }}
                onPublishToMarketplace={handlePublishToMarketplace}
                onCreatePart={handleCreatePart}
                onCreateChapter={handleCreateChapter}
                onCreateParagraph={handleCreateParagraph}
                onCreateNotion={handleCreateNotion}
                onRename={handleRenameGranule}
                onReorder={handleReorderGranule}
                onMove={handleMoveGranule}
                onExternalDrop={handleDropGranule}
                onDelete={async (type, id) => {
                  const findTitle = () => {
                    if (type === 'part') return structure.find(p => p.part_id === id)?.part_title;
                    if (type === 'chapter') return structure.flatMap(p => p.chapters || []).find(c => c.chapter_id === id)?.chapter_title;
                    if (type === 'paragraph') return structure.flatMap(p => p.chapters || []).flatMap(c => c.paragraphs || []).find(pa => pa.para_id === id)?.para_name;
                    if (type === 'notion') return structure.flatMap(p => p.chapters || []).flatMap(c => c.paragraphs || []).flatMap(pa => pa.notions || []).find(n => n.notion_id === id)?.notion_name;
                    return '';
                  };
                  handleDelete(type, id, findTitle() || '');
                }}
                selectedPartId={currentContext?.type === 'part' ? (currentContext?.part?.part_id || structure.find(p => p.part_title === currentContext?.partTitle)?.part_id) : undefined}
                selectedChapterId={currentContext?.type === 'chapter' ? currentContext?.chapterId : undefined}
                selectedParagraphId={currentContext?.type === 'paragraph' ? currentContext?.paraId : undefined}
                selectedNotionId={currentContext?.type === 'notion' ? currentContext?.notion?.notion_id : undefined}
                pulsingId={pulsingId}
                pendingGranule={pendingGranule}
                isNotionOpen={currentContext?.type === 'notion'}
                isLoading={isLoading}
              />
            </motion.aside>
            <div onMouseDown={() => setIsResizing(true)} className="hidden lg:block w-1 cursor-col-resize hover:bg-[#99334C] transition-colors z-10" />
          </>
        )}
      </AnimatePresence>

      {/* 2. Centre : Header + Toolbar + Content Area (Sandwich) */}
      <div className={`flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-white dark:bg-gray-900 ${isZenMode ? 'fixed inset-0 z-[100]' : ''}`}>
        {!isZenMode && (
          <EditorHeader
            projectName={projectName || ''}
            projectData={projectData}
            currentContext={currentContext}
            t={t}
            hasUnsavedChanges={hasUnsavedChanges}
            onSave={handleSave}
            onShare={() => setShowShareOverlay(true)}
            onPreview={() => router.push(`/preview?projectName=${encodeURIComponent(projectData?.pr_name || '')}`)}
            isSaving={isSaving}
            connectedUsers={connectedUsers}
            localClientId={localClientId}
            authUser={authUser}
            connectionStatus={synapseStatus}
            onReconnect={synapseReconnect}
            onToggleMobileTOC={() => setIsMobileTOCOpen(prev => !prev)}
          />
        )}

        <EditorToolbar
          onInsertImage={handleInsertImage}
          onFormatChange={(cmd) => {
            if (!tiptapEditor) return;
            const chain = tiptapEditor.chain().focus();

            if (cmd.startsWith('color:')) {
              chain.setColor(cmd.split(':')[1]).run();
              return;
            }

            switch (cmd) {
              case 'bold': chain.toggleBold().run(); break;
              case 'italic': chain.toggleItalic().run(); break;
              case 'underline': chain.toggleUnderline().run(); break;
              case 'strikethrough': chain.toggleStrike().run(); break;
              case 'justifyLeft': chain.setTextAlign('left').run(); break;
              case 'justifyCenter': chain.setTextAlign('center').run(); break;
              case 'justifyRight': chain.setTextAlign('right').run(); break;
              case 'justifyFull': chain.setTextAlign('justify').run(); break;
              case 'indent': chain.indent().run(); break;
              case 'outdent': chain.outdent().run(); break;
              case 'insertUnorderedList': chain.toggleBulletList().run(); break;
              case 'insertOrderedList': chain.toggleOrderedList().run(); break;
              case 'undo': chain.undo().run(); break;
              case 'redo': chain.redo().run(); break;
              default: console.warn('Unknown command:', cmd);
            }
          }}
          onFontChange={(e) => setTextFormat(prev => ({ ...prev, font: e.target.value }))}
          onFontSizeChange={(e) => setTextFormat(prev => ({ ...prev, fontSize: e.target.value }))}
          onChatToggle={() => setRightPanel(prev => prev === 'ai' ? null : 'ai')}
          textFormat={textFormat}
          disabled={!currentContext}
          isZenMode={isZenMode}
          onToggleZen={() => setIsZenMode(prev => !prev)}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 lg:p-12">
          <div className="max-w-4xl mx-auto min-h-full">
            <EditorArea
              key={collaborationData ? collaborationData.documentId : currentContext?.type + "-" + ((currentContext as any)?.[(currentContext?.type || '') + 'Id'] || 'no-id')}
              content={editorContent}
              textFormat={textFormat}
              onChange={(val) => {
                setEditorContent(val);
                setHasUnsavedChanges(true);
              }}
              onEditorReady={setTiptapEditor}
              onDrop={handleDropGranule}
              editorRef={editorRef}
              placeholder={
                !currentContext
                  ? "Sélectionnez ou créez une notion pour commencer..."
                  : structure.length === 0
                    ? "Créez votre première partie avec le bouton + dans la barre latérale"
                    : currentContext.type === 'notion'
                      ? "Commencez à écrire... Tapez / pour des commandes rapides"
                      : currentContext.type === 'chapter'
                        ? "Rédigez l'introduction de ce chapitre..."
                        : currentContext.type === 'paragraph'
                          ? "Rédigez l'introduction de ce paragraphe..."
                          : currentContext.type === 'part'
                            ? "Rédigez l'introduction de cette partie..."
                            : "Sélectionnez un élément pour éditer"
              }
              collaboration={collaborationData}
              socraticFeedback={mappedSocraticFeedback as any}
              currentContext={currentContext}
              saveError={saveError}
              onRetrySave={() => handleSave(false)}
            />
          </div>
        </main>
      </div>

      {/* 3. RightPanel - Pleine Hauteur (Droite) */}
      {!isZenMode && (
        <RightPanel
          activePanel={rightPanel}
          onToggle={(id: string) => {
            setRightPanel(prev => prev === id ? null : id);
          }}
          comments={comments}
          onAddComment={async (c: any) => {
            const newC = await commentService.addComment(projectName!, c);
            setComments(prev => [newC, ...prev]);
          }}
          onDeleteComment={async (id: string) => {
            await commentService.deleteComment(projectName!, id);
            setComments(prev => prev.filter(c => c.comment_id !== id));
          }}
          project={projectData}
          structure={structure}
          currentContext={currentContext}
          onUpdateProject={(data: any) => handleUpdateProjectSettings(data, router)}
          onImportFile={(newGranules: any) => {
            console.log("Importing granules:", newGranules);
            setImportableGranules(prev => [...newGranules, ...prev]);
            toast.success(`${newGranules.length} granules importés !`);
          }}
          granules={importableGranules}
          onDragStart={handleDragStart}
          socraticData={{
            feedback: socraticFeedback,
            bloomScore,
            isAnalyzing,
            analyzeContent,
            onDismissFeedback: dismissFeedback
          }}
          editorContent={editorContent}
          onNavigateToGranule={(ctx: any) => {
            // Navigate to the granule corresponding to an exercise
            if (ctx.type === 'part') {
              const part = structure.find((p: any) => p.part_title === ctx.partTitle);
              if (part) {
                setCurrentContext({
                  type: 'part',
                  projectName: projectData?.pr_name || '',
                  partTitle: ctx.partTitle,
                  part
                });
                setEditorContent(part.part_intro || '');
                setHasUnsavedChanges(false);
              }
            } else if (ctx.type === 'chapter') {
              const part = structure.find((p: any) => p.part_title === ctx.partTitle);
              const chapter = part?.chapters?.find((c: any) => c.chapter_title === ctx.chapterTitle);
              if (chapter) {
                setCurrentContext({
                  type: 'chapter',
                  projectName: projectData?.pr_name || '',
                  partTitle: ctx.partTitle,
                  chapterTitle: ctx.chapterTitle,
                  chapterId: chapter.chapter_id,
                  chapter
                });
                setEditorContent(chapter.chapter_intro || '');
                setHasUnsavedChanges(false);
              }
            } else if (ctx.type === 'paragraph') {
              const part = structure.find((p: any) => p.part_title === ctx.partTitle);
              const chapter = part?.chapters?.find((c: any) => c.chapter_title === ctx.chapterTitle);
              const para = chapter?.paragraphs?.find((pa: any) => pa.para_name === ctx.paraName);
              if (para) {
                setCurrentContext({
                  type: 'paragraph',
                  projectName: projectData?.pr_name || '',
                  partTitle: ctx.partTitle,
                  chapterTitle: ctx.chapterTitle,
                  paraName: ctx.paraName,
                  paraId: para.para_id,
                  paragraph: para
                });
                setEditorContent(para.para_intro || '');
                setHasUnsavedChanges(false);
              }
            } else if (ctx.type === 'notion') {
              const part = structure.find((p: any) => p.part_title === ctx.partTitle);
              const chapter = part?.chapters?.find((c: any) => c.chapter_title === ctx.chapterTitle);
              const para = chapter?.paragraphs?.find((pa: any) => pa.para_name === ctx.paraName);
              const notion = para?.notions?.find((n: any) => n.notion_name === ctx.notionName);
              if (notion) {
                setCurrentContext({
                  type: 'notion',
                  projectName: projectData?.pr_name || '',
                  partTitle: ctx.partTitle,
                  chapterTitle: ctx.chapterTitle,
                  paraName: ctx.paraName,
                  notionName: ctx.notionName,
                  notion
                });
                setEditorContent(notion.notion_content || '');
                setHasUnsavedChanges(false);
              }
            }
          }}
        />
      )}

      {/* Modals & Overlays */}
      <CreationModals {...{ showPartModal, setShowPartModal, showChapterModal, setShowChapterModal, showParagraphModal, setShowParagraphModal, showNotionModal, setShowNotionModal, modalContext, partFormData, setPartFormData, chapterFormData, setChapterFormData, paragraphFormData, setParagraphFormData, notionFormData, setNotionFormData, isCreatingPart, isCreatingChapter, isCreatingParagraph, isCreatingNotion, handleCreatePart, handleCreateChapter, handleCreateParagraph, handleCreateNotion, confirmCreatePart, confirmCreateChapter, confirmCreateParagraph, confirmCreateNotion }} />
      <DeleteModal config={deleteModalConfig} onClose={() => setDeleteModalConfig(prev => ({ ...prev, isOpen: false }))} onConfirm={() => confirmDelete(structure)} />
      {showShareOverlay && <ShareOverlay projectName={projectName || ''} isOpen={showShareOverlay} onClose={() => setShowShareOverlay(false)} />}
      <PublishToMarketplaceModal
        isOpen={showMarketplaceModal}
        onClose={() => setShowMarketplaceModal(false)}
        granuleData={marketplaceGranule}
      />

      {isZenMode && (
        <style jsx global>{`
          header { display: none !important; }
        `}</style>
      )}

      {/* ═══════ ONBOARDING ═══════ */}
      <OnboardingModal
        flowId="editor"
        title="L'Éditeur XCCM2"
        subtitle="Découvrez les outils pour créer des cours professionnels."
        steps={EDITOR_ONBOARDING_STEPS}
      />


    </div>
  );
};

export default function EditPage() {
  return (
    <Suspense fallback={<EditorSkeletonView />}>
      <XCCM2Editor />
    </Suspense>
  );
}