"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, Folder, FolderOpen, FileText, GripVertical } from 'lucide-react';
import { Part, Chapter, Paragraph, Notion } from '@/services/structureService';
import { Language, translations } from '@/services/locales';
import toast from 'react-hot-toast';
import ContextMenu from './ContextMenu';
import RichTooltip from '../UI/RichTooltip';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';

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
  onDelete?: (type: 'part' | 'chapter' | 'paragraph' | 'notion', id: string) => Promise<void>;
  language?: Language;
  width?: number; // ✅ Nouvelle prop pour la largeur dynamique
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
  onDelete,
  language = 'fr',
  width = 320 // ✅ Valeur par défaut
}) => {
  const t = (translations[language] ?? translations.fr).toc;
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  const [optimisticStructure, setOptimisticStructure] = useState<Part[]>(structure);
  const { execute } = useOptimisticUpdate<Part[]>();

  // Sync avec les props (le serveur a toujours raison à la fin)
  // Sauf si on est en train de draguer (optionnel, mais safest est react useEffect)
  React.useEffect(() => {
    setOptimisticStructure(structure);
  }, [structure]);

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
        toast.error("Échec du renommage");
        console.error("Rename failed:", error);
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
      console.error("Delete failed:", error);
      toast.error("Erreur lors de la suppression: " + (error instanceof Error ? error.message : "Erreur inconnue"));
    }
  };

  // ============= DRAG & DROP =============

  const handleDragStart = (
    e: React.DragEvent,
    type: 'part' | 'chapter' | 'paragraph' | 'notion',
    item: any,
    parentId: string | null
  ) => {
    e.stopPropagation();
    const id = item.part_id || item.chapter_id || item.para_id || item.notion_id;
    const title = item.part_title || item.chapter_title || item.para_name || item.notion_name || 'Élément';

    // Créer le ghost image personnalisé
    const ghost = createDragGhost(type, title);
    dragGhostRef.current = ghost;

    // Appliquer le ghost comme image de drag
    e.dataTransfer.setDragImage(ghost.firstElementChild as HTMLElement, 20, 20);
    e.dataTransfer.setData('text/plain', JSON.stringify({ type, id, parentId }));
    e.dataTransfer.effectAllowed = 'move';

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
    if (!draggedItem) return;

    const { type: dragType, parentId: dragParentId, id: dragId } = draggedItem;

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
    setDropTarget(null);

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
        // Determine effective target ID (may be targetId or targetParentId depending on context)
        // Logic in original code:
        // if chapter->part, targetId IS part_id (new parent)
        // if para->chapter, targetId IS chapter_id (new parent)
        // etc.
        // But existing code checked types specifically.

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
    // Nettoyer le ghost image du DOM
    if (dragGhostRef.current) {
      dragGhostRef.current.remove();
      dragGhostRef.current = null;
    }
    setDraggedItem(null);
    setDropTarget(null);
  };

  const getDropStyle = (type: string, id: string) => {
    if (!dropTarget || dropTarget.id !== id) return '';
    if (dropTarget.mode === 'reorder') {
      return 'border-t-2 border-t-[#99334C] bg-[#99334C]/5';
    } else if (dropTarget.mode === 'move-into') {
      return 'ring-2 ring-blue-500 bg-blue-50';
    }
    return '';
  };

  return (
    <div
      className="bg-white border-r border-gray-200 overflow-y-auto flex flex-col h-full select-none"
      style={{ width: `${width}px` }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
        <h2 className="text-gray-800 font-bold text-sm uppercase tracking-wider">{t.title}</h2>
        <RichTooltip title={t.addPart} description="Créer une nouvelle division principale dans votre projet.">
          <button
            onClick={onCreatePart}
            className="p-1.5 bg-[#99334C]/10 text-[#99334C] hover:bg-[#99334C] hover:text-white rounded-md transition-all"
          >
            <Plus size={18} />
          </button>
        </RichTooltip>
      </div>

      {/* Contenu */}
      <div className="p-3 flex-1 overflow-y-auto space-y-2">
        {optimisticStructure.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Folder size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Le projet est vide</p>
            {onCreatePart && (
              <button onClick={onCreatePart} className="mt-3 text-[#99334C] font-medium hover:underline text-sm">
                {t.addPart}
              </button>
            )}
          </div>
        ) : (
          optimisticStructure.map(part => (
            <div key={part.part_id} className="relative group/part">
              <div
                className={`flex items-center gap-2 py-2 px-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent
                  ${selectedPartId === part.part_id ? 'bg-[#99334C]/5 border-[#99334C]/10' : ''}
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
                  <FolderOpen size={18} className="stroke-[1.5px]" color={getIconColor('part')} />
                ) : (
                  <Folder size={18} className="stroke-[1.5px]" color={getIconColor('part')} />
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

              {expandedItems[`part-${part.part_id}`] && part.chapters && (
                <div className="pl-6 mt-1 space-y-1 relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-gray-100">
                  {part.chapters.map(chapter => (
                    <div key={chapter.chapter_id} className="relative group/chapter">
                      <div
                        className={`flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded-lg cursor-pointer group ${getDropStyle('chapter', chapter.chapter_id)}`}
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
                          <FolderOpen size={16} className="stroke-[1.5px]" color={getIconColor('chapter')} />
                        ) : (
                          <Folder size={16} className="stroke-[1.5px]" color={getIconColor('chapter')} />
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
                          <RichTooltip title={t.addParagraph} description="Diviser votre chapitre en sections de contenu.">
                            <button
                              onClick={(e) => { e.stopPropagation(); onCreateParagraph(part.part_title, chapter.chapter_title); }}
                              className="p-1 text-gray-300 hover:text-amber-600 hover:bg-amber-50 rounded transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </RichTooltip>
                        )}
                      </div>

                      {expandedItems[`chapter-${chapter.chapter_id}`] && chapter.paragraphs && (
                        <div className="pl-6 mt-1 space-y-1 relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-gray-100">
                          {chapter.paragraphs.map(paragraph => (
                            <div key={paragraph.para_id} className="relative group/para">
                              <div
                                className={`flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded-lg cursor-pointer group ${getDropStyle('paragraph', paragraph.para_id)}`}
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
                                  <FolderOpen size={16} className="stroke-[1.5px]" color={getIconColor('paragraph')} />
                                ) : (
                                  <Folder size={16} className="stroke-[1.5px]" color={getIconColor('paragraph')} />
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

                              {expandedItems[`paragraph-${paragraph.para_id}`] && paragraph.notions && (
                                <div className="pl-8 mt-1 space-y-0.5 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-px before:bg-gray-100">
                                  {paragraph.notions.map((notion) => (
                                    <div
                                      key={notion.notion_id}
                                      className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer w-full text-left transition-all group ${selectedNotionId === notion.notion_id ? 'bg-[#99334C]/10 text-[#99334C]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'} ${getDropStyle('notion', notion.notion_id)}`}
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, 'notion', notion, paragraph.para_id)}
                                      onDragOver={(e) => handleDragOver(e, 'notion', notion.notion_id, paragraph.para_id)}
                                      onDragLeave={(e) => handleDragLeave(e)}
                                      onDrop={(e) => handleDrop(e, 'notion', notion.notion_id, paragraph.para_id)}
                                      onDragEnd={handleDragEnd}
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
                              )}
                            </div>
                          ))}
                          {/* End zone Paragraphs */}
                          <div
                            className={`h-2 transition-all ${dropTarget?.id === `chapter-${chapter.chapter_id}-paragraphs-end` ? 'bg-[#D97706]/10 border border-[#D97706]/30 h-6 rounded' : 'opacity-0'}`}
                            onDragOver={(e) => handleDragOver(e, 'chapter', `chapter-${chapter.chapter_id}-paragraphs-end`, chapter.chapter_id)}
                            onDrop={(e) => handleDrop(e, 'paragraph', `chapter-${chapter.chapter_id}-paragraphs-end`, chapter.chapter_id)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {/* End zone Chapters */}
                  <div
                    className={`h-2 transition-all ${dropTarget?.id === `part-${part.part_id}-chapters-end` ? 'bg-[#DC3545]/10 border border-[#DC3545]/30 h-6 rounded' : 'opacity-0'}`}
                    onDragOver={(e) => handleDragOver(e, 'part', `part-${part.part_id}-chapters-end`, part.part_id)}
                    onDrop={(e) => handleDrop(e, 'chapter', `part-${part.part_id}-chapters-end`, part.part_id)}
                  />
                </div>
              )}
            </div>
          ))
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
        onDelete={handleContextMenuDelete}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
      />
    </div>
  );
};

export default TableOfContents;
