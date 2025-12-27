"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit3, Trash2 } from 'lucide-react';
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

  const colors = {
    part: '#99334C',      // Bordeaux
    chapter: '#DC3545',   // Rouge
    paragraph: '#FFC107', // Jaune
    notion: '#28A745'     // Vert
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 bg-[#6C7A89] flex items-center justify-between sticky top-0 z-10">
        <h2 className="text-white font-semibold text-sm">Table des matières</h2>
        {onCreatePart && (
          <button
            onClick={onCreatePart}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Ajouter une partie"
          >
            <Plus size={16} className="text-white" />
          </button>
        )}
      </div>

      {/* Contenu */}
      <div className="p-2 flex-1 overflow-y-auto">
        {structure.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <p>Aucune partie pour le moment</p>
            {onCreatePart && (
              <button
                onClick={onCreatePart}
                className="mt-2 text-[#99334C] hover:underline text-xs"
              >
                Créer la première partie
              </button>
            )}
          </div>
        ) : (
          structure.map(part => (
            <div key={part.part_id} className="mb-2">
              {/* Partie */}
              <div className="flex items-center gap-1 py-1 px-2 hover:bg-gray-100 rounded cursor-pointer group">
                <button
                  onClick={() => toggleExpand(`part-${part.part_id}`)}
                  className="flex items-center flex-1 min-w-0"
                >
                  {part.chapters && part.chapters.length > 0 ? (
                    expandedItems[`part-${part.part_id}`] ? (
                      <ChevronDown size={14} className="mr-1 flex-shrink-0" />
                    ) : (
                      <ChevronRight size={14} className="mr-1 flex-shrink-0" />
                    )
                  ) : (
                    <div className="w-4 mr-1" />
                  )}
                  <div 
                    className="w-3 h-3 rounded-sm mr-2 flex-shrink-0" 
                    style={{ backgroundColor: colors.part }}
                  />
                  <span className="text-sm text-black font-medium truncate">
                    {part.part_number}. {part.part_title}
                  </span>
                </button>
                {onCreateChapter && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateChapter(part.part_title);
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
                    title="Ajouter un chapitre"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>

              {/* Chapitres */}
              {expandedItems[`part-${part.part_id}`] && part.chapters && (
                <div className="ml-4">
                  {part.chapters.map(chapter => (
                    <div key={chapter.chapter_id} className="mb-1">
                      <div className="flex items-center gap-1 py-1 px-2 hover:bg-gray-100 rounded cursor-pointer group">
                        <button
                          onClick={() => toggleExpand(`chapter-${chapter.chapter_id}`)}
                          className="flex items-center flex-1 min-w-0"
                        >
                          {chapter.paragraphs && chapter.paragraphs.length > 0 ? (
                            expandedItems[`chapter-${chapter.chapter_id}`] ? (
                              <ChevronDown size={14} className="mr-1 flex-shrink-0" />
                            ) : (
                              <ChevronRight size={14} className="mr-1 flex-shrink-0" />
                            )
                          ) : (
                            <div className="w-4 mr-1" />
                          )}
                          <div 
                            className="w-3 h-3 rounded-sm mr-2 flex-shrink-0" 
                            style={{ backgroundColor: colors.chapter }}
                          />
                          <span className="text-sm text-black truncate">
                            {chapter.chapter_number}. {chapter.chapter_title}
                          </span>
                        </button>
                        {onCreateParagraph && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreateParagraph(part.part_title, chapter.chapter_title);
                            }}
                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
                            title="Ajouter un paragraphe"
                          >
                            <Plus size={12} />
                          </button>
                        )}
                      </div>

                      {/* Paragraphes */}
                      {expandedItems[`chapter-${chapter.chapter_id}`] && chapter.paragraphs && (
                        <div className="ml-4">
                          {chapter.paragraphs.map(paragraph => (
                            <div key={paragraph.para_id} className="mb-1">
                              <div className="flex items-center gap-1 py-1 px-2 hover:bg-gray-100 rounded cursor-pointer group">
                                <button
                                  onClick={() => toggleExpand(`paragraph-${paragraph.para_id}`)}
                                  className="flex items-center flex-1 min-w-0"
                                >
                                  {paragraph.notions && paragraph.notions.length > 0 ? (
                                    expandedItems[`paragraph-${paragraph.para_id}`] ? (
                                      <ChevronDown size={14} className="mr-1 flex-shrink-0" />
                                    ) : (
                                      <ChevronRight size={14} className="mr-1 flex-shrink-0" />
                                    )
                                  ) : (
                                    <div className="w-4 mr-1" />
                                  )}
                                  <div 
                                    className="w-3 h-3 rounded-sm mr-2 flex-shrink-0" 
                                    style={{ backgroundColor: colors.paragraph }}
                                  />
                                  <span className="text-sm text-black truncate">
                                    {paragraph.para_number}. {paragraph.para_name}
                                  </span>
                                </button>
                                {onCreateNotion && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onCreateNotion(part.part_title, chapter.chapter_title, paragraph.para_name);
                                    }}
                                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
                                    title="Ajouter une notion"
                                  >
                                    <Plus size={12} />
                                  </button>
                                )}
                              </div>

                              {/* Notions */}
                              {expandedItems[`paragraph-${paragraph.para_id}`] && paragraph.notions && (
                                <div className="ml-4">
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
                                      className={`flex items-center gap-1 py-1 px-2 rounded cursor-pointer w-full text-left transition-colors ${
                                        selectedNotionId === notion.notion_id
                                          ? 'bg-[#99334C] text-white'
                                          : 'hover:bg-gray-100'
                                      }`}
                                    >
                                      <div className="w-4 mr-1" />
                                      <div 
                                        className="w-3 h-3 rounded-sm mr-2 flex-shrink-0" 
                                        style={{ backgroundColor: selectedNotionId === notion.notion_id ? 'white' : colors.notion }}
                                      />
                                      <span className="text-sm truncate">
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