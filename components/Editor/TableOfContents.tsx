
"use client";

import React, { useState } from 'react';
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
  selectedNotionId
}) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };


  const getIconColor = (type: 'part' | 'chapter' | 'paragraph' | 'notion') => {
    switch (type) {
      case 'part': return '#99334C';
      case 'chapter': return '#DC3545';
      case 'paragraph': return '#D97706'; // Ambre plus foncé pour visibilité sur blanc
      case 'notion': return '#28A745';
      default: return '#000';
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
                className={`flex items-center gap-2 py-2 px-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent ${selectedPartId === part.part_id ? 'bg-[#99334C]/5 border-[#99334C]/10' : ''}`}
                draggable="true"
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

                {onSelectPart ? (
                  <div
                    className={`text-sm font-semibold truncate flex-1 ${selectedPartId === part.part_id ? 'text-[#99334C]' : 'text-gray-800'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPart({ projectName, partTitle: part.part_title, part });
                    }}
                  >
                    {part.part_number}. {part.part_title}
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-gray-800 truncate flex-1">
                    {part.part_number}. {part.part_title}
                  </span>
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
                      <div className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded-lg cursor-pointer draggable group" draggable="true">
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

                        <span
                          className="text-sm text-gray-700 truncate flex-1 font-medium cursor-pointer hover:underline"
                          onClick={() => onSelectChapter?.(projectName, part.part_title, chapter.chapter_title)}
                        >
                          {chapter.chapter_number}. {chapter.chapter_title}
                        </span>

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
                              <div className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded-lg cursor-pointer group" draggable="true">
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

                                <span
                                  className="text-sm text-gray-600 truncate flex-1 cursor-pointer hover:underline"
                                  onClick={() => onSelectParagraph?.(projectName, part.part_title, chapter.chapter_title, paragraph.para_name)}
                                >
                                  {paragraph.para_number}. {paragraph.para_name}
                                </span>

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
                                      className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer w-full text-left transition-all group/notion group ${selectedNotionId === notion.notion_id
                                        ? 'bg-[#99334C]/10 text-[#99334C]'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                      draggable="true"
                                    >
                                      <span className="text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab">
                                        <GripVertical size={14} />
                                      </span>
                                      <FileText
                                        size={14}
                                        className="flex-shrink-0"
                                        color={selectedNotionId === notion.notion_id ? '#99334C' : getIconColor('notion')}
                                      />
                                      <span className={`text-sm truncate ${selectedNotionId === notion.notion_id ? 'font-medium' : ''}`}>
                                        {notion.notion_name}
                                      </span>
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