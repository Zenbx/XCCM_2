"use client";
import React from 'react';
import {
    List, ChevronDown, ChevronRight, User, FileText, Calendar
} from 'lucide-react';
import { Part, Chapter, Paragraph } from '@/services/documentService';
import { Lock } from 'lucide-react';

interface ClassroomReaderTOCProps {
    structure: Part[];
    expandedParts: Record<string, boolean>;
    togglePart: (id: string) => void;
    expandedChapters: Record<string, boolean>;
    toggleChapter: (id: string) => void;
    scrollToSection: (id: string) => void;
    activeSection: string;
    projectAuthor: string;
    docPages: number;
    publishedAt: string;
    lockedIds?: Set<string>;
}

const ClassroomReaderTOC: React.FC<ClassroomReaderTOCProps> = ({
    structure, expandedParts, togglePart, expandedChapters, toggleChapter,
    scrollToSection, activeSection, projectAuthor, docPages, publishedAt,
    lockedIds = new Set()
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
                            <button
                                onClick={() => !lockedIds.has(part.part_id) && scrollToSection(part.part_id)}
                                disabled={lockedIds.has(part.part_id)}
                                className={`flex-1 text-left px-3 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-between ${activeSection === part.part_id
                                    ? 'bg-[#99334C] text-white'
                                    : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    } ${lockedIds.has(part.part_id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex items-center">
                                    <span className="text-xs opacity-60 mr-2 whitespace-nowrap">Partie {partIndex + 1}</span>
                                    <span className="line-clamp-1">{part.part_title}</span>
                                </div>
                                {lockedIds.has(part.part_id) && <Lock className="w-3.5 h-3.5 ml-2" />}
                            </button>
                        </div>

                        {expandedParts[part.part_id] && part.chapters.length > 0 && (
                            <div className="ml-6 mt-1 border-l-2 border-gray-100 dark:border-gray-800">
                                {part.chapters.map((chapter: Chapter) => (
                                    <div key={chapter.chapter_id}>
                                        <div className="flex items-center">
                                            {chapter.paragraphs.length > 0 && (
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
                                            )}
                                            <button
                                                onClick={() => !lockedIds.has(chapter.chapter_id) && scrollToSection(chapter.chapter_id)}
                                                disabled={lockedIds.has(chapter.chapter_id)}
                                                className={`flex-1 text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-between ${activeSection === chapter.chapter_id
                                                    ? 'bg-[#99334C] text-white font-medium shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    } ${lockedIds.has(chapter.chapter_id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <span className="line-clamp-1">{chapter.chapter_title}</span>
                                                {lockedIds.has(chapter.chapter_id) && <Lock className="w-3 h-3 ml-2 opacity-60" />}
                                            </button>
                                        </div>

                                        {expandedChapters[chapter.chapter_id] && chapter.paragraphs.length > 0 && (
                                            <div className="ml-6 border-l border-gray-100 dark:border-gray-800">
                                                {chapter.paragraphs.map((para: Paragraph) => (
                                                    <button
                                                        key={para.para_id}
                                                        onClick={() => !lockedIds.has(para.para_id) && scrollToSection(para.para_id)}
                                                        disabled={lockedIds.has(para.para_id)}
                                                        className={`w-full text-left px-3 py-1 text-xs transition-colors rounded flex items-center justify-between ${activeSection === para.para_id
                                                            ? 'bg-[#99334C] text-white font-medium'
                                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                                            } ${lockedIds.has(para.para_id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <span className="line-clamp-1">{para.para_name}</span>
                                                        {lockedIds.has(para.para_id) && <Lock className="w-3 h-3 ml-1.5 opacity-40" />}
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
                </div>
            </div>
        </div>
    );
};

export default ClassroomReaderTOC;
