
"use client";

import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit3, Trash2, Folder, FolderOpen, FileText, GripVertical } from 'lucide-react';
import { Part, Chapter, Paragraph, Notion } from '@/services/structureService';

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
  // Callbacks pour sélection de granules parents (pour drop zones)
  onSelectPart?: (context: {
    projectName: string;
    partTitle: string;
    part: Part;
  }) => void;
  onSelectChapter?: (projectName: string, partTitle: string, chapterTitle: string) => void;
  onSelectParagraph?: (projectName: string, partTitle: string, chapterTitle: string, paraName: string) => void;
  selectedPartId?: string;

  onCreatePart?: () => void;
  onCreateChapter?: (partTitle: string) => void;
  onCreateParagraph?: (partTitle: string, chapterTitle: string) => void;
  onCreateNotion?: (partTitle: string, chapterTitle: string, paraName: string) => void;
  selectedNotionId?: string;

  // Nouvelles fonctions pour renommage et réordonnancement
  onRename?: (type: 'part' | 'chapter' | 'paragraph' | 'notion', id: string, newTitle: string) => Promise<void>;
  onReorder?: (type: 'part' | 'chapter' | 'paragraph' | 'notion', parentId: string | null, items: any[]) => Promise<void>;
  styles?: any;
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
  onRename,
  onReorder,
  styles
}) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const isSubmitting = useRef(false);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };


  const getIconColor = (type: 'part' | 'chapter' | 'paragraph' | 'notion') => {
    if (styles) {
      if (type === 'part' && styles.part?.title?.color) return styles.part.title.color;
      if (type === 'chapter' && styles.chapter?.title?.color) return styles.chapter.title.color;
      if (type === 'paragraph' && styles.paragraph?.title?.color) return styles.paragraph.title.color;
    }
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
      const currentType = type;
      const currentId = id;

      // Désactiver l'input immédiatement pour un feedback rapide
      cancelEditing();

      try {
        await onRename(currentType, currentId, newTitle);
      } catch (error) {
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

  const handleDragStartItem = (e: React.DragEvent, type: any, item: any, parentId: string | null) => {
    e.dataTransfer.setData('reorderData', JSON.stringify({ type, id: item.id || item.part_id || item.chapter_id || item.para_id || item.notion_id, parentId }));
    setDraggedItem({ type, item, parentId });
  };

  const handleDragOverItem = (e: React.DragEvent, type: any, parentId: string | null, targetId: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem.type === type && draggedItem.parentId === parentId && draggedItem.id !== targetId) {
      setDropTargetId(targetId);
    }
  };

  const handleDropItem = async (e: React.DragEvent, type: any, parentId: string | null, targetId: string) => {
    e.preventDefault();
    setDropTargetId(null);
    const data = e.dataTransfer.getData('reorderData');
    if (!data) return;

    const { type: dragType, id: dragId, parentId: dragParentId } = JSON.parse(data);

    if (dragType === type && dragParentId === parentId && dragId !== targetId) {
      // Calculer le nouvel ordre
      let items: any[] = [];
      if (type === 'part') items = [...structure];
      else if (type === 'chapter') items = [...(structure.find(p => p.part_id === parentId)?.chapters || [])];
      else if (type === 'paragraph') {
        for (const p of structure) {
          const c = p.chapters?.find(ch => ch.chapter_id === parentId);
          if (c) { items = [...(c.paragraphs || [])]; break; }
        }
      } else if (type === 'notion') {
        for (const p of structure) {
          for (const c of p.chapters || []) {
            const para = c.paragraphs?.find(pg => pg.para_id === parentId);
            if (para) { items = [...(para.notions || [])]; break; }
          }
        }
      }

      const dragIndex = items.findIndex(i => (i.id || i.part_id || i.chapter_id || i.para_id || i.notion_id) === dragId);
      const dropIndex = items.findIndex(i => (i.id || i.part_id || i.chapter_id || i.para_id || i.notion_id) === targetId);

      if (dragIndex !== -1 && dropIndex !== -1) {
        const [movedItem] = items.splice(dragIndex, 1);
        items.splice(dropIndex, 0, movedItem);
        if (onReorder) await onReorder(type, parentId, items);
      }
    }
  };

  return (
    <div className="w-72 lg:w-80 xl:w-96 bg-white border-r border-gray-200 overflow-y-auto flex flex-col h-full select-none">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
        <h2 className="text-gray-800 font-bold text-sm uppercase tracking-wider">Plan du projet</h2>
        {onCreatePart && (
          <button
            onClick={onCreatePart}
            className="p-1.5 bg-[#99334C]/10 text-[#99334C] hover:bg-[#99334C] hover:text-white rounded-md transition-all"
            title="Ajouter une partie"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      {/* Contenu */}
      <div className="p-3 flex-1 overflow-y-auto space-y-2">
        {structure.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Folder size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Le projet est vide</p>
            {onCreatePart && (
              <button
                onClick={onCreatePart}
                className="mt-3 text-[#99334C] font-medium hover:underline text-sm"
              >
                Créer une partie
              </button>
            )}
          </div>
        ) : (
          structure.map(part => (
            <div key={part.part_id} className="relative group/part">
              {/* Partie */}
              <div
                className={`flex items-center gap-2 py-2 px-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent 
                  ${selectedPartId === part.part_id ? 'bg-[#99334C]/5 border-[#99334C]/10' : ''}
                  ${dropTargetId === part.part_id ? 'border-t-2 border-t-[#99334C] bg-gray-100' : ''}`}
                draggable="true"
                onDragStart={(e) => handleDragStartItem(e, 'part', part, null)}
                onDragOver={(e) => handleDragOverItem(e, 'part', null, part.part_id)}
                onDragLeave={() => setDropTargetId(null)}
                onDrop={(e) => handleDropItem(e, 'part', null, part.part_id)}
              >
                <button
                  onClick={() => toggleExpand(`part-${part.part_id}`)}
                  className="p-0.5 text-gray-400 hover:text-gray-600"
                >
                  {part.chapters && part.chapters.length > 0 ? (
                    expandedItems[`part-${part.part_id}`] ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                  ) : <div className="w-3.5" />}
                </button>

                {expandedItems[`part-${part.part_id}`] ? (
                  <FolderOpen size={18} className="stroke-[1.5px]" color={getIconColor('part')} fill="none" />
                ) : (
                  <Folder size={18} className="stroke-[1.5px]" color={getIconColor('part')} fill="none" />
                )}

                {editingId === `part-${part.part_id}` ? (
                  <input
                    autoFocus
                    className="text-sm font-semibold flex-1 bg-white border border-[#99334C] rounded px-1 outline-none text-gray-700 placeholder-gray-400"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={() => submitRename('part', part.part_id)}
                    onKeyDown={(e) => handleKeyDown(e, 'part', part.part_id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div
                    className={`text-sm font-semibold truncate flex-1 ${selectedPartId === part.part_id ? 'text-[#99334C]' : 'text-gray-800'}`}
                    style={{
                      color: (selectedPartId === part.part_id) ? undefined : styles?.part?.title?.color,
                      fontFamily: styles?.part?.title?.fontFamily,
                      fontWeight: (styles?.part?.title?.fontWeight === '700' || styles?.part?.title?.fontWeight === '800') ? 'bold' : undefined,
                      fontStyle: styles?.part?.title?.fontStyle
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPart?.({ projectName, partTitle: part.part_title, part });
                    }}
                    onDoubleClick={(e) => startEditing(e, `part-${part.part_id}`, part.part_title)}
                  >
                    {part.part_number}. {part.part_title}
                  </div>
                )}

                {onCreateChapter && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onCreateChapter(part.part_title); }}
                    className="p-1 text-gray-300 hover:text-[#DC3545] hover:bg-[#DC3545]/10 rounded transition-all"
                    title="Ajouter un chapitre"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>

              {/* Chapitres */}
              {expandedItems[`part-${part.part_id}`] && part.chapters && (
                <div className="pl-6 mt-1 space-y-1 relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-gray-100">
                  {part.chapters.map(chapter => (
                    <div key={chapter.chapter_id} className="relative group/chapter">
                      <div
                        className={`flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded-lg cursor-pointer draggable group 
                        ${dropTargetId === chapter.chapter_id ? 'border-t-2 border-t-[#DC3545] bg-gray-100' : ''}`}
                        draggable="true"
                        onDragStart={(e) => handleDragStartItem(e, 'chapter', chapter, part.part_id)}
                        onDragOver={(e) => handleDragOverItem(e, 'chapter', part.part_id, chapter.chapter_id)}
                        onDragLeave={() => setDropTargetId(null)}
                        onDrop={(e) => handleDropItem(e, 'chapter', part.part_id, chapter.chapter_id)}
                      >
                        <span className="text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab list-none">
                          <GripVertical size={14} />
                        </span>
                        <button
                          onClick={() => toggleExpand(`chapter-${chapter.chapter_id}`)}
                          className="p-0.5 text-gray-400 hover:text-gray-600"
                        >
                          {chapter.paragraphs && chapter.paragraphs.length > 0 ? (
                            expandedItems[`chapter-${chapter.chapter_id}`] ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                          ) : <div className="w-3.5" />}
                        </button>

                        {expandedItems[`chapter-${chapter.chapter_id}`] ? (
                          <FolderOpen size={16} className="stroke-[1.5px]" color={getIconColor('chapter')} fill="none" />
                        ) : (
                          <Folder size={16} className="stroke-[1.5px]" color={getIconColor('chapter')} fill="none" />
                        )}

                        {editingId === `chapter-${chapter.chapter_id}` ? (
                          <input
                            autoFocus
                            className="text-sm font-medium flex-1 bg-white border border-[#DC3545] rounded px-1 outline-none text-gray-700 placeholder-gray-400"
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onBlur={() => submitRename('chapter', chapter.chapter_id)}
                            onKeyDown={(e) => handleKeyDown(e, 'chapter', chapter.chapter_id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span
                            className="text-sm text-gray-700 truncate flex-1 font-medium cursor-pointer hover:underline"
                            style={{
                              color: styles?.chapter?.title?.color,
                              fontFamily: styles?.chapter?.title?.fontFamily,
                              fontWeight: (styles?.chapter?.title?.fontWeight === '700' || styles?.chapter?.title?.fontWeight === '800') ? 'bold' : undefined,
                              fontStyle: styles?.chapter?.title?.fontStyle
                            }}
                            onClick={() => onSelectChapter?.(projectName, part.part_title, chapter.chapter_title)}
                            onDoubleClick={(e) => startEditing(e, `chapter-${chapter.chapter_id}`, chapter.chapter_title)}
                          >
                            {chapter.chapter_number}. {chapter.chapter_title}
                          </span>
                        )}

                        {onCreateParagraph && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onCreateParagraph(part.part_title, chapter.chapter_title); }}
                            className="p-1 text-gray-300 hover:text-amber-600 hover:bg-amber-50 rounded transition-all"
                            title="Ajouter un paragraphe"
                          >
                            <Plus size={14} />
                          </button>
                        )}
                      </div>

                      {/* Paragraphes */}
                      {expandedItems[`chapter-${chapter.chapter_id}`] && chapter.paragraphs && (
                        <div className="pl-6 mt-1 space-y-1 relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-gray-100">
                          {chapter.paragraphs.map(paragraph => (
                            <div key={paragraph.para_id} className="relative group/para">
                              <div
                                className={`flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded-lg cursor-pointer group 
                                ${dropTargetId === paragraph.para_id ? 'border-t-2 border-t-[#D97706] bg-gray-100' : ''}`}
                                draggable="true"
                                onDragStart={(e) => handleDragStartItem(e, 'paragraph', paragraph, chapter.chapter_id)}
                                onDragOver={(e) => handleDragOverItem(e, 'paragraph', chapter.chapter_id, paragraph.para_id)}
                                onDragLeave={() => setDropTargetId(null)}
                                onDrop={(e) => handleDropItem(e, 'paragraph', chapter.chapter_id, paragraph.para_id)}
                              >
                                <span className="text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab">
                                  <GripVertical size={14} />
                                </span>
                                <button
                                  onClick={() => toggleExpand(`paragraph-${paragraph.para_id}`)}
                                  className="p-0.5 text-gray-400 hover:text-gray-600"
                                >
                                  {paragraph.notions && paragraph.notions.length > 0 ? (
                                    expandedItems[`paragraph-${paragraph.para_id}`] ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                                  ) : <div className="w-3.5" />}
                                </button>

                                {expandedItems[`paragraph-${paragraph.para_id}`] ? (
                                  <FolderOpen size={16} className="stroke-[1.5px]" color={getIconColor('paragraph')} fill="none" />
                                ) : (
                                  <Folder size={16} className="stroke-[1.5px]" color={getIconColor('paragraph')} fill="none" />
                                )}

                                {editingId === `paragraph-${paragraph.para_id}` ? (
                                  <input
                                    autoFocus
                                    className="text-sm flex-1 bg-white border border-[#D97706] rounded px-1 outline-none text-gray-700 placeholder-gray-400"
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    onBlur={() => submitRename('paragraph', paragraph.para_id)}
                                    onKeyDown={(e) => handleKeyDown(e, 'paragraph', paragraph.para_id)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <span
                                    className="text-sm text-gray-600 truncate flex-1 cursor-pointer hover:underline"
                                    style={{
                                      color: styles?.paragraph?.title?.color,
                                      fontFamily: styles?.paragraph?.title?.fontFamily,
                                      fontWeight: (styles?.paragraph?.title?.fontWeight === '700' || styles?.paragraph?.title?.fontWeight === '800') ? 'bold' : undefined,
                                      fontStyle: styles?.paragraph?.title?.fontStyle
                                    }}
                                    onClick={() => onSelectParagraph?.(projectName, part.part_title, chapter.chapter_title, paragraph.para_name)}
                                    onDoubleClick={(e) => startEditing(e, `paragraph-${paragraph.para_id}`, paragraph.para_name)}
                                  >
                                    {paragraph.para_number}. {paragraph.para_name}
                                  </span>
                                )}

                                {onCreateNotion && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onCreateNotion(part.part_title, chapter.chapter_title, paragraph.para_name); }}
                                    className="p-1 text-gray-300 hover:text-green-600 hover:bg-green-50 rounded transition-all"
                                    title="Ajouter une notion"
                                  >
                                    <Plus size={14} />
                                  </button>
                                )}
                              </div>

                              {/* Notions */}
                              {expandedItems[`paragraph-${paragraph.para_id}`] && paragraph.notions && (
                                <div className="pl-8 mt-1 space-y-0.5 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-px before:bg-gray-100">
                                  {paragraph.notions.map(notion => (
                                    <button
                                      key={notion.notion_id}
                                      onClick={() => onSelectNotion({
                                        projectName,
                                        partTitle: part.part_title,
                                        chapterTitle: chapter.chapter_title,
                                        paraName: paragraph.para_name,
                                        notionName: notion.notion_name,
                                        notion
                                      })}
                                      className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer w-full text-left transition-all group/notion group 
                                        ${selectedNotionId === notion.notion_id ? 'bg-[#99334C]/10 text-[#99334C]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                                        ${dropTargetId === notion.notion_id ? 'border-t-2 border-t-[#28A745] bg-gray-100' : ''}`}
                                      draggable="true"
                                      onDragStart={(e) => handleDragStartItem(e, 'notion', notion, paragraph.para_id)}
                                      onDragOver={(e) => handleDragOverItem(e, 'notion', paragraph.para_id, notion.notion_id)}
                                      onDragLeave={() => setDropTargetId(null)}
                                      onDrop={(e) => handleDropItem(e, 'notion', paragraph.para_id, notion.notion_id)}
                                    >
                                      <span className="text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab">
                                        <GripVertical size={14} />
                                      </span>
                                      <FileText
                                        size={14}
                                        className="flex-shrink-0"
                                        color={selectedNotionId === notion.notion_id ? '#99334C' : getIconColor('notion')}
                                      />
                                      {editingId === `notion-${notion.notion_id}` ? (
                                        <input
                                          autoFocus
                                          className="text-sm flex-1 bg-white border border-[#28A745] rounded px-1 outline-none text-gray-700 placeholder-gray-400"
                                          value={tempTitle}
                                          onChange={(e) => setTempTitle(e.target.value)}
                                          onBlur={() => submitRename('notion', notion.notion_id)}
                                          onKeyDown={(e) => handleKeyDown(e, 'notion', notion.notion_id)}
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      ) : (
                                        <span className={`text-sm truncate ${selectedNotionId === notion.notion_id ? 'font-medium' : ''}`}
                                          onDoubleClick={(e) => startEditing(e, `notion-${notion.notion_id}`, notion.notion_name)}>
                                          {notion.notion_name}
                                        </span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TableOfContents;