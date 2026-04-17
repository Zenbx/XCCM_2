"use client";

import React from 'react';
import {
    List, ChevronDown, ChevronRight, User, FileText, Calendar, Eye, Download, Play
} from 'lucide-react';
import { Part, Chapter, Paragraph, Notion } from '@/services/documentService';
import { Lock } from 'lucide-react';

interface ReaderTOCProps {
    structure: Part[];
    expandedParts: Record<string, boolean>;
    togglePart: (id: string) => void;
    expandedChapters: Record<string, boolean>;
    toggleChapter: (id: string) => void;
    onNavigateStep: (id: string, type: 'notion' | 'exercises') => void;
    activeSection: string;
    projectAuthor: string;
    docPages: number;
    publishedAt: string;
    consultations: number;
    downloads: number;
    lockedIds?: Set<string>;
    exercisesByNotion?: Record<string, any[]>;
}

const ReaderTOC: React.FC<ReaderTOCProps> = ({
    structure, expandedParts, togglePart, expandedChapters, toggleChapter,
    onNavigateStep, activeSection, projectAuthor, docPages, publishedAt,
    consultations, downloads, lockedIds = new Set(), exercisesByNotion = {}
}) => {
    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#99334C]/10 rounded-xl flex items-center justify-center">
                    <List className="w-5 h-5 text-[#99334C]" />
                </div>
                <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">Table des matières</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{structure.length} parties</p>
                </div>
            </div>

            <nav className="space-y-2">
                {structure.map((part: Part, partIndex) => (
                    <div key={part.part_id} className="mb-2">
                        {/* Part Header */}
                        <div className="flex items-center">
                            <button
                                onClick={() => togglePart(part.part_id)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors mr-1"
                            >
                                {expandedParts[part.part_id] ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </button>
                            <div
                                className={`flex-1 text-left px-3 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-between ${activeSection === part.part_id
                                    ? 'bg-[#99334C]/5 text-[#99334C]'
                                    : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    } ${lockedIds.has(part.part_id) ? 'opacity-50' : ''}`}
                            >
                                <div className="flex items-center">
                                    <span className="text-xs opacity-60 mr-2 whitespace-nowrap">Part {partIndex + 1}</span>
                                    <span className="line-clamp-1">{part.part_title}</span>
                                </div>
                                {lockedIds.has(part.part_id) && <Lock className="w-3.5 h-3.5 ml-2" />}
                            </div>
                        </div>

                        {/* Chapters */}
                        {expandedParts[part.part_id] && part.chapters.length > 0 && (
                            <div className="ml-6 mt-1 border-l-2 border-gray-100 dark:border-gray-800">
                                {part.chapters.map((chapter: Chapter) => (
                                    <div key={chapter.chapter_id}>
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => toggleChapter(chapter.chapter_id)}
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                            >
                                                {expandedChapters[chapter.chapter_id] ? (
                                                    <ChevronDown className="w-3 h-3 text-gray-400" />
                                                ) : (
                                                    <ChevronRight className="w-3 h-3 text-gray-400" />
                                                )}
                                            </button>
                                            <div
                                                className={`flex-1 text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-between ${activeSection === chapter.chapter_id
                                                    ? 'text-[#99334C] font-bold'
                                                    : 'text-gray-600 dark:text-gray-400'
                                                    } ${lockedIds.has(chapter.chapter_id) ? 'opacity-50' : ''}`}
                                            >
                                                <span className="line-clamp-1">{chapter.chapter_title}</span>
                                                {lockedIds.has(chapter.chapter_id) && <Lock className="w-3 h-3 ml-2 opacity-60" />}
                                            </div>
                                        </div>

                                        {/* Paragraphs and Notions */}
                                        {expandedChapters[chapter.chapter_id] && chapter.paragraphs.length > 0 && (
                                            <div className="ml-4 border-l border-gray-100 dark:border-gray-800">
                                                {chapter.paragraphs.map((para: Paragraph) => (
                                                    <div key={para.para_id} className="mb-1">
                                                        <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-tight opacity-70">
                                                            {para.para_name}
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            {para.notions.map((notion: Notion) => {
                                                                const isNotionActive = activeSection === notion.notion_id;
                                                                const hasExercises = (exercisesByNotion[notion.notion_id]?.length || 0) > 0;
                                                                
                                                                return (
                                                                    <div key={notion.notion_id} className="space-y-0.5">
                                                                        {/* Notion Item */}
                                                                        <button
                                                                            onClick={() => !lockedIds.has(notion.notion_id) && onNavigateStep(notion.notion_id, 'notion')}
                                                                            disabled={lockedIds.has(notion.notion_id)}
                                                                            className={`w-full text-left px-4 py-1.5 text-xs transition-all rounded-md flex items-center justify-between group ${isNotionActive
                                                                                ? 'bg-[#99334C] text-white shadow-md'
                                                                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                                                } ${lockedIds.has(notion.notion_id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                        >
                                                                            <span className="line-clamp-1 flex-1">{notion.notion_name}</span>
                                                                            {lockedIds.has(notion.notion_id) ? (
                                                                                <Lock className="w-3 h-3 ml-1.5 opacity-40 shrink-0" />
                                                                            ) : (
                                                                                <Play className={`w-2.5 h-2.5 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ${isNotionActive ? 'opacity-100' : ''}`} />
                                                                            )}
                                                                        </button>
                                                                        
                                                                        {/* Exercises Link (if any) */}
                                                                        {hasExercises && (
                                                                           <button
                                                                                onClick={() => !lockedIds.has(notion.notion_id) && onNavigateStep(notion.notion_id, 'exercises')}
                                                                                disabled={lockedIds.has(notion.notion_id)}
                                                                                className="w-full text-left px-6 py-1 text-[10px] font-bold uppercase tracking-wider text-[#99334C] opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1.5"
                                                                            >
                                                                                <div className="w-1 h-1 bg-[#99334C] rounded-full" />
                                                                                Exercices
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Informations</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{projectAuthor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{docPages} pages</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(publishedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>{consultations} consultations</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        <span>{downloads} téléchargements</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReaderTOC;
