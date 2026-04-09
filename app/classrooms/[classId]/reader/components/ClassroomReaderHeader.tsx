"use client";
import React from 'react';
import {
    Menu, X, ArrowLeft, ZoomOut, ZoomIn, 
    Loader2, BarChart2, Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ClassroomReaderHeaderProps {
    classId: string;
    tocOpen: boolean;
    setTocOpen: (open: boolean) => void;
    docName: string;
    author: string;
    pages: number;
    fontSize: number;
    setFontSize: React.Dispatch<React.SetStateAction<number>>;
    showProgressBar: boolean;
    setShowProgressBar: (b: boolean) => void;
    isAIOpen?: boolean;
    setIsAIOpen?: (b: boolean) => void;
}

const ClassroomReaderHeader: React.FC<ClassroomReaderHeaderProps> = ({
    classId, tocOpen, setTocOpen, docName, author, pages, fontSize, setFontSize,
    showProgressBar, setShowProgressBar,
    isAIOpen = false, setIsAIOpen
}) => {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm print:hidden">
            <div className="max-w-screen-2xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setTocOpen(!tocOpen)}
                            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            {tocOpen ? <X className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                        </button>

                        <button
                            onClick={() => router.push(`/classrooms/${classId}`)}
                            className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all text-gray-600 dark:text-gray-400 group"
                            title="Retour à la classe"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </button>

                        <div className="hidden sm:block border-l border-gray-200 dark:border-gray-800 pl-4">
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 max-w-md">
                                {docName}
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Cours de {author}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Font size control */}
                        <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                            <button
                                onClick={() => setFontSize(s => Math.max(14, s - 2))}
                                className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="Réduire la taille"
                            >
                                <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <span className="px-2 text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
                                {fontSize}px
                            </span>
                            <button
                                onClick={() => setFontSize(s => Math.min(28, s + 2))}
                                className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="Augmenter la taille"
                            >
                                <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Progression Toggle */}
                        <button
                            onClick={() => setShowProgressBar(!showProgressBar)}
                            className={`p-2.5 rounded-lg transition-all ${showProgressBar ? 'bg-[#99334C] text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-400'}`}
                            title={showProgressBar ? "Masquer la progression" : "Afficher la progression"}
                        >
                            <BarChart2 className="w-5 h-5" />
                        </button>

                        {/* Socratic AI Assistant UI */}
                        <button
                            onClick={() => setIsAIOpen?.(!isAIOpen)}
                            className={`p-2.5 rounded-lg transition-all border ${isAIOpen ? 'bg-[#99334C] text-white border-transparent shadow-lg scale-110' : 'hover:bg-[#99334C]/10 text-[#99334C] border-[#99334C]/30'}`}
                            title="Assistant Socratique (LIA)"
                        >
                            <Sparkles className={`w-5 h-5 ${isAIOpen ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ClassroomReaderHeader;
