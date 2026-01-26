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
import { structureService, Part } from '@/services/structureService';
import { commentService } from '@/services/commentService';
import { localPersistence } from '@/lib/localPersistence';

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
    localContentCacheRef,
    activeDocIdRef,
    patchStructureWithCache,
    handleUpdateProjectSettings
  } = useEditorState(projectName);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pulsingId, setPulsingId] = useState<string | null>(null);
  const [pendingGranule, setPendingGranule] = useState<{ type: 'part' | 'chapter' | 'paragraph' | 'notion'; content: string } | null>(null);

  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
  const [marketplaceGranule, setMarketplaceGranule] = useState<{
    type: string;
    title: string;
    content?: string;
  } | null>(null);

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

  const [rightPanel, setRightPanel] = useState<string | null>(null);
  const [showShareOverlay, setShowShareOverlay] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [tiptapEditor, setTiptapEditor] = useState<any>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastDocChangeTimeRef = useRef<number>(0);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    }
  ];

  const handleDragStart = (e: React.DragEvent, granule: any) => {
    e.dataTransfer.setData('granule', JSON.stringify(granule));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDropGranule = async (granule: any, targetType?: string, targetId?: string, targetParentId?: string | null) => {
    if (!projectName) return;
    const toastId = toast.loading(`Importation de "${granule.content}"...`);
    setPendingGranule({ type: granule.type, content: granule.content });

    try {
      let dropPartTitle = '';
      let dropChapterTitle = '';
      let dropParaName = '';

      if (targetType === 'part') {
        const part = structure.find(p => p.part_id === targetId);
        dropPartTitle = part?.part_title || '';
      } else if (targetType === 'chapter') {
        const part = structure.find(p => p.part_id === targetParentId);
        dropPartTitle = part?.part_title || '';
        const chapter = part?.chapters?.find(c => c.chapter_id === targetId);
        dropChapterTitle = chapter?.chapter_title || '';
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

      let effectiveData = granule;
      if (granule.previewContent && (granule.previewContent.startsWith('{') || granule.previewContent.startsWith('['))) {
        try { effectiveData = JSON.parse(granule.previewContent); } catch (e) { }
      }

      const recurseParagraph = async (pTitle: string, cTitle: string, paName: string, paraData: any) => {
        const notions = paraData.notions || paraData.children;
        if (notions && notions.length > 0) {
          for (let k = 0; k < notions.length; k++) {
            const notion = notions[k];
            await structureService.createNotion(projectName, pTitle, cTitle, paName, {
              notion_name: notion.notion_name || notion.content || "Nouvelle Notion",
              notion_content: notion.notion_content || notion.previewContent || '',
              notion_number: k + 1
            });
          }
        }
      };

      const recurseChapter = async (pTitle: string, cTitle: string, chapData: any) => {
        const paragraphs = chapData.paragraphs || chapData.children;
        if (paragraphs && paragraphs.length > 0) {
          for (let j = 0; j < paragraphs.length; j++) {
            const para = paragraphs[j];
            const newPara = await structureService.createParagraph(projectName, pTitle, cTitle, {
              para_name: para.para_name || para.content || "Nouveau Paragraphe",
              para_number: j + 1
            });
            await recurseParagraph(pTitle, cTitle, newPara.para_name, para);
          }
        }
      };

      if (granule.type === 'part') {
        const nextPartNum = structure.length + 1;
        const newPart = await structureService.createPart(projectName, {
          part_title: effectiveData.part_title || effectiveData.content || "Nouvelle Partie",
          part_number: nextPartNum,
          part_intro: effectiveData.part_intro || effectiveData.introduction || ''
        });
        setPulsingId(newPart.part_id);
        const chapters = effectiveData.chapters || effectiveData.children;
        if (chapters && chapters.length > 0) {
          for (let i = 0; i < chapters.length; i++) {
            const chap = chapters[i];
            const newChapter = await structureService.createChapter(projectName, newPart.part_title, {
              chapter_title: chap.chapter_title || chap.content || "Nouveau Chapitre",
              chapter_number: i + 1
            });
            await recurseChapter(newPart.part_title, newChapter.chapter_title, chap);
          }
        }
      } else if (granule.type === 'chapter') {
        const parentPart = dropPartTitle || currentContext?.partTitle || (structure.length > 0 ? structure[structure.length - 1].part_title : "Partie 1");
        const newChapter = await structureService.createChapter(projectName, parentPart, {
          chapter_title: effectiveData.chapter_title || effectiveData.content || "Nouveau Chapitre",
          chapter_number: 1
        });
        setPulsingId(newChapter.chapter_id);
        await recurseChapter(parentPart, newChapter.chapter_title, effectiveData);
      } else if (granule.type === 'paragraph') {
        const parentPart = dropPartTitle || currentContext?.partTitle || (structure.length > 0 ? structure[structure.length - 1].part_title : "Partie 1");
        const parentChapter = dropChapterTitle || "Chapitre 1";
        const newPara = await structureService.createParagraph(projectName, parentPart, parentChapter, {
          para_name: effectiveData.para_name || effectiveData.content || "Nouveau Paragraphe",
          para_number: 1
        });
        setPulsingId(newPara.para_id);
        await recurseParagraph(parentPart, parentChapter, newPara.para_name, effectiveData);
      } else if (granule.type === 'notion') {
        const parentPart = dropPartTitle || currentContext?.partTitle || "Partie 1";
        const parentChapter = dropChapterTitle || "Chapitre 1";
        const parentPara = dropParaName || "Paragraphe 1";
        await structureService.createNotion(projectName, parentPart, parentChapter, parentPara, {
          notion_name: effectiveData.notion_name || effectiveData.content || "Nouvelle Notion",
          notion_content: effectiveData.notion_content || effectiveData.previewContent || '',
          notion_number: 1
        });
      }

      await loadProject(true);
      setPendingGranule(null);
      toast.success('Importation réussie !', { id: toastId });
      setTimeout(() => setPulsingId(null), 1000);
    } catch (err: any) {
      setPendingGranule(null);
      toast.error("Échec de l'importation", { id: toastId });
    }
  };

  const handleRenameGranule = async (type: string, id: string, oldTitle: string, newTitle: string) => {
    if (!projectName) return;
    try {
      if (type === 'part') await structureService.updatePart(projectName, oldTitle, { part_title: newTitle });
      else if (type === 'chapter') {
        const part = structure.find(p => p.chapters?.some(c => c.chapter_id === id));
        if (part) await structureService.updateChapter(projectName, part.part_title, oldTitle, { chapter_title: newTitle });
      }
      loadProject(true);
    } catch (err) { toast.error("Erreur renommage"); }
  };

  const handleReorderGranule = async (type: string, parentId: string | null, items: any[]) => {
    if (!projectName) return;
    try {
      if (type === 'part') {
        await Promise.all(items.map((item, idx) => structureService.updatePart(projectName, item.part_title, { part_number: idx + 1 })));
      }
      loadProject(true);
    } catch (err) { loadProject(true); }
  };

  const handleMoveGranule = async (type: string, itemId: string, newParentId: string) => {
    if (!projectName) return;
    try {
      await structureService.moveGranule(projectName, type as any, itemId, newParentId);
      loadProject(true);
    } catch (err) { loadProject(true); }
  };

  const handlePublishToMarketplace = (type: string, id: string, title: string) => {
    setMarketplaceGranule({ type, title });
    setShowMarketplaceModal(true);
  };

  const { feedback: socraticFeedback, analyzeDebounced } = useSocraticAnalysis(currentContext?.type === 'notion' ? currentContext.notion?.notion_id : null);
  const mappedSocraticFeedback = useMemo(() => socraticFeedback.map(f => ({ id: f.id, from: f.sentenceStart, to: f.sentenceEnd, color: f.highlightColor, severity: f.severity, comment: f.comment })), [socraticFeedback]);

  const synapseDocId = useMemo(() => {
    if (!currentContext) return '';
    if (currentContext.type === 'notion' && currentContext.notion?.notion_id) return `notion-${currentContext.notion.notion_id}`;
    if (currentContext.type === 'part' && currentContext.part?.part_id) return `part-${currentContext.part.part_id}`;
    return '';
  }, [currentContext]);

  const authToken = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; auth_token=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  }, []);

  const { connectedUsers, localClientId, provider, yDoc } = useSynapseSync({
    documentId: synapseDocId,
    userId: authUser?.user_id || 'anonymous',
    userName: `${authUser?.firstname || 'L’Auteur'} ${authUser?.lastname || ''}`.trim(),
    serverUrl: process.env.NEXT_PUBLIC_HOCUSPOCUS_URL || 'ws://localhost:1234',
    token: authToken,
  });

  const collaborationData = useMemo(() => {
    if (!synapseDocId || !provider || !yDoc) return undefined;
    return { provider, documentId: synapseDocId, username: `${authUser?.firstname || 'L’Auteur'} ${authUser?.lastname || ''}`.trim(), userColor: '#99334C', colors: ['#99334C', '#2563EB', '#10B981', '#F59E0B'], yDoc };
  }, [synapseDocId, provider, yDoc, authUser]);

  const changeBufferRef = useRef<any[]>([]);

  const queueSave = useCallback((ctx: any, content: string) => {
    if (!ctx) return;
    const timestamp = Date.now();
    const contextId = ctx.notion?.notion_id || ctx.part?.part_id || 'unknown';
    const changeId = `${ctx.type}-${contextId}-${timestamp}`;

    localPersistence.writeChange({ id: changeId, contextType: ctx.type === 'notion' ? 'notion' : 'part', contextId: contextId, content: content, timestamp: timestamp }).catch(() => { });
    changeBufferRef.current.push({ id: changeId, context: JSON.parse(JSON.stringify(ctx)), content: content, timestamp: timestamp });
  }, []);

  const saveToBackend = async (ctx: any, content: string) => {
    if (!ctx || !projectName) return;
    if (ctx.type === 'notion' && ctx.notionName) {
      await structureService.updateNotion(projectName, ctx.partTitle, ctx.chapterTitle!, ctx.paraName!, ctx.notionName, { notion_content: content });
    } else if (ctx.type === 'part' && ctx.partTitle) {
      await structureService.updatePart(projectName, ctx.partTitle, { part_intro: content });
    }
  };

  useEffect(() => {
    const saveWorker = setInterval(async () => {
      if (changeBufferRef.current.length === 0) return;
      const toSave = changeBufferRef.current.shift();
      if (!toSave) return;
      setIsSaving(true);
      try {
        await saveToBackend(toSave.context, toSave.content);
        await localPersistence.markAsSynced(toSave.id);
      } catch (err) { changeBufferRef.current.unshift(toSave); } finally { setIsSaving(false); }
    }, 2000);
    return () => clearInterval(saveWorker);
  }, [projectName]);

  const handleSave = async () => {
    if (!currentContext || !projectName) return;
    setIsSaving(true);
    try {
      await saveToBackend(currentContext, editorContent);
      setHasUnsavedChanges(false);
      toast.success('Sauvegardé !');
    } catch (err) { toast.error("Erreur sauvegarde"); } finally { setIsSaving(false); }
  };

  useEditorCommands({
    onSave: () => handleSave(),
    onPreview: () => router.push(`/preview?projectName=${projectName}`),
    onShare: () => setShowShareOverlay(true),
    onExport: () => router.push(`/preview?projectName=${projectName}`),
    onToggleZen: () => setIsZenMode(prev => !prev),
  });

  const handleStructureChange = useCallback((event: string) => {
    if (event !== 'NOTION_UPDATED') loadProject(true);
  }, [loadProject]);

  useRealtimeSync({ projectName: projectData?.pr_name || projectName || '', enabled: !!(projectData?.pr_name || projectName), onStructureChange: handleStructureChange });

  useEffect(() => {
    loadProject();
  }, [projectName]);

  if (isLoading && !projectData) return <EditorSkeletonView />;
  if (error && !projectData) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={() => router.push('/edit-home')} className="px-6 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] transition-all">Retour</button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-white overflow-hidden selection:bg-[#99334C]/10 w-full max-w-[100vw]">
      {!isZenMode && (
        <>
          <aside style={{ width: `${sidebarWidth}px` }} className="h-full flex flex-col border-r border-gray-100 bg-gray-50/30 shrink-0">
            <TableOfContents
              projectName={projectName || ''}
              structure={structure}
              width={sidebarWidth}
              onSelectNotion={(ctx) => {
                const targetId = `notion-${ctx.notion.notion_id}`;
                const prevId = currentContext?.notion?.notion_id || currentContext?.part?.part_id;
                let trueContent = editorContent;
                if (tiptapEditor && !tiptapEditor.isDestroyed) { try { trueContent = tiptapEditor.getHTML(); } catch (e) { } }
                if (prevId) localContentCacheRef.current[prevId] = trueContent;
                if (hasUnsavedChanges && prevId && currentContext) { queueSave(currentContext, trueContent); }
                if (autoSaveTimerRef.current) { clearTimeout(autoSaveTimerRef.current); autoSaveTimerRef.current = null; }

                setIsTransitioning(true);
                setTimeout(() => {
                  activeDocIdRef.current = targetId;
                  lastDocChangeTimeRef.current = Date.now();
                  setCurrentContext({ type: 'notion', ...ctx });
                  const cached = localContentCacheRef.current[ctx.notion.notion_id];
                  setEditorContent((cached ?? ctx.notion.notion_content) || '');
                  setHasUnsavedChanges(false);
                  setIsTransitioning(false);
                }, 300);
              }}
              onSelectPart={(ctx) => {
                const targetId = `part-${ctx.part.part_id}`;
                const prevId = currentContext?.notion?.notion_id || currentContext?.part?.part_id;
                let trueContent = editorContent;
                if (tiptapEditor && !tiptapEditor.isDestroyed) { try { trueContent = tiptapEditor.getHTML(); } catch (e) { } }
                if (prevId) localContentCacheRef.current[prevId] = trueContent;
                if (hasUnsavedChanges && prevId && currentContext) { queueSave(currentContext, trueContent); }
                if (autoSaveTimerRef.current) { clearTimeout(autoSaveTimerRef.current); autoSaveTimerRef.current = null; }

                setIsTransitioning(true);
                setTimeout(() => {
                  activeDocIdRef.current = targetId;
                  lastDocChangeTimeRef.current = Date.now();
                  setCurrentContext({ type: 'part', ...ctx });
                  const cached = localContentCacheRef.current[ctx.part.part_id];
                  setEditorContent((cached ?? ctx.part.part_intro) || '');
                  setHasUnsavedChanges(false);
                  setIsTransitioning(false);
                }, 300);
              }}
              onSelectChapter={(pName, cTitle, cId) => {
                const prevId = currentContext?.notion?.notion_id || currentContext?.part?.part_id;
                let trueContent = editorContent;
                if (tiptapEditor && !tiptapEditor.isDestroyed) { try { trueContent = tiptapEditor.getHTML(); } catch (e) { } }
                if (prevId) localContentCacheRef.current[prevId] = trueContent;
                if (hasUnsavedChanges && currentContext) { queueSave(currentContext, trueContent); }
                if (autoSaveTimerRef.current) { clearTimeout(autoSaveTimerRef.current); autoSaveTimerRef.current = null; }
                setIsTransitioning(true);
                setTimeout(() => {
                  activeDocIdRef.current = `chapter-${cId}`;
                  setCurrentContext({ type: 'chapter', projectName: projectData?.pr_name || '', partTitle: pName, chapterTitle: cTitle, chapterId: cId });
                  setEditorContent('');
                  setHasUnsavedChanges(false);
                  setIsTransitioning(false);
                }, 300);
              }}
              onSelectParagraph={(pName, cTitle, paName, paId) => {
                const prevId = currentContext?.notion?.notion_id || currentContext?.part?.part_id;
                let trueContent = editorContent;
                if (tiptapEditor && !tiptapEditor.isDestroyed) { try { trueContent = tiptapEditor.getHTML(); } catch (e) { } }
                if (prevId) localContentCacheRef.current[prevId] = trueContent;
                if (hasUnsavedChanges && currentContext) { queueSave(currentContext, trueContent); }
                if (autoSaveTimerRef.current) { clearTimeout(autoSaveTimerRef.current); autoSaveTimerRef.current = null; }
                setIsTransitioning(true);
                setTimeout(() => {
                  activeDocIdRef.current = `paragraph-${paId}`;
                  setCurrentContext({ type: 'paragraph', projectName: projectData?.pr_name || '', partTitle: pName, chapterTitle: cTitle, paraName: paName, paraId: paId });
                  setEditorContent('');
                  setHasUnsavedChanges(false);
                  setIsTransitioning(false);
                }, 300);
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
              onDelete={handleDelete as any}
              selectedPartId={currentContext?.type === 'part' ? currentContext.part?.part_id || structure.find((p: any) => p.part_title === currentContext.partTitle)?.part_id : undefined}
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
            if (cmd.startsWith('color:')) { chain.setColor(cmd.split(':')[1]).run(); return; }
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

        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 lg:p-12 relative">
          {isTransitioning && (
            <div className="absolute top-6 right-6 z-50 flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-[#99334C]/10 animate-in slide-in-from-top-4 fade-in duration-300">
              <Loader2 className="w-5 h-5 text-[#99334C] animate-spin" />
            </div>
          )}
          <div className="max-w-4xl mx-auto min-h-full">
            <EditorArea
              key={synapseDocId}
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
                const cleanId = updateDocId.replace('notion-', '').replace('part-', '');
                if (!cleanId) return;
                const isValEmpty = val === '<p></p>' || val === '' || val.trim() === '';
                const isMounting = (Date.now() - lastDocChangeTimeRef.current) < 500;
                const matchesActive = updateDocId === activeDocIdRef.current;
                const hasPriorContent = !!(localContentCacheRef.current[cleanId] && localContentCacheRef.current[cleanId].length > 10);
                if (isValEmpty && hasPriorContent && isMounting) return;
                localContentCacheRef.current[cleanId] = val;
                if (matchesActive) {
                  setEditorContent(val);
                  setHasUnsavedChanges(true);
                  if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
                  const frozenContext = currentContext ? JSON.parse(JSON.stringify(currentContext)) : null;
                  autoSaveTimerRef.current = setTimeout(() => {
                    if (updateDocId === activeDocIdRef.current && frozenContext) { queueSave(frozenContext, val); }
                  }, 1500);
                }
                setStructure((prev: Part[]) => {
                  return prev.map(p => {
                    if (p.part_id === cleanId) return { ...p, part_intro: val };
                    return {
                      ...p, chapters: p.chapters?.map(c => {
                        return {
                          ...c, paragraphs: c.paragraphs?.map(pa => {
                            const notion = pa.notions?.find(n => n.notion_id === cleanId);
                            if (notion) return { ...pa, notions: pa.notions?.map((n: any) => n.notion_id === cleanId ? { ...n, notion_content: val } : n) };
                            return pa;
                          })
                        };
                      })
                    };
                  });
                });
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

      {!isZenMode && (
        <RightPanel
          activePanel={rightPanel}
          onToggle={(id: string) => { if (id === 'assistant') { setShowChatBot(prev => !prev); return; } setRightPanel(prev => prev === id ? null : id); }}
          comments={comments}
          onAddComment={async (c: any) => { const newC = await commentService.addComment(projectName!, c); setComments(prev => [newC, ...prev]); }}
          onDeleteComment={async (id: string) => { await commentService.deleteComment(projectName!, id); setComments(prev => prev.filter(c => c.comment_id !== id)); }}
          project={projectData}
          structure={structure}
          currentContext={currentContext}
          onUpdateProject={(data: any) => handleUpdateProjectSettings(data, router)}
          onImportFile={() => toast('Importation bientôt disponible')}
          granules={mockGranules}
          onDragStart={handleDragStart}
        />
      )}

      <CreationModals {...{ showPartModal, setShowPartModal, showChapterModal, setShowChapterModal, showParagraphModal, setShowParagraphModal, showNotionModal, setShowNotionModal, modalContext, partFormData, setPartFormData, chapterFormData, setChapterFormData, paragraphFormData, setParagraphFormData, notionFormData, setNotionFormData, isCreatingPart, isCreatingChapter, isCreatingParagraph, isCreatingNotion, handleCreatePart, handleCreateChapter, handleCreateParagraph, handleCreateNotion, confirmCreatePart, confirmCreateChapter, confirmCreateParagraph, confirmCreateNotion }} />
      <DeleteModal config={deleteModalConfig} onClose={() => setDeleteModalConfig(prev => ({ ...prev, isOpen: false }))} onConfirm={() => confirmDelete(structure)} />
      {showShareOverlay && <ShareOverlay projectName={projectName || ''} isOpen={showShareOverlay} onClose={() => setShowShareOverlay(false)} />}
      {showChatBot && <ChatBotOverlay isOpen={showChatBot} onClose={() => setShowChatBot(false)} currentContext={currentContext as any} editorContent={editorContent} />}
      <PublishToMarketplaceModal isOpen={showMarketplaceModal} onClose={() => setShowMarketplaceModal(false)} granuleData={marketplaceGranule} />
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