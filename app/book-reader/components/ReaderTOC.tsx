import React from 'react';
import {
    List, ChevronDown, ChevronRight, User, FileText, Calendar, Eye, Download
} from 'lucide-react';
import { Part, Chapter, Paragraph } from '@/services/documentService';

interface ReaderTOCProps {
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
    consultations: number;
    downloads: number;
}

const ReaderTOC: React.FC<ReaderTOCProps> = ({
    structure, expandedParts, togglePart, expandedChapters, toggleChapter,
    scrollToSection, activeSection, projectAuthor, docPages, publishedAt,
    consultations, downloads
}) => {
    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#99334C]/10 rounded-xl flex items-center justify-center">
                    <List className="w-5 h-5 text-[#99334C]" />
                </div>
                <div>
                    <h2 className="font-bold text-gray-900">Table des matières</h2>
                    <p className="text-xs text-gray-500">{structure.length} parties</p>
                </div>
            </div>

            <nav className="space-y-2">
                {structure.map((part: Part, partIndex) => (
                    <div key={part.part_id} className="mb-2">
                        <div className="flex items-center">
                            <button
                                onClick={() => togglePart(part.part_id)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors mr-1"
                            >
                                {expandedParts[part.part_id] ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </button>
                            <button
                                onClick={() => scrollToSection(part.part_id)}
                                className={`flex-1 text-left px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${activeSection === part.part_id
                                    ? 'bg-[#99334C] text-white'
                                    : 'text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <span className="text-xs opacity-60 mr-2">Partie {partIndex + 1}</span>
                                <span className="line-clamp-1">{part.part_title}</span>
                            </button>
                        </div>

                        {expandedParts[part.part_id] && part.chapters.length > 0 && (
                            <div className="ml-6 mt-1 border-l-2 border-gray-100">
                                {part.chapters.map((chapter: Chapter) => (
                                    <div key={chapter.chapter_id}>
                                        <div className="flex items-center">
                                            {chapter.paragraphs.length > 0 && (
                                                <button
                                                    onClick={() => toggleChapter(chapter.chapter_id)}
                                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                >
                                                    {expandedChapters[chapter.chapter_id] ? (
                                                        <ChevronDown className="w-3 h-3 text-gray-400" />
                                                    ) : (
                                                        <ChevronRight className="w-3 h-3 text-gray-400" />
                                                    )}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => scrollToSection(chapter.chapter_id)}
                                                className={`flex-1 text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${activeSection === chapter.chapter_id
                                                    ? 'text-[#99334C] font-medium bg-[#99334C]/5'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span className="line-clamp-1">{chapter.chapter_title}</span>
                                            </button>
                                        </div>

                                        {expandedChapters[chapter.chapter_id] && chapter.paragraphs.length > 0 && (
                                            <div className="ml-6 border-l border-gray-100">
                                                {chapter.paragraphs.map((para: Paragraph) => (
                                                    <button
                                                        key={para.para_id}
                                                        onClick={() => scrollToSection(para.para_id)}
                                                        className={`block w-full text-left px-3 py-1 text-xs transition-colors ${activeSection === para.para_id
                                                            ? 'text-[#99334C] font-medium'
                                                            : 'text-gray-500 hover:text-gray-700'
                                                            }`}
                                                    >
                                                        <span className="line-clamp-1">{para.para_name}</span>
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

            <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Informations</h3>
                <div className="space-y-2 text-sm text-gray-600">
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
