/**
 * Tests — TiptapEditor / couche temps réel
 *
 * Sections :
 *  1. Extensions montées selon hasYDoc / hasValidCollaboration
 *  2. Prop content : undefined si Yjs drive, HTML sinon
 *  3. setContent non écrasé quand collaboration active
 *  4. Callbacks et readOnly
 *  5. Deps useEditor et re-init quand yDoc arrive
 *
 * Stratégie de mock :
 *  - useEditor intercepté → on capture les options (extensions, content, deps)
 *    et on retourne un faux éditeur contrôlable
 *  - Chaque extension retourne { _mockName, _opts } → assertions claires
 *  - Tous les blocs custom mockés → on évite leurs imports CSS / React-NodeView
 *
 * Lancer : npm test -- __tests__/editor/TiptapEditor.collab.test.tsx
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import * as Y from 'yjs';

// ─── CSS silencés ─────────────────────────────────────────────────────────────
vi.mock('katex/dist/katex.min.css', () => ({}));
vi.mock('@/styles/socratic-highlights.css', () => ({}));

// ─── État partagé — accessible dans les factories vi.mock (vi.hoisted) ────────

const captured = vi.hoisted(() => ({
    lastOptions: null as null | {
        extensions: any[];
        content:    any;
        editable:   boolean;
        deps:       any[];
        onCreate?:  (arg: { editor: any }) => void;
        onUpdate?:  (arg: { editor: any }) => void;
    },
}));

const mockEditor = vi.hoisted(() => ({
    getHTML:     vi.fn(() => '<p></p>'),
    commands:    { setContent: vi.fn() },
    chain:       vi.fn(() => ({
        setFontFamily: vi.fn().mockReturnThis(),
        setFontSize:   vi.fn().mockReturnThis(),
        run:           vi.fn(),
    })),
    setEditable: vi.fn(),
    isFocused:   false,
    isDestroyed: false,
    state:       { selection: { empty: true } },
    destroy:     vi.fn(),
}));

// ─── @tiptap/react ────────────────────────────────────────────────────────────

vi.mock('@tiptap/react', () => ({
    useEditor: vi.fn((options: any, deps?: any[]) => {
        captured.lastOptions = {
            extensions: options?.extensions ?? [],
            content:    options?.content,
            editable:   options?.editable ?? true,
            deps:       deps ?? [],
            onCreate:   options?.onCreate,
            onUpdate:   options?.onUpdate,
        };
        // Simule l'appel onCreate (= éditeur prêt) de manière synchrone
        options?.onCreate?.({ editor: mockEditor });
        return mockEditor;
    }),
    // Composant factice — rend null, évite tout import DOM réel
    EditorContent: () => null,
    // Extension.create utilisé à scope module pour FontSize — retourne un objet nommé
    Extension: {
        create: (config: any) => ({
            name: config?.name ?? 'extension',
            ...config,
        }),
    },
}));

// ─── StarterKit ───────────────────────────────────────────────────────────────

vi.mock('@tiptap/starter-kit', () => ({
    default: {
        configure: (opts: any) => ({ _mockName: 'starterKit', _opts: opts }),
    },
}));

// ─── Collaboration & CollaborationCursor ──────────────────────────────────────

vi.mock('@tiptap/extension-collaboration', () => ({
    default: {
        configure: (opts: any) => ({ _mockName: 'collaboration', _opts: opts }),
    },
}));

vi.mock('@tiptap/extension-collaboration-cursor', () => ({
    default: {
        configure: (opts: any) => ({ _mockName: 'collaborationCursor', _opts: opts }),
    },
}));

// ─── Autres extensions tiptap (passthrough minimal) ──────────────────────────

vi.mock('@tiptap/extension-placeholder', () => ({
    default: { configure: (o: any) => ({ _mockName: 'placeholder',  _opts: o }) },
}));
vi.mock('@tiptap/extension-text-align', () => ({
    // TextAlign est un export nommé (pas default) dans ce package
    TextAlign: { configure: (o: any) => ({ _mockName: 'textAlign', _opts: o }) },
}));
vi.mock('@tiptap/extension-highlight', () => ({
    default: { configure: (o: any) => ({ _mockName: 'highlight', _opts: o }) },
}));
vi.mock('@tiptap/extension-image', () => ({
    // Image.extend({...}).configure({...}) — deux appels chaînés
    default: {
        extend: () => ({
            configure: (o: any) => ({ _mockName: 'image', _opts: o }),
        }),
    },
}));
vi.mock('@tiptap/extension-underline',    () => ({ default:     { name: 'underline' } }));
vi.mock('@tiptap/extension-text-style',   () => ({ TextStyle:   { name: 'textStyle' } }));
vi.mock('@tiptap/extension-color',        () => ({ Color:       { name: 'color' } }));
vi.mock('@tiptap/extension-font-family',  () => ({ FontFamily:  { name: 'fontFamily' } }));

// ─── Blocs custom ─────────────────────────────────────────────────────────────
// Mockés pour éviter leurs imports CSS (katex) et ReactNodeViewRenderer

vi.mock('@/components/Editor/Blocks/NoteBlock',              () => ({ NoteBlock:       { name: 'noteBlock' } }));
vi.mock('@/components/Editor/Blocks/CaptureZoneBlock',       () => ({ CaptureZoneBlock:{ name: 'captureZoneBlock' } }));
vi.mock('@/components/Editor/Blocks/MathBlock',              () => ({ MathBlock:       { name: 'mathBlock' } }));
vi.mock('@/components/Editor/Blocks/QuizBlockExtension',     () => ({ QuizBlock:       { name: 'quizBlock' } }));
vi.mock('@/components/Editor/Blocks/DiscoveryHint',          () => ({ DiscoveryHint:   { name: 'discoveryHint' } }));
vi.mock('@/components/Editor/Blocks/CodeRunnerBlockExtension',() => ({ CodeRunnerBlock:{ name: 'codeRunner' } }));
vi.mock('@/components/Editor/Blocks/DiagramBlock',           () => ({ DiagramBlock:    { name: 'diagramBlock' } }));

vi.mock('@/extensions/SocraticExtension', () => ({
    SocraticExtension: {
        configure: (o: any) => ({ _mockName: 'socratic', _opts: o }),
    },
}));
vi.mock('@/extensions/IndentationExtension', () => ({
    IndentationExtension: { name: 'indentation' },
}));

// ─── Import composant (après les mocks) ──────────────────────────────────────

import TiptapEditor from '@/components/Editor/TiptapEditor';
import { useEditor } from '@tiptap/react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ext(name: string) {
    return captured.lastOptions?.extensions.find((e: any) => e._mockName === name);
}

function makeCollabProps(overrides: { yDoc?: Y.Doc; provider?: any } = {}) {
    return {
        provider:   overrides.provider ?? null,
        documentId: 'doc-1',
        username:   'Alice',
        userColor:  '#99334C',
        colors:     ['#99334C'],
        yDoc:       overrides.yDoc,
    };
}

// ─── 1. Extensions montées ────────────────────────────────────────────────────

describe('Extensions montées selon hasYDoc / hasValidCollaboration', () => {
    beforeEach(() => {
        captured.lastOptions = null;
        mockEditor.isFocused = false;
    });

    it('sans yDoc → Collaboration et CollaborationCursor absents', () => {
        render(<TiptapEditor content="" onChange={vi.fn()} />);

        expect(ext('collaboration')).toBeUndefined();
        expect(ext('collaborationCursor')).toBeUndefined();
    });

    it('avec yDoc sans provider → Collaboration présent, CollaborationCursor absent', () => {
        const yDoc = new Y.Doc();
        render(<TiptapEditor content="" onChange={vi.fn()} yDoc={yDoc} />);

        expect(ext('collaboration')).toBeDefined();
        expect(ext('collaborationCursor')).toBeUndefined();

        yDoc.destroy();
    });

    it('avec yDoc ET provider → Collaboration et CollaborationCursor présents', () => {
        const yDoc     = new Y.Doc();
        const provider = { awareness: null } as any;
        render(<TiptapEditor
            content="" onChange={vi.fn()}
            collaboration={makeCollabProps({ yDoc, provider })}
        />);

        expect(ext('collaboration')).toBeDefined();
        expect(ext('collaborationCursor')).toBeDefined();

        yDoc.destroy();
    });

    it('Collaboration.configure reçoit le bon document', () => {
        const yDoc = new Y.Doc();
        render(<TiptapEditor content="" onChange={vi.fn()} yDoc={yDoc} />);

        expect(ext('collaboration')._opts.document).toBe(yDoc);

        yDoc.destroy();
    });

    it('CollaborationCursor.configure reçoit provider et user', () => {
        const yDoc     = new Y.Doc();
        const provider = { awareness: null } as any;
        render(<TiptapEditor
            content="" onChange={vi.fn()}
            collaboration={makeCollabProps({ yDoc, provider })}
        />);

        const cursor = ext('collaborationCursor');
        expect(cursor._opts.provider).toBe(provider);
        expect(cursor._opts.user.name).toBe('Alice');
        expect(cursor._opts.user.color).toBe('#99334C');

        yDoc.destroy();
    });

    it('StarterKit history=false quand hasYDoc (Yjs gère undo)', () => {
        const yDoc = new Y.Doc();
        render(<TiptapEditor content="" onChange={vi.fn()} yDoc={yDoc} />);

        expect(ext('starterKit')._opts.history).toBe(false);

        yDoc.destroy();
    });

    it('StarterKit history actif (objet) quand pas de yDoc', () => {
        render(<TiptapEditor content="" onChange={vi.fn()} />);

        // history n'est pas false → ProseMirror gère l'historique
        expect(ext('starterKit')._opts.history).not.toBe(false);
    });
});

// ─── 2. Prop content ─────────────────────────────────────────────────────────

describe('Prop content passée à useEditor', () => {
    beforeEach(() => { captured.lastOptions = null; });

    it('content=undefined quand yDoc présent (Yjs drive le contenu)', () => {
        const yDoc = new Y.Doc();
        render(<TiptapEditor content="<p>initial</p>" onChange={vi.fn()} yDoc={yDoc} />);

        expect(captured.lastOptions?.content).toBeUndefined();

        yDoc.destroy();
    });

    it('content=HTML quand pas de yDoc (mode non-collaboratif)', () => {
        render(<TiptapEditor content="<p>bonjour</p>" onChange={vi.fn()} />);

        expect(captured.lastOptions?.content).toBe('<p>bonjour</p>');
    });

    it("content='' quand pas de yDoc et content vide", () => {
        render(<TiptapEditor content="" onChange={vi.fn()} />);

        expect(captured.lastOptions?.content).toBe('');
    });
});

// ─── 3. setContent — protection contre l'écrasement du contenu Yjs ───────────

describe('setContent — protection écrasement collaboration', () => {
    beforeEach(() => {
        captured.lastOptions = null;
        mockEditor.isFocused = false;
        mockEditor.commands.setContent.mockClear();
    });

    it('setContent non appelé si collaboration active', async () => {
        const yDoc     = new Y.Doc();
        const provider = { awareness: null } as any;

        render(<TiptapEditor
            content="<p>test</p>"
            onChange={vi.fn()}
            collaboration={makeCollabProps({ yDoc, provider })}
        />);

        // Laisse les effets se flush (inclus queueMicrotask)
        await act(async () => {});

        expect(mockEditor.commands.setContent).not.toHaveBeenCalled();

        yDoc.destroy();
    });

    it('setContent appelé quand content prop change (mode non-collaboratif)', async () => {
        // L'éditeur "contient" déjà '<p>initial</p>'
        mockEditor.getHTML.mockReturnValue('<p>initial</p>');

        const onChange = vi.fn();
        const { rerender } = render(<TiptapEditor content="<p>initial</p>" onChange={onChange} />);

        // Flush l'effet initial
        await act(async () => {});
        mockEditor.commands.setContent.mockClear();

        // On change le contenu de l'extérieur
        rerender(<TiptapEditor content="<p>updated</p>" onChange={onChange} />);
        await act(async () => {});

        expect(mockEditor.commands.setContent).toHaveBeenCalledWith('<p>updated</p>', false);
    });

    it('setContent non appelé si editor.isFocused (utilisateur en train de taper)', async () => {
        mockEditor.getHTML.mockReturnValue('<p>old</p>');
        mockEditor.isFocused = true;

        const { rerender } = render(<TiptapEditor content="<p>old</p>" onChange={vi.fn()} />);
        await act(async () => {});
        mockEditor.commands.setContent.mockClear();

        rerender(<TiptapEditor content="<p>new</p>" onChange={vi.fn()} />);
        await act(async () => {});

        expect(mockEditor.commands.setContent).not.toHaveBeenCalled();

        mockEditor.isFocused = false;
    });
});

// ─── 4. Callbacks et readOnly ─────────────────────────────────────────────────

describe('Callbacks cycle de vie et readOnly', () => {
    beforeEach(() => {
        captured.lastOptions = null;
        mockEditor.setEditable.mockClear();
    });

    it('onReady appelé avec l\'instance éditeur au montage', () => {
        const onReady = vi.fn();
        render(<TiptapEditor content="" onChange={vi.fn()} onReady={onReady} />);

        // onCreate est déclenché dans notre mock useEditor — onReady doit suivre
        expect(onReady).toHaveBeenCalledTimes(1);
        expect(onReady).toHaveBeenCalledWith(mockEditor);
    });

    it('onChange appelé sur onUpdate avec le HTML courant', () => {
        const onChange = vi.fn();
        render(<TiptapEditor content="" onChange={onChange} />);

        mockEditor.getHTML.mockReturnValue('<p>nouveau contenu</p>');

        act(() => {
            // Déclenche manuellement le callback onUpdate capturé
            captured.lastOptions?.onUpdate?.({ editor: mockEditor });
        });

        expect(onChange).toHaveBeenCalledWith('<p>nouveau contenu</p>');
    });

    it('readOnly=true → setEditable(false)', () => {
        render(<TiptapEditor content="" onChange={vi.fn()} readOnly={true} />);

        expect(mockEditor.setEditable).toHaveBeenCalledWith(false);
    });

    it('readOnly passe de false à true → setEditable(false)', () => {
        const { rerender } = render(<TiptapEditor content="" onChange={vi.fn()} readOnly={false} />);
        mockEditor.setEditable.mockClear();

        rerender(<TiptapEditor content="" onChange={vi.fn()} readOnly={true} />);

        expect(mockEditor.setEditable).toHaveBeenCalledWith(false);
    });
});

// ─── 5. Deps useEditor et résolution de effectiveDoc ─────────────────────────

describe('Deps useEditor et effectiveDoc', () => {
    beforeEach(() => { captured.lastOptions = null; });

    it('deps = [false, false, undefined] sans yDoc', () => {
        render(<TiptapEditor content="" onChange={vi.fn()} />);

        expect(captured.lastOptions?.deps).toEqual([false, false, undefined]);
    });

    it('deps = [true, false, yDoc] avec yDoc mais sans provider', () => {
        const yDoc = new Y.Doc();
        render(<TiptapEditor content="" onChange={vi.fn()} yDoc={yDoc} />);

        expect(captured.lastOptions?.deps).toEqual([true, false, yDoc]);

        yDoc.destroy();
    });

    it('deps = [true, true, yDoc] avec yDoc ET provider', () => {
        const yDoc     = new Y.Doc();
        const provider = { awareness: null } as any;
        render(<TiptapEditor
            content="" onChange={vi.fn()}
            collaboration={makeCollabProps({ yDoc, provider })}
        />);

        expect(captured.lastOptions?.deps).toEqual([true, true, yDoc]);

        yDoc.destroy();
    });

    it('effectiveDoc : yDoc prop prioritaire sur collaboration.yDoc', () => {
        const yDoc1 = new Y.Doc(); // prop de haut niveau
        const yDoc2 = new Y.Doc(); // dans collaboration
        render(<TiptapEditor
            content="" onChange={vi.fn()}
            yDoc={yDoc1}
            collaboration={makeCollabProps({ yDoc: yDoc2 })}
        />);

        // Collaboration.configure doit recevoir yDoc1, pas yDoc2
        expect(ext('collaboration')._opts.document).toBe(yDoc1);

        yDoc1.destroy();
        yDoc2.destroy();
    });

    it('effectiveDoc : fallback sur collaboration.provider.document si yDoc absent', () => {
        const providerDoc = new Y.Doc();
        const provider    = { document: providerDoc, awareness: null } as any;
        render(<TiptapEditor
            content="" onChange={vi.fn()}
            collaboration={makeCollabProps({ provider })}
        />);

        expect(ext('collaboration')._opts.document).toBe(providerDoc);

        providerDoc.destroy();
    });

    it('re-render avec yDoc → useEditor rappelé avec hasYDoc=true', () => {
        const mockedUseEditor = vi.mocked(useEditor);
        const onChange        = vi.fn();

        const { rerender } = render(<TiptapEditor content="<p>test</p>" onChange={onChange} />);

        // Vérifie l'état initial
        const callsBefore = mockedUseEditor.mock.calls.length;
        expect(captured.lastOptions?.deps[0]).toBe(false); // hasYDoc=false

        // yDoc arrive (WebSocket connecté → provider passe le yDoc)
        const yDoc = new Y.Doc();
        rerender(<TiptapEditor content="<p>test</p>" onChange={onChange} yDoc={yDoc} />);

        // useEditor a été rappelé au moins une fois de plus
        expect(mockedUseEditor.mock.calls.length).toBeGreaterThan(callsBefore);
        // Les nouvelles options reflètent hasYDoc=true
        expect(captured.lastOptions?.deps[0]).toBe(true);
        expect(captured.lastOptions?.content).toBeUndefined(); // Yjs drive

        yDoc.destroy();
    });
});
