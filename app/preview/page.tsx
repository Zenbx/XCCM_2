"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Share2, Download, FileText, File, Printer, ChevronDown } from 'lucide-react';
import { projectService } from '@/services/projectService';
import { structureService, Part } from '@/services/structureService';

const PreviewPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectName = searchParams.get('projectName');

    const [structure, setStructure] = useState<Part[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showPublishMenu, setShowPublishMenu] = useState(false);

    useEffect(() => {
        if (projectName) {
            loadProject();
        }
    }, [projectName]);

    const loadProject = async () => {
        try {
            setIsLoading(true);
            const projectStructure = await structureService.getProjectStructure(projectName!);
            setStructure(projectStructure);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 text-[#99334C] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            {/* Top Bar */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                        title="Retour à l'éditeur"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#99334C] to-[#DC3545]">
                        {projectName} <span className="text-gray-400 font-normal text-sm ml-2">(Aperçu)</span>
                    </h1>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowPublishMenu(!showPublishMenu)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#99334C] to-[#DC3545] text-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all font-medium"
                    >
                        <Share2 size={18} />
                        Publier
                        <ChevronDown size={16} className={`transition-transform ${showPublishMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu Canva-style */}
                    {showPublishMenu && (
                        <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="font-semibold text-gray-900">Options de publication</h3>
                                <p className="text-xs text-gray-500 mt-1">Choisissez comment diffuser votre cours</p>
                            </div>

                            <div className="p-2">
                                <button className="w-full flex items-center gap-3 p-3 hover:bg-[#99334C]/5 rounded-lg transition-colors group text-left">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Share2 size={18} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">Publier en ligne</div>
                                        <div className="text-xs text-gray-500">Rendre accessible via lien public</div>
                                    </div>
                                </button>

                                <button className="w-full flex items-center gap-3 p-3 hover:bg-[#99334C]/5 rounded-lg transition-colors group text-left">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">Exporter en PDF</div>
                                        <div className="text-xs text-gray-500">Format document portable</div>
                                    </div>
                                </button>

                                <button className="w-full flex items-center gap-3 p-3 hover:bg-[#99334C]/5 rounded-lg transition-colors group text-left">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 group-hover:bg-blue-800 group-hover:text-white transition-colors">
                                        <File size={18} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">Exporter en Word</div>
                                        <div className="text-xs text-gray-500">Format éditable .docx</div>
                                    </div>
                                </button>

                                <button className="w-full flex items-center gap-3 p-3 hover:bg-[#99334C]/5 rounded-lg transition-colors group text-left">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-gray-800 group-hover:text-white transition-colors">
                                        <Printer size={18} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">Imprimer</div>
                                        <div className="text-xs text-gray-500">Lancer l'impression locale</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-4xl mx-auto py-12 px-8 min-h-[calc(100vh-80px)]">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">{projectName?.toUpperCase()}</h1>

                    {structure.length === 0 && (
                        <div className="text-center text-gray-500 py-20 italic">
                            Ce cours est vide pour le moment.
                        </div>
                    )}

                    {structure.map((part) => (
                        <div key={part.part_id} className="mb-16">
                            {/* Partie : Style Titre Livre */}
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">
                                {part.part_title}
                            </h2>

                            {part.part_intro && (
                                <div className="mb-10 text-lg text-gray-600 leading-relaxed font-serif"
                                    dangerouslySetInnerHTML={{ __html: part.part_intro }} />
                            )}

                            {part.chapters?.map((chapter) => (
                                <div key={chapter.chapter_id} className="mb-12">
                                    {/* Chapitre : Style Sous-titre */}
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-6 mt-10">
                                        {chapter.chapter_title}
                                    </h3>

                                    {chapter.paragraphs?.map((para) => (
                                        <div key={para.para_id} className="mb-8">
                                            {/* Paragraphe : Style Section */}
                                            <h4 className="text-xl font-medium text-gray-800 mb-4">
                                                {para.para_name}
                                            </h4>

                                            {para.notions?.map((notion) => (
                                                <div key={notion.notion_id} className="mb-6 group">
                                                    {/* Notion : Contenu pur */}
                                                    <h5 className="text-lg font-medium text-gray-900 mb-2 mt-4 hidden group-hover:block text-sm uppercase tracking-wide text-gray-400">
                                                        {notion.notion_name}
                                                    </h5>
                                                    <div
                                                        className="prose prose-lg prose-slate max-w-none text-gray-700 leading-loose font-serif"
                                                        dangerouslySetInnerHTML={{ __html: notion.notion_content }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {structure.indexOf(part) < structure.length - 1 && (
                                <div className="w-full flex justify-center my-20">
                                    <div className="w-16 h-1 bg-gray-200 rounded-full"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PreviewPage;
