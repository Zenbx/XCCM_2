"use client";

import React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { X } from 'lucide-react';

export const NoteBlockView = (props: any) => {
    const deleteNode = () => {
        props.deleteNode();
    };

    return (
        <NodeViewWrapper className="note-block relative group">
            <div className="note-header flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="note-icon">📝</span>
                    <span className="note-title">Note</span>
                </div>
                <button
                    onClick={deleteNode}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#99334C]/10 text-[#99334C] rounded-md transition-all duration-200"
                    title="Supprimer la note"
                >
                    <X size={14} />
                </button>
            </div>
            <NodeViewContent className="note-content" />
        </NodeViewWrapper>
    );
};
