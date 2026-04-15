/**
 * MindMapWorkspace - Refactored for Drag & Drop + Context Menu + Theme
 */
"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
    X, FileText, BookOpen, Layout, AlignLeft,
    HelpCircle, GitFork, Minimize2, ZoomIn, ZoomOut, RotateCcw,
    Plus, Edit2, Trash2
} from 'lucide-react';
import TiptapEditor from './TiptapEditor';
import EditorToolBar from './EditorToolBar';
import { exerciseService, Exercise } from '@/services/exerciseService';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Notion { notion_id: string; notion_name: string; notion_content: string; notion_number: number; }
interface Para { para_id: string; para_name: string; para_intro?: string | null; para_number: number; notions: Notion[]; }
interface Chapter { chapter_id: string; chapter_title: string; chapter_intro?: string | null; chapter_number: number; paragraphs: Para[]; }
interface Part { part_id: string; part_title: string; part_intro?: string | null; part_number: number; chapters: Chapter[]; }

interface NodeDef {
    id: string;
    label: string;
    type: 'project' | 'part' | 'chapter' | 'paragraph' | 'notion' | 'exercise';
    x: number;
    y: number;
    width: number;
    height: number;
    editContent: string | null;
    editLevel: 'intro' | 'notion' | null;
    granuleId: string;
    hasChildren: boolean;
    isCollapsed: boolean;
    direction: 1 | -1;
    // Context paths
    partTitle?: string;
    chapterTitle?: string;
    paraName?: string;
}

interface EdgeDef { id: string; source: string; target: string; }

// ─── Constants ───────────────────────────────────────────────────────────────

type NodeType = NodeDef['type'];

// We will use classes for theming instead of hardcoded hex, but colors need to be dynamic for borders/text.
// Let's use CSS variables or tailwind class names mapped to a style object.
const NODE_THEME: Record<NodeType, { borderLight: string, borderDark: string, textLight: string, textDark: string, icon: React.ReactNode }> = {
    project:   { borderLight: '#ff8aac', borderDark: '#ff8aac', textLight: '#e11d48', textDark: '#ffb3c6', icon: <GitFork size={14} /> },
    part:      { borderLight: '#93c5fd', borderDark: '#60a5fa', textLight: '#2563eb', textDark: '#93c5fd', icon: <Layout size={14} /> },
    chapter:   { borderLight: '#6ee7b7', borderDark: '#34d399', textLight: '#059669', textDark: '#6ee7b7', icon: <BookOpen size={14} /> },
    paragraph: { borderLight: '#fcd34d', borderDark: '#fbbf24', textLight: '#d97706', textDark: '#fcd34d', icon: <AlignLeft size={14} /> },
    notion:    { borderLight: '#d1d5db', borderDark: '#9ca3af', textLight: '#4b5563', textDark: '#d1d5db', icon: <FileText size={14} /> },
    exercise:  { borderLight: '#c4b5fd', borderDark: '#a78bfa', textLight: '#7c3aed', textDark: '#c4b5fd', icon: <HelpCircle size={14} /> },
};

const NODE_W = 160;
const NODE_H = 50;
const H_GAP = 90;
const V_GAP = 20;

// ─── Engine ──────────────────────────────────────────────────────────────────

function buildTreeRadial(
    projectName: string,
    projectId: string,
    parts: Part[],
    exercises: Exercise[],
    collapsedNodes: Set<string>
): { nodes: NodeDef[]; edges: EdgeDef[] } {
    const nodes: NodeDef[] = [];
    const edges: EdgeDef[] = [];

    const getEx = (id: string, type: 'part'|'chapter'|'paragraph'|'notion') => exercises.filter(e => {
        if (type === 'part') return e.part_id === id && !e.chapter_id && !e.para_id && !e.notion_id;
        if (type === 'chapter') return e.chapter_id === id && !e.para_id && !e.notion_id;
        if (type === 'paragraph') return e.para_id === id && !e.notion_id;
        if (type === 'notion') return e.notion_id === id;
        return false;
    });

    const rightParts = parts.filter((_, i) => i % 2 === 0);
    const leftParts = parts.filter((_, i) => i % 2 !== 0);

    const projectNodeId = `project-${projectId}`;

    function traverse(
        item: any,
        type: NodeType,
        id: string,
        label: string,
        content: string | null,
        editLevel: 'intro' | 'notion' | null,
        level: number,
        parentId: string | null,
        direction: 1 | -1,
        yCounterRef: { y: number },
        ctx: { partTitle?: string, chapterTitle?: string, paraName?: string } = {}
    ): number {
        let children: Array<{ item: any; type: NodeType; id: string; label: string; content: string | null; editLevel: 'intro' | 'notion' | null }> = [];
        
        let exs: any[] = [];
        if (type !== 'project' && type !== 'exercise') {
             exs = getEx(id, type as any).map(ex => ({
                item: ex, type: 'exercise', id: `ex-${ex.id}`, label: ex.title, content: null, editLevel: null
            }));
        }

        const nextCtx = { ...ctx };
        if (type === 'part') nextCtx.partTitle = label;
        if (type === 'chapter') nextCtx.chapterTitle = label;
        if (type === 'paragraph') nextCtx.paraName = label;

        if (type === 'part') {
            children = (item.chapters || []).map((c: any) => ({
                item: c, type: 'chapter', id: c.chapter_id, label: c.chapter_title, content: c.chapter_intro || '', editLevel: 'intro'
            })).concat(exs);
        } else if (type === 'chapter') {
            children = (item.paragraphs || []).map((p: any) => ({
                item: p, type: 'paragraph', id: p.para_id, label: p.para_name, content: p.para_intro || '', editLevel: 'intro'
            })).concat(exs);
        } else if (type === 'paragraph') {
            children = (item.notions || []).map((n: any) => ({
                item: n, type: 'notion', id: n.notion_id, label: n.notion_name, content: n.notion_content, editLevel: 'notion'
            })).concat(exs);
        } else if (type === 'notion') {
            children = exs;
        }

        const isCollapsed = collapsedNodes.has(id);
        const hasChildren = children.length > 0;
        const myY = yCounterRef.y;
        let centeredY = myY;

        if (hasChildren && !isCollapsed) {
            const childStartY = yCounterRef.y;
            children.forEach(child => traverse(child.item, child.type, child.id, child.label, child.content, child.editLevel, level + 1, id, direction, yCounterRef, nextCtx));
            const childEndY = yCounterRef.y;
            centeredY = childStartY + (childEndY - childStartY - NODE_H) / 2;
        } else {
            yCounterRef.y += NODE_H + V_GAP;
        }

        nodes.push({
            id, label, type,
            ...nextCtx,
            x: direction * level * (NODE_W + H_GAP),
            y: centeredY,
            width: NODE_W, height: NODE_H,
            editContent: content, editLevel,
            granuleId: type === 'exercise' ? item.id : id,
            hasChildren, isCollapsed, direction
        });

        if (parentId) edges.push({ id: `${parentId}->${id}`, source: parentId, target: id });
        return centeredY;
    }

    let rightY = { y: 0 };
    let leftY = { y: 0 };

    rightParts.forEach(part => traverse(part, 'part', part.part_id, part.part_title, part.part_intro || '', 'intro', 1, projectNodeId, 1, rightY));
    leftParts.forEach(part => traverse(part, 'part', part.part_id, part.part_title, part.part_intro || '', 'intro', 1, projectNodeId, -1, leftY));

    const maxTotalY = Math.max(rightY.y, leftY.y);
    const rightOffset = maxTotalY > 0 ? (maxTotalY - rightY.y) / 2 : 0;
    const leftOffset = maxTotalY > 0 ? (maxTotalY - leftY.y) / 2 : 0;

    nodes.forEach(n => {
        if (n.x > 0) n.y += rightOffset;
        if (n.x < 0) n.y += leftOffset;
    });

    nodes.push({
        id: projectNodeId, label: projectName, type: 'project',
        x: 0, y: maxTotalY > 0 ? (maxTotalY - NODE_H) / 2 : 0,
        width: NODE_W, height: NODE_H,
        editContent: null, editLevel: null,
        granuleId: projectId, hasChildren: parts.length > 0,
        isCollapsed: false, direction: 1
    });

    return { nodes, edges };
}

// ─── Components ──────────────────────────────────────────────────────────────

const MapNode: React.FC<{
    node: NodeDef;
    transform: { x: number; y: number; scale: number };
    onDoubleClick: (node: NodeDef) => void;
    onToggleCollapse: (id: string, e: React.MouseEvent) => void;
    onContextMenu: (e: React.MouseEvent, node: NodeDef) => void;
    onDragStart: (e: React.DragEvent, node: NodeDef) => void;
    onDrop: (e: React.DragEvent, node: NodeDef) => void;
    isDropTarget: boolean;
}> = React.memo(({ node, transform, onDoubleClick, onToggleCollapse, onContextMenu, onDragStart, onDrop, isDropTarget }) => {
    const theme = NODE_THEME[node.type];
    const screenX = node.x * transform.scale + transform.x;
    const screenY = node.y * transform.scale + transform.y;
    const sw = node.width * transform.scale;
    const sh = node.height * transform.scale;
    
    return (
        <div
            draggable={node.type !== 'project'}
            onDragStart={(e) => onDragStart(e, node)}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(e, node); }}
            className={`absolute flex items-center shadow-sm hover:shadow-md transition-shadow overflow-visible rounded-lg 
                bg-white dark:bg-gray-800 ${isDropTarget ? 'ring-4 ring-blue-400 dark:ring-blue-500 scale-105 z-50' : 'z-10'}`}
            onDoubleClick={(e) => { e.stopPropagation(); node.editContent !== null && onDoubleClick(node); }}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(e, node); }}
            style={{
                left: screenX, top: screenY, width: sw, height: sh,
                borderTop: `1px solid ${isDropTarget ? '#60a5fa' : 'currentColor'}`,
                borderRight: `1px solid ${isDropTarget ? '#60a5fa' : 'currentColor'}`,
                borderBottom: `1px solid ${isDropTarget ? '#60a5fa' : 'currentColor'}`,
                borderLeft: `1px solid ${isDropTarget ? '#60a5fa' : 'currentColor'}`, // Minimal solid border, actual thickness comes from strip
                padding: `0 ${10 * transform.scale}px`, gap: 6 * transform.scale,
                cursor: 'grab', userSelect: 'none',
                color: 'currentColor', // Relies on dark/light flow class
                borderColor: 'transparent' // Fallback handled by classes
            }}
            title={node.label}
        >
            {/* Color Strip (Light Mode) */}
            <div className="absolute inset-y-[-1px] left-[-1px] rounded-l-lg dark:hidden" style={{ width: 6, backgroundColor: theme.borderLight }} />
            {/* Color Strip (Dark Mode) */}
            <div className="hidden dark:block absolute inset-y-[-1px] left-[-1px] rounded-l-lg" style={{ width: 6, backgroundColor: theme.borderDark }} />

            <div className="dark:hidden opacity-20 absolute inset-0 pointer-events-none rounded-lg border border-gray-200" />
            <div className="hidden dark:block opacity-20 absolute inset-0 pointer-events-none rounded-lg border border-gray-700" />

            <span className="flex-shrink-0 flex dark:hidden" style={{ transform: `scale(${transform.scale})`, color: theme.textLight }}>
                {theme.icon}
            </span>
            <span className="hidden flex-shrink-0 dark:flex" style={{ transform: `scale(${transform.scale})`, color: theme.textDark }}>
                {theme.icon}
            </span>
            <span className="text-gray-800 dark:text-gray-200 font-semibold truncate flex-1" style={{ fontSize: Math.max(9, 12 * transform.scale) }}>
                {node.label}
            </span>

            {node.hasChildren && node.type !== 'project' && (
                <button
                    onClick={(e) => onToggleCollapse(node.id, e)}
                    className="absolute bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 shadow-sm"
                    style={{
                        [node.direction === -1 ? 'left' : 'right']: -8 * transform.scale,
                        top: '50%', transform: 'translateY(-50%)',
                        width: 16 * transform.scale, height: 16 * transform.scale,
                        fontSize: 12 * transform.scale, lineHeight: 1
                    }}
                >
                    {node.isCollapsed ? '+' : '-'}
                </button>
            )}
        </div>
    );
});
MapNode.displayName = 'MapNode';

// ─── SVG Edges ───────────────────────────────────────────────────────────────

const Edges: React.FC<{
    nodes: NodeDef[];
    edges: EdgeDef[];
    transform: { x: number; y: number; scale: number };
}> = React.memo(({ nodes, edges, transform }) => {
    const nodeMap = useMemo(() => {
        const m: Record<string, NodeDef> = {};
        nodes.forEach(n => (m[n.id] = n));
        return m;
    }, [nodes]);

    const toScreen = (x: number, y: number) => ({
        x: x * transform.scale + transform.x,
        y: y * transform.scale + transform.y,
    });

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
            {edges.map(edge => {
                const src = nodeMap[edge.source];
                const tgt = nodeMap[edge.target];
                if (!src || !tgt) return null;

                const sx = src.type === 'project' ? (tgt.direction === -1 ? src.x : src.x + src.width) : (src.direction === -1 ? src.x : src.x + src.width);
                const tx = tgt.direction === -1 ? tgt.x + tgt.width : tgt.x;
                const s = toScreen(sx, src.y + src.height / 2);
                const t = toScreen(tx, tgt.y + tgt.height / 2);
                const cx = (s.x + t.x) / 2;

                return (
                    <path
                        key={edge.id}
                        d={`M ${s.x} ${s.y} C ${cx} ${s.y}, ${cx} ${t.y}, ${t.x} ${t.y}`}
                        fill="none"
                        className="stroke-gray-300 dark:stroke-gray-700"
                        strokeWidth={Math.max(1, 1.5 * transform.scale)}
                    />
                );
            })}
        </svg>
    );
});
Edges.displayName = 'Edges';

// ─── Context Menu ────────────────────────────────────────────────────────────

const ContextMenu: React.FC<{
    x: number; y: number;
    node: NodeDef;
    onClose: () => void;
    onAction: (action: string, type: string, id: string, label: string) => void;
}> = ({ x, y, node, onClose, onAction }) => {
    useEffect(() => {
        const h = () => onClose();
        window.addEventListener('click', h);
        return () => window.removeEventListener('click', h);
    }, [onClose]);

    const actions = [];
    if (node.type === 'project') actions.push({ label: 'Ajouter une Partie', icon: <Plus size={14}/>, id: 'addPart' });
    if (node.type === 'part') actions.push({ label: 'Ajouter un Chapitre', icon: <Plus size={14}/>, id: 'addChapter' });
    if (node.type === 'chapter') actions.push({ label: 'Ajouter un Paragraphe', icon: <Plus size={14}/>, id: 'addParagraph' });
    if (node.type === 'paragraph') actions.push({ label: 'Ajouter une Notion', icon: <Plus size={14}/>, id: 'addNotion' });
    
    if (node.type !== 'project' && node.type !== 'exercise') {
        actions.push({ label: 'Renommer', icon: <Edit2 size={14}/>, id: 'rename' });
        actions.push({ label: 'Supprimer', icon: <Trash2 size={14} color="#ef4444"/>, id: 'delete', danger: true });
    }

    if (actions.length === 0) return null;

    return (
        <div style={{ left: x, top: y }} className="fixed z-[9999] w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 overflow-hidden" onClick={e => e.stopPropagation()}>
            {actions.map(a => (
                <button key={a.id} onClick={() => { onAction(a.id, node.type, node.granuleId, node.label); onClose(); }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${a.danger ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>
                    {a.icon} {a.label}
                </button>
            ))}
        </div>
    );
};


// ─── Main Component ──────────────────────────────────────────────────────────

export interface MindMapWorkspaceProps {
    projectName: string;
    projectId: string;
    parts: any[];
    onClose: () => void;
    onSaveContent: (granuleId: string, html: string) => void;
    
    // CRUD propagation
    onUpdateContext: (type: string, id: string) => void;
    onCreatePart: (partTitle?: string) => void;
    onCreateChapter: (partTitle: string) => void;
    onCreateParagraph: (partTitle: string, chapterTitle: string) => void;
    onCreateNotion: (partTitle: string, chapterTitle: string, paraName: string) => void;
    onRename: (type: string, id: string, name: string) => void;
    onDelete: (type: string, id: string, title: string) => void;
    onMove: (type: string, sourceId: string, targetId: string) => void;
}

export const MindMapWorkspace: React.FC<MindMapWorkspaceProps> = ({
    projectName, projectId, parts, onClose, onSaveContent,
    onUpdateContext, onCreatePart, onCreateChapter, onCreateParagraph, onCreateNotion, onRename, onDelete, onMove
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState({ x: 0, y: 100, scale: 0.9 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0, tx: 0, ty: 0 });
    const [editingNode, setEditingNode] = useState<NodeDef | null>(null);
    const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
    
    // Context Menu
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, node: NodeDef } | null>(null);

    // D&D Internal reparenting
    const [draggedNode, setDraggedNode] = useState<NodeDef | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);

    // TipTap Editor Ref for Toolbar
    const [tiptapEditor, setTiptapEditor] = useState<any>(null);
    const [textFormat, setTextFormat] = useState({ font: 'Inter', fontSize: '12', color: '#000000' });
    
    // Initialize center X
    useEffect(() => {
        if (containerRef.current) {
            setTransform(t => ({ ...t, x: containerRef.current!.clientWidth / 2 - NODE_W / 2 }));
        }
    }, []);

    const [exercises, setExercises] = useState<Exercise[]>([]);
    useEffect(() => {
        if (projectId) exerciseService.getExercises({ project_id: projectId }).then(setExercises).catch(console.error);
    }, [projectId, parts]); // re-fetch if structure changes essentially

    const { nodes, edges } = useMemo(() => buildTreeRadial(projectName, projectId, parts, exercises, collapsedNodes), [projectName, projectId, parts, exercises, collapsedNodes]);

    // Events
    const onWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        setTransform(t => ({ ...t, scale: Math.max(0.3, Math.min(2.5, t.scale - e.deltaY * 0.001)) }));
    }, []);

    const handleAction = useCallback((action: string, type: string, id: string, label: string, nodeCtx?: { partTitle?: string, chapterTitle?: string, paraName?: string }) => {
        onUpdateContext(type, id);
        setTimeout(() => {
            if (action === 'addPart') onCreatePart();
            if (action === 'addChapter') onCreateChapter(nodeCtx?.partTitle || label);
            if (action === 'addParagraph') onCreateParagraph(nodeCtx?.partTitle || '', nodeCtx?.chapterTitle || label);
            if (action === 'addNotion') onCreateNotion(nodeCtx?.partTitle || '', nodeCtx?.chapterTitle || '', nodeCtx?.paraName || label);
            if (action === 'rename') onRename(type, id, label);
            if (action === 'delete') onDelete(type, id, label);
        }, 50);
    }, [onUpdateContext, onCreatePart, onCreateChapter, onCreateParagraph, onCreateNotion, onRename, onDelete]);

    return (
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden text-gray-800 dark:text-gray-100 outline-none" tabIndex={0}>
            
            {/* Viewport */}
            <div ref={containerRef} className={`flex-1 relative cursor-${isPanning ? 'grabbing' : 'grab'}`} 
                onMouseDown={(e) => { if ((e.target as HTMLElement).closest('[draggable]')) return; setIsPanning(true); setPanStart({ x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y }); }}
                onMouseMove={(e) => { if (!isPanning) return; setTransform(t => ({ ...t, x: panStart.tx + (e.clientX - panStart.x), y: panStart.ty + (e.clientY - panStart.y) })); }}
                onMouseUp={() => setIsPanning(false)} onMouseLeave={() => setIsPanning(false)} onWheel={onWheel}
                onContextMenu={e => e.preventDefault()}>
                
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <pattern id="mmgrid" width={40 * transform.scale} height={40 * transform.scale} patternUnits="userSpaceOnUse" patternTransform={`translate(${transform.x % (40 * transform.scale)},${transform.y % (40 * transform.scale)})`}>
                        <circle cx={1} cy={1} r={1} fill="currentColor" className="text-gray-300 dark:text-gray-700" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#mmgrid)" />
                </svg>

                <Edges nodes={nodes} edges={edges} transform={transform} />

                {nodes.map(node => (
                    <MapNode key={node.id} node={node} transform={transform} 
                        onDoubleClick={setEditingNode} 
                        onToggleCollapse={(id, e) => { e.stopPropagation(); setCollapsedNodes(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); }}
                        onContextMenu={(e, n) => setContextMenu({ x: e.clientX, y: e.clientY, node: n })}
                        onDragStart={(e, n) => setDraggedNode(n)}
                        onDrop={(e, n) => {
                            if (draggedNode && draggedNode.id !== n.id) {
                                // Reparenting
                                onMove(draggedNode.type, draggedNode.granuleId, n.granuleId);
                            }
                            setDraggedNode(null); setDropTargetId(null);
                        }}
                        isDropTarget={dropTargetId === node.id}
                    />
                ))}
            </div>

            {/* Controls Float */}
            <div className="absolute bottom-6 right-6 flex items-center bg-white dark:bg-gray-800 shadow-lg rounded-full border border-gray-200 dark:border-gray-700 p-1">
                <button onClick={() => setTransform(t => ({ ...t, scale: Math.min(2.5, t.scale * 1.2) }))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400" title="Zoom In"><ZoomIn size={16}/></button>
                <button onClick={() => setTransform(t => ({ ...t, scale: Math.max(0.3, t.scale * 0.8) }))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400" title="Zoom Out"><ZoomOut size={16}/></button>
                <button onClick={() => setTransform({ x: containerRef.current?.clientWidth! / 2 - NODE_W/2, y: 100, scale: 0.9 })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400" title="Reset View"><RotateCcw size={16}/></button>
                <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-red-500 dark:text-red-400 flex items-center gap-1 pr-3 shadow-sm border border-transparent mx-1 bg-red-50 dark:bg-red-900/20"><Minimize2 size={14}/><span className="text-xs font-semibold">Fermer Vue</span></button>
            </div>

            {/* Editing Drawer */}
            {editingNode && (
                <div className="absolute top-0 right-0 bottom-0 w-[540px] bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 z-50 flex flex-col transform transition-transform animate-in slide-in-from-right-8">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-[#99334C] uppercase tracking-wider">{editingNode.type}</span>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate mt-0.5">{editingNode.label}</h3>
                        </div>
                        <button onClick={() => setEditingNode(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto bg-gray-50/50 dark:bg-gray-900/50 flex flex-col relative w-full items-center">
                        {tiptapEditor && (
                            <div className="sticky top-0 z-10 w-full max-w-[500px] mt-4 mb-2 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                <EditorToolBar
                                    onFormatChange={(cmd) => {
                                        if (!tiptapEditor) return;
                                        const chain = tiptapEditor.chain().focus();
                                        if (cmd === 'bold') chain.toggleBold().run();
                                        else if (cmd === 'italic') chain.toggleItalic().run();
                                        else if (cmd === 'underline') chain.toggleUnderline().run();
                                        else if (cmd === 'strike') chain.toggleStrike().run();
                                        else if (cmd === 'left') chain.setTextAlign('left').run();
                                        else if (cmd === 'center') chain.setTextAlign('center').run();
                                        else if (cmd === 'right') chain.setTextAlign('right').run();
                                        else if (cmd === 'justify') chain.setTextAlign('justify').run();
                                        else if (cmd === 'bullet') chain.toggleBulletList().run();
                                        else if (cmd === 'ordered') chain.toggleOrderedList().run();
                                        else if (cmd === 'highlight') chain.toggleHighlight().run();
                                        else if (cmd === 'clear') chain.unsetAllMarks().run();
                                    }}
                                    onFontChange={(e) => setTextFormat(f => ({ ...f, font: e.target.value }))}
                                    onFontSizeChange={(e) => setTextFormat(f => ({ ...f, fontSize: e.target.value }))}
                                    onChatToggle={() => {}}
                                    textFormat={textFormat}
                                />
                            </div>
                        )}
                        <div className="w-full max-w-[500px] border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 p-4 mb-4" style={{ minHeight: '300px' }}>
                            <TiptapEditor 
                               content={editingNode.editContent || ''} 
                               onChange={(v: string) => { editingNode.editContent = v }}
                               onReady={setTiptapEditor}
                               placeholder={`Rédigez le contenu pour ${editingNode.label}...`}
                            />
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2 bg-white dark:bg-gray-900">
                        <button onClick={() => setEditingNode(null)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
                            Annuler
                        </button>
                        <button onClick={() => { onSaveContent(editingNode.granuleId, editingNode.editContent || ''); setEditingNode(null); }} className="px-5 py-2 rounded-lg bg-[#99334C] hover:bg-[#80293f] text-white text-sm font-medium transition-colors shadow-sm">
                            Enregistrer
                        </button>
                    </div>
                </div>
            )}
            
            {contextMenu && (
                <ContextMenu 
                    x={contextMenu.x} 
                    y={contextMenu.y} 
                    node={contextMenu.node} 
                    onClose={() => setContextMenu(null)} 
                    onAction={(a, t, i, l) => handleAction(a, t, i, l, contextMenu.node)} 
                />
            )}
        </div>
    );
};

export default MindMapWorkspace;
