"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, Plus, Eye, Share2, Save, Loader2, AlertCircle, Home, X } from 'lucide-react';
import Link from 'next/link';
import TableOfContents from '@/components/Editor/TableOfContents';
import EditorToolbar from '@/components/Editor/EditorToolBar';
import EditorArea from '@/components/Editor/EditorArea';
import RightPanel from '@/components/Editor/RightPanel';
import ChatBotOverlay from '@/components/Editor/ChatBotOverlay';
import { projectService, Project } from '@/services/projectService';
import { commentService } from '@/services/commentService';
import { Language, translations } from '@/services/locales';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import { structureService, Part, Chapter, Paragraph, Notion } from '@/services/structureService';
import ShareOverlay from '@/components/Editor/ShareOverlay';
import pLimit from 'p-limit';
import { FaHome } from 'react-icons/fa';
import toast from 'react-hot-toast';

const XCCM2Editor = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectName = searchParams.get('projectName');
  const { language } = useLanguage();
  const t = translations[language] ?? translations.fr;

  const [projectData, setProjectData] = useState<Project | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const [structure, setStructure] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<string | null>(null);
  const [textFormat, setTextFormat] = useState({
    font: 'Arial',
    fontSize: '11'
  });

  const [currentContext, setCurrentContext] = useState<{
    type: 'part' | 'chapter' | 'paragraph' | 'notion'; // Support tous les types de granules
    projectName: string;
    partTitle: string;
    // Optionnels selon le type
    chapterTitle?: string;
    chapterId?: string;
    paraName?: string;
    paraId?: string;
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
  const [showShareOverlay, setShowShareOverlay] = useState(false);
  const isToolbarDisabled = React.useMemo(() => {
    // Désactiver si Chapter ou Paragraph est sélectionné (mais pas Notion)
    return (
      (currentContext?.type === 'chapter') ||
      (currentContext?.type === 'paragraph')
    );
  }, [currentContext?.type]);
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

  /* import pLimit from 'p-limit'; // Put this at the top of file */

  const loadProject = async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      setError('');

      const project = await projectService.getProjectByName(projectName!);
      setProjectData(project);

      // Charger aussi les commentaires si nécessaire (ou on le fera quand le panel s'ouvre)
      fetchComments();

      // 1. Charger uniquement les parties (rapide)
      const parts = await structureService.getParts(project.pr_name);
      setStructure(parts); // Affichage immédiat
      if (!isSilent) setIsLoading(false); // L'UI est débloquée

      // 2. Charger les détails en arrière-plan (Progressive Loading)
      const limit = pLimit(3); // 3 parties en parallèle max pour ne pas ralentir l'UI

      const updatePromise = parts.map(part => limit(async () => {
        try {
          // On récupère la partie complète
          const updatedPart = await structureService.fillPartDetails(project.pr_name, { ...part });

          // Mise à jour de l'état local pour rafraîchir l'affichage de CETTE partie
          setStructure(prev => prev.map(p => p.part_id === updatedPart.part_id ? updatedPart : p));
        } catch (err) {
          console.error(`Erreur chargement détails partie ${part.part_title}:`, err);
        }
      }));

      await Promise.all(updatePromise);

    } catch (err: any) {
      // Gestion spécifique de l'erreur d'authentification
      if (err.message && err.message.includes('Token invalide ou expiré')) {
        toast.error('⚠️ Votre session a expiré. Veuillez vous reconnecter.', { duration: 4000 });
        // Redirection vers la page de connexion
        window.location.href = '/login';
        return;
      }

      console.error('Erreur chargement projet:', err);
      toast.error(err.message || 'Erreur lors du chargement du projet');
      if (!isSilent) setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!projectName) return;
    try {
      setIsFetchingComments(true);
      const data = await commentService.getComments(projectName);
      setComments(data);
    } catch (err) {
      console.error("Erreur fetch comments:", err);
    } finally {
      setIsFetchingComments(false);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!projectName) return;
    try {
      const newComment = await commentService.addComment(projectName, content);
      setComments(prev => [newComment, ...prev]);
    } catch (err: any) {
      toast.error("Erreur lors de l'ajout du commentaire: " + err.message);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!projectName) return;
    try {
      await commentService.deleteComment(projectName, commentId);
      setComments(prev => prev.filter(c => c.comment_id !== commentId));
    } catch (err: any) {
      toast.error("Erreur lors de la suppression du commentaire: " + err.message);
    }
  };

  const handleUpdateProjectSettings = async (data: Partial<Project>) => {
    if (!projectData || !projectName) return;
    try {
      const updated = await projectService.updateProject(projectName, data);
      setProjectData(updated);

      // Si le nom a changé, mettre à jour l'URL
      if (data.pr_name && data.pr_name !== projectName) {
        router.replace(`/edit?projectName=${encodeURIComponent(data.pr_name)}`);
      }
    } catch (err: any) {
      console.error("Erreur update settings:", err);
      toast.error("Erreur lors de la mise à jour des paramètres: " + err.message);
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

  // Handler pour sélectionner un chapitre (pour drop de paragraphes)
  const handleSelectChapter = (projectName: string, partTitle: string, chapterTitle: string, chapterId: string) => {
    if (hasUnsavedChanges) {
      handleSave(true);
    }
    setCurrentContext({
      type: 'chapter',
      projectName,
      partTitle,
      chapterTitle,
      chapterId,
      paraName: undefined,
      paraId: undefined,
      notionName: undefined,
      notion: null,
      part: null
    });
    setEditorContent(''); // Pas de contenu éditable pour un chapitre
    setHasUnsavedChanges(false);
  };

  // Handler pour sélectionner un paragraphe (pour drop de notions)
  const handleSelectParagraph = (projectName: string, partTitle: string, chapterTitle: string, paraName: string, paraId: string) => {
    if (hasUnsavedChanges) {
      handleSave(true);
    }
    setCurrentContext({
      type: 'paragraph',
      projectName,
      partTitle,
      chapterTitle,
      paraName,
      paraId,
      notionName: undefined,
      notion: null,
      part: null
    });
    setEditorContent(''); // Pas de contenu éditable pour un paragraphe
    setHasUnsavedChanges(false);
  };

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
          currentContext.notionName!,
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
        toast.success('Sauvegardé !');
      }

    } catch (err: any) {
      // Gestion spécifique de l'erreur d'authentification
      if (err.message && err.message.includes('Token invalide ou expiré')) {
        toast.error('⚠️ Votre session a expiré. Veuillez vous reconnecter.');
        window.location.href = '/login';
        return;
      }

      // Afficher erreur toast
      toast.error(err.message || "Erreur de sauvegarde");
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

  // Helper pour temporiser
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Remplacé par handleDropNew qui gère maintenant objets (structure) et texte
  const handleDropNew = async (contentOrGranule: any) => {
    // 1. Cas : Import de Structure (Objet)
    if (typeof contentOrGranule === 'object' && contentOrGranule.type) {
      if (!projectData) return;

      try {
        setIsImporting(true); // Feedback immédiat (localisé)

        // REFRESH structure AVANT drop pour avoir les bons numéros (SILENCIEUX)
        await loadProject(true);

        // Initialisation du contexte avec la sélection actuelle pour les drops relatifs
        const initialContext: any = {};
        if (currentContext) {
          // Copier tous les champs disponibles (pour supporter drop dans Chapter, Paragraph, etc.)
          initialContext.partTitle = currentContext.partTitle;
          if (currentContext.chapterTitle) {
            initialContext.chapterTitle = currentContext.chapterTitle;
          }
          if (currentContext.paraName) {
            initialContext.paraName = currentContext.paraName;
          }
        }

        // Compteurs LOCAUX pour cette opération d'import
        const counters = new Map<string, number>();
        const limit = pLimit(2); // Limite de parallélisme pour l'import

        // Helper stateful pour avoir le prochain numéro et incrémenter
        const getNextNumAndInc = (type: string, ctx: any) => {
          let key = '';
          let currentMax = 0;

          if (type === 'part') {
            key = 'root_parts';
            if (!counters.has(key)) {
              // Init depuis structure existante
              currentMax = structure.length > 0 ? Math.max(...structure.map(p => p.part_number || 0)) : 0;
              counters.set(key, currentMax);
            }
          } else if (type === 'chapter') {
            key = `chapters_of_${ctx.partTitle}`;
            if (!counters.has(key)) {
              const part = structure.find(p => p.part_title === ctx.partTitle);
              const chapters = part?.chapters || [];
              currentMax = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapter_number || 0)) : 0;
              counters.set(key, currentMax);
            }
          } else if (type === 'paragraph') {
            key = `paras_of_${ctx.chapterTitle}`;
            if (!counters.has(key)) {
              const part = structure.find(p => p.part_title === ctx.partTitle);
              const chapter = part?.chapters?.find(c => c.chapter_title === ctx.chapterTitle);
              const paras = chapter?.paragraphs || [];
              currentMax = paras.length > 0 ? Math.max(...paras.map(p => p.para_number || 0)) : 0;
              counters.set(key, currentMax);
            }
          } else if (type === 'notion') {
            key = `notions_of_${ctx.paraName}`;
            if (!counters.has(key)) {
              const part = structure.find(p => p.part_title === ctx.partTitle);
              const chapter = part?.chapters?.find(c => c.chapter_title === ctx.chapterTitle);
              const para = chapter?.paragraphs?.find(p => p.para_name === ctx.paraName);
              const notions = para?.notions || [];
              currentMax = notions.length > 0 ? Math.max(...notions.map(n => n.notion_number || 0)) : 0;
              counters.set(key, currentMax);
            }
          }

          // Incrémente et retourne
          const newVal = (counters.get(key) || 0) + 1;
          counters.set(key, newVal);
          return newVal;
        };

        // Fonction récursive d'import
        const importRecursive = async (item: any, context: any) => {
          let createdItem;

          if (item.type === 'part') {
            const nextNum = getNextNumAndInc('part', context);
            const uniqueTitle = `${item.content} ${nextNum}`;

            createdItem = await limit(() => structureService.createPart(projectData.pr_name, {
              part_title: uniqueTitle,
              part_number: nextNum
            }));
            // Contexte pour les enfants
            context = { partTitle: createdItem.part_title, partId: createdItem.part_id };

          } else if (item.type === 'chapter') {
            if (!context.partTitle) throw new Error("Chapitre sans partie parente");
            const nextNum = getNextNumAndInc('chapter', context);

            createdItem = await limit(() => structureService.createChapter(projectData.pr_name, context.partTitle, {
              chapter_title: `${item.content} ${nextNum}`,
              chapter_number: nextNum
            }));
            context = { ...context, chapterTitle: createdItem.chapter_title };

          } else if (item.type === 'paragraph') {
            if (!context.chapterTitle) throw new Error("Impossible de créer un paragraphe : Aucun chapitre parent sélectionné.");
            const nextNum = getNextNumAndInc('paragraph', context);

            createdItem = await limit(() => structureService.createParagraph(projectData.pr_name, context.partTitle, context.chapterTitle, {
              para_name: `${item.content} ${nextNum}`,
              para_number: nextNum
            }));
            context = { ...context, paraName: createdItem.para_name };

          } else if (item.type === 'notion') {
            if (!context.paraName) throw new Error("Impossible de créer une notion : Aucun paragraphe parent sélectionné.");
            const nextNum = getNextNumAndInc('notion', context);

            createdItem = await limit(() => structureService.createNotion(projectData.pr_name, context.partTitle, context.chapterTitle, context.paraName, {
              notion_name: `${item.content} ${nextNum}`,
              notion_number: nextNum,
              notion_content: "<p>Contenu importé...</p>"
            }));

            // SI c'est la première notion trouvée, on la sélectionne (User Request)
            if (!firstNotionFound.current) {
              firstNotionFound.current = {
                notion: createdItem,
                context: { ...context, notionName: createdItem.notion_name }
              };
            }
          }

          // Récursion sur les enfants (en parallèle via p-limit)
          if (item.children && item.children.length > 0) {
            await Promise.all(item.children.map((child: any) => importRecursive(child, { ...context })));
          }
        };

        // Ref pour stocker la première notion
        const firstNotionFound = { current: null } as any;

        // Lancer l'import avec le contexte initial fusionné
        await importRecursive(contentOrGranule, { ...initialContext });

        // Recharger la structure silencieusement (background)
        await loadProject(true);

        // Sélectionner la notion si trouvée
        if (firstNotionFound.current) {
          handleSelectNotion({
            projectName: projectData.pr_name,
            partTitle: firstNotionFound.current.context.partTitle,
            chapterTitle: firstNotionFound.current.context.chapterTitle,
            paraName: firstNotionFound.current.context.paraName,
            notionName: firstNotionFound.current.context.notionName,
            notion: firstNotionFound.current.notion
          });

          // Toast succès
          toast.success("Structure importée avec succès !");
        }

      } catch (err: any) {
        console.error("Erreur import structure:", err);
        if (err.message.includes("sans partie parente")) {
          toast.error("Impossible de créer ce chapitre orphelin. Veuillez d'abord cliquer sur une Partie ou une Notion existante.");
        } else if (err.message.includes("Impossible de créer une notion")) {
          toast.error("Impossible de créer cette notion. Veuillez sélectionner un Paragraphe cible.");
        } else {
          toast.error("Erreur lors de l'import : " + err.message);
        }
      } finally {
        setIsImporting(false);
      }
      return;
    }

    // 2. Cas : Drop de Contenu (Texte/Image string)
    if (editorRef.current) {
      if (typeof contentOrGranule === 'string') {
        editorRef.current.innerHTML += '\n' + contentOrGranule;
        setEditorContent(editorRef.current.innerHTML);
        setHasUnsavedChanges(true);
      }
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
      toast.error(err.message || 'Erreur lors de la création de la partie');
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
      toast.error(err.message || 'Erreur lors de la création du chapitre');
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
      toast.error(err.message || 'Erreur lors de la création du paragraphe');
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
      toast.error(err.message || 'Erreur lors de la création de la notion');
    } finally {
      setIsCreatingNotion(false);
    }
  };

  const handleRename = async (type: string, id: string, newTitle: string) => {
    if (!projectData) return;
    try {
      // Trouver l'item et son contexte dans la structure
      let part: Part | undefined;
      let chapter: Chapter | undefined;
      let paragraph: Paragraph | undefined;
      let notion: Notion | undefined;

      if (type === 'part') {
        part = structure.find(p => p.part_id === id);
        if (part) {
          await structureService.updatePart(projectData.pr_name, part.part_title, { part_title: newTitle });
        }
      } else if (type === 'chapter') {
        outer: for (const p of structure) {
          chapter = p.chapters?.find(c => c.chapter_id === id);
          if (chapter) { part = p; break outer; }
        }
        if (part && chapter) {
          await structureService.updateChapter(projectData.pr_name, part.part_title, chapter.chapter_title, { chapter_title: newTitle });
        }
      } else if (type === 'paragraph') {
        outer: for (const p of structure) {
          for (const c of p.chapters || []) {
            paragraph = c.paragraphs?.find(pg => pg.para_id === id);
            if (paragraph) { part = p; chapter = c; break outer; }
          }
        }
        if (part && chapter && paragraph) {
          await structureService.updateParagraph(projectData.pr_name, part.part_title, chapter.chapter_title, paragraph.para_name, { para_name: newTitle });
        }
      } else if (type === 'notion') {
        outer: for (const p of structure) {
          for (const c of p.chapters || []) {
            for (const pg of c.paragraphs || []) {
              notion = pg.notions?.find(n => n.notion_id === id);
              if (notion) { part = p; chapter = c; paragraph = pg; break outer; }
            }
          }
        }
        if (part && chapter && paragraph && notion) {
          await structureService.updateNotion(projectData.pr_name, part.part_title, chapter.chapter_title, paragraph.para_name, notion.notion_name, { notion_name: newTitle });
        }
      }

      // Rafraîchir la structure
      await loadProject(true);
    } catch (err: any) {
      console.error("Erreur renommage:", err);
      alert("Erreur lors du renommage : " + err.message);
    }
  };

  const handleReorder = async (
    type: 'part' | 'chapter' | 'paragraph' | 'notion',
    parentId: string | null,
    items: any[]
  ) => {
    if (!projectData) return;

    try {
      setError('');

      console.log(`🔃 Réordonnancement ${type}s`, { parentId, count: items.length });

      // Mettre à jour les numéros dans l'ordre
      const limit = pLimit(3);
      const updatePromises = items.map((item, index) => limit(async () => {
        const newNumber = index + 1;

        try {
          if (type === 'part') {
            const currentNumber = item.part_number;
            if (currentNumber !== newNumber) {
              await structureService.updatePart(
                projectData.pr_name,
                item.part_title,
                { part_number: newNumber }
              );
            }
          } else if (type === 'chapter') {
            const currentNumber = item.chapter_number;
            if (currentNumber !== newNumber) {
              const part = structure.find(p => p.part_id === parentId);
              if (part) {
                await structureService.updateChapter(
                  projectData.pr_name,
                  part.part_title,
                  item.chapter_title,
                  { chapter_number: newNumber }
                );
              }
            }
          } else if (type === 'paragraph') {
            const currentNumber = item.para_number;
            if (currentNumber !== newNumber) {
              let partTitle = "";
              let chapterTitle = "";
              outer: for (const p of structure) {
                const c = p.chapters?.find(ch => ch.chapter_id === parentId);
                if (c) {
                  partTitle = p.part_title;
                  chapterTitle = c.chapter_title;
                  break outer;
                }
              }
              if (partTitle && chapterTitle) {
                await structureService.updateParagraph(
                  projectData.pr_name,
                  partTitle,
                  chapterTitle,
                  item.para_name,
                  { para_number: newNumber }
                );
              }
            }
          } else if (type === 'notion') {
            const currentNumber = item.notion_number;
            if (currentNumber !== newNumber) {
              let partT = "", chapT = "", paraN = "";
              outer: for (const p of structure) {
                for (const c of p.chapters || []) {
                  const para = c.paragraphs?.find(pg => pg.para_id === parentId);
                  if (para) {
                    partT = p.part_title;
                    chapT = c.chapter_title;
                    paraN = para.para_name;
                    break outer;
                  }
                }
              }
              if (partT && chapT && paraN) {
                await structureService.updateNotion(
                  projectData.pr_name,
                  partT,
                  chapT,
                  paraN,
                  item.notion_name,
                  { notion_number: newNumber }
                );
              }
            }
          }
        } catch (err) {
          console.error(`Erreur update ${type} #${newNumber}:`, err);
          throw err;
        }
      }));

      await Promise.all(updatePromises);

      // Recharger silencieusement
      await loadProject(true);

      // Toast succès
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-right';
      successMsg.innerHTML = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> Ordre mis à jour`;
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 2000);

    } catch (err: any) {
      console.error("❌ Erreur réordonnancement:", err);
      setError(`Erreur réordonnancement: ${err.message}`);

      // Recharger quand même pour être synchro
      await loadProject(true);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!projectData) return;

    // Confirmation avant suppression
    const confirmMsg = type === 'part'
      ? 'Êtes-vous sûr de vouloir supprimer cette partie et tous ses enfants?'
      : type === 'chapter'
        ? 'Êtes-vous sûr de vouloir supprimer ce chapitre et tous ses enfants?'
        : type === 'paragraph'
          ? 'Êtes-vous sûr de vouloir supprimer ce paragraphe et toutes ses notions?'
          : 'Êtes-vous sûr de vouloir supprimer cette notion?';

    if (!window.confirm(confirmMsg)) return;

    try {
      setError('');

      // Trouver l'item et récupérer sa hiérarchie
      let part: Part | undefined;
      let chapter: Chapter | undefined;
      let paragraph: Paragraph | undefined;

      if (type === 'part') {
        part = structure.find(p => p.part_id === id);
        if (part) {
          await structureService.deletePart(projectData.pr_name, part.part_title);
        }
      } else if (type === 'chapter') {
        outer: for (const p of structure) {
          chapter = p.chapters?.find(c => c.chapter_id === id);
          if (chapter) { part = p; break outer; }
        }
        if (part && chapter) {
          await structureService.deleteChapter(projectData.pr_name, part.part_title, chapter.chapter_title);
        }
      } else if (type === 'paragraph') {
        outer: for (const p of structure) {
          for (const c of p.chapters || []) {
            paragraph = c.paragraphs?.find(pg => pg.para_id === id);
            if (paragraph) { part = p; chapter = c; break outer; }
          }
        }
        if (part && chapter && paragraph) {
          await structureService.deleteParagraph(projectData.pr_name, part.part_title, chapter.chapter_title, paragraph.para_name);
        }
      } else if (type === 'notion') {
        outer: for (const p of structure) {
          for (const c of p.chapters || []) {
            for (const pg of c.paragraphs || []) {
              const notion = pg.notions?.find(n => n.notion_id === id);
              if (notion) { part = p; chapter = c; paragraph = pg; break outer; }
            }
          }
        }
        if (part && chapter && paragraph) {
          const notion = paragraph.notions?.find(n => n.notion_id === id);
          if (notion) {
            await structureService.deleteNotion(projectData.pr_name, part.part_title, chapter.chapter_title, paragraph.para_name, notion.notion_name);
          }
        }
      }

      // Rafraîchir la structure
      await loadProject(true);

      // Toast succès
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-right';
      successMsg.textContent = "Supprimé avec succès !";
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);

    } catch (err: any) {
      console.error("Erreur suppression:", err);
      setError("Erreur lors de la suppression : " + err.message);
      alert("Erreur: " + err.message);
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


  const handleMoveGranule = async (
    type: 'chapter' | 'paragraph' | 'notion',
    itemId: string,
    newParentId: string
  ) => {
    if (!projectData) return;

    try {
      setIsLoading(true);
      setError('');

      console.log(`🔄 Déplacement ${type} ${itemId} vers parent ${newParentId}`);

      // Appel API pour déplacer le granule
      await structureService.moveGranule(
        projectData.pr_name,
        type,
        itemId,
        newParentId
      );

      // Recharger la structure complète (silencieux)
      await loadProject(true);

      // Toast succès
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-right';
      successMsg.innerHTML = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> ${type.charAt(0).toUpperCase() + type.slice(1)} déplacé(e) avec succès`;
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);

    } catch (err: any) {
      console.error('❌ Erreur déplacement:', err);
      setError(`Erreur: ${err.message}`);

      // Toast erreur
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
      errorMsg.textContent = `Erreur: ${err.message}`;
      document.body.appendChild(errorMsg);
      setTimeout(() => document.body.removeChild(errorMsg), 5000);
    } finally {
      setIsLoading(false);
    }
  };

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
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media only screen and (max-width: 768px) {
          /* Force desktop-like scale on mobile */
          viewport { width: 1200px !important; initial-scale: 0.5 !important; }
        }
      ` }} />
      <meta name="viewport" content="width=1200, initial-scale=0.5" />
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <TableOfContents
          projectName={projectData?.pr_name || ''}
          structure={structure}
          onSelectNotion={handleSelectNotion}
          onSelectPart={handleSelectPart}
          onSelectChapter={handleSelectChapter}
          onSelectParagraph={handleSelectParagraph}
          selectedPartId={currentContext?.part?.part_id}
          selectedChapterId={currentContext?.chapterId}
          selectedParagraphId={currentContext?.paraId}
          selectedNotionId={currentContext?.notion?.notion_id}
          onCreatePart={handleCreatePart}
          onCreateChapter={handleCreateChapter}
          onCreateParagraph={handleCreateParagraph}
          onCreateNotion={handleCreateNotion}
          onRename={handleRename}
          onReorder={handleReorder}        // ✅ HANDLER DE RÉORDONNANCEMENT
          onMove={handleMoveGranule}        // ✅ HANDLER DE DÉPLACEMENT
          onDelete={handleDelete}
          language={language}
        />

        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-4">
              <Link
                href="/edit-home"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-[#99334C]"
                title="Retour à l'accueil"
              >
                <Home className="w-5 h-5" />
              </Link>

              <h1 className="text-lg font-bold text-gray-900 border-l pl-4 border-gray-200">
                {projectData?.pr_name}
              </h1>

              {currentContext && (
                <div className="flex items-center gap-2 text-sm text-gray-500 ml-4 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  {currentContext.type === 'notion' ? (
                    <>
                      <span className="hover:text-gray-700 transition-colors uppercase text-[10px] font-bold tracking-wider">{currentContext.partTitle}</span>
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                      <span className="hover:text-gray-700 transition-colors uppercase text-[10px] font-bold tracking-wider">{currentContext.chapterTitle}</span>
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                      <span className="hover:text-gray-700 transition-colors uppercase text-[10px] font-bold tracking-wider">{currentContext.paraName}</span>
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                      <span className="font-bold text-[#99334C]">{currentContext.notionName}</span>
                    </>
                  ) : (
                    <>
                      <span className="uppercase text-[10px] font-bold tracking-wider">{t.editor.part}</span>
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                      <span className="font-bold text-[#99334C]">{currentContext.partTitle}</span>
                      <span className="ml-1 text-gray-400 font-normal">(Intro)</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">

              <button
                onClick={() => {
                  if (hasUnsavedChanges) handleSave(true);
                  router.push(`/preview?projectName=${encodeURIComponent(projectData?.pr_name || '')}`);
                }}
                className="px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                title={t.editor.publishPreview}
              >
                <Eye className="w-4 h-4" />
                {t.editor.publishPreview.split(' / ')[0]}
              </button>


              {/* Bouton Partager - AVEC CHECK AUTH */}
              <button
                onClick={() => {
                  setShowShareOverlay(true);
                }}
                className="px-4 py-2 border border-[#99334C] text-[#99334C] bg-white rounded-lg hover:bg-[#99334C]/5 transition-all flex items-center gap-2 font-medium"
                title="Publier / Partager le projet"
              >
                <Share2 className="w-4 h-4" />
                Partager
              </button>

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
            disabled={isToolbarDisabled}  // ✅ AJOUT DE LA PROP disabled
          />

          {currentContext ? (
            <EditorArea
              content={editorContent}
              textFormat={textFormat}
              onChange={setEditorContent}
              onDrop={handleDropNew} // Utilise la nouvelle méthode
              editorRef={editorRef}
              isImporting={isImporting}
              readOnly={currentContext.type === 'chapter' || currentContext.type === 'paragraph'}
              placeholder={
                currentContext.type === 'part'
                  ? t.editor.partPlaceholder
                  : currentContext.type === 'chapter'
                    ? t.editor.chapterPlaceholder
                    : currentContext.type === 'paragraph'
                      ? t.editor.paragraphPlaceholder
                      : currentContext.type === 'notion'
                        ? t.editor.notionPlaceholder
                        : t.editor.selectPrompt
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
          granules={[
            {
              id: 'p1',
              type: 'part',
              content: 'Partie 1: Fondamentaux',
              icon: 'Folder',
              children: [
                {
                  id: 'c1',
                  type: 'chapter',
                  content: 'Chapitre 1: Introduction',
                  icon: 'Book',
                  children: [
                    {
                      id: 'pg1',
                      type: 'paragraph',
                      content: 'Paragraphe 1.1: Concepts',
                      icon: 'FileText',
                      children: [
                        { id: 'n1', type: 'notion', content: 'Notion 1: Définition', icon: 'File' },
                        { id: 'n2', type: 'notion', content: 'Notion 2: Exemples', icon: 'File' }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: 'p2',
              type: 'part',
              content: 'Partie 2: Avancé',
              icon: 'Folder',
              children: []
            }
          ]}
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
          onUpdateProject={handleUpdateProjectSettings}
          comments={comments}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          isFetchingComments={isFetchingComments}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900 outline-none"
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-gray-500">Min. 3 caractères</p>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900 outline-none"
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-gray-500">Min. 3 caractères</p>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900 outline-none"
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-gray-500">Min. 3 caractères</p>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#99334C] text-gray-900 outline-none"
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-gray-500">Min. 3 caractères</p>
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

        {/* Overlay de partage */}
        <ShareOverlay
          isOpen={showShareOverlay}
          onClose={() => setShowShareOverlay(false)}
          projectName={projectName}
        />
      </div>
    </>
  );
};

export default XCCM2Editor;