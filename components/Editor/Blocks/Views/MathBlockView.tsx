import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import React, { useState, useEffect, useRef } from 'react';
import * as katex from 'katex';
import 'katex/dist/katex.min.css';

export const MathBlockView: React.FC<NodeViewProps> = (props) => {
    const { node, updateAttributes, selected } = props;
    const { tex, inline } = node.attrs;
    const [isEditing, setIsEditing] = useState(false);
    const [localTex, setLocalTex] = useState(tex);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Mettre à jour le tex local si l'attribut change
    useEffect(() => {
        setLocalTex(tex);
    }, [tex]);

    // Focus l'input quand on passe en mode édition
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            setIsEditing(false);
            updateAttributes({ tex: localTex });
        }
        if (e.key === 'Escape') {
            setLocalTex(tex);
            setIsEditing(false);
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        updateAttributes({ tex: localTex });
    };

    let renderedHtml = '';
    try {
        renderedHtml = katex.renderToString(localTex || '?', {
            throwOnError: false,
            displayMode: !inline,
        });
    } catch (e) {
        renderedHtml = `<span class="text-red-500 underline">${localTex || '?'}</span>`;
    }

    return (
        <NodeViewWrapper
            className={`math-node-wrapper ${inline ? 'inline-block' : 'block my-6'} ${selected ? 'ProseMirror-selectednode' : ''}`}
            as={inline ? 'span' : 'div'}
        >
            <div
                ref={containerRef}
                className={`relative group transition-all rounded-lg overflow-hidden ${!inline ? 'bg-slate-50/50 border border-transparent hover:border-slate-200 p-4' : ''
                    }`}
            >
                {isEditing ? (
                    <div className={`${inline ? 'inline-flex' : 'flex'} flex-col gap-2 w-full`}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={localTex}
                            onChange={(e) => setLocalTex(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleBlur}
                            className={`
                                font-mono text-sm p-2 rounded border border-[#99334C] outline-none bg-white
                                ${inline ? 'min-w-[100px] inline-block' : 'w-full block'}
                            `}
                            placeholder="Entrez votre formule LaTeX..."
                        />
                        <div
                            className={`opacity-50 pointer-events-none scale-75 origin-left ${!inline ? 'text-center' : ''}`}
                            dangerouslySetInnerHTML={{ __html: renderedHtml }}
                        />
                    </div>
                ) : (
                    <div
                        onClick={() => setIsEditing(true)}
                        className={`cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 ${!inline ? 'flex justify-center py-2' : 'inline-block px-1'
                            }`}
                        title="Cliquez pour modifier la formule"
                    >
                        <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />

                        {/* Overlay "Edit" discret au hover en mode block */}
                        {!inline && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-bold text-[#99334C] bg-[#99334C10] px-1.5 py-0.5 rounded uppercase">
                                    Éditer
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
};
