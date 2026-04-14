/**
 * MindMapWorkspace
 * A zero-dependency (no React Flow) interactive mind map for the XCCM2 editor.
 *
 * Features:
 *  - Auto-layouts the full project hierarchy (Project → Parts → Chapters → Paras → Notions + Exercises)
 *  - Click any node to open a Drawer with TipTap editor (intro text or full Notion content)
 *  - Horizontal tree layout with SVG cubic-bezier edges
 *  - Draggable canvas (pan) + mouse-wheel zoom
 *  - Toggle button placed in the parent editor shell
 */
"use client";

import React, {
    useRef, useState, useEffect, useCallback, useMemo
} from 'react';
import {
    X, FileText, BookOpen, Layout, AlignLeft,
    HelpCircle, Code, GitFork, Minimize2, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import TiptapEditor from './TiptapEditor';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Notion { notion_id: string; notion_name: string; notion_content: string; notion_number: number; }
interface Para { para_id: string; para_name: string; para_intro?: string | null; para_number: number; notions: Notion[]; }
interface Chapter { chapter_id: string; chapter_title: string; chapter_intro?: string | null; chapter_number: number; paragraphs: Para[]; }
interface Part { part_id: string; part_title: string; part_intro?: string | null; part_number: number; chapters: Chapter[]; }
interface Exercise { id: string; title: string; type: string; para_id?: string | null; notion_id?: string | null; chapter_id?: string | null; part_id?: string | null; }

interface NodeDef {
    id: string;
    label: string;
    type: 'project' | 'part' | 'chapter' | 'paragraph' | 'notion' | 'exercise';
    x: number;
    y: number;
    width: number;
    height: number;
    editContent: string | null;   // HTML content for the drawer editor (null = no editing)
    editLevel: 'intro' | 'notion' | null;
    granuleId: string;
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
const H_GAP = 80;   // horizontal gap between levels
const V_GAP = 12;   // vertical gap between sibling nodes

const ICONS: Record<NodeDef['type'], React.ReactNode> = {
    project:   <GitFork size={14} />,
    part:      <Layout size={14} />,
    chapter:   <BookOpen size={14} />,
    paragraph: <AlignLeft size={14} />,
    notion:    <FileText size={14} />,
    exercise:  <HelpCircle size={14} />,
};

// ─── Layout Engine ───────────────────────────────────────────────────────────

function buildTree(
    projectName: string,
    projectId: string,
    parts: Part[],
    exercises: Exercise[]
): { nodes: NodeDef[]; edges: EdgeDef[] } {
    const nodes: NodeDef[] = [];
    const edges: EdgeDef[] = [];

    // Helper: get exercises for a granule
    const getEx = (id: string) => exercises.filter(e =>
        e.part_id === id || e.chapter_id === id || e.para_id === id || e.notion_id === id
    );

    let yCounter = 0;

    // Recursive layout: returns the height of the subtree in "units"
    function layoutSubtree(
        items: any[],
        level: number,
        parentId: string | null,
        typeGetter: (item: any) => NodeDef['type'],
        idGetter: (item: any) => string,
        labelGetter: (item: any) => string,
        contentGetter: (item: any) => string | null,
        editLevelGetter: (item: any) => 'intro' | 'notion' | null,
        childrenFactory: (item: any) => void,
    ) {
        items.forEach(item => {
            const id = idGetter(item);
            const startY = yCounter;

            // Reserve my row
            const myY = yCounter;
            yCounter += NODE_H + V_GAP;

            // Recurse into children to get total height
            const childStartY = yCounter;
            childrenFactory(item);
            const childEndY = yCounter;

            // Center me vertically relative to my children
            const childrenHeight = childEndY - childStartY;
            const centeredY = childrenHeight > 0
                ? (childStartY + (childEndY - (NODE_H + V_GAP)) / 2) - (NODE_H / 2)
                : myY;

            // Patch Y back
            const existingNode = nodes.find(n => n.id === id);
            if (existingNode) {
                existingNode.y = centeredY;
            } else {
                nodes.push({
                    id,
                    label: labelGetter(item),
                    type: typeGetter(item),
                    x: level * (NODE_W + H_GAP),
                    y: centeredY,
                    width: NODE_W,
                    height: NODE_H,
                    editContent: contentGetter(item),
                    editLevel: editLevelGetter(item),
                    granuleId: id,
                });
            }

            // Edge to parent
            if (parentId) {
                edges.push({ id: `${parentId}->${id}`, source: parentId, target: id });
            }

            // Exercise nodes for this granule
            getEx(id).forEach(ex => {
                const exId = `ex-${ex.id}`;
                nodes.push({
                    id: exId,
                    label: ex.title,
                    type: 'exercise',
                    x: (level + 1) * (NODE_W + H_GAP),
                    y: yCounter,
                    width: NODE_W,
                    height: NODE_H,
                    editContent: null,
                    editLevel: null,
                    granuleId: ex.id,
                });
                edges.push({ id: `${id}->${exId}`, source: id, target: exId });
                yCounter += NODE_H + V_GAP;
            });
        });
    }

    // Root project node
    const projectNodeId = `project-${projectId}`;
    const projectStartY = yCounter;
    yCounter += NODE_H + V_GAP;

    // Parts
    parts.forEach(part => {
        const partId = part.part_id;
        const partY = yCounter;
        yCounter += NODE_H + V_GAP;

        edges.push({ id: `${projectNodeId}->${partId}`, source: projectNodeId, target: partId });

        // Chapters
        part.chapters.forEach(chapter => {
            const chapId = chapter.chapter_id;
            const chapY = yCounter;
            yCounter += NODE_H + V_GAP;
            edges.push({ id: `${partId}->${chapId}`, source: partId, target: chapId });

            // Paragraphs
            chapter.paragraphs.forEach(para => {
                const paraId = para.para_id;
                const paraY = yCounter;
                yCounter += NODE_H + V_GAP;
                edges.push({ id: `${chapId}->${paraId}`, source: chapId, target: paraId });

                // Notions
                para.notions.forEach(notion => {
                    nodes.push({
                        id: notion.notion_id,
                        label: notion.notion_name,
                        type: 'notion',
                        x: 4 * (NODE_W + H_GAP),
                        y: yCounter,
                        width: NODE_W,
                        height: NODE_H,
                        editContent: notion.notion_content,
                        editLevel: 'notion',
                        granuleId: notion.notion_id,
                    });
                    edges.push({ id: `${paraId}->${notion.notion_id}`, source: paraId, target: notion.notion_id });
                    yCounter += NODE_H + V_GAP;
                });

                // Para exercises
                getEx(paraId).forEach(ex => {
                    const exId = `ex-${ex.id}`;
                    if (!nodes.find(n => n.id === exId)) {
                        nodes.push({ id: exId, label: ex.title, type: 'exercise', x: 5 * (NODE_W + H_GAP), y: yCounter, width: NODE_W, height: NODE_H, editContent: null, editLevel: null, granuleId: ex.id });
                        edges.push({ id: `${paraId}->${exId}`, source: paraId, target: exId });
                        yCounter += NODE_H + V_GAP;
                    }
                });

                nodes.push({ id: paraId, label: para.para_name, type: 'paragraph', x: 3 * (NODE_W + H_GAP), y: paraY, width: NODE_W, height: NODE_H, editContent: para.para_intro ?? null, editLevel: 'intro', granuleId: paraId });
            });

            // Chapter exercises
            getEx(chapId).forEach(ex => {
                const exId = `ex-${ex.id}`;
                if (!nodes.find(n => n.id === exId)) {
                    nodes.push({ id: exId, label: ex.title, type: 'exercise', x: 4 * (NODE_W + H_GAP), y: yCounter, width: NODE_W, height: NODE_H, editContent: null, editLevel: null, granuleId: ex.id });
                    edges.push({ id: `${chapId}->${exId}`, source: chapId, target: exId });
                    yCounter += NODE_H + V_GAP;
                }
            });

            nodes.push({ id: chapId, label: chapter.chapter_title, type: 'chapter', x: 2 * (NODE_W + H_GAP), y: chapY, width: NODE_W, height: NODE_H, editContent: chapter.chapter_intro ?? null, editLevel: 'intro', granuleId: chapId });
        });

        // Part exercises
        getEx(partId).forEach(ex => {
            const exId = `ex-${ex.id}`;
            if (!nodes.find(n => n.id === exId)) {
                nodes.push({ id: exId, label: ex.title, type: 'exercise', x: 3 * (NODE_W + H_GAP), y: yCounter, width: NODE_W, height: NODE_H, editContent: null, editLevel: null, granuleId: ex.id });
                edges.push({ id: `${partId}->${exId}`, source: partId, target: exId });
                yCounter += NODE_H + V_GAP;
            }
        });

        nodes.push({ id: partId, label: part.part_title, type: 'part', x: 1 * (NODE_W + H_GAP), y: partY, width: NODE_W, height: NODE_H, editContent: part.part_intro ?? null, editLevel: 'intro', granuleId: partId });
    });

    // Root
    nodes.unshift({
        id: projectNodeId,
        label: projectName,
        type: 'project',
        x: 0,
        y: projectStartY,
        width: NODE_W,
        height: NODE_H,
        editContent: null,
        editLevel: null,
        granuleId: projectId,
    });

    return { nodes, edges };
}

// ─── Node Component ──────────────────────────────────────────────────────────

const MapNode: React.FC<{
    node: NodeDef;
    transform: { x: number; y: number; scale: number };
    onDoubleClick: (node: NodeDef) => void;
}> = React.memo(({ node, transform, onDoubleClick }) => {
    const colors = NODE_COLORS[node.type];
    const screenX = node.x * transform.scale + transform.x;
    const screenY = node.y * transform.scale + transform.y;
    const sw = node.width * transform.scale;
    const sh = node.height * transform.scale;
    const fontSize = Math.max(9, Math.min(13, 11 * transform.scale));

    return (
        <div
            onDoubleClick={() => node.editContent !== null && onDoubleClick(node)}
            style={{
                position: 'absolute',
                left: screenX,
                top: screenY,
                width: sw,
                height: sh,
                background: colors.bg,
                border: `2px solid ${colors.border}`,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0 10px',
                cursor: node.editContent !== null ? 'pointer' : 'default',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                userSelect: 'none',
                transition: 'box-shadow 0.15s',
                overflow: 'hidden',
            }}
            title={node.editContent !== null ? `Double-cliquer pour éditer "${node.label}"` : node.label}
        >
            <span style={{ color: colors.dot, flexShrink: 0, display: 'flex' }}>{ICONS[node.type]}</span>
            <span style={{ color: colors.text, fontSize, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {node.label}
            </span>
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

    const toScreen = (worldX: number, worldY: number) => ({
        x: worldX * transform.scale + transform.x,
        y: worldY * transform.scale + transform.y,
    });

    return (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
            {edges.map(edge => {
                const src = nodeMap[edge.source];
                const tgt = nodeMap[edge.target];
                if (!src || !tgt) return null;

                const s = toScreen(src.x + src.width, src.y + src.height / 2);
                const t = toScreen(tgt.x, tgt.y + tgt.height / 2);
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
    const [content, setContent] = useState(node?.editContent ?? '');

    useEffect(() => { setContent(node?.editContent ?? ''); }, [node]);

    if (!node) return null;

    const typeLabel: Record<NodeDef['type'], string> = {
        project: 'Projet', part: 'Partie (Intro)', chapter: 'Chapitre (Intro)',
        paragraph: 'Paragraphe (Intro)', notion: 'Notion (Contenu)', exercise: 'Exercice'
    };

    return (
        <div
            style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: 540,
                background: 'white', borderLeft: '1px solid #e5e7eb',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', zIndex: 9999,
                display: 'flex', flexDirection: 'column',
            }}
        >
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#99334C', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                        {typeLabel[node.type]}
                    </p>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {node.label}
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    style={{ padding: 8, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', color: '#6b7280' }}
                >
                    <X size={16} />
                </button>
            </div>

            {/* Editor */}
            <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
                <TiptapEditor
                    content={content}
                    onChange={setContent}
                    placeholder={node.editLevel === 'intro'
                        ? 'Rédigez ici le texte introductif...'
                        : 'Rédigez ici le contenu de la notion...'}
                />
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 14, color: '#6b7280' }}>
                    Annuler
                </button>
                <button
                    onClick={() => { onSave(node.granuleId, content); onClose(); }}
                    style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#99334C', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                >
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
    exercises?: Exercise[];
    onClose: () => void;
    /** Called when the user saves content in the drawer; wire to your save handlers */
    onSaveContent: (granuleId: string, html: string) => void;
}

export const MindMapWorkspace: React.FC<MindMapWorkspaceProps> = ({
    projectName, projectId, parts, exercises = [], onClose, onSaveContent
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState({ x: 60, y: 40, scale: 0.85 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0, tx: 0, ty: 0 });
    const [editingNode, setEditingNode] = useState<NodeDef | null>(null);

    const { nodes, edges } = useMemo(
        () => buildTree(projectName, projectId, parts, exercises),
        [projectName, projectId, parts, exercises]
    );

    // ── Panning ────────────────────────────────────────────────────────────

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('[data-node]')) return;
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y });
    }, [transform]);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isPanning) return;
        setTransform(t => ({
            ...t,
            x: panStart.tx + (e.clientX - panStart.x),
            y: panStart.ty + (e.clientY - panStart.y),
        }));
    }, [isPanning, panStart]);

    const onMouseUp = useCallback(() => setIsPanning(false), []);

    // ── Zoom ───────────────────────────────────────────────────────────────

    const onWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        setTransform(t => ({
            ...t,
            scale: Math.max(0.2, Math.min(2, t.scale + delta * t.scale)),
        }));
    }, []);

    const zoom = (factor: number) => setTransform(t => ({ ...t, scale: Math.max(0.2, Math.min(2, t.scale * factor)) }));
    const reset = () => setTransform({ x: 60, y: 40, scale: 0.85 });

    return (
        <div
            style={{ position: 'fixed', inset: 0, background: '#0f172a', zIndex: 5000, display: 'flex', flexDirection: 'column' }}
        >
            {/* Top Bar */}
            <div style={{ height: 52, background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0 }}>
                <GitFork size={18} color="#99334C" />
                <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Vue Mind Map</span>
                <span style={{ color: '#64748b', fontSize: 13, flex: 1 }}>— {projectName}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => zoom(1.2)} style={btnStyle} title="Zoom +"><ZoomIn size={15} /></button>
                    <button onClick={() => zoom(0.8)} style={btnStyle} title="Zoom -"><ZoomOut size={15} /></button>
                    <button onClick={reset} style={btnStyle} title="Réinitialiser"><RotateCcw size={15} /></button>
                </div>
                <button
                    onClick={onClose}
                    style={{ ...btnStyle, background: '#99334C', color: 'white', borderColor: '#7a283d' }}
                    title="Fermer la vue Mind Map"
                >
                    <Minimize2 size={15} />
                    <span style={{ fontSize: 12, marginLeft: 4 }}>Fermer</span>
                </button>
            </div>

            {/* Legend */}
            <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '6px 20px', display: 'flex', gap: 16, flexShrink: 0 }}>
                {(Object.entries(NODE_COLORS) as [NodeDef['type'], typeof NODE_COLORS[NodeDef['type']]][]).map(([type, colors]) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: colors.bg }} />
                        <span style={{ color: '#94a3b8', fontSize: 10, textTransform: 'capitalize' }}>{type}</span>
                    </div>
                ))}
                <span style={{ color: '#475569', fontSize: 10, marginLeft: 'auto' }}>Double-clic sur un nœud pour éditer · Scroll pour zoomer · Glisser pour déplacer</span>
            </div>

            {/* Canvas */}
            <div
                ref={containerRef}
                style={{ flex: 1, overflow: 'hidden', position: 'relative', cursor: isPanning ? 'grabbing' : 'grab' }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onWheel={onWheel}
            >
                {/* Grid background */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <defs>
                        <pattern id="mmgrid" width={40 * transform.scale} height={40 * transform.scale} patternUnits="userSpaceOnUse"
                            patternTransform={`translate(${transform.x % (40 * transform.scale)},${transform.y % (40 * transform.scale)})`}>
                            <circle cx={1} cy={1} r={1} fill="#1e293b" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#mmgrid)" />
                </svg>

                {/* Edges */}
                <Edges nodes={nodes} edges={edges} transform={transform} />

                {/* Nodes */}
                {nodes.map(node => (
                    <div key={node.id} data-node="true" style={{ position: 'absolute', top: 0, left: 0 }}>
                        <MapNode node={node} transform={transform} onDoubleClick={setEditingNode} />
                    </div>
                ))}
            </div>

            {/* Stats bar */}
            <div style={{ height: 28, background: '#0f172a', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16 }}>
                <span style={{ color: '#475569', fontSize: 11 }}>{nodes.length} nœuds</span>
                <span style={{ color: '#475569', fontSize: 11 }}>{edges.length} connexions</span>
                <span style={{ color: '#475569', fontSize: 11 }}>Zoom: {Math.round(transform.scale * 100)}%</span>
            </div>

            {/* Edit Drawer */}
            {editingNode && (
                <EditDrawer
                    node={editingNode}
                    onClose={() => setEditingNode(null)}
                    onSave={onSaveContent}
                />
            )}
        </div>
    );
};

const btnStyle: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid #334155',
    background: '#1e293b',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
};

export default MindMapWorkspace;
