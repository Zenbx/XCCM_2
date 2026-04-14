/**
 * MindMapWorkspace
 * A zero-dependency (no React Flow) interactive mind map for the XCCM2 editor.
 * Features:
 *  - Radial auto-layout (Project in center, Parts left/right)
 *  - Collapsible nodes (expand/collapse children)
 *  - Edit text intros and notions via TipTap drawer
 *  - Fetches exercises and displays them as nodes
 */
"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
    X, FileText, BookOpen, Layout, AlignLeft,
    HelpCircle, GitFork, Minimize2, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import TiptapEditor from './TiptapEditor';
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
}

interface EdgeDef { id: string; source: string; target: string; }

// ─── Constants ───────────────────────────────────────────────────────────────

const NODE_COLORS: Record<NodeDef['type'], { bg: string; border: string; text: string; dot: string }> = {
    project:   { bg: '#99334C',   border: '#7a283d', text: '#ffffff', dot: '#ff8aac' },
    part:      { bg: '#1e40af',   border: '#1e3a8a', text: '#ffffff', dot: '#93c5fd' },
    chapter:   { bg: '#047857',   border: '#065f46', text: '#ffffff', dot: '#6ee7b7' },
    paragraph: { bg: '#92400e',   border: '#78350f', text: '#ffffff', dot: '#fbbf24' },
    notion:    { bg: '#4b5563',   border: '#374151', text: '#ffffff', dot: '#d1d5db' },
    exercise:  { bg: '#6d28d9',   border: '#5b21b6', text: '#ffffff', dot: '#c4b5fd' },
};

const NODE_W = 160;
const NODE_H = 52;
const H_GAP = 80;
const V_GAP = 12;

const ICONS: Record<NodeDef['type'], React.ReactNode> = {
    project:   <GitFork size={14} />,
    part:      <Layout size={14} />,
    chapter:   <BookOpen size={14} />,
    paragraph: <AlignLeft size={14} />,
    notion:    <FileText size={14} />,
    exercise:  <HelpCircle size={14} />,
};

// ─── Radial Layout Engine ───────────────────────────────────────────────────

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

    // Split parts into left and right branches for a radial look
    const rightParts = parts.filter((_, i) => i % 2 === 0);
    const leftParts = parts.filter((_, i) => i % 2 !== 0);

    const projectNodeId = `project-${projectId}`;

    function traverse(
        item: any,
        type: NodeDef['type'],
        id: string,
        label: string,
        content: string | null,
        editLevel: 'intro' | 'notion' | null,
        level: number,
        parentId: string | null,
        direction: 1 | -1,
        yCounterRef: { y: number }
    ): number {
        let children: Array<{ item: any; type: NodeDef['type']; id: string; label: string; content: string | null; editLevel: 'intro' | 'notion' | null }> = [];
        
        let exs: any[] = [];
        if (type !== 'project' && type !== 'exercise') {
             exs = getEx(id, type as any).map(ex => ({
                item: ex, type: 'exercise', id: `ex-${ex.id}`, label: ex.title, content: null, editLevel: null
            }));
        }

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
            children.forEach(child => {
                traverse(child.item, child.type, child.id, child.label, child.content, child.editLevel, level + 1, id, direction, yCounterRef);
            });
            const childEndY = yCounterRef.y;
            centeredY = childStartY + (childEndY - childStartY - NODE_H) / 2;
        } else {
            yCounterRef.y += NODE_H + V_GAP;
        }

        nodes.push({
            id,
            label,
            type,
            x: direction * level * (NODE_W + H_GAP),
            y: centeredY,
            width: NODE_W,
            height: NODE_H,
            editContent: content,
            editLevel,
            granuleId: type === 'exercise' ? item.id : id,
            hasChildren,
            isCollapsed,
            direction
        });

        if (parentId) {
            edges.push({ id: `${parentId}->${id}`, source: parentId, target: id });
        }

        return centeredY;
    }

    let rightY = { y: 0 };
    let leftY = { y: 0 };

    rightParts.forEach(part => traverse(part, 'part', part.part_id, part.part_title, part.part_intro || '', 'intro', 1, projectNodeId, 1, rightY));
    leftParts.forEach(part => traverse(part, 'part', part.part_id, part.part_title, part.part_intro || '', 'intro', 1, projectNodeId, -1, leftY));

    // Calculate bounding box so we can center the root
    const totalRightY = rightY.y;
    const totalLeftY = leftY.y;
    const maxTotalY = Math.max(totalRightY, totalLeftY);

    const rightOffset = maxTotalY > 0 ? (maxTotalY - totalRightY) / 2 : 0;
    const leftOffset = maxTotalY > 0 ? (maxTotalY - totalLeftY) / 2 : 0;

    nodes.forEach(n => {
        if (n.x > 0) n.y += rightOffset;
        if (n.x < 0) n.y += leftOffset;
    });

    const pjY = maxTotalY > 0 ? (maxTotalY - NODE_H) / 2 : 0;

    // Add project root
    nodes.push({
        id: projectNodeId,
        label: projectName,
        type: 'project',
        x: 0,
        y: pjY,
        width: NODE_W,
        height: NODE_H,
        editContent: null,
        editLevel: null,
        granuleId: projectId,
        hasChildren: parts.length > 0,
        isCollapsed: false,
        direction: 1
    });

    return { nodes, edges };
}

// ─── Components ──────────────────────────────────────────────────────────────

const MapNode: React.FC<{
    node: NodeDef;
    transform: { x: number; y: number; scale: number };
    onDoubleClick: (node: NodeDef) => void;
    onToggleCollapse: (id: string, e: React.MouseEvent) => void;
}> = React.memo(({ node, transform, onDoubleClick, onToggleCollapse }) => {
    const colors = NODE_COLORS[node.type];
    const screenX = node.x * transform.scale + transform.x;
    const screenY = node.y * transform.scale + transform.y;
    const sw = node.width * transform.scale;
    const sh = node.height * transform.scale;
    const fontSize = Math.max(9, Math.min(13, 11 * transform.scale));
    
    // Position of the collapse button depends on the direction the node is expanding
    const isLeft = node.direction === -1 && node.type !== 'project';
    const btnSize = Math.max(12, 16 * transform.scale);
    const btnOffset = -btnSize / 2;

    return (
        <div
            className="absolute rounded-[10px] flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-[box-shadow_0.15s] overflow-visible"
            onDoubleClick={() => node.editContent !== null && onDoubleClick(node)}
            style={{
                left: screenX,
                top: screenY,
                width: sw,
                height: sh,
                background: colors.bg,
                border: `2px solid ${colors.border}`,
                gap: 6,
                padding: `0 ${10 * transform.scale}px`,
                cursor: node.editContent !== null ? 'pointer' : 'default',
                userSelect: 'none',
            }}
            title={node.editContent !== null ? `Double-cliquer pour éditer "${node.label}"` : node.label}
        >
            <span style={{ color: colors.dot, flexShrink: 0, display: 'flex', transform: `scale(${transform.scale})` }}>
                {ICONS[node.type]}
            </span>
            <span style={{ color: colors.text, fontSize, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {node.label}
            </span>

            {node.hasChildren && node.type !== 'project' && (
                <button
                    onClick={(e) => onToggleCollapse(node.id, e)}
                    style={{
                        position: 'absolute',
                        [isLeft ? 'left' : 'right']: btnOffset,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: btnSize,
                        height: btnSize,
                        borderRadius: btnSize / 2,
                        background: 'white',
                        border: `1px solid ${colors.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        fontSize: btnSize * 0.7,
                        fontWeight: 'bold',
                        color: colors.border,
                        lineHeight: 1
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
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
            {edges.map(edge => {
                const src = nodeMap[edge.source];
                const tgt = nodeMap[edge.target];
                if (!src || !tgt) return null;

                // For project, edges split outwards
                // For other nodes, edges continue in their direction
                let sx, tx;
                if (src.type === 'project') {
                    sx = tgt.direction === -1 ? src.x : src.x + src.width;
                } else {
                    sx = src.direction === -1 ? src.x : src.x + src.width;
                }
                
                tx = tgt.direction === -1 ? tgt.x + tgt.width : tgt.x;
                
                const s = toScreen(sx, src.y + src.height / 2);
                const t = toScreen(tx, tgt.y + tgt.height / 2);
                const cx = (s.x + t.x) / 2;

                return (
                    <path
                        key={edge.id}
                        d={`M ${s.x} ${s.y} C ${cx} ${s.y}, ${cx} ${t.y}, ${t.x} ${t.y}`}
                        fill="none"
                        stroke="#4b5563"
                        strokeWidth={Math.max(1, 1.5 * transform.scale)}
                        strokeOpacity={0.5}
                    />
                );
            })}
        </svg>
    );
});
Edges.displayName = 'Edges';

// ─── Editor Drawer ───────────────────────────────────────────────────────────

const EditDrawer: React.FC<{
    node: NodeDef | null;
    onClose: () => void;
    onSave: (id: string, html: string) => void;
}> = ({ node, onClose, onSave }) => {
    const [content, setContent] = useState(node?.editContent || '');
    useEffect(() => { setContent(node?.editContent || ''); }, [node]);

    if (!node) return null;

    const typeLabel: Record<NodeDef['type'], string> = {
        project: 'Projet', part: 'Partie (Intro)', chapter: 'Chapitre (Intro)',
        paragraph: 'Paragraphe (Intro)', notion: 'Notion (Contenu)', exercise: 'Exercice'
    };

    return (
        <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 540,
            background: 'white', borderLeft: '1px solid #e5e7eb',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', zIndex: 9999,
            display: 'flex', flexDirection: 'column'
        }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#99334C', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                        {typeLabel[node.type]}
                    </p>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {node.label}
                    </h3>
                </div>
                <button onClick={onClose} style={{ padding: 8, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', color: '#6b7280' }}>
                    <X size={16} />
                </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
                <TiptapEditor
                    content={content}
                    onChange={setContent}
                    placeholder={node.editLevel === 'intro' ? 'Rédigez ici le texte introductif...' : 'Rédigez ici le contenu de la notion...'}
                />
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 14, color: '#6b7280' }}>
                    Annuler
                </button>
                <button onClick={() => { onSave(node.granuleId, content); onClose(); }} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#99334C', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                    Sauvegarder
                </button>
            </div>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────

interface MindMapWorkspaceProps {
    projectName: string;
    projectId: string;
    parts: Part[];
    onClose: () => void;
    onSaveContent: (granuleId: string, html: string) => void;
}

export const MindMapWorkspace: React.FC<MindMapWorkspaceProps> = ({
    projectName, projectId, parts, onClose, onSaveContent
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState({ x: typeof window !== 'undefined' ? window.innerWidth / 2 - NODE_W / 2 : 400, y: 100, scale: 0.85 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0, tx: 0, ty: 0 });
    const [editingNode, setEditingNode] = useState<NodeDef | null>(null);
    const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
    
    // Fetch exercises locally
    const [exercises, setExercises] = useState<Exercise[]>([]);
    useEffect(() => {
        if (!projectId) return;
        exerciseService.getExercises({ project_id: projectId }).then(setExercises).catch(console.error);
    }, [projectId]);

    const { nodes, edges } = useMemo(
        () => buildTreeRadial(projectName, projectId, parts, exercises, collapsedNodes),
        [projectName, projectId, parts, exercises, collapsedNodes]
    );

    const toggleCollapse = useCallback((id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setCollapsedNodes(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    // ── Interaction ────────────────────────────────────────────────────────

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('[data-node]')) return;
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y });
    }, [transform]);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isPanning) return;
        setTransform(t => ({ ...t, x: panStart.tx + (e.clientX - panStart.x), y: panStart.ty + (e.clientY - panStart.y) }));
    }, [isPanning, panStart]);

    const onMouseUp = useCallback(() => setIsPanning(false), []);

    const onWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        setTransform(t => ({ ...t, scale: Math.max(0.2, Math.min(2, t.scale + delta * t.scale)) }));
    }, []);

    const zoom = (factor: number) => setTransform(t => ({ ...t, scale: Math.max(0.2, Math.min(2, t.scale * factor)) }));
    const reset = () => setTransform({ x: typeof window !== 'undefined' ? window.innerWidth / 2 - NODE_W / 2 : 400, y: 100, scale: 0.85 });

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#0f172a', zIndex: 5000, display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 52, background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0 }}>
                <GitFork size={18} color="#99334C" />
                <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Vue Mind Map</span>
                <span style={{ color: '#64748b', fontSize: 13, flex: 1 }}>— {projectName}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => zoom(1.2)} style={btnStyle} title="Zoom +"><ZoomIn size={15} /></button>
                    <button onClick={() => zoom(0.8)} style={btnStyle} title="Zoom -"><ZoomOut size={15} /></button>
                    <button onClick={reset} style={btnStyle} title="Réinitialiser"><RotateCcw size={15} /></button>
                </div>
                <button onClick={onClose} style={{ ...btnStyle, background: '#99334C', color: 'white', borderColor: '#7a283d' }} title="Fermer la vue Mind Map">
                    <Minimize2 size={15} />
                    <span style={{ fontSize: 12, marginLeft: 4 }}>Fermer</span>
                </button>
            </div>

            <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '6px 20px', display: 'flex', gap: 16, flexShrink: 0 }}>
                {(Object.entries(NODE_COLORS) as [NodeDef['type'], typeof NODE_COLORS[NodeDef['type']]][]).map(([type, colors]) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: colors.bg }} />
                        <span style={{ color: '#94a3b8', fontSize: 10, textTransform: 'capitalize' }}>{type}</span>
                    </div>
                ))}
                <span style={{ color: '#475569', fontSize: 10, marginLeft: 'auto' }}>Double-clic sur un nœud éditable · Scroll pour zoomer · Glisser pour déplacer</span>
            </div>

            <div ref={containerRef} style={{ flex: 1, overflow: 'hidden', position: 'relative', cursor: isPanning ? 'grabbing' : 'grab' }}
                onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} onWheel={onWheel}>
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <defs>
                        <pattern id="mmgrid" width={40 * transform.scale} height={40 * transform.scale} patternUnits="userSpaceOnUse"
                            patternTransform={`translate(${transform.x % (40 * transform.scale)},${transform.y % (40 * transform.scale)})`}>
                            <circle cx={1} cy={1} r={1} fill="#1e293b" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#mmgrid)" />
                </svg>

                <Edges nodes={nodes} edges={edges} transform={transform} />

                {nodes.map(node => (
                    <div key={node.id} data-node="true" style={{ position: 'absolute', top: 0, left: 0 }}>
                        <MapNode node={node} transform={transform} onDoubleClick={setEditingNode} onToggleCollapse={toggleCollapse} />
                    </div>
                ))}
            </div>

            <div style={{ height: 28, background: '#0f172a', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16 }}>
                <span style={{ color: '#475569', fontSize: 11 }}>{nodes.length} nœuds</span>
                <span style={{ color: '#475569', fontSize: 11 }}>{edges.length} connexions</span>
                <span style={{ color: '#475569', fontSize: 11 }}>Zoom: {Math.round(transform.scale * 100)}%</span>
            </div>

            {editingNode && (
                <EditDrawer node={editingNode} onClose={() => setEditingNode(null)} onSave={onSaveContent} />
            )}
        </div>
    );
};

const btnStyle: React.CSSProperties = {
    padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b',
    color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13
};

export default MindMapWorkspace;
