"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, Download, Share2, Bookmark, BookmarkCheck, Eye, User, Calendar, Clock, Star, Menu, X, Copy, Check, Plus, Lock, Unlock, FileText, List, ZoomIn, ZoomOut, Printer, Loader2, AlertCircle
} from 'lucide-react';
import { projectService, Project } from '@/services/projectService';

// Définir une interface pour le contenu du projet publié
interface PublishedProjectContent {
  project: Project; // Métadonnées du projet
  structure: any[]; // Structure détaillée (parties, chapitres, etc.)
}

const DocumentReaderPage = () => {
  const searchParams = useSearchParams();
  const projectName = searchParams.get('projectName');

  const [projectContent, setProjectContent] = useState<PublishedProjectContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tocOpen, setTocOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('intro');
  const [fontSize, setFontSize] = useState(16);
  const contentRef = useRef(null);

  useEffect(() => {
    if (projectName) {
      const fetchProjectContent = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const content = await projectService.getPublishedProjectContent(projectName);
          setProjectContent(content);
        } catch (err: any) {
          setError(err.message || "Impossible de charger le document.");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProjectContent();
    }
  }, [projectName]);

  const scrollToSection = (sectionId: string) => {
     if (typeof window === 'undefined') return;
    const element = window.document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  // ... (autres fonctions utilitaires comme la gestion du scroll, etc.)

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#99334C] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
       <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
           <button onClick={() => window.history.back()} className="px-4 py-2 bg-[#99334C] text-white rounded-lg">
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!projectContent) {
    return <div>Document non trouvé.</div>;
  }

  const { project, structure } = projectContent;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixe */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
         <div className="max-w-7xl mx-auto px-6 py-4">
            {/* ... (Contenu du header, maintenant dynamique) */}
             <h1 className="text-xl font-bold text-gray-900 line-clamp-1">{project.pr_name}</h1>
         </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Table des matières (dynamique) */}
        <aside
          className={`${
            tocOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:sticky lg:translate-x-0 top-[73px] left-0 w-80 h-[calc(100vh-73px)] bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 z-40 lg:z-0`}
        >
           <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Table des matières</h2>
                <nav className="space-y-2">
                    {structure.map((part: any) => (
                        <div key={part.part_id}>
                            <button onClick={() => scrollToSection(part.part_id)} className={`font-semibold w-full text-left px-3 py-2 rounded-lg ${activeSection === part.part_id ? 'bg-[#99334C] text-white' : 'hover:bg-gray-100'}`}>{part.part_title}</button>
                            <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100">
                                {part.chapters?.map((chapter: any) => (
                                    <button key={chapter.chapter_id} onClick={() => scrollToSection(chapter.chapter_id)} className={`text-sm w-full text-left px-3 py-1.5 rounded-lg ${activeSection === chapter.chapter_id ? 'text-[#99334C] font-medium' : 'text-gray-600 hover:text-black'}`}>{chapter.chapter_title}</button>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
           </div>
        </aside>

        {/* Contenu du document (dynamique) */}
        <main className="flex-1 p-6 lg:p-12" ref={contentRef}>
          <article 
            className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 lg:p-12 prose lg:prose-xl"
            style={{ fontSize: `${fontSize}px` }}
          >
            <header className="mb-12 pb-8 border-b border-gray-200">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{project.pr_name}</h1>
                <p className="text-lg text-gray-600">{project.description || ''}</p>
                {/* ... (Autres métadonnées) */}
            </header>
            
            {structure.map((part: any) => (
                <section key={part.part_id} id={part.part_id} className="scroll-mt-24">
                    <h2 className="text-3xl font-bold mt-12 mb-6">{part.part_title}</h2>
                    {part.part_intro && <div className="italic text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: part.part_intro }} />}
                    
                    {part.chapters?.map((chapter: any) => (
                        <section key={chapter.chapter_id} id={chapter.chapter_id} className="scroll-mt-24">
                            <h3 className="text-2xl font-bold mt-8 mb-4">{chapter.chapter_title}</h3>
                            {chapter.paragraphs?.map((paragraph: any) => (
                                <div key={paragraph.para_id} className="mb-6">
                                    <h4 className="text-xl font-semibold mt-6 mb-3">{paragraph.para_name}</h4>
                                    {paragraph.notions?.map((notion: any) => (
                                        <div key={notion.notion_id} dangerouslySetInnerHTML={{ __html: notion.notion_content }} />
                                    ))}
                                </div>
                            ))}
                        </section>
                    ))}
                </section>
            ))}
          </article>
        </main>
      </div>
    </div>
  );
};

export default DocumentReaderPage;
