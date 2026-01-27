import React, { useMemo } from 'react';
import { Layers, BookOpen, Layout, MessageSquare, FileText } from 'lucide-react';

interface MarketplaceViewerProps {
    content: string | any;
    type: 'part' | 'chapter' | 'paragraph' | 'notion' | 'document' | 'item';
}

export const MarketplaceViewer: React.FC<MarketplaceViewerProps> = ({ content, type }) => {

    // Essayer de parser le contenu si c'est une chaîne JSON
    const parsedContent = useMemo(() => {
        if (typeof content !== 'string') return content;
        try {
            // Si c'est du HTML simple (commence par <), on le garde tel quel
            if (content.trim().startsWith('<')) return content;
            return JSON.parse(content);
        } catch (e) {
            return content;
        }
    }, [content]);

    // Si c'est du HTML (chaîne), on l'affiche directement
    if (typeof parsedContent === 'string') {
        return (
            <div
                className="prose prose-lg max-w-none text-gray-700 font-serif leading-relaxed"
                dangerouslySetInnerHTML={{ __html: parsedContent }}
            />
        );
    }

    // Gestion des types structurés
    const renderStructure = () => {
        if (!parsedContent) return <p className="text-gray-400 italic">Contenu vide.</p>;

        switch (type) {
            case 'item': // Generic fallback
            case 'part':
                return (
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl text-purple-900 border border-purple-100">
                            <Layers size={24} />
                            <div>
                                <h3 className="font-black text-lg">Partie : {parsedContent.part_title || parsedContent.title || 'Sans titre'}</h3>
                                <p className="text-sm opacity-80">{parsedContent.part_intro || parsedContent.description}</p>
                            </div>
                        </div>
                        <div className="pl-6 border-l-2 border-purple-100 space-y-6">
                            {(parsedContent.chapters || []).map((chap: any, i: number) => (
                                <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                                        <BookOpen size={16} className="text-purple-500" />
                                        {chap.chapter_title}
                                    </h4>
                                    <p className="text-xs text-gray-500">{chap.paragraphs?.length || 0} paragraphes</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'chapter':
                return (
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl text-amber-900 border border-amber-100">
                            <BookOpen size={24} />
                            <div>
                                <h3 className="font-black text-lg">Chapitre : {parsedContent.chapter_title || parsedContent.title || 'Sans titre'}</h3>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {(parsedContent.paragraphs || []).map((para: any, i: number) => (
                                <div key={i} className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                                    <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <Layout size={14} className="text-amber-500" />
                                        {para.para_name}
                                    </h5>
                                    <div className="grid grid-cols-1 gap-3">
                                        {(para.notions || []).map((notion: any, j: number) => (
                                            <div key={j} className="bg-white p-3 rounded-lg border border-gray-100 text-sm text-gray-600 flex items-center gap-2">
                                                <MessageSquare size={12} className="text-gray-400" />
                                                {notion.notion_name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'paragraph':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl text-emerald-900 border border-emerald-100">
                            <Layout size={24} />
                            <div>
                                <h3 className="font-black text-lg">Paragraphe : {parsedContent.para_name || parsedContent.title || 'Sans titre'}</h3>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            {(parsedContent.notions || []).map((notion: any, i: number) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <h5 className="font-bold text-gray-900 mb-2">{notion.notion_name}</h5>
                                    <div
                                        className="text-xs text-gray-500 line-clamp-3 prose prose-sm"
                                        dangerouslySetInnerHTML={{ __html: notion.notion_content }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'notion':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-xl text-rose-900 border border-rose-100">
                            <MessageSquare size={24} />
                            <div>
                                <h3 className="font-black text-lg">Notion : {parsedContent.notion_name || parsedContent.title || 'Sans titre'}</h3>
                            </div>
                        </div>
                        <article
                            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm prose prose-lg max-w-none font-serif text-gray-800"
                            dangerouslySetInnerHTML={{ __html: parsedContent.notion_content || parsedContent.content }}
                        />
                    </div>
                );

            default:
                return (
                    <div className="bg-gray-50 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                        <pre>{JSON.stringify(parsedContent, null, 2)}</pre>
                    </div>
                );
        }
    };

    return (
        <div className="marketplace-viewer animate-in fade-in duration-500">
            {renderStructure()}
        </div>
    );
};
