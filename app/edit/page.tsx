"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle, Save, X, Eye } from 'lucide-react';
import TableOfContents from '@/components/Editor/TableOfContents';
import EditorToolbar from '@/components/Editor/EditorToolBar';
import EditorArea from '@/components/Editor/EditorArea';
import RightPanel from '@/components/Editor/RightPanel';
import ChatBotOverlay from '@/components/Editor/ChatBotOverlay';
import { projectService } from '@/services/projectService';
import { structureService, Part, Notion } from '@/services/structureService';

const XCCM2Editor = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectName = searchParams.get('projectName');

  const [projectData, setProjectData] = useState<{
    pr_id: string;
    pr_name: string;
    owner_id: string;
  } | null>(null);
  const [structure, setStructure] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [rightPanel, setRightPanel] = useState<string | null>(null);
  const [textFormat, setTextFormat] = useState({
    font: 'Arial',
    fontSize: '11'
  });

  const [currentContext, setCurrentContext] = useState<{
    type: 'part' | 'notion'; // Ajout du type
    projectName: string;
    partTitle: string;
    // Optionnels selon le type
    chapterTitle?: string;
    paraName?: string;
    notionName?: string;
    notion?: Notion | null;
    part?: Part | null;
  } | null>(null);

  const [editorContent, setEditorContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // États des modales
  const [showPartModal, setShowPartModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showParagraphModal, setShowParagraphModal] = useState(false);
  const [showNotionModal, setShowNotionModal] = useState(false);

  const [modalContext, setModalContext] = useState<{
    partTitle?: string;
    chapterTitle?: string;
    paraName?: string;
  }>({});

  const [partFormData, setPartFormData] = useState({ title: '', number: 1 });
  const [chapterFormData, setChapterFormData] = useState({ title: '', number: 1 });
  const [paragraphFormData, setParagraphFormData] = useState({ name: '', number: 1 });
  const [notionFormData, setNotionFormData] = useState({ name: '', number: 1 });

  const [isCreatingPart, setIsCreatingPart] = useState(false);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [isCreatingParagraph, setIsCreatingParagraph] = useState(false);
  const [isCreatingNotion, setIsCreatingNotion] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);

  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (projectName) {
      loadProject();
    }
  }, [projectName]);

  useEffect(() => {
    if (currentContext && editorContent !== currentContext.notion?.notion_content) {
      setHasUnsavedChanges(true);
    }
  }, [editorContent, currentContext]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      setError('');

      const project = await projectService.getProjectByName(projectName!);
      setProjectData({
        pr_id: project.pr_id,
        pr_name: project.pr_name,
        owner_id: project.owner_id
      });

      const projectStructure = await structureService.getProjectStructure(project.pr_name);
      setStructure(projectStructure);

    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du projet');
      console.error('Erreur chargement projet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (!hasUnsavedChanges || !currentContext) return;

    const timeoutId = setTimeout(() => {
      handleSave(true); // true = silent/auto
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [editorContent, hasUnsavedChanges, currentContext]);

  const handleSelectNotion = (context: {
    projectName: string;
    partTitle: string;
    chapterTitle: string;
    paraName: string;
    notionName: string;
    notion: Notion;
  }) => {
    // Suppression de window.confirm : auto-save gérera la sauvegarde si nécessaire avant ou après,
    // mais ici on change de contexte, donc il faut sauvegarder AVANT de changer si on veut pas perdre.
    // Idéalement on force le save avant switch.
    if (hasUnsavedChanges) {
      handleSave(true); // Save immédiat silencieux avant de changer
    }

    setCurrentContext({ ...context, type: 'notion', part: null });
    setEditorContent(context.notion.notion_content || '');
    setHasUnsavedChanges(false);
  };

  // Nouveau handler pour sélectionner une partie (Intro)
  const handleSelectPart = (context: {
    projectName: string;
    partTitle: string;
    part: Part;
  }) => {
    if (hasUnsavedChanges) {
      handleSave(true);
    }
    setCurrentContext({
      type: 'part',
      projectName: context.projectName,
      partTitle: context.partTitle,
      part: context.part,
      chapterTitle: undefined, paraName: undefined, notionName: undefined, notion: null
    });
    setEditorContent(context.part.part_intro || '');
    setHasUnsavedChanges(false);
  }

  const handleSave = async (isAuto = false) => {
    if (!currentContext) return;

    try {
      setIsSaving(true);
      setError('');

      if (currentContext.type === 'notion' && currentContext.notionName) {
        // Sauvegarde NOTION
        await structureService.updateNotion(
          currentContext.projectName,
          currentContext.partTitle,
          currentContext.chapterTitle!,
          currentContext.paraName!,
          currentContext.notionName,
          { notion_content: editorContent }
        );
        // Mise à jour locale
        if (currentContext.notion) {
          currentContext.notion.notion_content = editorContent;
        }
      } else if (currentContext.type === 'part' && currentContext.partTitle) {
        // Sauvegarde PARTIE (Intro)
        await structureService.updatePart(
          currentContext.projectName,
          currentContext.partTitle,
          { part_intro: editorContent }
        );
        // Mise à jour locale
        if (currentContext.part) {
          currentContext.part.part_intro = editorContent;
        }
      }

      setHasUnsavedChanges(false);

      if (!isAuto) {
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-right';
        successMsg.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> Sauvegardé !';
        document.body.appendChild(successMsg);
        setTimeout(() => document.body.removeChild(successMsg), 3000);
      }

    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
      // Afficher erreur toast
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
      errorMsg.textContent = err.message || "Erreur de sauvegarde";
      document.body.appendChild(errorMsg);
      setTimeout(() => document.body.removeChild(errorMsg), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRightPanel = (panelName: string) => {
    setRightPanel(rightPanel === panelName ? null : panelName);
  };

  const applyFormat = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTextFormat(prev => ({ ...prev, font: e.target.value }));
    document.execCommand('fontName', false, e.target.value);
    editorRef.current?.focus();
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTextFormat(prev => ({ ...prev, fontSize: e.target.value }));
    const sizeMap: { [key: string]: string } = {
      '8': '1', '9': '1', '10': '2', '11': '2', '12': '3',
      '14': '4', '16': '4', '18': '5', '20': '5', '24': '6',
      '28': '6', '32': '7', '36': '7'
    };
    document.execCommand('fontSize', false, sizeMap[e.target.value]);
    editorRef.current?.focus();
  };

  const handleDragStart = (e: React.DragEvent, granule: any) => {
    e.dataTransfer.setData('granule', JSON.stringify(granule));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Remplacé par handleDropNew qui est plus simple (le EditorArea gère la position)
  const handleDropNew = (contentToAdd: string) => {
    if (editorRef.current) {
      // Fallback si le drop précis n'a pas marché ou n'est pas supporté par le navigateur
      // On ajoute à la fin ou là où était le curseur avant
      editorRef.current.innerHTML += '\n' + contentToAdd;
      setEditorContent(editorRef.current.innerHTML);
      setHasUnsavedChanges(true);
    }
  };

  // Fonctions d'ouverture des modales
  const handleCreatePart = () => {
    const maxNumber = structure.length > 0
      ? Math.max(...structure.map(p => p.part_number || 0))
      : 0;
    setPartFormData({ title: '', number: maxNumber + 1 });
    setShowPartModal(true);
  };

  const handleCreateChapter = (partTitle: string) => {
    setModalContext({ partTitle });

    const part = structure.find(p => p.part_title === partTitle);
    const existingChapters = part?.chapters || [];
    const maxNumber = existingChapters.length > 0
      ? Math.max(...existingChapters.map(c => c.chapter_number || 0))
      : 0;

    setChapterFormData({ title: '', number: maxNumber + 1 });
    setShowChapterModal(true);
  };

  const handleCreateParagraph = (partTitle: string, chapterTitle: string) => {
    setModalContext({ partTitle, chapterTitle });

    const part = structure.find(p => p.part_title === partTitle);
    const chapter = part?.chapters?.find(c => c.chapter_title === chapterTitle);
    const existingParagraphs = chapter?.paragraphs || [];
    const maxNumber = existingParagraphs.length > 0
      ? Math.max(...existingParagraphs.map(p => p.para_number || 0))
      : 0;

    setParagraphFormData({ name: '', number: maxNumber + 1 });
    setShowParagraphModal(true);
  };

  const handleCreateNotion = (partTitle: string, chapterTitle: string, paraName: string) => {
    setModalContext({ partTitle, chapterTitle, paraName });

    const part = structure.find(p => p.part_title === partTitle);
    const chapter = part?.chapters?.find(c => c.chapter_title === chapterTitle);
    const paragraph = chapter?.paragraphs?.find(p => p.para_name === paraName);
    const existingNotions = paragraph?.notions || [];

    const maxNumber = existingNotions.length > 0
      ? Math.max(...existingNotions.map(n => n.notion_number || 0))
      : 0;

    setNotionFormData({
      name: '',
      number: maxNumber + 1
    });

    setShowNotionModal(true);
  };

  // Fonctions de confirmation
  const confirmCreatePart = async () => {
    if (!projectData || !partFormData.title.trim() || isCreatingPart) return;

    try {
      setIsCreatingPart(true);
      setError('');

      const newPart = await structureService.createPart(projectData.pr_name, {
        part_title: partFormData.title,
        part_number: partFormData.number
      });

      setStructure(prevStructure => {
        const exists = prevStructure.some(p => p.part_id === newPart.part_id);
        if (!exists) {
          return [...prevStructure, { ...newPart, chapters: [] }];
        }
        return prevStructure;
      });

      setShowPartModal(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la partie');
    } finally {
      setIsCreatingPart(false);
    }
  };

  const confirmCreateChapter = async () => {
    if (!projectData || !modalContext.partTitle || !chapterFormData.title.trim() || isCreatingChapter) return;

    try {
      setIsCreatingChapter(true);
      setError('');

      const newChapter = await structureService.createChapter(
        projectData.pr_name,
        modalContext.partTitle,
        {
          chapter_title: chapterFormData.title,
          chapter_number: chapterFormData.number
        }
      );

      setStructure(prevStructure => {
        const newStructure = [...prevStructure];
        const part = newStructure.find(p => p.part_title === modalContext.partTitle);
        if (part) {
          if (!part.chapters) part.chapters = [];
          const exists = part.chapters.some(c => c.chapter_id === newChapter.chapter_id);
          if (!exists) {
            part.chapters.push({ ...newChapter, paragraphs: [] });
          }
        }
        return newStructure;
      });

      setShowChapterModal(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du chapitre');
    } finally {
      setIsCreatingChapter(false);
    }
  };

  const confirmCreateParagraph = async () => {
    if (!projectData || !modalContext.partTitle || !modalContext.chapterTitle || !paragraphFormData.name.trim() || isCreatingParagraph) return;

    try {
      setIsCreatingParagraph(true);
      setError('');

      const newParagraph = await structureService.createParagraph(
        projectData.pr_name,
        modalContext.partTitle,
        modalContext.chapterTitle,
        {
          para_name: paragraphFormData.name,
          para_number: paragraphFormData.number
        }
      );

      setStructure(prevStructure => {
        const newStructure = [...prevStructure];
        const part = newStructure.find(p => p.part_title === modalContext.partTitle);
        if (part?.chapters) {
          const chapter = part.chapters.find(c => c.chapter_title === modalContext.chapterTitle);
          if (chapter) {
            if (!chapter.paragraphs) chapter.paragraphs = [];
            const exists = chapter.paragraphs.some(p => p.para_id === newParagraph.para_id);
            if (!exists) {
              chapter.paragraphs.push({ ...newParagraph, notions: [] });
            }
          }
        }
        return newStructure;
      });

      setShowParagraphModal(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du paragraphe');
    } finally {
      setIsCreatingParagraph(false);
    }
  };

  const confirmCreateNotion = async () => {
    if (!projectData || !modalContext.partTitle || !modalContext.chapterTitle || !modalContext.paraName || !notionFormData.name.trim()) return;

    if (isCreatingNotion) return;

    try {
      setIsCreatingNotion(true);
      setError('');

      const newNotion = await structureService.createNotion(
        projectData.pr_name,
        modalContext.partTitle,
        modalContext.chapterTitle,
        modalContext.paraName,
        {
          notion_name: notionFormData.name,
          notion_number: notionFormData.number,
          notion_content: 'À compléter...'
        }
      );

      setStructure(prevStructure => {
        const newStructure = [...prevStructure];
        const part = newStructure.find(p => p.part_title === modalContext.partTitle);
        if (part?.chapters) {
          const chapter = part.chapters.find(c => c.chapter_title === modalContext.chapterTitle);
          if (chapter?.paragraphs) {
            const paragraph = chapter.paragraphs.find(p => p.para_name === modalContext.paraName);
            if (paragraph) {
              if (!paragraph.notions) paragraph.notions = [];

              const exists = paragraph.notions.some(n => n.notion_id === newNotion.notion_id);
              if (!exists) {
                paragraph.notions.push(newNotion);
              }

              setExpandedItems(prev => ({
                ...prev,
                [`paragraph-${paragraph.para_id}`]: true
              }));
            }
          }
        }
        return newStructure;
      });

      setShowNotionModal(false);
    } catch (err: any) {
      console.error('❌ Erreur création notion:', err);
      setError(err.message || 'Erreur lors de la création de la notion');
    } finally {
      setIsCreatingNotion(false);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#99334C] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (error && !projectData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/edit-home')}
            className="px-6 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] transition-all"
          >
            Retour aux projets
          </button>
        </div>
      </div>
    );
  }

  const handleInsertImage = () => {
    // Créer un input file invisible
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (file) {
        // Créer une URL locale pour l'image
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;

          // Insérer l'image dans l'éditeur
          if (editorRef.current) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.margin = '10px 0';

            // Insérer à la position du curseur ou à la fin
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.insertNode(img);
              range.collapse(false);
            } else {
              editorRef.current.appendChild(img);
            }

            // Mettre à jour le contenu
            setEditorContent(editorRef.current.innerHTML);
            setHasUnsavedChanges(true);
          }
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <TableOfContents
        projectName={projectData?.pr_name || ''}
        structure={structure}
        onSelectNotion={handleSelectNotion}
        onCreatePart={handleCreatePart}
        onCreateChapter={handleCreateChapter}
        onCreateParagraph={handleCreateParagraph}
        onCreateNotion={handleCreateNotion}
        selectedNotionId={currentContext?.notion?.notion_id}
        // Ajout des props pour la sélection de partie (à update aussi dans TableOfContents)
        // @ts-ignore (on va update le composant juste après)
        onSelectPart={handleSelectPart}
        selectedPartId={currentContext?.part?.part_id}
      />

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">{projectData?.pr_name}</h1>
            {currentContext ? (
              currentContext.type === 'notion' ? (
                <div className="text-sm text-gray-600">
                  {currentContext.partTitle} / {currentContext.chapterTitle} / {currentContext.paraName} / <span className="font-semibold text-[#99334C]">{currentContext.notionName}</span>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  Partie <span className="font-semibold text-[#99334C]">{currentContext.partTitle}</span> (Introduction)
                </div>
              )
            ) : null}
          </div>
          <div className="flex items-center gap-3">

            <button
              onClick={() => {
                if (hasUnsavedChanges) handleSave(true);
                router.push(`/preview?projectName=${encodeURIComponent(projectData?.pr_name || '')}`);
              }}
              className="px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
              title="Aperçu du cours"
            >
              <Eye className="w-4 h-4" />
              Aperçu
            </button>
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
                Modifications non sauvegardées
              </span>
            )}
            <button
              onClick={() => handleSave(false)}
              disabled={!hasUnsavedChanges || isSaving}
              className="px-4 py-2 bg-[#99334C] text-white rounded-lg hover:bg-[#7a283d] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </div>

        <EditorToolbar
          textFormat={textFormat}
          onFormatChange={applyFormat}
          onFontChange={handleFontChange}
          onFontSizeChange={handleFontSizeChange}
          onChatToggle={() => setShowChatBot(!showChatBot)}
          onInsertImage={handleInsertImage}
        />

        {currentContext ? (
          <EditorArea
            content={editorContent}
            textFormat={textFormat}
            onChange={setEditorContent}
            onDrop={handleDropNew} // Utilise la nouvelle méthode
            editorRef={editorRef}
            placeholder={
              currentContext.type === 'part'
                ? "Rédigez l'introduction de cette partie..."
                : "Commencez à rédaction votre notion ici..."
            }
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">Sélectionnez une notion ou une partie pour commencer à éditer</p>
              <p className="text-sm">ou utilisez la table des matières à gauche</p>
            </div>
          </div>
        )}
      </div>

      <RightPanel
        activePanel={rightPanel}
        onToggle={toggleRightPanel}
        granules={[]}
        onDragStart={handleDragStart}
        project={projectData}
        structure={structure}
        currentContext={currentContext ? {
          projectName: currentContext.projectName,
          partTitle: currentContext.partTitle,
          chapterTitle: currentContext.chapterTitle,
          paraName: currentContext.paraName,
          notionName: currentContext.notionName
        } : undefined}
      />

      <ChatBotOverlay isOpen={showChatBot} onClose={() => setShowChatBot(false)} />

      {/* MODALE PARTIE */}
      {showPartModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Nouvelle Partie</h3>
              <button onClick={() => setShowPartModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la partie</label>
                <input
                  type="text"
                  value={partFormData.title}
                  onChange={(e) => setPartFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Introduction"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
                <input
                  type="number"
                  value={partFormData.number}
                  onChange={(e) => setPartFormData(prev => ({ ...prev, number: parseInt(e.target.value) || 1 }))}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPartModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmCreatePart}
                disabled={isCreatingPart || partFormData.title.trim().length < 3}
                className="flex-1 px-4 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isCreatingPart && <Loader2 className="w-4 h-4 animate-spin" />}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE CHAPITRE */}
      {showChapterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Nouveau Chapitre</h3>
              <button onClick={() => setShowChapterModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-3 text-sm text-gray-600">
              Dans la partie : <span className="font-semibold text-[#99334C]">{modalContext.partTitle}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre du chapitre</label>
                <input
                  type="text"
                  value={chapterFormData.title}
                  onChange={(e) => setChapterFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Concepts fondamentaux"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
                <input
                  type="number"
                  value={chapterFormData.number}
                  onChange={(e) => setChapterFormData(prev => ({ ...prev, number: parseInt(e.target.value) || 1 }))}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowChapterModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmCreateChapter}
                disabled={isCreatingChapter || chapterFormData.title.trim().length < 3}
                className="flex-1 px-4 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isCreatingChapter && <Loader2 className="w-4 h-4 animate-spin" />}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE PARAGRAPHE */}
      {showParagraphModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Nouveau Paragraphe</h3>
              <button onClick={() => setShowParagraphModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-3 text-sm text-gray-600">
              Dans : <span className="font-semibold text-[#99334C]">{modalContext.partTitle} / {modalContext.chapterTitle}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du paragraphe</label>
                <input
                  type="text"
                  value={paragraphFormData.name}
                  onChange={(e) => setParagraphFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Définitions"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
                <input
                  type="number"
                  min="1"
                  value={paragraphFormData.number}
                  onChange={(e) => setParagraphFormData(prev => ({
                    ...prev,
                    number: parseInt(e.target.value) || 1
                  }))}
                  placeholder="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowParagraphModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmCreateParagraph}
                disabled={isCreatingParagraph || paragraphFormData.name.trim().length < 3}
                className="flex-1 px-4 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isCreatingParagraph && <Loader2 className="w-4 h-4 animate-spin" />}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}












      {/* MODALE NOTION */}
      {showNotionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Nouvelle Notion</h3>
              <button onClick={() => setShowNotionModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-3 text-sm text-gray-600">
              Dans : <span className="font-semibold text-[#99334C]">{modalContext.partTitle} / {modalContext.chapterTitle} / {modalContext.paraName}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la notion</label>
                <input
                  type="text"
                  value={notionFormData.name}
                  onChange={(e) => setNotionFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Théorème de Pythagore"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
                <input
                  type="number"
                  min="1"
                  value={notionFormData.number}
                  onChange={(e) => setNotionFormData(prev => ({
                    ...prev,
                    number: parseInt(e.target.value) || 1
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNotionModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmCreateNotion}
                disabled={isCreatingNotion || notionFormData.name.trim().length < 3}
                className="flex-1 px-4 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isCreatingNotion && <Loader2 className="w-4 h-4 animate-spin" />}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default XCCM2Editor;