import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import React from 'react';
import { Camera, Trash2 } from 'lucide-react';

export const CaptureZoneBlockView: React.FC<NodeViewProps> = ({ deleteNode }) => {
    return (
        <NodeViewWrapper className="capture-zone-block-wrapper my-6" contentEditable={false}>
            <div className="relative group capture-zone-block rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-[#99334C] hover:bg-[#fdf2f4] transition-all p-8 text-center">
                <button
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); deleteNode(); }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-white/90 text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-sm"
                    title="Supprimer la zone de capture"
                >
                    <Trash2 size={13} />
                </button>
                <div className="flex flex-col items-center gap-2 pointer-events-none select-none">
                    <Camera size={28} className="text-gray-300" />
                    <span className="text-sm font-semibold text-gray-400">Zone de Capture</span>
                    <span className="text-xs text-gray-400">Collez votre image ici (Ctrl+V) ou glissez-la</span>
                </div>
            </div>
        </NodeViewWrapper>
    );
};
