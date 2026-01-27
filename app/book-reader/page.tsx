"use client";

import React, { useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Hooks
import { useReaderState } from './hooks/useReaderState';
import { useCollection } from './hooks/useCollection';

// Components
import ReaderHeader from './components/ReaderHeader';
import ReaderTOC from './components/ReaderTOC';
import ReaderContent from './components/ReaderContent';
import CollectionModal from './components/CollectionModal';
import ReaderSkeleton from './components/ReaderSkeleton';

const BookReaderPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const docId = searchParams.get('docId');

  const {
    data, isLoading, error,
    tocOpen, setTocOpen,
    activeSection, setActiveSection,
    fontSize, setFontSize,
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

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (docId) {
      fetchDocument();
      recordView();
    }
  }, [docId, fetchDocument, recordView]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  const togglePart = (partId: string) => {
    setExpandedParts(prev => ({ ...prev, [partId]: !prev[partId] }));
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  if (isLoading) return <ReaderSkeleton />;

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
      />

      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full">
        <aside className={`fixed lg:sticky top-[73px] left-0 z-40 w-80 h-[calc(100vh-73px)] bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${tocOpen ? 'translate-x-0' : '-translate-x-full'} print:hidden`}>
          <ReaderTOC
            structure={data.structure}
            expandedParts={expandedParts}
            togglePart={togglePart}
            expandedChapters={expandedChapters}
            toggleChapter={toggleChapter}
            scrollToSection={scrollToSection}
            activeSection={activeSection}
            projectAuthor={data.project.author || ''}
            docPages={data.document.pages}
            publishedAt={data.document.published_at}
            consultations={data.document.consult}
            downloads={data.document.downloaded}
          />
        </aside>

        {tocOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setTocOpen(false)} />}

        <main className="flex-1 min-w-0" ref={contentRef}>
          <ReaderContent
            doc={data.document}
            project={data.project}
            structure={data.structure}
            fontSize={fontSize}
            onCollect={handleCollect}
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
