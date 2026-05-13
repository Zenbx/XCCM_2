import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import React from 'react';
import { BookOpen, BookMarked, Trash2 } from 'lucide-react';

export const DiscoveryHintView: React.FC<NodeViewProps> = ({ node, updateAttributes, deleteNode }) => {
    const { title, isOpen } = node.attrs;

    return (
        <NodeViewWrapper className="discovery-hint-wrapper my-6">
            <div className={`relative group rounded-xl border overflow-hidden transition-all ${isOpen ? 'border-blue-200' : 'border-gray-200'}`}>
                {/* Header cliquable pour toggle */}
                <div
                    className={`flex items-center gap-3 px-5 py-3 cursor-pointer select-none transition-colors ${isOpen ? 'bg-blue-50 border-b border-blue-100' : 'bg-slate-50'}`}
                    onMouseDown={(e) => { e.preventDefault(); updateAttributes({ isOpen: !isOpen }); }}
                >
                    {isOpen ? <BookOpen size={16} className="text-blue-500 shrink-0" /> : <BookMarked size={16} className="text-gray-400 shrink-0" />}
                    <span className="flex-1 text-sm font-semibold text-gray-700">{title || 'Indice'}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        {isOpen ? 'Cacher' : 'Découvrir'}
                    </span>

                    {/* Delete button */}
                    <button
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); deleteNode(); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50"
                        title="Supprimer l'indice"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>

                {/* Editable content zone */}
                {isOpen && (
                    <div className="px-5 py-4 bg-white">
                        <NodeViewContent className="discovery-hint-content focus:outline-none text-sm text-gray-600" />
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
};
