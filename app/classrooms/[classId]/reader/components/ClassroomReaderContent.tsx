"use client";
import React, { useCallback } from 'react';
import { BookOpen, User, Lock } from 'lucide-react';
import { Part, Chapter, Paragraph, Notion } from '@/services/documentService';
import { Exercise, Submission, SubmissionResult } from '@/services/exerciseService';
import ExerciseBlock from '@/app/book-reader/components/ExerciseBlock';

interface ClassroomReaderContentProps {
    doc: any;
    project: any;
    structure: Part[];
    fontSize: number;
    // Exercise integration
    exercises?: Exercise[];
    submissions?: Submission[];
    submittingId?: string | null;
    onSubmitAnswer?: (exerciseId: string, answers: any) => Promise<SubmissionResult | null>;
    getExercisesForGranule?: (granuleId: string, granuleType: string) => Exercise[];
    getLatestSubmission?: (exerciseId: string) => Submission | undefined;
    getSubmissionCount?: (exerciseId: string) => number;
    lockedIds?: Set<string>;
}

const RenderExercises = ({
    granuleId, granuleType, getExercisesForGranule, getLatestSubmission, getSubmissionCount, submittingId, onSubmitAnswer, isLocked
}: {
    granuleId: string;
    granuleType: string;
    getExercisesForGranule?: (id: string, type: string) => Exercise[];
    getLatestSubmission?: (id: string) => Submission | undefined;
    getSubmissionCount?: (id: string) => number;
    submittingId?: string | null;
    onSubmitAnswer?: (exerciseId: string, answers: any) => Promise<SubmissionResult | null>;
    isLocked?: boolean;
}) => {
    if (!getExercisesForGranule || !onSubmitAnswer) return null;
    const exs = getExercisesForGranule(granuleId, granuleType);
    if (exs.length === 0) return null;

    return (
        <div className={`mt-4 mb-8 transition-all duration-500 ${isLocked ? 'blur-sm opacity-50 pointer-events-none select-none' : ''}`}>
            {exs.map((exercise) => (
                <ExerciseBlock
                    key={exercise.id}
                    exercise={exercise}
                    submission={getLatestSubmission?.(exercise.id)}
                    submissionCount={getSubmissionCount?.(exercise.id)}
                    isSubmitting={submittingId === exercise.id}
                    onSubmit={onSubmitAnswer}
                />
            ))}
        </div>
    );
};

const ClassroomReaderContent: React.FC<ClassroomReaderContentProps> = ({
    doc, project, structure, fontSize,
    exercises, submissions, submittingId, onSubmitAnswer,
    getExercisesForGranule, getLatestSubmission, getSubmissionCount, lockedIds = new Set()
}) => {
    const exerciseProps = { getExercisesForGranule, getLatestSubmission, getSubmissionCount, submittingId, onSubmitAnswer };

    // Cross-reference click handler: scrolls to a Notion when a notion-mention link is clicked
    const handleCrossRefClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        const mention = target.closest('[data-type="notion-mention"]') as HTMLElement | null;
        if (!mention) return;
        const referenceId = mention.getAttribute('data-reference-id');
        if (!referenceId) return;
        e.preventDefault();
        const el = document.getElementById(referenceId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Brief visual highlight to confirm destination
            el.style.outline = '2px solid #99334C80';
            el.style.borderRadius = '8px';
            setTimeout(() => { el.style.outline = ''; el.style.borderRadius = ''; }, 2000);
        }
    }, []);

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 lg:px-8">
            {/* Title Card */}
            <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 lg:p-12 mb-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-[#99334C]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-8 h-8 text-[#99334C]" />
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {doc.doc_name}
                    </h1>
                    {project.description && (
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                            {project.description}
                        </p>
                    )}
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                        <span className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {project.author}
                        </span>
                        {project.category && (
                            <span className="px-3 py-1 bg-[#99334C]/10 text-[#99334C] rounded-full font-medium">
                                {project.category}
                            </span>
                        )}
                        {project.level && (
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-full">
                                {project.level}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Article Body */}
            <article
                className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden"
                style={{ fontSize: `${fontSize}px` }}
                onClick={handleCrossRefClick}
            >
                <div className="p-8 lg:p-12">
                    {structure.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Ce document ne contient pas encore de contenu.</p>
                        </div>
                    ) : (
                        structure.map((part: Part, partIndex) => (
                            <section key={part.part_id} id={part.part_id} className="mb-16 scroll-mt-24">
                                <div className="mb-8 pb-6 border-b-2 border-[#99334C]/20">
                                    <span className="inline-block px-4 py-1.5 bg-[#99334C] text-white text-sm font-bold rounded-full mb-4">
                                        Partie {partIndex + 1}
                                    </span>
                                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                                        {part.part_title}
                                    </h2>
                                    {/* NO ARCHIVE/COLLECT BUTTON HERE */}
                                </div>

                                {part.part_intro && (
                                    <div
                                        className="mb-10 text-lg text-gray-600 dark:text-gray-400 leading-relaxed italic border-l-4 border-[#99334C]/30 pl-6 prose prose-lg dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: part.part_intro }}
                                    />
                                )}

                                <RenderExercises granuleId={part.part_id} granuleType="part" {...exerciseProps} isLocked={lockedIds.has(part.part_id)} />

                                {part.chapters.map((chapter: Chapter) => (
                                    <div key={chapter.chapter_id} id={chapter.chapter_id} className="mb-12 scroll-mt-24">
                                        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                            <span className="text-[#99334C]/40 font-normal">#</span>
                                            {chapter.chapter_title}
                                        </h3>

                                        <RenderExercises granuleId={chapter.chapter_id} granuleType="chapter" {...exerciseProps} isLocked={lockedIds.has(chapter.chapter_id)} />

                                        {chapter.paragraphs.map((para: Paragraph) => (
                                            <div key={para.para_id} id={para.para_id} className="mb-10 scroll-mt-24">
                                                <h4 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                                                    {para.para_name}
                                                </h4>

                                                {para.notions.map((notion: Notion) => (
                                                    <div key={notion.notion_id} id={notion.notion_id} className="mb-8">
                                                        {notion.notion_name && (
                                                            <h5 className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 font-bold mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                                                                {notion.notion_name}
                                                            </h5>
                                                        )}
                                                        <div className="relative group/notion">
                                                            {lockedIds.has(notion.notion_id) && (
                                                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-md rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 text-center transition-all">
                                                                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center mb-3">
                                                                        <Lock className="w-6 h-6 text-gray-400" />
                                                                    </div>
                                                                    <h6 className="font-bold text-gray-900 dark:text-white mb-1">Section verrouillée</h6>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">
                                                                        Complétez les exercices précédents pour débloquer ce contenu.
                                                                    </p>
                                                                </div>
                                                            )}
                                                            <div
                                                                className={`prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed transition-all duration-500
                                                                    ${lockedIds.has(notion.notion_id) ? 'blur-sm select-none opacity-40 pointer-events-none' : ''}
                                                                `}
                                                                dangerouslySetInnerHTML={{ __html: notion.notion_content }}
                                                            />
                                                        </div>

                                                        <RenderExercises granuleId={notion.notion_id} granuleType="notion" {...exerciseProps} isLocked={lockedIds.has(notion.notion_id)} />
                                                    </div>
                                                ))}

                                                <RenderExercises granuleId={para.para_id} granuleType="paragraph" {...exerciseProps} isLocked={lockedIds.has(para.para_id)} />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </section>
                        ))
                    )}
                </div>
            </article>
        </div>
    );
};

export default ClassroomReaderContent;
