"use client";

import React, { useState, useRef, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Loader2, AlertCircle, Bot
} from 'lucide-react';
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

// Components
import TableOfContents from '@/components/Editor/TableOfContents';
import EditorToolbar from '@/components/Editor/EditorToolBar';
import EditorArea from '@/components/Editor/EditorArea';
import RightPanel from '@/components/Editor/RightPanel';
import ChatBotOverlay from '@/components/Editor/ChatBotOverlay';
import ShareOverlay from '@/components/Editor/ShareOverlay';
import EditorHeader from './components/EditorHeader';
import CreationModals from './components/Modals/CreationModals';
import DeleteModal from './components/Modals/DeleteModal';
import EditorSkeletonView from './components/EditorSkeletonView';
import PublishToMarketplaceModal from '@/components/Editor/PublishToMarketplaceModal';

// Services & Utils
import { structureService } from '@/services/structureService';
import { commentService } from '@/services/commentService';
import { localPersistence } from '@/lib/localPersistence';
//import '../../styles/view-transitions.css';

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
    handleUpdateProjectSettings
  } = useEditorState(projectName);

  // Feedback States
  const [pulsingId, setPulsingId] = useState<string | null>(null);
  const [pendingGranule, setPendingGranule] = useState<{ type: 'part' | 'chapter' | 'paragraph' | 'notion'; content: string } | null>(null);

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
  } = useEditorModals(projectName, structure, setStructure, loadProject, setPendingGranule, setPulsingId);

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
  const mockGranules = [
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
  ];

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
        const part = structure.find(p => p.part_id === targetId);
        dropPartTitle = part?.part_title || '';
        if (granule.type === 'notion') {
          const firstChap = part?.chapters?.[0];
          dropChapterTitle = firstChap?.chapter_title || '';
          dropParaName = firstChap?.paragraphs?.[0]?.para_name || '';
        }
      } else if (targetType === 'chapter') {
        const part = structure.find(p => p.part_id === targetParentId);
        dropPartTitle = part?.part_title || '';
        const chapter = part?.chapters?.find(c => c.chapter_id === targetId);
        dropChapterTitle = chapter?.chapter_title || '';
        if (granule.type === 'notion') {
          dropParaName = chapter?.paragraphs?.[0]?.para_name || '';
        }
      } else if (targetType === 'paragraph') {
        for (const p of structure) {
          const ch = p.chapters?.find(c => c.chapter_id === targetParentId);
          if (ch) {
            dropPartTitle = p.part_title;
            dropChapterTitle = ch.chapter_title;
            dropParaName = ch.paragraphs?.find(pa => pa.para_id === targetId)?.para_name || '';
            break;
          }
        }
      }

      if (!dropPartTitle && structure.length > 0) {
        dropPartTitle = currentContext?.partTitle || structure[0].part_title;
        const partObj = structure.find(p => p.part_title === dropPartTitle) || structure[0];
        dropChapterTitle = currentContext?.chapterTitle || partObj.chapters?.[0]?.chapter_title || '';
        const chapObj = partObj.chapters?.find(c => c.chapter_title === dropChapterTitle) || partObj.chapters?.[0];
        dropParaName = currentContext?.paraName || chapObj?.paragraphs?.[0]?.para_name || '';
      }


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
        const partObj = structure.find(p => p.part_title.toLowerCase().trim() === rawPart.toLowerCase().trim()) || structure[0];
        const parentPart = partObj?.part_title || rawPart;

        const rawChap = dropChapterTitle || currentContext?.chapterTitle || (partObj?.chapters?.[0]?.chapter_title || "Chapitre 1");
        const chapObj = partObj?.chapters?.find(c => c.chapter_title.toLowerCase().trim() === rawChap.toLowerCase().trim()) || partObj?.chapters?.[0];
        const parentChapter = chapObj?.chapter_title || rawChap;

        const rawPara = dropParaName || currentContext?.paraName || (chapObj?.paragraphs?.[0]?.para_name || "Paragraphe 1");
        const paraObj = chapObj?.paragraphs?.find(p => p.para_name.toLowerCase().trim() === rawPara.toLowerCase().trim()) || chapObj?.paragraphs?.[0];
        const parentPara = paraObj?.para_name || rawPara;

        const nextNotionNum = (paraObj?.notions?.length || 0) + 1;

        await structureService.createNotion(projectName, parentPart, parentChapter, parentPara, {
          notion_name: effectiveData.notion_name || effectiveData.content || "Nouvelle Notion",
          notion_content: effectiveData.notion_content || effectiveData.previewContent || '',
          notion_number: nextNotionNum
        });
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
            await structureService.createNotion(projectName!, pTitle, cTitle, paName, {
              notion_name: notion.notion_name || notion.content,
              notion_content: notion.notion_content || notion.previewContent || '',
              notion_number: k + 1
            });
          }
        }
      }

      const updatedStructure = await loadProject(true);
      setPendingGranule(null);
      toast.success('Importation réussie !', { id: toastId });
      setTimeout(() => setPulsingId(null), 1000);

    } catch (err: any) {
      console.error("Drop error:", err);
      setPendingGranule(null);
      toast.error("Échec de l'importation: " + (err.message || "Erreur inconnue"), { id: toastId });
    }
  };

  // States remaining in component
  const [rightPanel, setRightPanel] = useState<string | null>(null);
  const [showShareOverlay, setShowShareOverlay] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [tiptapEditor, setTiptapEditor] = useState<any>(null);

  const editorRef = useRef<HTMLDivElement>(null);

  // Cache local pour garantir que la mémoire est TOUJOURS la vérité (Règle n°1)
  const localContentCacheRef = useRef<Record<string, string>>({});

  // Handlers pour la structure (TOC)
  const handleRenameGranule = async (type: string, id: string, oldTitle: string, newTitle: string) => {
    if (!projectName) return;
    try {
      if (type === 'part') {
        await structureService.updatePart(projectName, oldTitle, { part_title: newTitle });
      } else if (type === 'chapter') {
        const part = structure.find(p => p.chapters?.some(c => c.chapter_id === id));
        if (part) await structureService.updateChapter(projectName, part.part_title, oldTitle, { chapter_title: newTitle });
      } else if (type === 'paragraph') {
        const part = structure.find(p => p.chapters?.some(c => c.paragraphs?.some(pa => pa.para_id === id)));
        const chapter = part?.chapters?.find(c => c.paragraphs?.some(pa => pa.para_id === id));
        if (part && chapter) await structureService.updateParagraph(projectName, part.part_title, chapter.chapter_title, oldTitle, { para_name: newTitle });
      } else if (type === 'notion') {
        const part = structure.find(p => p.chapters?.some(c => c.paragraphs?.some(pa => pa.notions?.some(n => n.notion_id === id))));
        const chapter = part?.chapters?.find(c => c.paragraphs?.some(pa => pa.notions?.some(n => n.notion_id === id)));
        const para = chapter?.paragraphs?.find(pa => pa.notions?.some(n => n.notion_id === id));
        if (part && chapter && para) await structureService.updateNotion(projectName, part.part_title, chapter.chapter_title, para.para_name, oldTitle, { notion_name: newTitle });
      }
      loadProject(true);
    } catch (err: any) {
      toast.error("Impossible de renommer l'élément");
    }
  };

  const handleReorderGranule = async (type: string, parentId: string | null, items: any[]) => {
    if (!projectName) return;
    try {
      if (type === 'part') {
        await Promise.all(items.map((item, idx) =>
          structureService.updatePart(projectName, item.part_title, { part_number: idx + 1 })
        ));
      } else {
        await Promise.all(items.map((item, idx) => {
          const itemId = item.chapter_id || item.para_id || item.notion_id;
          return structureService.moveGranule(projectName, type as any, itemId, parentId!, idx + 1);
        }));
      }
      loadProject(true);
    } catch (err: any) {
      toast.error("Échec de la réorganisation");
      loadProject(true);
    }
  };

  const handleMoveGranule = async (type: string, itemId: string, newParentId: string) => {
    if (!projectName) return;
    try {
      await structureService.moveGranule(projectName, type as any, itemId, newParentId);
      loadProject(true);
    } catch (err: any) {
      toast.error("Échec du déplacement");
      loadProject(true);
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
    yDoc
  } = useSynapseSync({
    documentId: synapseDocId,
    userId: authUser?.user_id || 'anonymous',
    userName: `${authUser?.firstname || 'L’Auteur'} ${authUser?.lastname || ''}`.trim(),
    serverUrl: process.env.NEXT_PUBLIC_HOCUSPOCUS_URL || 'ws://localhost:1234',
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

  // ============= NON-BLOCKING AUTO-SAVE ARCHITECTURE =============

  // Change Buffer: Queue de modifications à sauvegarder
  const changeBufferRef = useRef<{
    id: string; // ✅ ID unique pour réconciliation WAL
    context: typeof currentContext;
    content: string;
    timestamp: number;
  }[]>([]);

  // File d'attente pour la sauvegarde (non-bloquant)
  const queueSave = useCallback((ctx: typeof currentContext, content: string) => {
    if (!ctx) return;

    const timestamp = Date.now();
    const contextId = ctx.notion?.notion_id || ctx.part?.part_id || 'unknown';
    const changeId = `${ctx.type}-${contextId}-${timestamp}`;

    // ✅ RÈGLE N°6 : Écrire localement AVANT d'envoyer au serveur (Write-Ahead Log)
    localPersistence.writeChange({
      id: changeId,
      contextType: ctx.type === 'notion' ? 'notion' : 'part',
      contextId: contextId,
      content: content,
      timestamp: timestamp
    }).catch(err => {
      // Fallback localStorage si IndexedDB échoue
      localPersistence.writeChangeToLocalStorage({
        id: changeId,
        contextType: ctx.type === 'notion' ? 'notion' : 'part',
        contextId: contextId,
        content: content,
        timestamp: timestamp
      });
    });

    changeBufferRef.current.push({
      id: changeId,
      context: JSON.parse(JSON.stringify(ctx)), // Deep copy pour éviter mutations
      content: content,
      timestamp: timestamp
    });
  }, []);

  // Fonction de sauvegarde réelle (backend only, pas de reload)
  const saveToBackend = async (ctx: typeof currentContext, content: string) => {
    if (!ctx || !projectName) return;
    // ... rest of the function remains the same but accepts ctx

    try {
      if (ctx.type === 'notion' && ctx.notionName) {
        await structureService.updateNotion(
          projectName,
          ctx.partTitle,
          ctx.chapterTitle!,
          ctx.paraName!,
          ctx.notionName,
          { notion_content: content }
        );
        // Mettre à jour state local immédiatement (pas de reload serveur)
        if (ctx.notion) ctx.notion.notion_content = content;
      } else if (ctx.type === 'part' && ctx.partTitle) {
        await structureService.updatePart(
          projectName,
          ctx.partTitle,
          { part_intro: content }
        );
        // Mettre à jour state local immédiatement (pas de reload serveur)
        if (ctx.part) ctx.part.part_intro = content;
      }
    } catch (err: any) {
      console.error('[Save] Failed:', err);
      // En cas d'échec, la modification reste dans le buffer et sera retentée
      throw err;
    }
  };

  // Worker de sauvegarde en arrière-plan (toutes les 2 secondes)
  useEffect(() => {
    const saveWorker = setInterval(async () => {
      if (changeBufferRef.current.length === 0) return;

      const toSave = changeBufferRef.current.shift(); // FIFO
      if (!toSave) return;

      setIsSaving(true);
      try {
        await saveToBackend(toSave.context, toSave.content);

        // ✅ Marquer comme synchronisé dans le WAL (Règle n°6)
        await localPersistence.markAsSynced(toSave.id);

        // Succès : pas de notification pour auto-save silencieux
      } catch (err) {
        // Échec : remettre en queue pour retry
        changeBufferRef.current.unshift(toSave);
        console.warn('[Save Worker] Retry scheduled');
      } finally {
        setIsSaving(false);
      }
    }, 2000);

    return () => clearInterval(saveWorker);
  }, [projectName]);

  // Fonction publique handleSave (pour Ctrl+S manuel)
  const handleSave = async (isAuto = false) => {
    if (!currentContext || !projectName) return;

    try {
      setIsSaving(true);
      await saveToBackend(currentContext, editorContent);
      setHasUnsavedChanges(false);
      if (!isAuto) toast.success('Sauvegardé !');
    } catch (err: any) {
      toast.error(err.message || "Erreur de sauvegarde");
    } finally {
      setIsSaving(false);
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
    // On ignore les simples mises à jour de contenu pour éviter les rechargements intempestifs
    if (event === 'NOTION_UPDATED') return;

    if (event === 'STRUCTURE_CHANGED' || event === 'COMMENT_ADDED') {
      loadProject(true);
      if (event === 'COMMENT_ADDED') {
        toast.success('💬 Nouveau commentaire');
      }
    }
  }, [loadProject]);

  useRealtimeSync({
    projectName: projectData?.pr_name || projectName || '',
    enabled: !!(projectData?.pr_name || projectName),
    onStructureChange: handleStructureChange
  });

  // Lifecycle
  useEffect(() => {
    loadProject();

    // ✅ RÈGLE N°6 : Rejouer les changements non synchronisés au chargement (Crash Recovery)
    const recoverUnsyncedChanges = async () => {
      try {
        const unsynced = await localPersistence.getUnsyncedChanges();
        if (unsynced.length > 0) {
          console.log(`[Recovery] Found ${unsynced.length} unsynced changes, replaying...`);
          toast.success(`🔄 Récupération de ${unsynced.length} modification(s) non sauvegardée(s)`);

          // Trier chronologiquement pour appliquer les modifs dans le bon ordre
          const sortedChanges = [...unsynced].sort((a, b) => a.timestamp - b.timestamp);

          // Ajouter au cache local (POUR CHARGEMENT IMMÉDIAT) et au buffer
          sortedChanges.forEach(change => {
            localContentCacheRef.current[change.contextId] = change.content;

            changeBufferRef.current.push({
              id: change.id, // ✅ Garder l'id original pour marquer comme sync plus tard
              context: {
                type: change.contextType === 'notion' ? 'notion' : 'part',
                notion: change.contextType === 'notion' ? { notion_id: change.contextId } : undefined,
                part: change.contextType === 'part' ? { part_id: change.contextId } : undefined
              } as any,
              content: change.content,
              timestamp: change.timestamp
            });
          });
        }
      } catch (err) {
        console.error('[Recovery] Failed:', err);
      }
    };

    recoverUnsyncedChanges();
  }, [projectName]);

  /* 
   * DÉSACTIVÉ: Content External Sync
   * Incompatible avec l'architecture local-first.
   * Le state local est la source de vérité pendant l'édition.
   */
  /*
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
        if (foundNotion.notion_content !== editorContent && !hasUnsavedChanges) {
          setEditorContent(foundNotion.notion_content || '');
        }
      }
    }
  }, [structure]);
  */

  // Socratic Debounce
  useEffect(() => {
    if (editorContent && editorContent.length > 50 && !isImporting) analyzeDebounced(editorContent);
  }, [editorContent, analyzeDebounced, isImporting]);

  // AUTO-SAVE: Debounced automatic save every 5 seconds of inactivity
  useEffect(() => {
    if (hasUnsavedChanges && !isSaving && !isImporting && currentContext) {
      const timer = setTimeout(() => {
        console.log("[Auto-save] Queuing save...");
        queueSave(currentContext, editorContent);
        setHasUnsavedChanges(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [editorContent, hasUnsavedChanges, isSaving, isImporting, currentContext, queueSave]);

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
      {/* 1. Sidebar TOC - Pleine Hauteur (Gauche) */}
      {!isZenMode && (
        <>
          <aside style={{ width: `${sidebarWidth}px` }} className="h-full flex flex-col border-r border-gray-100 bg-gray-50/30 shrink-0">
            <TableOfContents
              projectName={projectName || ''}
              structure={structure}
              width={sidebarWidth}
              onSelectNotion={(ctx) => {
                // Queue save en arrière-plan si nécessaire (NON-BLOQUANT)
                if (hasUnsavedChanges && currentContext) {
                  queueSave(currentContext, editorContent);
                }
                // Changement de contexte INSTANTANÉ
                setCurrentContext({
                  type: 'notion',
                  projectName: projectData?.pr_name || '',
                  partTitle: ctx.partTitle,
                  chapterTitle: ctx.chapterTitle,
                  paraName: ctx.paraName,
                  notionName: ctx.notionName,
                  notion: ctx.notion
                });
                // ✅ RÈGLE N°1 : Toujours charger depuis le cache local s'il existe
                const cached = localContentCacheRef.current[ctx.notion.notion_id];
                setEditorContent((cached ?? ctx.notion.notion_content) || '');
                setHasUnsavedChanges(false);
              }}
              onSelectPart={(ctx) => {
                // Queue save en arrière-plan si nécessaire (NON-BLOQUANT)
                if (hasUnsavedChanges && currentContext) {
                  queueSave(currentContext, editorContent);
                }
                // Changement de contexte INSTANTANÉ
                setCurrentContext({
                  type: 'part',
                  projectName: projectData?.pr_name || '',
                  partTitle: ctx.partTitle,
                  part: ctx.part
                });
                // ✅ RÈGLE N°1 : Toujours charger depuis le cache local s'il existe
                const cached = localContentCacheRef.current[ctx.part.part_id];
                setEditorContent((cached ?? ctx.part.part_intro) || '');
                setHasUnsavedChanges(false);
              }}
              onSelectChapter={(pName, cTitle, cId) => {
                // Queue save en arrière-plan si nécessaire (NON-BLOQUANT)
                if (hasUnsavedChanges && currentContext) {
                  queueSave(currentContext, editorContent);
                }
                // Changement de contexte INSTANTANÉ
                setCurrentContext({
                  type: 'chapter',
                  projectName: projectData?.pr_name || '',
                  partTitle: pName,
                  chapterTitle: cTitle,
                  chapterId: cId
                });
                setEditorContent('');
                setHasUnsavedChanges(false);
              }}
              onSelectParagraph={(pName, cTitle, paName, paId) => {
                // Queue save en arrière-plan si nécessaire (NON-BLOQUANT)
                if (hasUnsavedChanges && currentContext) {
                  queueSave(currentContext, editorContent);
                }
                // Changement de contexte INSTANTANÉ
                setCurrentContext({
                  type: 'paragraph',
                  projectName: projectData?.pr_name || '',
                  partTitle: pName,
                  chapterTitle: cTitle,
                  paraName: paName,
                  paraId: paId
                });
                setEditorContent('');
                setHasUnsavedChanges(false);
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
              onDelete={async (type, id, title) => {
                handleDelete(type, id, title);
              }}
              selectedPartId={currentContext?.type === 'part' ? currentContext.part?.part_id || structure.find(p => p.part_title === currentContext.partTitle)?.part_id : undefined}
              selectedChapterId={currentContext?.chapterId}
              selectedParagraphId={currentContext?.paraId}
              selectedNotionId={currentContext?.notion?.notion_id}
              pulsingId={pulsingId}
              pendingGranule={pendingGranule}
              isNotionOpen={currentContext?.type === 'notion'}
              isLoading={isLoading}
            />
          </aside>
          <div onMouseDown={() => setIsResizing(true)} className="w-1 cursor-col-resize hover:bg-[#99334C] transition-colors z-10" />
        </>
      )}

      {/* 2. Centre : Header + Toolbar + Content Area (Sandwich) */}
      <div className={`flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-white ${isZenMode ? 'fixed inset-0 z-[100]' : ''}`}>
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
          onChatToggle={() => setShowChatBot(prev => !prev)}
          textFormat={textFormat}
          disabled={(currentContext?.type === 'chapter' || currentContext?.type === 'paragraph')}
          isZenMode={isZenMode}
          onToggleZen={() => setIsZenMode(prev => !prev)}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 lg:p-12">
          <div className="max-w-4xl mx-auto min-h-full">
            <EditorArea
              key={synapseDocId} // ✅ FORCE LE RE-MONTAGE TOTAL (ZÉRO FUITE SÉCURITÉ MAX)
              docId={synapseDocId}
              content={editorContent}
              placeholder={(() => {
                if (!currentContext) return t('selectPrompt');
                switch (currentContext.type) {
                  case 'part': return t('partPlaceholder');
                  case 'chapter': return t('chapterPlaceholder');
                  case 'paragraph': return t('paragraphPlaceholder');
                  case 'notion': return t('notionPlaceholder');
                  default: return t('selectPrompt');
                }
              })()}
              textFormat={textFormat}
              onChange={(val, updateDocId) => {
                // ✅ RÈGLE D'OR : VÉRIFICATION D'IDENTITÉ (ANTI-FUITE)
                // Si l'éditeur qui envoie le texte ne correspond plus au contexte affiché, ON JETTE.
                if (updateDocId !== synapseDocId) {
                  console.log(`[Identity Lock] Dropped update from stale doc: ${updateDocId} (current: ${synapseDocId})`);
                  return;
                }

                setEditorContent(val);
                setHasUnsavedChanges(true);

                // ✅ RÈGLE N°1 : Cache local pour vérité absolue
                const contextId = currentContext?.notion?.notion_id || currentContext?.part?.part_id;
                if (contextId) {
                  localContentCacheRef.current[contextId] = val;
                }

                // Pour la TOC (référence directe)
                if (currentContext?.type === 'notion' && currentContext.notion) {
                  currentContext.notion.notion_content = val;
                } else if (currentContext?.type === 'part' && currentContext.part) {
                  currentContext.part.part_intro = val;
                }
              }}
              onEditorReady={setTiptapEditor}
              onDrop={handleDropGranule}
              editorRef={editorRef}
              collaboration={collaborationData}
              socraticFeedback={mappedSocraticFeedback as any}
            />
          </div>
        </main>
      </div>

      {/* 3. RightPanel - Pleine Hauteur (Droite) */}
      {!isZenMode && (
        <RightPanel
          activePanel={rightPanel}
          onToggle={(id: string) => {
            if (id === 'assistant') {
              setShowChatBot(prev => !prev);
              return;
            }
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
          onImportFile={() => toast('Importation bientôt disponible')}
          granules={mockGranules}
          onDragStart={handleDragStart}
        />
      )}

      {/* Modals & Overlays */}
      <CreationModals {...{ showPartModal, setShowPartModal, showChapterModal, setShowChapterModal, showParagraphModal, setShowParagraphModal, showNotionModal, setShowNotionModal, modalContext, partFormData, setPartFormData, chapterFormData, setChapterFormData, paragraphFormData, setParagraphFormData, notionFormData, setNotionFormData, isCreatingPart, isCreatingChapter, isCreatingParagraph, isCreatingNotion, handleCreatePart, handleCreateChapter, handleCreateParagraph, handleCreateNotion, confirmCreatePart, confirmCreateChapter, confirmCreateParagraph, confirmCreateNotion }} />
      <DeleteModal config={deleteModalConfig} onClose={() => setDeleteModalConfig(prev => ({ ...prev, isOpen: false }))} onConfirm={() => confirmDelete(structure)} />
      {showShareOverlay && <ShareOverlay projectName={projectName || ''} isOpen={showShareOverlay} onClose={() => setShowShareOverlay(false)} />}
      {showChatBot && <ChatBotOverlay isOpen={showChatBot} onClose={() => setShowChatBot(false)} currentContext={currentContext as any} editorContent={editorContent} />}
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