"use client";

import React, { useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';

// Hooks
import { useReaderState } from './hooks/useReaderState';
import { useCollection } from './hooks/useCollection';
import { useExerciseProgress } from './hooks/useExerciseProgress';
import { useLinearNavigation } from './hooks/useLinearNavigation';

// Components
import ReaderHeader from './components/ReaderHeader';
import ReaderTOC from './components/ReaderTOC';
import ReaderContent from './components/ReaderContent';
import CollectionModal from './components/CollectionModal';
import ReaderSkeleton from './components/ReaderSkeleton';
import ProgressBar from './components/ProgressBar';
import StudentAIPanel from './components/StudentAIPanel';

const BookReaderPageContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const docId = searchParams.get('docId');
    const classId = searchParams.get('classId');
    const isClassroom = !!classId;

    const [isAIOpen, setIsAIOpen] = React.useState(false);

    const {
        data, isLoading: isDocLoading, error,
        tocOpen, setTocOpen,
        activeSection, setActiveSection,
        fontSize, setFontSize,
        showProgressBar, setShowProgressBar,
        isBookmarked, setIsBookmarked,
        expandedParts, setExpandedParts,
        expandedChapters, setExpandedChapters,
        isDownloading,
        copied,
        likesCount, userLiked,
        fetchDocument, recordView,
        handleToggleLike, handleDownload, handleShare
    } = useReaderState(docId);

    const {
        showCollectModal, setShowCollectModal,
        collectedGranule,
        myProjects,
        selectedProject,
        projectStructure,
        isLoadingProjects,
        isLoadingStructure,
        isInserting,
        modalStep, setModalStep,
        navigationPath,
        setNavigationPath,
        includeChildren,
        setIncludeChildren,
        handleCollect,
        confirmCollectToVault,
        handleSelectProject,
        handleNavigateIn,
        handleNavigateBack,
        confirmCollectToProject
    } = useCollection(docId, data?.document);

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
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center max-w-md mx-4">
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => router.back()} className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" /> Retour
                        </button>
                        <button onClick={() => router.push('/library')} className="px-6 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] transition-all">Bibliothèque</button>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return <div className="h-screen flex items-center justify-center text-gray-500">Document non trouvé.</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <ReaderHeader
                tocOpen={tocOpen}
                setTocOpen={setTocOpen}
                docName={data.document.doc_name}
                author={data.project.author || ''}
                pages={data.document.pages}
                fontSize={fontSize}
                setFontSize={setFontSize}
                showProgressBar={showProgressBar}
                setShowProgressBar={setShowProgressBar}
                isBookmarked={isBookmarked}
                setIsBookmarked={setIsBookmarked}
                userLiked={userLiked}
                likesCount={likesCount}
                onToggleLike={handleToggleLike}
                onShare={handleShare}
                copied={copied}
                onPrint={() => window.print()}
                onDownload={handleDownload}
                isDownloading={isDownloading}
                isClassroom={isClassroom}
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
                <aside className={`fixed lg:sticky top-[73px] left-0 z-40 w-80 h-[calc(100vh-73px)] bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${tocOpen ? 'translate-x-0' : '-translate-x-full'} print:hidden`}>
                    <ReaderTOC
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
                        consultations={data.document.consult}
                        downloads={data.document.downloaded}
                        lockedIds={lockedIds}
                        exercisesByNotion={exercisesByNotion}
                    />
                </aside>

                {tocOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setTocOpen(false)} />}

                <main className="flex-1 min-w-0 relative overflow-hidden" ref={contentRef}>
                    <ReaderContent
                        doc={data.document}
                        project={data.project}
                        structure={data.structure}
                        fontSize={fontSize}
                        onCollect={handleCollect}
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
                        docId={docId || ''}
                        context={{
                            docName: data.document.doc_name,
                            activeSectionName: activeContext.name,
                            activeSectionContent: activeContext.content
                        }}
                    />
                </main>
            </div>

            <CollectionModal
                isOpen={showCollectModal}
                onClose={() => setShowCollectModal(false)}
                granule={collectedGranule}
                step={modalStep}
                setStep={setModalStep}
                projects={myProjects}
                onSelectProject={handleSelectProject}
                selectedProject={selectedProject}
                projectStructure={projectStructure}
                isLoadingProjects={isLoadingProjects}
                isLoadingStructure={isLoadingStructure}
                navigationPath={navigationPath}
                setNavigationPath={setNavigationPath}
                onNavigateIn={handleNavigateIn}
                onNavigateBack={handleNavigateBack}
                onConfirmVault={confirmCollectToVault}
                onConfirmProject={confirmCollectToProject}
                isInserting={isInserting}
                includeChildren={includeChildren}
                setIncludeChildren={setIncludeChildren}
            />
        </div>
    );
};

export default function BookReaderPage() {
    return (
        <Suspense fallback={<ReaderSkeleton />}>
            <BookReaderPageContent />
        </Suspense>
    );
}
