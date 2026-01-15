"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, Download, Share2, Bookmark, BookmarkCheck,
  Eye, User, Calendar, Clock, Menu, X, ZoomIn, ZoomOut, Printer, Loader2,
  AlertCircle, FileText, List, ChevronDown, ChevronUp, Home, ArrowLeft,
  BookOpen, Copy, Check
} from 'lucide-react';
import { documentService, Part, Chapter, Paragraph, Notion, DocumentWithStructure } from '@/services/documentService';

const BookReaderPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const docId = searchParams.get('docId');

  // Data states
  const [data, setData] = useState<DocumentWithStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI states
  const [tocOpen, setTocOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('');
  const [fontSize, setFontSize] = useState(18);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [expandedParts, setExpandedParts] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (docId) {
      fetchDocument();
    }
  }, [docId]);

  const fetchDocument = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await documentService.getDocumentById(docId!);
      setData(result);

      // Expand all parts by default
      const partsExpanded: Record<string, boolean> = {};
      const chaptersExpanded: Record<string, boolean> = {};
      result.structure.forEach((part) => {
        partsExpanded[part.part_id] = true;
        part.chapters.forEach((chapter) => {
          chaptersExpanded[chapter.chapter_id] = true;
        });
      });
      setExpandedParts(partsExpanded);
      setExpandedChapters(chaptersExpanded);

      // Set first part as active
      if (result.structure.length > 0) {
        setActiveSection(result.structure[0].part_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger le document.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleDownload = async () => {
    if (!docId) return;
    try {
      setIsDownloading(true);
      const { url, doc_name } = await documentService.downloadDocument(docId);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erreur telechargement:', err);
      alert('Erreur lors du telechargement');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#99334C]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-[#99334C] animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Chargement du cours</h2>
          <p className="text-gray-500">Preparation de votre lecture...</p>
        </div>
      </div>
    );
  }

  // Error state
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
            <button
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            <button
              onClick={() => router.push('/library')}
              className="px-6 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] transition-all"
            >
              Bibliotheque
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Document non trouve.</p>
      </div>
    );
  }

  const { document: doc, project, structure } = data;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header fixe */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm print:hidden">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTocOpen(!tocOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {tocOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <button
                onClick={() => router.push('/library')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                title="Retour a la bibliotheque"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="hidden sm:block border-l border-gray-200 pl-4">
                <h1 className="text-lg font-bold text-gray-900 line-clamp-1 max-w-md">
                  {doc.doc_name}
                </h1>
                <p className="text-xs text-gray-500">
                  Par {project.author} - {doc.pages} pages
                </p>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-2">
              {/* Zoom */}
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFontSize(s => Math.max(14, s - 2))}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                  title="Reduire la taille"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-2 text-sm font-medium text-gray-600 min-w-[3rem] text-center">
                  {fontSize}px
                </span>
                <button
                  onClick={() => setFontSize(s => Math.min(28, s + 2))}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                  title="Augmenter la taille"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Bookmark */}
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2.5 rounded-lg transition-colors ${isBookmarked ? 'bg-[#99334C]/10 text-[#99334C]' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Ajouter aux favoris"
              >
                {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                title="Partager"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
              </button>

              {/* Print */}
              <button
                onClick={handlePrint}
                className="hidden sm:block p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                title="Imprimer"
              >
                <Printer className="w-5 h-5" />
              </button>

              {/* Download */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="px-4 py-2.5 bg-[#99334C] text-white rounded-lg hover:bg-[#7a283d] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Telecharger</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full">
        {/* Sidebar - Table des matieres */}
        <aside
          className={`
            fixed lg:sticky top-[73px] left-0 z-40
            w-80 h-[calc(100vh-73px)]
            bg-white border-r border-gray-200
            overflow-y-auto
            transition-transform duration-300
            lg:translate-x-0
            ${tocOpen ? 'translate-x-0' : '-translate-x-full'}
            print:hidden
          `}
        >
          <div className="p-6">
            {/* Header TOC */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#99334C]/10 rounded-xl flex items-center justify-center">
                <List className="w-5 h-5 text-[#99334C]" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Table des matieres</h2>
                <p className="text-xs text-gray-500">{structure.length} parties</p>
              </div>
            </div>

            {/* TOC Navigation */}
            <nav className="space-y-2">
              {structure.map((part, partIndex) => (
                <div key={part.part_id} className="mb-2">
                  {/* Part */}
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
                      className={`flex-1 text-left px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        activeSection === part.part_id
                          ? 'bg-[#99334C] text-white'
                          : 'text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xs opacity-60 mr-2">Partie {partIndex + 1}</span>
                      <span className="line-clamp-1">{part.part_title}</span>
                    </button>
                  </div>

                  {/* Chapters */}
                  {expandedParts[part.part_id] && part.chapters.length > 0 && (
                    <div className="ml-6 mt-1 border-l-2 border-gray-100">
                      {part.chapters.map((chapter, chapterIndex) => (
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
                              className={`flex-1 text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                activeSection === chapter.chapter_id
                                  ? 'text-[#99334C] font-medium bg-[#99334C]/5'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              }`}
                            >
                              <span className="line-clamp-1">{chapter.chapter_title}</span>
                            </button>
                          </div>

                          {/* Paragraphs (optional - can be collapsed) */}
                          {expandedChapters[chapter.chapter_id] && chapter.paragraphs.length > 0 && (
                            <div className="ml-6 border-l border-gray-100">
                              {chapter.paragraphs.map((para) => (
                                <button
                                  key={para.para_id}
                                  onClick={() => scrollToSection(para.para_id)}
                                  className={`block w-full text-left px-3 py-1 text-xs transition-colors ${
                                    activeSection === para.para_id
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

            {/* Document Info */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Informations</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{project.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{doc.pages} pages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(doc.published_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{doc.consult} consultations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>{doc.downloaded} telechargements</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay mobile */}
        {tocOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setTocOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto py-8 px-4 lg:px-8" ref={contentRef}>
            {/* Document Title Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 lg:p-12 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#99334C]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-[#99334C]" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {doc.doc_name}
                </h1>
                {project.description && (
                  <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500 flex-wrap">
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
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {project.level}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <article
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              style={{ fontSize: `${fontSize}px` }}
            >
              <div className="p-8 lg:p-12">
                {structure.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Ce document ne contient pas encore de contenu.</p>
                  </div>
                ) : (
                  structure.map((part, partIndex) => (
                    <section key={part.part_id} id={part.part_id} className="mb-16 scroll-mt-24">
                      {/* Part Header */}
                      <div className="mb-8 pb-6 border-b-2 border-[#99334C]/20">
                        <span className="inline-block px-4 py-1.5 bg-[#99334C] text-white text-sm font-bold rounded-full mb-4">
                          Partie {partIndex + 1}
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                          {part.part_title}
                        </h2>
                      </div>

                      {/* Part Intro */}
                      {part.part_intro && (
                        <div
                          className="mb-10 text-lg text-gray-600 leading-relaxed italic border-l-4 border-[#99334C]/30 pl-6 prose prose-lg max-w-none"
                          dangerouslySetInnerHTML={{ __html: part.part_intro }}
                        />
                      )}

                      {/* Chapters */}
                      {part.chapters.map((chapter, chapterIndex) => (
                        <div key={chapter.chapter_id} id={chapter.chapter_id} className="mb-12 scroll-mt-24">
                          {/* Chapter Header */}
                          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="text-[#99334C]/40 font-normal">#</span>
                            {chapter.chapter_title}
                          </h3>

                          {/* Paragraphs */}
                          {chapter.paragraphs.map((para) => (
                            <div key={para.para_id} id={para.para_id} className="mb-10 scroll-mt-24">
                              {/* Paragraph Header */}
                              <h4 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4">
                                {para.para_name}
                              </h4>

                              {/* Notions */}
                              {para.notions.map((notion) => (
                                <div key={notion.notion_id} id={notion.notion_id} className="mb-8">
                                  {/* Notion Title */}
                                  {notion.notion_name && (
                                    <h5 className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-3 border-b border-gray-100 pb-2 inline-block">
                                      {notion.notion_name}
                                    </h5>
                                  )}
                                  {/* Notion Content */}
                                  <div
                                    className="prose prose-lg max-w-none text-gray-700 leading-relaxed
                                      [&_p]:mb-4
                                      [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6
                                      [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5
                                      [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4
                                      [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
                                      [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
                                      [&_li]:mb-2
                                      [&_blockquote]:border-l-4 [&_blockquote]:border-[#99334C]/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4
                                      [&_a]:text-[#99334C] [&_a]:underline [&_a]:hover:text-[#7a283d]
                                      [&_strong]:font-bold [&_strong]:text-gray-900
                                      [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
                                      [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4
                                      [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4
                                      [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
                                      [&_th]:bg-gray-100 [&_th]:border [&_th]:border-gray-200 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left
                                      [&_td]:border [&_td]:border-gray-200 [&_td]:px-4 [&_td]:py-2
                                    "
                                    dangerouslySetInnerHTML={{ __html: notion.notion_content }}
                                  />
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ))}
                    </section>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-100 px-8 lg:px-12 py-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm text-gray-500">
                    Publie le {new Date(doc.published_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleShare}
                      className="text-sm text-gray-600 hover:text-[#99334C] transition-colors flex items-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                      {copied ? 'Lien copie !' : 'Partager'}
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="text-sm text-[#99334C] hover:text-[#7a283d] transition-colors flex items-center gap-2 font-medium"
                    >
                      {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Telecharger le PDF
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Back to library */}
            <div className="text-center mt-8">
              <button
                onClick={() => router.push('/library')}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-[#99334C] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour a la bibliotheque
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            font-size: 12pt !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          article {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BookReaderPage;
