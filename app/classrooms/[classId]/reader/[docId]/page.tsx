"use client";

import React, { useRef, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

// Hooks from the main reader
import { useReaderState } from '@/app/book-reader/hooks/useReaderState';
import { useExerciseProgress } from '@/app/book-reader/hooks/useExerciseProgress';
import { useLinearNavigation } from '@/app/book-reader/hooks/useLinearNavigation';

// Specialized Classroom Components
import ClassroomReaderHeader from '../components/ClassroomReaderHeader';
import ClassroomReaderTOC from '../components/ClassroomReaderTOC';
import ClassroomReaderContent from '../components/ClassroomReaderContent';

// Shared Components
import ReaderSkeleton from '@/app/book-reader/components/ReaderSkeleton';
import ProgressBar from '@/app/book-reader/components/ProgressBar';
import StudentAIPanel from '@/app/book-reader/components/StudentAIPanel';

const ClassroomReaderPageContent = () => {
    const params = useParams();
    const router = useRouter();
    const classId = params.classId as string;
    const docId = params.docId as string;

    const [isAIOpen, setIsAIOpen] = React.useState(false);

    const {
        data, isLoading: isDocLoading, error,
        tocOpen, setTocOpen,
        activeSection, setActiveSection,
        fontSize, setFontSize,
        showProgressBar, setShowProgressBar,
        expandedParts, setExpandedParts,
        expandedChapters, setExpandedChapters,
        fetchDocument, recordView
    } = useReaderState(docId);

    // Exercise progress
    const {
        exercises, submissions, submittingId,
        totalExercises, completedExercises, attemptedExercises, progressPercentage,
        lockedIds,
        submitAnswer, getExercisesForGranule, getLatestSubmission, getSubmissionCount
    } = useExerciseProgress({
        projectId: data?.project?.pr_id,
        structure: data?.structure
    });

    // Build notionId → Exercise[] map for linear navigation
    const exercisesByNotion = React.useMemo(() => {
        if (!getExercisesForGranule || !data?.structure) return {};
        const map: Record<string, any[]> = {};
        for (const part of data.structure) {
            for (const chapter of part.chapters) {
                for (const para of chapter.paragraphs) {
                    for (const notion of para.notions) {
                        const exos = getExercisesForGranule(notion.notion_id, 'notion');
                        if (exos.length > 0) map[notion.notion_id] = exos;
                    }
                }
            }
        }
        return map;
    }, [data?.structure, getExercisesForGranule]);

    const nav = useLinearNavigation(data?.structure || [], exercisesByNotion);

    // Sync activeSection with current step for AI context
    useEffect(() => {
        if (nav.currentItem?.type === 'notion') {
            setActiveSection(nav.currentItem.data.notion_id);
        } else if (nav.currentItem?.type === 'exercises') {
            setActiveSection(nav.currentItem.notionId);
        }
    }, [nav.currentItem, setActiveSection]);

    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (docId) {
            fetchDocument();
            recordView();
        }
    }, [docId, fetchDocument, recordView]);

    const handleNavigateStep = (id: string, type: 'notion' | 'exercises' = 'notion') => {
        nav.goToId(id, type);
        if (window.innerWidth < 1024) setTocOpen(false);
    };

    const togglePart = (partId: string) => {
        setExpandedParts(prev => ({ ...prev, [partId]: !prev[partId] }));
    };

    const toggleChapter = (chapterId: string) => {
        setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
    };

    const getActiveContext = () => {
        if (!data || !activeSection) return { name: '', content: '' };
        for (const part of data.structure) {
            if (part.part_id === activeSection) return { name: part.part_title, content: part.part_intro || '' };
            for (const chapter of part.chapters) {
                if (chapter.chapter_id === activeSection) return { name: chapter.chapter_title, content: '' };
                for (const para of chapter.paragraphs) {
                    if (para.para_id === activeSection) return { name: para.para_name, content: '' };
                    for (const notion of para.notions) {
                        if (notion.notion_id === activeSection) return { name: notion.notion_name, content: notion.notion_content };
                    }
                }
            }
        }
        return { name: '', content: '' };
    };

    const activeContext = getActiveContext();

    if (isDocLoading) return <ReaderSkeleton />;

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="text-center max-w-md mx-4">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold dark:text-white mb-2">Erreur</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                    <button onClick={() => router.back()} className="px-6 py-3 bg-[#99334C] text-white rounded-xl">Retour</button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
            <ClassroomReaderHeader
                classId={classId}
                tocOpen={tocOpen}
                setTocOpen={setTocOpen}
                docName={data.document.doc_name}
                author={data.project.author || ''}
                pages={data.document.pages}
                fontSize={fontSize}
                setFontSize={setFontSize}
                showProgressBar={showProgressBar}
                setShowProgressBar={setShowProgressBar}
                isAIOpen={isAIOpen}
                setIsAIOpen={setIsAIOpen}
            />

            {showProgressBar && totalExercises > 0 && (
                <ProgressBar
                    completed={completedExercises}
                    total={totalExercises}
                    percentage={progressPercentage}
                    attempted={attemptedExercises}
                />
            )}

            <div className="flex flex-1 max-w-screen-2xl mx-auto w-full">
                <aside className={`fixed lg:sticky top-[73px] left-0 z-40 w-80 h-[calc(100vh-73px)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${tocOpen ? 'translate-x-0' : '-translate-x-full'} print:hidden`}>
                    <ClassroomReaderTOC
                        structure={data.structure}
                        expandedParts={expandedParts}
                        togglePart={togglePart}
                        expandedChapters={expandedChapters}
                        toggleChapter={toggleChapter}
                        onNavigateStep={handleNavigateStep}
                        activeSection={activeSection}
                        projectAuthor={data.project.author || ''}
                        docPages={data.document.pages}
                        publishedAt={data.document.published_at}
                        lockedIds={lockedIds}
                        exercisesByNotion={exercisesByNotion}
                    />
                </aside>

                {tocOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setTocOpen(false)} />}

                <main className="flex-1 min-w-0 relative overflow-hidden" ref={contentRef}>
                    <ClassroomReaderContent
                        doc={data.document}
                        project={data.project}
                        structure={data.structure}
                        fontSize={fontSize}
                        exercises={exercises}
                        submissions={submissions}
                        submittingId={submittingId}
                        onSubmitAnswer={submitAnswer}
                        getExercisesForGranule={getExercisesForGranule}
                        getLatestSubmission={getLatestSubmission}
                        getSubmissionCount={getSubmissionCount}
                        lockedIds={lockedIds}
                        // Navigation props
                        playlist={nav.playlist}
                        currentIndex={nav.currentIndex}
                        currentItem={nav.currentItem}
                        isFirst={nav.isFirst}
                        isLast={nav.isLast}
                        progress={nav.progress}
                        nextStep={nav.nextStep}
                        prevStep={nav.prevStep}
                        exercisesByNotion={exercisesByNotion}
                    />

                    <StudentAIPanel
                        isOpen={isAIOpen}
                        onClose={() => setIsAIOpen(false)}
                        docId={docId}
                        context={{
                            docName: data.document.doc_name,
                            activeSectionName: activeContext.name,
                            activeSectionContent: activeContext.content
                        }}
                    />
                </main>
            </div>
        </div>
    );
};

export default function ClassroomReaderPage() {
    return (
        <Suspense fallback={<ReaderSkeleton />}>
            <ClassroomReaderPageContent />
        </Suspense>
    );
}
