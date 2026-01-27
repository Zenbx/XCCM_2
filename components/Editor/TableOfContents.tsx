"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, Folder, FolderOpen, FileText, GripVertical } from 'lucide-react';
import { Part, Chapter, Paragraph, Notion } from '@/services/structureService';
import { Language } from '@/services/locales';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import ContextMenu from './ContextMenu';
import RichTooltip from '../UI/RichTooltip';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import { usePrefetch } from '@/hooks/usePrefetch'; // ✅ Prefetching
import { showError } from '../UI/ErrorToast'; // ✅ Error messages améliorés
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'; // ✅ Navigation clavier

// Animation variants pour les conteneurs expandables
const expandVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.2 },
      opacity: { duration: 0.15 }
    }
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      height: { duration: 0.2 },
      opacity: { duration: 0.15, delay: 0.05 }
    }
  }
};

// Animation pour les items individuels
const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.03,
      duration: 0.2
    }
  })
};

// Animation pour le chevron de toggle
const chevronVariants = {
  collapsed: { rotate: 0 },
  expanded: { rotate: 90 }
};

// Couleurs par type pour le ghost image
const typeColors: Record<string, string> = {
  part: '#99334C',
  chapter: '#DC3545',
  paragraph: '#D97706',
  notion: '#28A745'
};

// Icônes par type (pour le ghost)
const typeIcons: Record<string, string> = {
  part: '📁',
  chapter: '📖',
  paragraph: '📄',
  notion: '📝'
};

const TOCSkeleton = () => (
  <div className="p-3 space-y-4 animate-pulse opacity-60">
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-200" />
          <div className="h-5 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="pl-6 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

// Créer un ghost image personnalisé pour le drag
const createDragGhost = (
  type: 'part' | 'chapter' | 'paragraph' | 'notion',
  title: string
): HTMLElement => {
  const ghost = document.createElement('div');
  const color = typeColors[type];

  ghost.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: linear-gradient(135deg, ${color}15, ${color}08);
      border: 2px solid ${color};
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 0 1px ${color}40;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: ${color};
      white-space: nowrap;
      max-width: 200px;
      overflow: hidden;
      backdrop-filter: blur(8px);
    ">
      <span style="font-size: 14px;">${typeIcons[type]}</span>
      <span style="overflow: hidden; text-overflow: ellipsis;">${title}</span>
      <span id="drag-warning-icon" style="display: none; margin-left: auto; color: #EF4444;">⚠️</span>
    </div>
  `;

  ghost.style.position = 'absolute';
  ghost.style.top = '-1000px';
  ghost.style.left = '-1000px';
  ghost.style.zIndex = '9999';

  document.body.appendChild(ghost);

  return ghost;
};

// Helper pour mettre à jour l'arbre localement
const updateTree = (
  currentStructure: Part[],
  type: 'part' | 'chapter' | 'paragraph' | 'notion',
  parentId: string | null,
  newChildren: any[]
): Part[] => {
  const newStructure = JSON.parse(JSON.stringify(currentStructure));

  if (type === 'part') {
    return newChildren;
  }

  if (type === 'chapter') {
    const part = newStructure.find((p: Part) => p.part_id === parentId);
    if (part) part.chapters = newChildren;
    return newStructure;
  }

  if (type === 'paragraph') {
    for (const part of newStructure) {
      const chap = part.chapters?.find((c: Chapter) => c.chapter_id === parentId);
      if (chap) {
        chap.paragraphs = newChildren;
        return newStructure;
      }
    }
  }

  if (type === 'notion') {
    for (const part of newStructure) {
      for (const chap of part.chapters || []) {
        const para = chap.paragraphs?.find((p: Paragraph) => p.para_id === parentId);
        if (para) {
          para.notions = newChildren;
          return newStructure;
        }
      }
    }
  }

  return newStructure;
};

// Helper pour déplacer un élément (changement de parent)
const moveInTree = (
  currentStructure: Part[],
  type: 'chapter' | 'paragraph' | 'notion',
  itemId: string,
  newParentId: string
): Part[] => {
  const newStructure = JSON.parse(JSON.stringify(currentStructure));
  let itemToMove: any = null;

  // 1. Trouver et retirer l'élément de son ancien emplacement
  if (type === 'chapter') {
    for (const part of newStructure) {
      if (part.chapters) {
        const idx = part.chapters.findIndex((c: Chapter) => c.chapter_id === itemId);
        if (idx !== -1) {
          [itemToMove] = part.chapters.splice(idx, 1);
          break;
        }
      }
    }
  } else if (type === 'paragraph') {
    outer: for (const part of newStructure) {
      for (const chap of part.chapters || []) {
        if (chap.paragraphs) {
          const idx = chap.paragraphs.findIndex((p: Paragraph) => p.para_id === itemId);
          if (idx !== -1) {
            [itemToMove] = chap.paragraphs.splice(idx, 1);
            break outer;
          }
        }
      }
    }
  } else if (type === 'notion') {
    outer: for (const part of newStructure) {
      for (const chap of part.chapters || []) {
        for (const para of chap.paragraphs || []) {
          if (para.notions) {
            const idx = para.notions.findIndex((n: Notion) => n.notion_id === itemId);
            if (idx !== -1) {
              [itemToMove] = para.notions.splice(idx, 1);
              break outer;
            }
          }
        }
      }
    }
  }

  if (!itemToMove) return currentStructure;

  // 2. Ajouter l'élément au nouveau parent
  if (type === 'chapter') {
    const part = newStructure.find((p: Part) => p.part_id === newParentId);
    if (part) {
      if (!part.chapters) part.chapters = [];
      part.chapters.push(itemToMove);
    }
  } else if (type === 'paragraph') {
    outerAdd: for (const part of newStructure) {
      const chap = part.chapters?.find((c: Chapter) => c.chapter_id === newParentId);
      if (chap) {
        if (!chap.paragraphs) chap.paragraphs = [];
        chap.paragraphs.push(itemToMove);
        break outerAdd;
      }
    }
  } else if (type === 'notion') {
    outerAdd: for (const part of newStructure) {
      for (const chap of part.chapters || []) {
        const para = chap.paragraphs?.find((p: Paragraph) => p.para_id === newParentId);
        if (para) {
          if (!para.notions) para.notions = [];
          para.notions.push(itemToMove);
          break outerAdd;
        }
      }
    }
  }

  return newStructure;
};

// Helper: Flatten hierarchical structure to flat array for keyboard navigation
function flattenStructure(
  structure: Part[],
  expandedItems: Record<string, boolean>
): Array<{
  id: string;
  type: 'part' | 'chapter' | 'paragraph' | 'notion';
  depth: number;
  data: any;
}> {
  const result: any[] = [];

  structure.forEach(part => {
    result.push({
      type: 'part',
      data: part,
      depth: 0,
      id: part.part_id
    });

    if (expandedItems[`part-${part.part_id}`] && part.chapters) {
      part.chapters.forEach(chapter => {
        result.push({
          type: 'chapter',
          data: chapter,
          depth: 1,
          id: chapter.chapter_id
        });

        if (expandedItems[`chapter-${chapter.chapter_id}`] && chapter.paragraphs) {
          chapter.paragraphs.forEach(para => {
            result.push({
              type: 'paragraph',
              data: para,
              depth: 2,
              id: para.para_id
            });

            if (expandedItems[`paragraph-${para.para_id}`] && para.notions) {
              para.notions.forEach(notion => {
                result.push({
                  type: 'notion',
                  data: notion,
                  depth: 3,
                  id: notion.notion_id
                });
              });
            }
          });
        }
      });
    }
  });

  return result;
}

interface TableOfContentsProps {
  projectName: string;
  structure: Part[];
  onSelectNotion: (context: {
    projectName: string;
    partTitle: string;
    chapterTitle: string;
    paraName: string;
    notionName: string;
    notion: Notion;
  }) => void;
  onSelectPart?: (context: {
    projectName: string;
    partTitle: string;
    part: Part;
  }) => void;
  onSelectChapter?: (projectName: string, partTitle: string, chapterTitle: string, chapterId: string) => void;
  onSelectParagraph?: (projectName: string, partTitle: string, chapterTitle: string, paraName: string, paraId: string) => void;
  selectedPartId?: string;
  onCreatePart?: () => void;
  onCreateChapter?: (partTitle: string) => void;
  onCreateParagraph?: (partTitle: string, chapterTitle: string) => void;
  onCreateNotion?: (partTitle: string, chapterTitle: string, paraName: string) => void;
  selectedChapterId?: string;
  selectedParagraphId?: string;
  selectedNotionId?: string;
  onRename?: (type: 'part' | 'chapter' | 'paragraph' | 'notion', id: string, newTitle: string) => Promise<void>;
  onReorder?: (type: 'part' | 'chapter' | 'paragraph' | 'notion', parentId: string | null, items: any[]) => Promise<void>;
  onMove?: (type: 'chapter' | 'paragraph' | 'notion', itemId: string, newParentId: string) => Promise<void>;
  onExternalDrop?: (granule: any, targetType?: string, targetId?: string, targetParentId?: string | null) => Promise<void>;
  onDelete?: (type: 'part' | 'chapter' | 'paragraph' | 'notion', id: string) => Promise<void>;
  onPublishToMarketplace?: (type: string, id: string, title: string) => void;
  language?: Language;
  width?: number;
  isNotionOpen?: boolean;
  pulsingId?: string | null;
  pendingGranule?: { type: 'part' | 'chapter' | 'paragraph' | 'notion'; content: string } | null;
  isLoading?: boolean;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  projectName,
  structure = [],
  onSelectNotion,
  onSelectPart,
  onSelectChapter,
  onSelectParagraph,
  selectedPartId,
  onCreatePart,
  onCreateChapter,
  onCreateParagraph,
  onCreateNotion,
  selectedNotionId,
  selectedChapterId,
  selectedParagraphId,
  onRename,
  onReorder,
  onMove,
  onExternalDrop,
  onDelete,
  onPublishToMarketplace,
  language = 'fr',
  width = 320,
  isNotionOpen = false,
  pulsingId = null,
  pendingGranule = null,
  isLoading = false
}) => {
  const t = useTranslations('toc');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  const [optimisticStructure, setOptimisticStructure] = useState<Part[]>(structure);
  const { execute } = useOptimisticUpdate<Part[]>();

  // ✅ Prefetch hook
  const { prefetchNotion, prefetchPart } = usePrefetch({
    maxCacheSize: 50,
    ttl: 5 * 60 * 1000, // 5 minutes
  });

  // ✅ Hover prefetch timers
  const hoverTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // ✅ Navigation clavier - Flatten structure
  const flatItems = React.useMemo(
    () => flattenStructure(optimisticStructure, expandedItems),
    [optimisticStructure, expandedItems]
  );

  // ✅ Navigation clavier hook
  const {
    focusedIndex,
    isTOCFocused,
    tocRef,
    handleTOCFocus,
    handleTOCBlur
  } = useKeyboardNavigation({
    items: flatItems,
    expandedItems,
    onSelect: (item) => {
      if (item.type === 'notion') {
        const part = optimisticStructure.find(p =>
          p.chapters?.some(c =>
            c.paragraphs?.some(pa =>
              pa.notions?.some(n => n.notion_id === item.id)
            )
          )
        );
        const chapter = part?.chapters?.find(c =>
          c.paragraphs?.some(pa =>
            pa.notions?.some(n => n.notion_id === item.id)
          )
        );
        const para = chapter?.paragraphs?.find(pa =>
          pa.notions?.some(n => n.notion_id === item.id)
        );

        if (part && chapter && para) {
          onSelectNotion({
            projectName,
            partTitle: part.part_title,
            chapterTitle: chapter.chapter_title,
            paraName: para.para_name,
            notionName: item.data.notion_name,
            notion: item.data
          });
        }
      } else if (item.type === 'part' && onSelectPart) {
        onSelectPart({
          projectName,
          partTitle: item.data.part_title,
          part: item.data
        });
      }
    },
    onToggleExpand: (id) => toggleExpand(id),
    onRename: (item) => {
      const title = item.type === 'part' ? item.data.part_title :
        item.type === 'chapter' ? item.data.chapter_title :
          item.type === 'paragraph' ? item.data.para_name :
            item.data.notion_name;
      startEditing(null as any, item.id, title);
    },
    onDelete: onDelete ? (item) => onDelete(item.type, item.id) : undefined,
    enabled: true
  });

  // Sync avec les props (le serveur a toujours raison à la fin)
  // Sauf si on est en train de draguer (optionnel, mais safest est react useEffect)
  React.useEffect(() => {
    setOptimisticStructure(structure);
  }, [structure]);

  // ✅ Auto-Expand Logic (quand un nouvel item est créé/pulsing)
  React.useEffect(() => {
    if (!pulsingId || !structure) return;

    const newExpanded = { ...expandedItems };
    let changed = false;

    structure.forEach(part => {
      // 1. Is it the part itself?
      if (part.part_id === pulsingId) {
        // No parent to expand
      }

      // 2. Is it a chapter?
      if (part.chapters) {
        part.chapters.forEach(chap => {
          if (chap.chapter_id === pulsingId) {
            newExpanded[`part-${part.part_id}`] = true;
            changed = true;
          }

          // 3. Is it a paragraph?
          if (chap.paragraphs) {
            chap.paragraphs.forEach(para => {
              if (para.para_id === pulsingId) {
                newExpanded[`part-${part.part_id}`] = true;
                newExpanded[`chapter-${chap.chapter_id}`] = true;
                changed = true;
              }

              // 4. Is it a notion?
              if (para.notions) {
                para.notions.forEach(notion => {
                  if (notion.notion_id === pulsingId) {
                    newExpanded[`part-${part.part_id}`] = true;
                    newExpanded[`chapter-${chap.chapter_id}`] = true;
                    newExpanded[`paragraph-${para.para_id}`] = true;
                    changed = true;
                  }
                });
              }
            });
          }
        });
      }
    });

    if (changed) {
      setExpandedItems(prev => ({ ...prev, ...newExpanded }));
    }
  }, [pulsingId, structure]);

  // Drag & Drop states
  const [draggedItem, setDraggedItem] = useState<{
    type: 'part' | 'chapter' | 'paragraph' | 'notion';
    id: string;
    parentId: string | null;
    item: any;
  } | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    type: 'part' | 'chapter' | 'paragraph' | 'notion';
    id: string;
    mode: 'reorder' | 'move-into';
  } | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    type?: 'part' | 'chapter' | 'paragraph' | 'notion';
    id?: string;
    partTitle?: string;
    chapterTitle?: string;
    paraName?: string;
  }>({ isOpen: false, x: 0, y: 0 });

  const isSubmitting = useRef(false);
  const dragGhostRef = useRef<HTMLElement | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getIconColor = (type: 'part' | 'chapter' | 'paragraph' | 'notion') => {
    switch (type) {
      case 'part': return '#99334C';
      case 'chapter': return '#DC3545';
      case 'paragraph': return '#D97706';
      case 'notion': return '#28A745';
      default: return '#000';
    }
  };

  const startEditing = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingId(id);
    setTempTitle(currentTitle);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTempTitle("");
  };

  const submitRename = async (type: 'part' | 'chapter' | 'paragraph' | 'notion', id: string) => {
    if (isSubmitting.current) return;
    const newTitle = tempTitle.trim();
    if (newTitle && onRename) {
      isSubmitting.current = true;
      cancelEditing();
      try {
        await onRename(type, id, newTitle);
      } catch (error) {
        showError({
          title: "Échec du renommage",
          message: error instanceof Error ? error.message : "Une erreur est survenue lors du renommage de l'élément.",
          type: 'network',
          retry: () => submitRename(type, id)
        });
      } finally {
        isSubmitting.current = false;
      }
    } else {
      cancelEditing();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'part' | 'chapter' | 'paragraph' | 'notion', id: string) => {
    if (e.key === 'Enter') submitRename(type, id);
    if (e.key === 'Escape') cancelEditing();
  };

  const handleContextMenu = (e: React.MouseEvent, type: 'part' | 'chapter' | 'paragraph' | 'notion', id: string, extra: any = {}) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      type,
      id,
      partTitle: extra.partTitle,
      chapterTitle: extra.chapterTitle,
      paraName: extra.paraName,
    });
  };

  const handleContextMenuDelete = async () => {
    if (!contextMenu.type || !contextMenu.id || !onDelete) return;
    try {
      await onDelete(contextMenu.type, contextMenu.id);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Erreur inconnue";
      showError({
        title: "Erreur lors de la suppression",
        message: errorMsg,
        type: 'network',
        retry: () => handleContextMenuDelete()
      });
    }
  };

  // ============= DRAG & DROP =============

  const [forbiddenTarget, setForbiddenTarget] = useState<string | null>(null);
  const [activeShake, setActiveShake] = useState<string | null>(null);

  const triggerShake = (id: string) => {
    setActiveShake(id);
    if ('vibrate' in navigator) navigator.vibrate(50);
    setTimeout(() => setActiveShake(null), 500);
  };

  // ✅ NOUVEAU: Fonction pour afficher un toast avec la raison du refus
  const showInvalidDropToast = (reason: string) => {
    toast.error(reason, {
      icon: '🚫',
      duration: 3000,
      style: {
        background: '#FEE2E2',
        color: '#991B1B',
        border: '1px solid #FCA5A5',
      },
    });
  };

  const handleDragStart = (
    e: React.DragEvent,
    type: 'part' | 'chapter' | 'paragraph' | 'notion',
    item: any,
    parentId: string | null
  ) => {
    e.stopPropagation();
    const id = item.part_id || item.chapter_id || item.para_id || item.notion_id;
    const title = item.part_title || item.chapter_title || item.para_name || item.notion_name || 'Élément';

    const ghost = createDragGhost(type, title);
    dragGhostRef.current = ghost;

    if (e.dataTransfer) {
      e.dataTransfer.setDragImage(ghost.firstElementChild as HTMLElement, 20, 20);
      e.dataTransfer.setData('application/x-toc-item', JSON.stringify({ type, id, parentId }));
      e.dataTransfer.effectAllowed = 'move';
    }

    setDraggedItem({ type, id, parentId, item });
  };

  const handleDragOver = (
    e: React.DragEvent,
    targetType: 'part' | 'chapter' | 'paragraph' | 'notion',
    targetId: string,
    targetParentId: string | null
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Si c'est un granule externe (draggedItem est null), on autorise le drop
    if (!draggedItem) {
      if (e.dataTransfer.types.includes('granule')) {
        setDropTarget({ type: targetType, id: targetId, mode: 'move-into' });
      }
      return;
    }

    const { type: dragType, id: dragId, parentId: dragParentId } = draggedItem;

    // --- Validation logically impossible moves ---
    let isForbidden = false;
    let forbiddenReason = '';

    // 1. Cannot drop on itself
    if (dragId === targetId) {
      isForbidden = true;
      forbiddenReason = "❌ Impossible de déposer un élément sur lui-même";
    }

    // 2. ✅ NOUVEAU: Block all drops if a notion is currently open
    if (isNotionOpen && !isForbidden) {
      isForbidden = true;
      forbiddenReason = "❌ Fermez la notion actuelle avant de réorganiser la structure";
    }

    // 3. Strict hierarchical rules
    if (!isForbidden && dragType === 'part' && targetType !== 'part') {
      isForbidden = true;
      forbiddenReason = "❌ Une partie ne peut être déplacée que parmi d'autres parties";
    }
    if (!isForbidden && dragType === 'chapter' && (targetType === 'paragraph' || targetType === 'notion')) {
      isForbidden = true;
      forbiddenReason = "❌ Un chapitre ne peut aller que dans une partie ou parmi d'autres chapitres";
    }
    if (!isForbidden && dragType === 'paragraph' && targetType === 'notion') {
      isForbidden = true;
      forbiddenReason = "❌ Un paragraphe ne peut pas être déplacé dans une notion";
    }

    // 4. Reverse hierarchy (cannot move parent into child)
    if (!isForbidden && dragType === 'part' && targetId.includes('chapter')) {
      isForbidden = true;
      forbiddenReason = "❌ Impossible de déplacer un parent dans son propre enfant";
    }

    if (isForbidden) {
      setForbiddenTarget(targetId);
      setDropTarget(null);
      // Store reason for display on drop attempt
      e.dataTransfer.dropEffect = 'none';
      return;
    }

    setForbiddenTarget(null);

    // --- End-of-list targets ---
    if (targetId.endsWith('-end')) {
      if (
        (targetId === 'root-end' && dragType === 'part') ||
        (targetId.endsWith('-chapters-end') && dragType === 'chapter') ||
        (targetId.endsWith('-paragraphs-end') && dragType === 'paragraph') ||
        (targetId.endsWith('-notions-end') && dragType === 'notion')
      ) {
        setDropTarget({ type: dragType, id: targetId, mode: 'reorder' });
        return;
      }
    }

    // --- Drop on existing item ---
    if (dragType === targetType && dragId !== targetId) {
      if (dragParentId === targetParentId) {
        setDropTarget({ type: targetType, id: targetId, mode: 'reorder' });
      } else {
        setDropTarget({ type: targetType, id: targetId, mode: 'move-into' });
      }
    }
    // --- Move into parent directly ---
    else if (
      (dragType === 'chapter' && targetType === 'part') ||
      (dragType === 'paragraph' && targetType === 'chapter') ||
      (dragType === 'notion' && targetType === 'paragraph')
    ) {
      if (targetId !== dragParentId) {
        setDropTarget({ type: targetType, id: targetId, mode: 'move-into' });
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setDropTarget(null);
      setForbiddenTarget(null);
    }
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetType: 'part' | 'chapter' | 'paragraph' | 'notion',
    targetId: string,
    targetParentId: string | null
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (forbiddenTarget === targetId) {
      triggerShake(targetId);
      // ✅ NOUVEAU: Show contextual error toast
      if (isNotionOpen) {
        showInvalidDropToast("❌ Fermez la notion actuelle avant de réorganiser la structure");
      } else {
        showInvalidDropToast("❌ Cette opération n'est pas permise ici");
      }
      setDropTarget(null);
      setForbiddenTarget(null);
      return;
    }

    setDropTarget(null);
    setForbiddenTarget(null);

    // ✅ NOUVEAU: Gestion du Drop Externe (Depuis RightPanel)
    if (!draggedItem && onExternalDrop) {
      try {
        const granuleData = e.dataTransfer.getData('granule');
        if (granuleData) {
          const granule = JSON.parse(granuleData);
          await onExternalDrop(granule, targetType, targetId, targetParentId);
          return;
        }
      } catch (err) {
        console.error("Erreur parsing granule drop:", err);
      }
    }

    if (!draggedItem) return;
    const { type: dragType, id: dragId, parentId: dragParentId } = draggedItem;
    setDraggedItem(null);

    // Cas: Drop à la fin d'une liste
    if (targetId.endsWith('-end') && onReorder) {
      let items: any[] = [];
      if (dragType === 'part') {
        items = [...optimisticStructure];
      } else if (dragType === 'chapter') {
        const part = optimisticStructure.find(p => p.part_id === targetParentId);
        items = [...(part?.chapters || [])];
      } else if (dragType === 'paragraph') {
        for (const p of optimisticStructure) {
          const c = p.chapters?.find(ch => ch.chapter_id === targetParentId);
          if (c) { items = [...(c.paragraphs || [])]; break; }
        }
      } else if (dragType === 'notion') {
        for (const p of optimisticStructure) {
          for (const c of p.chapters || []) {
            const para = c.paragraphs?.find(pg => pg.para_id === targetParentId);
            if (para) { items = [...(para.notions || [])]; break; }
          }
        }
      }

      const getId = (i: any) => i.part_id || i.chapter_id || i.para_id || i.notion_id;
      const dragIndex = items.findIndex(i => getId(i) === dragId);

      if (dragIndex !== -1) {
        const [movedItem] = items.splice(dragIndex, 1);
        items.push(movedItem);

        // Optimistic update
        const newStruct = updateTree(optimisticStructure, dragType, targetParentId, items);
        execute(optimisticStructure, newStruct, {
          onOptimisticUpdate: setOptimisticStructure,
          onRollback: setOptimisticStructure,
          apiCall: async () => await onReorder(dragType, targetParentId, items),
          errorMessage: "Erreur lors du réordonnancement"
        });

      } else if (dragParentId !== targetParentId && onMove) {
        await onMove(dragType as any, dragId, targetParentId!);
      }
      return;
    }

    // Cas: Reorder sur un item existant
    if (dragType === targetType && dragParentId === targetParentId && dragId !== targetId && onReorder) {
      let items: any[] = [];
      if (dragType === 'part') {
        items = [...optimisticStructure];
      } else if (dragType === 'chapter') {
        const part = optimisticStructure.find(p => p.part_id === targetParentId);
        items = [...(part?.chapters || [])];
      } else if (dragType === 'paragraph') {
        for (const p of optimisticStructure) {
          const c = p.chapters?.find(ch => ch.chapter_id === targetParentId);
          if (c) { items = [...(c.paragraphs || [])]; break; }
        }
      } else if (dragType === 'notion') {
        for (const p of optimisticStructure) {
          for (const c of p.chapters || []) {
            const para = c.paragraphs?.find(pg => pg.para_id === targetParentId);
            if (para) { items = [...(para.notions || [])]; break; }
          }
        }
      }

      const getId = (i: any) => i.part_id || i.chapter_id || i.para_id || i.notion_id;
      const dragIndex = items.findIndex(i => getId(i) === dragId);
      const dropIndex = items.findIndex(i => getId(i) === targetId);

      if (dragIndex !== -1 && dropIndex !== -1) {
        const [movedItem] = items.splice(dragIndex, 1);
        items.splice(dropIndex, 0, movedItem);

        // Optimistic update
        const newStruct = updateTree(optimisticStructure, dragType, targetParentId, items);
        execute(optimisticStructure, newStruct, {
          onOptimisticUpdate: setOptimisticStructure,
          onRollback: setOptimisticStructure,
          apiCall: async () => await onReorder(dragType, targetParentId, items),
          errorMessage: "Erreur lors du réordonnancement"
        });
      }
    }
    // Cas: Move into new parent
    else if (onMove) {
      if (
        (dragType === 'chapter' && targetType === 'part') ||
        (dragType === 'paragraph' && targetType === 'chapter') ||
        (dragType === 'notion' && targetType === 'paragraph') ||
        (dragType !== 'part' && dragType === targetType && dragParentId !== targetParentId && targetParentId)
      ) {
        let actualNewParentId = targetId;
        if (dragType === targetType) {
          actualNewParentId = targetParentId!;
        }

        // Move Optimiste
        const newStruct = moveInTree(optimisticStructure, dragType as any, dragId, actualNewParentId);
        execute(optimisticStructure, newStruct, {
          onOptimisticUpdate: setOptimisticStructure,
          onRollback: setOptimisticStructure,
          apiCall: async () => await onMove(dragType as any, dragId, actualNewParentId),
          errorMessage: "Erreur lors du déplacement"
        });
      }
    }
  };

  const handleDragEnd = () => {
    if (dragGhostRef.current) {
      dragGhostRef.current.remove();
      dragGhostRef.current = null;
    }
    setDraggedItem(null);
    setDropTarget(null);
    setForbiddenTarget(null);
  };

  const getDropStyle = (type: string, id: string) => {
    let classes = '';
    if (activeShake === id) classes += ' animate-shake';
    if (forbiddenTarget === id) return classes + ' drop-forbidden animate-pulse border-2 border-red-500 bg-red-50';

    if (dropTarget && dropTarget.id === id) {
      if (dropTarget.mode === 'reorder') {
        classes += ' border-t-2 border-t-[#99334C] bg-[#99334C]/5';
      } else if (dropTarget.mode === 'move-into') {
        classes += ' ring-2 ring-blue-500 bg-blue-50';
      }
    }
    return classes;
  };

  return (
    <div
      ref={tocRef as React.RefObject<HTMLDivElement>}
      tabIndex={0}
      onFocus={handleTOCFocus}
      onBlur={handleTOCBlur}
      className={`bg-white border-r border-gray-200 overflow-y-auto flex flex-col h-full select-none transition-all`}
      style={{
        width: `${width}px`,
        ...(isTOCFocused && {
          boxShadow: 'inset 0 0 0 4px #99334C40'
        })
      }}
      aria-label="Table of Contents - Use arrow keys to navigate, Enter to select, F2 to rename, Delete to remove"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
        <h2 className="text-gray-800 font-bold text-sm uppercase tracking-wider">{t('title')}</h2>
        <div className="flex items-center gap-2">
          {/* ✅ NOUVEAU: Info tooltip */}
          <RichTooltip
            title="💡 Guide Drag & Drop"
            description="Glissez-déposez pour réorganiser. Hiérarchie: Partie > Chapitre > Paragraphe > Notion. Fermez toute notion ouverte avant de réorganiser."
          >
            <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </RichTooltip>
          <RichTooltip title={t('addPart')} description="Créer une nouvelle division principale dans votre projet.">
            <button
              onClick={onCreatePart}
              className="p-1.5 bg-[#99334C]/10 text-[#99334C] hover:bg-[#99334C] hover:text-white rounded-md transition-all"
            >
              <Plus size={18} />
            </button>
          </RichTooltip>
        </div>
      </div>

      {/* ✅ NOUVEAU: Warning banner when notion is open */}
      {isNotionOpen && (
        <div className="mx-3 mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Réorganisation désactivée : fermez la notion actuelle pour déplacer des éléments</span>
        </div>
      )}

      {/* Contenu */}
      <div
        className="p-3 flex-1 overflow-y-auto space-y-2 relative"
        onDragOver={(e) => {
          // Allow drop if it's an external granule
          if (!draggedItem) {
            e.preventDefault();
          }
        }}
        onDrop={(e) => {
          if (!draggedItem) {
            handleDrop(e, 'part', 'root-end', null);
          }
        }}
      >
        {isLoading ? (
          <TOCSkeleton />
        ) : optimisticStructure.length === 0 ? (
          <div
            className={`text-center py-12 text-gray-400 rounded-xl border-2 border-dashed transition-all ${dropTarget?.id === 'empty-state' ? 'border-[#99334C] bg-[#99334C]/5' : 'border-transparent'}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDropTarget({ type: 'part', id: 'empty-state', mode: 'move-into' });
            }}
            onDragLeave={() => setDropTarget(null)}
            onDrop={(e) => handleDrop(e, 'part', 'root-end', null)}
          >
            <Folder size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Le projet est vide</p>
            {onCreatePart && (
              <button onClick={onCreatePart} className="mt-3 text-[#99334C] font-medium hover:underline text-sm">
                {t('addPart')}
              </button>
            )}
            {pendingGranule && pendingGranule.type === 'part' && (
              <div className="mt-6 flex items-center gap-2 py-2 px-2 bg-gray-50/50 rounded-lg animate-pulse border-2 border-dashed border-[#99334C]/30 text-left">
                <span className="text-gray-300"><GripVertical size={14} /></span>
                <div className="w-5 h-5 rounded bg-[#99334C]/20" />
                <div className="h-4 bg-gray-200 rounded w-48" />
              </div>
            )}
          </div>
        ) : (
          <>
            {optimisticStructure.map(part => (
              <div key={part.part_id} className="relative group/part">
                <div
                  className={`flex items-center gap-2 py-2 px-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors
                  ${selectedPartId === part.part_id ? 'bg-[#99334C]/10 text-[#99334C] shadow-sm rounded-lg' : 'rounded-lg'}
                  ${pulsingId === part.part_id ? 'animate-pulse ring-2 ring-[#99334C]' : ''}
                  ${getDropStyle('part', part.part_id)}`}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, 'part', part, null)}
                  onDragOver={(e) => handleDragOver(e, 'part', part.part_id, null)}
                  onDragLeave={(e) => handleDragLeave(e)}
                  onDrop={(e) => handleDrop(e, 'part', part.part_id, null)}
                  onDragEnd={handleDragEnd}
                  onContextMenu={(e) => handleContextMenu(e, 'part', part.part_id, { partTitle: part.part_title })}
                >
                  <span className="text-gray-300 cursor-grab"><GripVertical size={14} /></span>
                  <button onClick={(e) => { e.stopPropagation(); toggleExpand(`part-${part.part_id}`); }} className="p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                    {part.chapters && part.chapters.length > 0 ? (
                      <motion.div
                        variants={chevronVariants}
                        animate={expandedItems[`part-${part.part_id}`] ? "expanded" : "collapsed"}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight size={14} />
                      </motion.div>
                    ) : <div className="w-3.5" />}
                  </button>

                  {expandedItems[`part-${part.part_id}`] ? (
                    <FolderOpen size={18} className="stroke-[1.5px]" color={selectedPartId === part.part_id ? '#99334C' : getIconColor('part')} />
                  ) : (
                    <Folder size={18} className="stroke-[1.5px]" color={selectedPartId === part.part_id ? '#99334C' : getIconColor('part')} />
                  )}

                  {editingId === `part-${part.part_id}` ? (
                    <input
                      autoFocus
                      className="text-sm font-semibold flex-1 bg-white border border-[#99334C] rounded px-1 outline-none text-gray-700"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onBlur={() => submitRename('part', part.part_id)}
                      onKeyDown={(e) => handleKeyDown(e, 'part', part.part_id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div
                      className={`text-sm font-semibold truncate flex-1 ${selectedPartId === part.part_id ? 'text-[#99334C]' : 'text-gray-800'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPart?.({ projectName, partTitle: part.part_title, part });
                        toggleExpand(`part-${part.part_id}`);
                      }}
                      onDoubleClick={(e) => startEditing(e, `part-${part.part_id}`, part.part_title)}
                    >
                      {part.part_number}. {part.part_title}
                    </div>
                  )}

                  {onCreateChapter && (
                    <RichTooltip title="Ajouter un chapitre" description="Créer une sous-division logique dans cette partie.">
                      <button
                        onClick={(e) => { e.stopPropagation(); onCreateChapter(part.part_title); }}
                        className="p-1 text-gray-300 hover:text-[#DC3545] hover:bg-[#DC3545]/10 rounded transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </RichTooltip>
                  )}
                </div>

                {
                  expandedItems[`part-${part.part_id}`] && part.chapters && (
                    <AnimatePresence>
                      <motion.div
                        className="pl-6 mt-1 space-y-1 relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-gray-100"
                        initial="hidden"
                        animate="visible"
                        variants={expandVariants}
                      >
                        {part.chapters.map((chapter, idx) => (
                          <motion.div
                            key={chapter.chapter_id}
                            className="relative group/chapter"
                            custom={idx}
                            initial="hidden"
                            animate="visible"
                            variants={itemVariants}
                          >
                            <div
                              className={`flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded-lg cursor-pointer group transition-all
                              ${selectedChapterId === chapter.chapter_id ? 'bg-[#99334C]/10 text-[#99334C] shadow-sm rounded-lg' : 'rounded-lg'}
                               ${pulsingId === chapter.chapter_id ? 'animate-pulse ring-2 ring-[#99334C]' : ''}
                              ${getDropStyle('chapter', chapter.chapter_id)}`}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, 'chapter', chapter, part.part_id)}
                              onDragOver={(e) => handleDragOver(e, 'chapter', chapter.chapter_id, part.part_id)}
                              onDragLeave={(e) => handleDragLeave(e)}
                              onDrop={(e) => handleDrop(e, 'chapter', chapter.chapter_id, part.part_id)}
                              onDragEnd={handleDragEnd}
                              onContextMenu={(e) => handleContextMenu(e, 'chapter', chapter.chapter_id, { partTitle: part.part_title, chapterTitle: chapter.chapter_title })}
                            >
                              <span className="text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab"><GripVertical size={14} /></span>
                              <button onClick={(e) => { e.stopPropagation(); toggleExpand(`chapter-${chapter.chapter_id}`); }} className="p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                                {chapter.paragraphs && chapter.paragraphs.length > 0 ? (
                                  <motion.div
                                    variants={chevronVariants}
                                    animate={expandedItems[`chapter-${chapter.chapter_id}`] ? "expanded" : "collapsed"}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronRight size={14} />
                                  </motion.div>
                                ) : <div className="w-3.5" />}
                              </button>

                              {expandedItems[`chapter-${chapter.chapter_id}`] ? (
                                <FolderOpen size={16} className="stroke-[1.5px]" color={selectedChapterId === chapter.chapter_id ? '#99334C' : getIconColor('chapter')} />
                              ) : (
                                <Folder size={16} className="stroke-[1.5px]" color={selectedChapterId === chapter.chapter_id ? '#99334C' : getIconColor('chapter')} />
                              )}

                              {editingId === `chapter-${chapter.chapter_id}` ? (
                                <input
                                  autoFocus
                                  className="text-sm font-medium flex-1 bg-white border border-[#DC3545] rounded px-1 outline-none text-gray-700"
                                  value={tempTitle}
                                  onChange={(e) => setTempTitle(e.target.value)}
                                  onBlur={() => submitRename('chapter', chapter.chapter_id)}
                                  onKeyDown={(e) => handleKeyDown(e, 'chapter', chapter.chapter_id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <span
                                  className={`text-sm truncate flex-1 font-medium cursor-pointer hover:underline ${selectedChapterId === chapter.chapter_id ? 'text-[#99334C]' : 'text-gray-700'}`}
                                  onClick={() => {
                                    onSelectChapter?.(projectName, part.part_title, chapter.chapter_title, chapter.chapter_id);
                                    toggleExpand(`chapter-${chapter.chapter_id}`);
                                  }}
                                  onDoubleClick={(e) => startEditing(e, `chapter-${chapter.chapter_id}`, chapter.chapter_title)}
                                >
                                  {chapter.chapter_number}. {chapter.chapter_title}
                                </span>
                              )}

                              {onCreateParagraph && (
                                <RichTooltip title={t('addParagraph')} description="Diviser votre chapitre en sections de contenu.">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onCreateParagraph(part.part_title, chapter.chapter_title); }}
                                    className="p-1 text-gray-300 hover:text-amber-600 hover:bg-amber-50 rounded transition-all"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </RichTooltip>
                              )}
                            </div>

                            {
                              expandedItems[`chapter-${chapter.chapter_id}`] && chapter.paragraphs && (
                                <div className="pl-6 mt-1 space-y-1 relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-gray-100">
                                  {chapter.paragraphs.map(paragraph => (
                                    <div key={paragraph.para_id} className="relative group/para">
                                      <div
                                        className={`flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded-lg cursor-pointer group transition-all
                                      ${selectedParagraphId === paragraph.para_id ? 'bg-[#99334C]/10 text-[#99334C] shadow-sm rounded-lg' : 'rounded-lg'}
                                      ${pulsingId === paragraph.para_id ? 'animate-pulse ring-2 ring-[#99334C]' : ''}
                                      ${getDropStyle('paragraph', paragraph.para_id)}`}
                                        draggable={true}
                                        onDragStart={(e) => handleDragStart(e, 'paragraph', paragraph, chapter.chapter_id)}
                                        onDragOver={(e) => handleDragOver(e, 'paragraph', paragraph.para_id, chapter.chapter_id)}
                                        onDragLeave={(e) => handleDragLeave(e)}
                                        onDrop={(e) => handleDrop(e, 'paragraph', paragraph.para_id, chapter.chapter_id)}
                                        onDragEnd={handleDragEnd}
                                        onContextMenu={(e) => handleContextMenu(e, 'paragraph', paragraph.para_id, { partTitle: part.part_title, chapterTitle: chapter.chapter_title, paraName: paragraph.para_name })}
                                      >
                                        <span className="text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab"><GripVertical size={14} /></span>
                                        <button onClick={(e) => { e.stopPropagation(); toggleExpand(`paragraph-${paragraph.para_id}`); }} className="p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                                          {paragraph.notions && paragraph.notions.length > 0 ? (
                                            <motion.div
                                              variants={chevronVariants}
                                              animate={expandedItems[`paragraph-${paragraph.para_id}`] ? "expanded" : "collapsed"}
                                              transition={{ duration: 0.2 }}
                                            >
                                              <ChevronRight size={14} />
                                            </motion.div>
                                          ) : <div className="w-3.5" />}
                                        </button>

                                        {expandedItems[`paragraph-${paragraph.para_id}`] ? (
                                          <FolderOpen size={16} className="stroke-[1.5px]" color={selectedParagraphId === paragraph.para_id ? '#99334C' : getIconColor('paragraph')} />
                                        ) : (
                                          <Folder size={16} className="stroke-[1.5px]" color={selectedParagraphId === paragraph.para_id ? '#99334C' : getIconColor('paragraph')} />
                                        )}

                                        {editingId === `paragraph-${paragraph.para_id}` ? (
                                          <input
                                            autoFocus
                                            className="text-sm flex-1 bg-white border border-[#D97706] rounded px-1 outline-none text-gray-700"
                                            value={tempTitle}
                                            onChange={(e) => setTempTitle(e.target.value)}
                                            onBlur={() => submitRename('paragraph', paragraph.para_id)}
                                            onKeyDown={(e) => handleKeyDown(e, 'paragraph', paragraph.para_id)}
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        ) : (
                                          <span
                                            className={`text-sm truncate flex-1 cursor-pointer hover:underline ${selectedParagraphId === paragraph.para_id ? 'text-[#99334C]' : 'text-gray-600'}`}
                                            onClick={() => {
                                              onSelectParagraph?.(projectName, part.part_title, chapter.chapter_title, paragraph.para_name, paragraph.para_id);
                                              toggleExpand(`paragraph-${paragraph.para_id}`);
                                            }}
                                            onDoubleClick={(e) => startEditing(e, `paragraph-${paragraph.para_id}`, paragraph.para_name)}
                                          >
                                            {paragraph.para_number}. {paragraph.para_name}
                                          </span>
                                        )}

                                        {onCreateNotion && (
                                          <RichTooltip title="Ajouter une notion" description="Créer une unité de contenu (texte, image, rappel) dans ce paragraphe.">
                                            <button
                                              onClick={(e) => { e.stopPropagation(); onCreateNotion(part.part_title, chapter.chapter_title, paragraph.para_name); }}
                                              className="p-1 text-green-600/50 hover:text-green-600 hover:bg-green-50 rounded transition-all ml-auto"
                                            >
                                              <Plus size={14} />
                                            </button>
                                          </RichTooltip>
                                        )}
                                      </div>

                                      {
                                        expandedItems[`paragraph-${paragraph.para_id}`] && paragraph.notions && (
                                          <div className="pl-8 mt-1 space-y-0.5 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-px before:bg-gray-100">
                                            {paragraph.notions.map((notion) => (
                                              <div
                                                key={notion.notion_id}
                                                className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer w-full text-left transition-all group
                                            ${selectedNotionId === notion.notion_id ? 'bg-[#99334C]/10 text-[#99334C] shadow-sm rounded-lg' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg'} 
                                            ${pulsingId === notion.notion_id ? 'animate-pulse ring-2 ring-[#99334C]' : ''}
                                            ${getDropStyle('notion', notion.notion_id)}`}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, 'notion', notion, paragraph.para_id)}
                                                onDragOver={(e) => handleDragOver(e, 'notion', notion.notion_id, paragraph.para_id)}
                                                onDragLeave={(e) => handleDragLeave(e)}
                                                onDrop={(e) => handleDrop(e, 'notion', notion.notion_id, paragraph.para_id)}
                                                onDragEnd={handleDragEnd}
                                                onMouseEnter={() => {
                                                  // ✅ Prefetch on hover with 100ms delay
                                                  const timerId = setTimeout(() => {
                                                    prefetchNotion(projectName, part.part_title, chapter.chapter_title, paragraph.para_name, notion.notion_name);
                                                  }, 100);
                                                  hoverTimers.current[notion.notion_id] = timerId;
                                                }}
                                                onMouseLeave={() => {
                                                  // Clear hover timer if user leaves before delay
                                                  if (hoverTimers.current[notion.notion_id]) {
                                                    clearTimeout(hoverTimers.current[notion.notion_id]);
                                                    delete hoverTimers.current[notion.notion_id];
                                                  }
                                                }}
                                                onClick={() => onSelectNotion({ projectName, partTitle: part.part_title, chapterTitle: chapter.chapter_title, paraName: paragraph.para_name, notionName: notion.notion_name, notion })}
                                                onContextMenu={(e) => handleContextMenu(e, 'notion', notion.notion_id, { partTitle: part.part_title, chapterTitle: chapter.chapter_title, paraName: paragraph.para_name })}
                                              >
                                                <span className="text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab"><GripVertical size={14} /></span>
                                                <FileText size={14} className="shrink-0" color={selectedNotionId === notion.notion_id ? '#99334C' : getIconColor('notion')} />
                                                <span className={`text-sm truncate ${selectedNotionId === notion.notion_id ? 'font-medium' : ''}`}>{notion.notion_name}</span>
                                              </div>
                                            ))}
                                            {/* End zone Notions */}
                                            <div
                                              className={`h-2 transition-all ${dropTarget?.id === `paragraph-${paragraph.para_id}-notions-end` ? 'bg-[#99334C]/10 border border-[#99334C]/20 h-6' : 'opacity-0'}`}
                                              onDragOver={(e) => handleDragOver(e, 'paragraph', `paragraph-${paragraph.para_id}-notions-end`, paragraph.para_id)}
                                              onDrop={(e) => handleDrop(e, 'notion', `paragraph-${paragraph.para_id}-notions-end`, paragraph.para_id)}
                                            />
                                          </div>
                                        )
                                      }
                                    </div>
                                  ))}
                                  {/* End zone Paragraphs */}
                                  <div
                                    className={`h-2 transition-all ${dropTarget?.id === `chapter-${chapter.chapter_id}-paragraphs-end` ? 'bg-[#D97706]/10 border border-[#D97706]/30 h-6 rounded' : 'opacity-0'}`}
                                    onDragOver={(e) => handleDragOver(e, 'chapter', `chapter-${chapter.chapter_id}-paragraphs-end`, chapter.chapter_id)}
                                    onDrop={(e) => handleDrop(e, 'paragraph', `chapter-${chapter.chapter_id}-paragraphs-end`, chapter.chapter_id)}
                                  />
                                </div>
                              )
                            }
                          </motion.div>
                        ))}
                        {/* End zone Chapters */}
                        <div
                          className={`h-2 transition-all ${dropTarget?.id === `part-${part.part_id}-chapters-end` ? 'bg-[#DC3545]/10 border border-[#DC3545]/30 h-6 rounded' : 'opacity-0'}`}
                          onDragOver={(e) => handleDragOver(e, 'part', `part-${part.part_id}-chapters-end`, part.part_id)}
                          onDrop={(e) => handleDrop(e, 'chapter', `part-${part.part_id}-chapters-end`, part.part_id)}
                        />
                      </motion.div>
                    </AnimatePresence>
                  )
                }
              </div>
            ))}

            {/* Placeholder de création pulsant */}
            {
              pendingGranule && pendingGranule.type === 'part' && (
                <div className="flex items-center gap-2 py-2 px-2 bg-gray-50/50 rounded-lg animate-pulse border-2 border-dashed border-[#99334C]/30">
                  <span className="text-gray-300"><GripVertical size={14} /></span>
                  <div className="w-5 h-5 rounded bg-[#99334C]/20" />
                  <div className="h-4 bg-gray-200 rounded w-48" />
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#99334C] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#99334C] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#99334C] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )
            }
          </>
        )}

        {/* End zone Parts */}
        <div
          className={`h-8 border-2 border-dashed rounded-lg transition-all flex items-center justify-center text-xs text-gray-400 ${dropTarget?.id === 'root-end' ? 'border-[#99334C] bg-[#99334C]/5 text-[#99334C]' : 'border-transparent opacity-0'}`}
          onDragOver={(e) => handleDragOver(e, 'part', 'root-end', null)}
          onDrop={(e) => handleDrop(e, 'part', 'root-end', null)}
        >
          Déposer ici
        </div>
      </div>

      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        onRename={() => {
          if (contextMenu.id && contextMenu.type) {
            let title = '';
            if (contextMenu.type === 'part') title = structure.find(p => p.part_id === contextMenu.id)?.part_title || '';
            startEditing({ stopPropagation: () => { } } as any, `${contextMenu.type}-${contextMenu.id}`, title);
          }
        }}
        onAddChild={() => {
          if (contextMenu.type === 'part' && onCreateChapter && contextMenu.partTitle) onCreateChapter(contextMenu.partTitle);
          else if (contextMenu.type === 'chapter' && onCreateParagraph && contextMenu.partTitle && contextMenu.chapterTitle) onCreateParagraph(contextMenu.partTitle, contextMenu.chapterTitle);
        }}
        onPublishToMarketplace={() => {
          if (contextMenu.id && contextMenu.type && onPublishToMarketplace) {
            let title = '';
            if (contextMenu.type === 'part') {
              const part = structure.find(p => p.part_id === contextMenu.id);
              title = part?.part_title || '';
            } else if (contextMenu.type === 'chapter') {
              for (const p of structure) {
                const chap = p.chapters?.find(c => c.chapter_id === contextMenu.id);
                if (chap) { title = chap.chapter_title; break; }
              }
            } else if (contextMenu.type === 'paragraph') {
              for (const p of structure) {
                for (const c of p.chapters || []) {
                  const para = c.paragraphs?.find(pa => pa.para_id === contextMenu.id);
                  if (para) { title = para.para_name; break; }
                }
              }
            } else if (contextMenu.type === 'notion') {
              for (const p of structure) {
                for (const c of p.chapters || []) {
                  for (const pa of c.paragraphs || []) {
                    const notion = pa.notions?.find(n => n.notion_id === contextMenu.id);
                    if (notion) { title = notion.notion_name; break; }
                  }
                }
              }
            }
            onPublishToMarketplace(contextMenu.type, contextMenu.id, title);
          }
        }}
        onDelete={handleContextMenuDelete}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
      />
    </div>
  );
};

export default TableOfContents;
