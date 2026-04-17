'use client';
import React, { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Archive } from 'lucide-react';
import { Part } from '@/services/documentService';
import { Exercise, Submission, SubmissionResult } from '@/services/exerciseService';
import { useLinearNavigation } from '@/app/book-reader/hooks/useLinearNavigation';
import ExerciseCarousel from '@/components/Editor/ExerciseCarousel';

interface ReaderContentProps {
    doc: any;
    project: any;
    structure: Part[];
    fontSize: number;
    onCollect: (granule: any) => void;
    // Exercise integration
    exercises?: Exercise[];
    submissions?: Submission[];
    submittingId?: string | null;
    onSubmitAnswer?: (exerciseId: string, answers: any) => Promise<SubmissionResult | null>;
    getExercisesForGranule?: (granuleId: string, granuleType: string) => Exercise[];
    getLatestSubmission?: (exerciseId: string) => Submission | undefined;
    getSubmissionCount?: (exerciseId: string) => number;
    lockedIds?: Set<string>;
    // Navigation props
    playlist: any[];
    currentIndex: number;
    currentItem: any;
    isFirst: boolean;
    isLast: boolean;
    progress: number;
    nextStep: () => void;
    prevStep: () => void;
    exercisesByNotion: Record<string, any[]>;
}

const ReaderContent: React.FC<ReaderContentProps> = ({
    doc, project, structure, fontSize, onCollect,
    exercises, submissions, submittingId, onSubmitAnswer,
    getExercisesForGranule, getLatestSubmission, getSubmissionCount, lockedIds = new Set(),
    playlist, currentIndex, currentItem, isFirst, isLast, progress, nextStep, prevStep, exercisesByNotion
}) => {
    // Cross-reference click handler
    const handleCrossRefClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        const mention = target.closest('[data-type="notion-mention"]') as HTMLElement | null;
        if (!mention) return;
        // Cross-refs: in paged mode, just ignore or navigate if needed
        e.preventDefault();
    }, []);

    if (!currentItem) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <BookOpen className="w-12 h-12 mb-3" />
                <p>Aucun contenu disponible</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-73px)]">

            {/* ═══ Top Progress Bar ═══ */}
            <div className="h-1 bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                <motion.div
                    className="h-full bg-gradient-to-r from-[#99334C] to-[#c45b72]"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                />
            </div>

            {/* ═══ Main Content ═══ */}
            <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">

                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-5 flex-wrap">
                    <span className="font-semibold text-[#99334C]">{currentItem.context.partTitle}</span>
                    {currentItem.context.chapterTitle && (
                        <>
                            <ChevronRight className="w-3 h-3 shrink-0" />
                            <span>{currentItem.context.chapterTitle}</span>
                        </>
                    )}
                    {currentItem.context.paraTitle && (
                        <>
                            <ChevronRight className="w-3 h-3 shrink-0" />
                            <span>{currentItem.context.paraTitle}</span>
                        </>
                    )}
                </div>

                {/* Step content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                        {/* ── NOTION READING STEP ── */}
                        {currentItem.type === 'notion' && (
                            <div>
                                {/* Title + Vault button */}
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <h1
                                        className="font-bold text-gray-900 dark:text-white leading-tight"
                                        style={{ fontSize: `${Math.round(fontSize * 1.45)}px` }}
                                    >
                                        {currentItem.data.notion_name}
                                    </h1>
                                    <button
                                        onClick={() => onCollect(currentItem.data)}
                                        title="Sauvegarder dans le coffre"
                                        className="mt-1 shrink-0 p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-[#99334C]/10 text-gray-400 hover:text-[#99334C] transition-all"
                                    >
                                        <Archive className="w-4 h-4" />
                                    </button>
                                </div>

                                <div
                                    className="prose prose-gray dark:prose-invert max-w-none"
                                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
                                    onClick={handleCrossRefClick as any}
                                    dangerouslySetInnerHTML={{ __html: currentItem.data.notion_content }}
                                />
                            </div>
                        )}

                        {/* ── EXERCISE CAROUSEL STEP ── */}
                        {currentItem.type === 'exercises' && (
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-[#99334C]/10 rounded-xl flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-[#99334C]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-[#99334C]">Exercices</p>
                                        <h2
                                            className="font-bold text-gray-900 dark:text-white"
                                            style={{ fontSize: `${Math.round(fontSize * 1.2)}px` }}
                                        >
                                            {currentItem.notionName}
                                        </h2>
                                    </div>
                                </div>

                                {getExercisesForGranule && getLatestSubmission && getSubmissionCount && onSubmitAnswer && (
                                    <ExerciseCarousel
                                        exercises={exercisesByNotion[currentItem.notionId] || []}
                                        getLatestSubmission={getLatestSubmission}
                                        getSubmissionCount={getSubmissionCount}
                                        onSubmitAnswer={onSubmitAnswer}
                                        submittingId={submittingId ?? null}
                                        lockedIds={lockedIds}
                                    />
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ═══ Fixed Bottom Navigation Bar ═══ */}
            <div className="sticky bottom-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-6 py-3 z-20">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    <button
                        onClick={prevStep}
                        disabled={isFirst}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Précédent
                    </button>

                    <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-400">
                            {currentIndex + 1} / {playlist.length}
                        </span>
                        {currentItem.type === 'exercises' && (
                            <span className="text-[10px] text-[#99334C] font-bold uppercase tracking-wider mt-0.5">
                                Exercices
                            </span>
                        )}
                    </div>

                    <button
                        onClick={nextStep}
                        disabled={isLast}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#99334C] text-white text-sm font-semibold hover:bg-[#7a283d] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
                    >
                        {isLast ? 'Terminé ✓' : 'Suivant'}
                        {!isLast && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReaderContent;
