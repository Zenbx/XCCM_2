import React from 'react';
import { BookOpen, User, Archive } from 'lucide-react';
import { Part, Chapter, Paragraph, Notion } from '@/services/documentService';

interface ReaderContentProps {
    doc: any;
    project: any;
    structure: Part[];
    fontSize: number;
    onCollect: (granule: any) => void;
}

const ReaderContent: React.FC<ReaderContentProps> = ({
    doc, project, structure, fontSize, onCollect
}) => {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 lg:px-8">
            {/* Title Card */}
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

            {/* Article Body */}
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
                        structure.map((part: Part, partIndex) => (
                            <section key={part.part_id} id={part.part_id} className="mb-16 scroll-mt-24">
                                <div className="mb-8 pb-6 border-b-2 border-[#99334C]/20">
                                    <span className="inline-block px-4 py-1.5 bg-[#99334C] text-white text-sm font-bold rounded-full mb-4">
                                        Partie {partIndex + 1}
                                    </span>
                                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                                        {part.part_title}
                                    </h2>
                                    <button
                                        onClick={() => onCollect({ ...part, type: 'part', title: part.part_title, id: part.part_id })}
                                        className="mt-4 p-2 text-gray-400 hover:text-[#99334C] hover:bg-[#99334C]/5 rounded-lg transition-all flex items-center gap-2 group w-fit"
                                        title="Récupérer cette partie"
                                    >
                                        <Archive size={18} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Récupérer</span>
                                    </button>
                                </div>

                                {part.part_intro && (
                                    <div
                                        className="mb-10 text-lg text-gray-600 leading-relaxed italic border-l-4 border-[#99334C]/30 pl-6 prose prose-lg max-w-none"
                                        dangerouslySetInnerHTML={{ __html: part.part_intro }}
                                    />
                                )}

                                {part.chapters.map((chapter: Chapter) => (
                                    <div key={chapter.chapter_id} id={chapter.chapter_id} className="mb-12 scroll-mt-24">
                                        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                            <span className="text-[#99334C]/40 font-normal">#</span>
                                            {chapter.chapter_title}
                                            <button
                                                onClick={() => onCollect({ ...chapter, type: 'chapter', title: chapter.chapter_title, id: chapter.chapter_id })}
                                                className="p-1.5 text-gray-400 hover:text-[#99334C] hover:bg-[#99334C]/5 rounded-lg transition-all"
                                                title="Récupérer ce chapitre"
                                            >
                                                <Archive size={16} />
                                            </button>
                                        </h3>

                                        {chapter.paragraphs.map((para: Paragraph) => (
                                            <div key={para.para_id} id={para.para_id} className="mb-10 scroll-mt-24">
                                                <h4 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                                                    {para.para_name}
                                                    <button
                                                        onClick={() => onCollect({ ...para, type: 'paragraph', title: para.para_name, id: para.para_id })}
                                                        className="p-1.5 text-gray-400 hover:text-[#99334C] hover:bg-[#99334C]/5 rounded-lg transition-all"
                                                        title="Récupérer ce paragraphe"
                                                    >
                                                        <Archive size={14} />
                                                    </button>
                                                </h4>

                                                {para.notions.map((notion: Notion) => (
                                                    <div key={notion.notion_id} id={notion.notion_id} className="mb-8">
                                                        {notion.notion_name && (
                                                            <h5 className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-3 border-b border-gray-100 pb-2 inline-flex items-center gap-2">
                                                                {notion.notion_name}
                                                                <button
                                                                    onClick={() => onCollect({ type: 'notion', title: notion.notion_name, id: notion.notion_id, content: notion.notion_content })}
                                                                    className="p-1 text-gray-400 hover:text-[#99334C] hover:bg-[#99334C]/5 rounded-lg transition-all"
                                                                    title="Récupérer cette notion"
                                                                >
                                                                    <Archive size={12} />
                                                                </button>
                                                            </h5>
                                                        )}
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
            </article>
        </div>
    );
};

export default ReaderContent;
