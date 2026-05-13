"use client";

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Trash2, GitFork, RefreshCw, Code2, Eye } from 'lucide-react';

export const DiagramBlockView: React.FC<NodeViewProps> = ({ node, updateAttributes, deleteNode }) => {
    const { code, theme } = node.attrs;
    const [localCode, setLocalCode] = useState<string>(code);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [svg, setSvg] = useState<string>('');
    const [rendering, setRendering] = useState(false);
    const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`);

    const renderDiagram = useCallback(async (source: string) => {
        setRendering(true);
        setError(null);
        try {
            // Dynamic import to avoid SSR issues
            const mermaid = (await import('mermaid')).default;
            mermaid.initialize({ startOnLoad: false, theme, securityLevel: 'loose' });
            const { svg: rendered } = await mermaid.render(idRef.current, source);
            setSvg(rendered);
        } catch (e: any) {
            setError(e?.message || 'Erreur de syntaxe Mermaid');
            setSvg('');
        } finally {
            setRendering(false);
        }
    }, [theme]);

    // Render on mount and when code attribute changes
    useEffect(() => {
        setLocalCode(code);
        renderDiagram(code);
    }, [code, renderDiagram]);

    const handleApply = () => {
        updateAttributes({ code: localCode });
        setIsEditing(false);
        renderDiagram(localCode);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const el = e.currentTarget;
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const newVal = localCode.substring(0, start) + '    ' + localCode.substring(end);
            setLocalCode(newVal);
            requestAnimationFrame(() => {
                el.selectionStart = el.selectionEnd = start + 4;
            });
        }
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleApply();
        }
        if (e.key === 'Escape') {
            setLocalCode(code);
            setIsEditing(false);
        }
    };

    return (
        <NodeViewWrapper className="diagram-block-wrapper my-6" contentEditable={false}>
            <div className="relative group rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <GitFork size={14} className="text-[#99334C]" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Diagramme Mermaid</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onMouseDown={(e) => { e.preventDefault(); setIsEditing(v => !v); }}
                            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded transition-colors ${isEditing ? 'bg-[#99334C] text-white' : 'text-gray-400 hover:text-[#99334C] hover:bg-[#99334C10]'}`}
                            title={isEditing ? 'Voir le rendu' : 'Modifier le code'}
                        >
                            {isEditing ? <><Eye size={11} /> Aperçu</> : <><Code2 size={11} /> Éditer</>}
                        </button>
                        {isEditing && (
                            <button
                                onMouseDown={(e) => { e.preventDefault(); handleApply(); }}
                                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Appliquer (Ctrl+Enter)"
                            >
                                <RefreshCw size={11} /> Appliquer
                            </button>
                        )}
                        <button
                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); deleteNode(); }}
                            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 hover:bg-red-50 rounded"
                            title="Supprimer le diagramme"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {isEditing ? (
                    <div className="p-3 bg-[#1e1e1e]">
                        <textarea
                            value={localCode}
                            onChange={(e) => setLocalCode(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent text-gray-200 font-mono text-sm outline-none resize-none min-h-[180px] leading-relaxed"
                            spellCheck={false}
                            placeholder="graph TD&#10;    A[Début] --> B[Fin]"
                        />
                        <p className="text-[10px] text-gray-600 mt-1">Ctrl+Enter pour appliquer · Échap pour annuler · Tab pour indenter</p>
                    </div>
                ) : (
                    <div className="p-4 flex justify-center min-h-[100px] items-center">
                        {rendering && (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <RefreshCw size={14} className="animate-spin" /> Rendu en cours...
                            </div>
                        )}
                        {!rendering && error && (
                            <div className="text-red-500 text-xs font-mono bg-red-50 px-3 py-2 rounded w-full">
                                ⚠ {error}
                                <p className="mt-1 text-gray-400 font-sans">Cliquez sur Éditer pour corriger la syntaxe.</p>
                            </div>
                        )}
                        {!rendering && !error && svg && (
                            <div
                                className="w-full overflow-auto"
                                dangerouslySetInnerHTML={{ __html: svg }}
                            />
                        )}
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
};
