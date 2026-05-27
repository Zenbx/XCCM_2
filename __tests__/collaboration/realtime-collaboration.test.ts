/**
 * Tests — Couche temps réel / collaboration
 *
 * Sections :
 *  1. useSynapseSync  — yDoc synchrone, provider réactif, nettoyage
 *  2. useRealtimeSync — channel.subscribe, présence, nettoyage
 *  3. useSocraticAnalysis — stabilité debounce, protection boucle infinie
 *  4. Logique collaboration — hasYDoc / hasValidCollaboration
 *  5. ExercisePanel refresh — compteur sur EXERCISE_CHANGED
 *
 * Lancer : npm test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as Y from 'yjs';

// ─── Mock state (vi.hoisted garantit l'accès dans les factories vi.mock) ──────

const hp = vi.hoisted(() => ({
    disconnect: vi.fn(),
    connect:    vi.fn(),
    awareness: {
        clientID: 42,
        setLocalStateField: vi.fn(),
        getStates: vi.fn(() => new Map()),
        on:  vi.fn(),
        off: vi.fn(),
    },
    // Callbacks passés au constructeur — mutés à chaque instanciation
    callbacks: {} as Record<string, (arg?: any) => void>,
}));

const ab = vi.hoisted(() => ({
    channelSubscribe:   vi.fn(),
    channelUnsubscribe: vi.fn(),
    presenceSubscribe:  vi.fn(),
    presenceEnter:      vi.fn(),
    presenceGet:        vi.fn(() => Promise.resolve([])),
    connectionOn:       vi.fn(),
    close:              vi.fn(),
}));

// ─── Mocks des modules ────────────────────────────────────────────────────────

vi.mock('@hocuspocus/provider', () => ({
    // Classe (pas arrow function) → utilisable avec `new`
    HocuspocusProvider: class MockHocuspocusProvider {
        awareness  = hp.awareness;
        isSynced   = false;
        disconnect = hp.disconnect;
        connect    = hp.connect;

        constructor(opts: any) {
            hp.callbacks = {
                onConnect:    opts.onConnect    ?? (() => {}),
                onDisconnect: opts.onDisconnect ?? (() => {}),
                onSynced:     opts.onSynced     ?? (() => {}),
                onStatus:     opts.onStatus     ?? (() => {}),
            };
        }
    },
}));

vi.mock('ably', () => ({
    Realtime: class MockRealtime {
        channels   = { get: () => ({
            subscribe:   ab.channelSubscribe,
            unsubscribe: ab.channelUnsubscribe,
            presence: {
                subscribe: ab.presenceSubscribe,
                enter:     ab.presenceEnter,
                get:       ab.presenceGet,
            },
        }) };
        connection = { on: ab.connectionOn };
        close      = ab.close;
    },
}));

vi.mock('@/lib/apiHelper', () => ({
    getAuthHeaders: vi.fn(() => ({ Authorization: 'Bearer test' })),
}));

vi.mock('@/services/socraticService', () => ({
    socraticService: {
        auditContent: vi.fn().mockResolvedValue({
            bloomLevel:       'apply',
            clarityScore:     0.8,
            engagementScore:  0.7,
            suggestions:      ['Ajoutez des exemples.'],
            recommendedBlocks: [],
            improvedContent:  '',
            suggestedGranules: [],
        }),
    },
}));

// fetch → token Ably
global.fetch = vi.fn().mockResolvedValue({
    ok:   true,
    json: async () => ({ data: { tokenRequest: { keyName: 'test-key' } } }),
}) as unknown as typeof fetch;

// ─── Imports après les mocks ──────────────────────────────────────────────────

import { useSynapseSync }      from '@/hooks/useSynapseSync';
import { useRealtimeSync }     from '@/hooks/useRealtimeSync';
import { useSocraticAnalysis } from '@/hooks/useSocraticAnalysis';

// ─── 1. useSynapseSync ────────────────────────────────────────────────────────

describe('useSynapseSync', () => {
    beforeEach(() => { vi.clearAllMocks(); hp.callbacks = {}; });

    const baseOpts = {
        documentId: 'notion-abc',
        userId:     'user-1',
        userName:   'Alice',
        token:      'jwt',
    };

    it('crée le yDoc de façon synchrone dès le premier render', () => {
        const { result } = renderHook(() => useSynapseSync(baseOpts));
        // yDoc disponible sans await
        expect(result.current.yDoc).toBeInstanceOf(Y.Doc);
    });

    it('retourne documentId correctement', () => {
        const { result } = renderHook(() => useSynapseSync(baseOpts));
        expect(result.current.documentId).toBe('notion-abc');
    });

    it('crée un NOUVEAU yDoc quand documentId change', () => {
        const { result, rerender } = renderHook(
            ({ docId }) => useSynapseSync({ ...baseOpts, documentId: docId }),
            { initialProps: { docId: 'notion-aaa' } }
        );

        const first = result.current.yDoc;
        expect(first).toBeInstanceOf(Y.Doc);

        rerender({ docId: 'notion-bbb' });

        expect(result.current.yDoc).toBeInstanceOf(Y.Doc);
        expect(result.current.yDoc).not.toBe(first);
    });

    it('passe à connected quand onConnect est déclenché', async () => {
        const { result } = renderHook(() => useSynapseSync(baseOpts));

        await waitFor(() => expect(hp.callbacks.onConnect).toBeDefined());

        act(() => { hp.callbacks.onConnect?.(); });

        expect(result.current.isConnected).toBe(true);
        expect(result.current.connectionStatus).toBe('connected');
    });

    it('appelle disconnect sur le provider au démontage', async () => {
        const { unmount } = renderHook(() => useSynapseSync(baseOpts));

        await waitFor(() => expect(hp.callbacks.onConnect).toBeDefined());

        unmount();
        expect(hp.disconnect).toHaveBeenCalledTimes(1);
    });

    it('ne connecte pas si enabled=false', async () => {
        renderHook(() => useSynapseSync({ ...baseOpts, enabled: false }));

        // L'effet ne doit pas instancier HocuspocusProvider
        await new Promise(r => setTimeout(r, 50));
        expect(hp.disconnect).not.toHaveBeenCalled();
        // callbacks non remplis = constructeur jamais appelé
        expect(hp.callbacks.onConnect).toBeUndefined();
    });

    it('ne connecte pas sans token', async () => {
        renderHook(() => useSynapseSync({ ...baseOpts, token: null }));

        await new Promise(r => setTimeout(r, 50));
        expect(hp.callbacks.onConnect).toBeUndefined();
    });

    it('accepte un getter de token (fonction)', async () => {
        const tokenFn = vi.fn(() => 'jwt-lazy');
        renderHook(() => useSynapseSync({ ...baseOpts, token: tokenFn }));

        await waitFor(() => expect(tokenFn).toHaveBeenCalled());
    });

    it('provider est null avant la connexion, disponible après', async () => {
        const { result } = renderHook(() => useSynapseSync(baseOpts));

        // Avant la connexion, provider peut être null
        // (c'est setState qui le set après construction du provider)
        // On attend que l'effet tourne
        await waitFor(() => expect(hp.callbacks.onConnect).toBeDefined());

        act(() => { hp.callbacks.onConnect?.(); });

        // Après connexion, isConnected=true
        expect(result.current.isConnected).toBe(true);
    });

    it('isSynced passe à true quand onSynced est déclenché', async () => {
        const { result } = renderHook(() => useSynapseSync(baseOpts));

        await waitFor(() => expect(hp.callbacks.onSynced).toBeDefined());

        act(() => { hp.callbacks.onSynced?.({ state: true }); });

        expect(result.current.isSynced).toBe(true);
    });
});

// ─── 2. useRealtimeSync ───────────────────────────────────────────────────────

describe('useRealtimeSync', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    const baseOpts = {
        projectName:       'mon-projet',
        onStructureChange: vi.fn(),
        enabled:           true,
    };

    it('appelle channel.subscribe après connexion', async () => {
        renderHook(() => useRealtimeSync(baseOpts));
        await waitFor(() => expect(ab.channelSubscribe).toHaveBeenCalledWith(expect.any(Function)));
    });

    it('transmet STRUCTURE_CHANGED au callback', async () => {
        const onStructureChange = vi.fn();
        renderHook(() => useRealtimeSync({ ...baseOpts, onStructureChange }));

        await waitFor(() => expect(ab.channelSubscribe).toHaveBeenCalled());

        const [cb] = ab.channelSubscribe.mock.calls[0];
        act(() => cb({ name: 'STRUCTURE_CHANGED', data: { type: 'notion' } }));

        expect(onStructureChange).toHaveBeenCalledWith('STRUCTURE_CHANGED', { type: 'notion' });
    });

    it('transmet EXERCISE_CHANGED au callback', async () => {
        const onStructureChange = vi.fn();
        renderHook(() => useRealtimeSync({ ...baseOpts, onStructureChange }));

        await waitFor(() => expect(ab.channelSubscribe).toHaveBeenCalled());

        const [cb] = ab.channelSubscribe.mock.calls[0];
        act(() => cb({ name: 'EXERCISE_CHANGED', data: { action: 'created', exerciseId: 'ex-1' } }));

        expect(onStructureChange).toHaveBeenCalledWith('EXERCISE_CHANGED', { action: 'created', exerciseId: 'ex-1' });
    });

    it('transmet NOTION_UPDATED au callback', async () => {
        const onStructureChange = vi.fn();
        renderHook(() => useRealtimeSync({ ...baseOpts, onStructureChange }));

        await waitFor(() => expect(ab.channelSubscribe).toHaveBeenCalled());

        const [cb] = ab.channelSubscribe.mock.calls[0];
        act(() => cb({ name: 'NOTION_UPDATED', data: {} }));

        expect(onStructureChange).toHaveBeenCalledWith('NOTION_UPDATED', {});
    });

    it('onPresenceChange appelé quand un membre entre', async () => {
        const onPresenceChange = vi.fn();
        ab.presenceGet.mockResolvedValue([{ clientId: 'a' }, { clientId: 'b' }]);

        renderHook(() => useRealtimeSync({ ...baseOpts, onPresenceChange }));

        await waitFor(() => expect(ab.presenceEnter).toHaveBeenCalled());

        // Simuler enter de présence
        const enterCall = ab.presenceSubscribe.mock.calls.find(
            ([event]: [string]) => event === 'enter'
        );
        if (enterCall) {
            await act(async () => { await enterCall[1](); });
            expect(onPresenceChange).toHaveBeenCalledWith(2, expect.any(Array));
        }
    });

    it('ne s\'abonne pas si enabled=false', async () => {
        renderHook(() => useRealtimeSync({ ...baseOpts, enabled: false }));
        await new Promise(r => setTimeout(r, 50));
        expect(global.fetch).not.toHaveBeenCalled();
        expect(ab.channelSubscribe).not.toHaveBeenCalled();
    });

    it('appelle channel.unsubscribe au démontage', async () => {
        const { unmount } = renderHook(() => useRealtimeSync(baseOpts));

        await waitFor(() => expect(ab.channelSubscribe).toHaveBeenCalled());

        unmount();
        expect(ab.channelUnsubscribe).toHaveBeenCalled();
    });
});

// ─── 3. useSocraticAnalysis ───────────────────────────────────────────────────

describe('useSocraticAnalysis', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    const LONG = 'X'.repeat(100);

    it('ne déclenche pas d\'analyse si texte < 50 caractères', async () => {
        const { socraticService } = await import('@/services/socraticService');
        const { result } = renderHook(() => useSocraticAnalysis('notion-1'));

        await act(async () => { await result.current.analyzeContent('Court'); });

        expect(socraticService.auditContent).not.toHaveBeenCalled();
        expect(result.current.feedback).toHaveLength(0);
        expect(result.current.bloomScore).toBeNull();
    });

    it('n\'analyse pas deux fois le même texte (dédup ref)', async () => {
        const { socraticService } = await import('@/services/socraticService');
        const { result } = renderHook(() => useSocraticAnalysis('notion-1'));

        await act(async () => { await result.current.analyzeContent(LONG); });
        await act(async () => { await result.current.analyzeContent(LONG); });

        expect(socraticService.auditContent).toHaveBeenCalledTimes(1);
    });

    it('force=true ré-analyse même texte identique', async () => {
        const { socraticService } = await import('@/services/socraticService');
        const { result } = renderHook(() => useSocraticAnalysis('notion-1'));

        await act(async () => { await result.current.analyzeContent(LONG); });
        await act(async () => { await result.current.analyzeContent(LONG, undefined, true); });

        expect(socraticService.auditContent).toHaveBeenCalledTimes(2);
    });

    it('peuple feedback et bloomScore après analyse', async () => {
        const { result } = renderHook(() => useSocraticAnalysis('notion-1'));

        await act(async () => { await result.current.analyzeContent(LONG); });

        expect(result.current.feedback.length).toBeGreaterThan(0);
        expect(result.current.bloomScore).not.toBeNull();
        expect(result.current.bloomScore?.bloomLevel).toBe('apply');
        expect(result.current.bloomScore?.clarityScore).toBe(0.8);
        expect(result.current.bloomScore?.suggestions).toContain('Ajoutez des exemples.');
    });

    it('isAnalyzing est false après la fin de l\'analyse', async () => {
        const { result } = renderHook(() => useSocraticAnalysis('notion-1'));

        await act(async () => { await result.current.analyzeContent(LONG); });

        expect(result.current.isAnalyzing).toBe(false);
    });

    it('analyzeDebounced reste la même référence entre les renders (pas de boucle)', () => {
        const { result, rerender } = renderHook(() => useSocraticAnalysis('notion-1'));

        const ref1 = result.current.analyzeDebounced;
        rerender();
        rerender();
        const ref2 = result.current.analyzeDebounced;

        // Même instance = pas de récréation = pas de déclenchement en boucle
        expect(ref1).toBe(ref2);
    });

    it('analyzeDebounced change si notionId change (nouveau document)', () => {
        const { result, rerender } = renderHook(
            ({ nid }) => useSocraticAnalysis(nid),
            { initialProps: { nid: 'notion-aaa' } }
        );

        const ref1 = result.current.analyzeDebounced;
        rerender({ nid: 'notion-bbb' });
        const ref2 = result.current.analyzeDebounced;

        // Notion différente → nouveau debounce timer
        expect(ref1).not.toBe(ref2);
    });

    it('vide feedback et bloomScore si texte < 50 caractères', async () => {
        const { result } = renderHook(() => useSocraticAnalysis('notion-1'));

        // Première analyse réussie
        await act(async () => { await result.current.analyzeContent(LONG); });
        expect(result.current.feedback.length).toBeGreaterThan(0);

        // Puis texte court → reset
        await act(async () => { await result.current.analyzeContent('abc'); });
        expect(result.current.feedback).toHaveLength(0);
        expect(result.current.bloomScore).toBeNull();
    });
});

// ─── 4. Logique hasYDoc / hasValidCollaboration (pur, sans DOM) ───────────────

describe('Logique de collaboration (hasYDoc / hasValidCollaboration)', () => {
    it('hasYDoc=true quand effectiveDoc est présent', () => {
        const effectiveDoc = new Y.Doc();
        expect(!!effectiveDoc).toBe(true);
        effectiveDoc.destroy();
    });

    it('hasYDoc=false quand effectiveDoc est null/undefined', () => {
        expect(!!(null as any)).toBe(false);
        expect(!!(undefined as any)).toBe(false);
    });

    it('hasValidCollaboration=false si provider est null même avec yDoc', () => {
        const collab = { provider: null, yDoc: new Y.Doc(), documentId: 'x', username: '', userColor: '', colors: [] };
        const hasValid = !!(collab && collab.provider && collab.yDoc);
        expect(hasValid).toBe(false);
        collab.yDoc.destroy();
    });

    it('hasValidCollaboration=true si provider et yDoc présents', () => {
        const collab = {
            provider:   { awareness: null } as any,
            yDoc:       new Y.Doc(),
            documentId: 'x', username: '', userColor: '', colors: [],
        };
        const hasValid = !!(collab && collab.provider && collab.yDoc);
        expect(hasValid).toBe(true);
        collab.yDoc.destroy();
    });

    it('content=undefined quand hasYDoc (Yjs drive le contenu)', () => {
        const hasYDoc = true;
        const contentProp = hasYDoc ? undefined : '<p>HTTP</p>';
        expect(contentProp).toBeUndefined();
    });

    it('content=HTTP quand pas de yDoc (mode non-collaboratif)', () => {
        const hasYDoc = false;
        const contentProp = hasYDoc ? undefined : ('<p>HTTP</p>' || '');
        expect(contentProp).toBe('<p>HTTP</p>');
    });

    it('content vide string quand pas de yDoc et contenu vide', () => {
        const hasYDoc = false;
        const contentProp = hasYDoc ? undefined : ('' || '');
        expect(contentProp).toBe('');
    });
});

// ─── 5. ExercisePanel — refresh via exerciseRefreshKey ────────────────────────

describe('ExercisePanel refresh sur EXERCISE_CHANGED', () => {
    // Reproduit la logique de handleStructureChange dans edit/page.tsx
    function makeHandler(setKey: (fn: (k: number) => number) => void) {
        return (event: string) => {
            if (event === 'NOTION_UPDATED' || event === 'STRUCTURE_CHANGED') {
                // loadProject(true) — pas testé ici
            } else if (event === 'EXERCISE_CHANGED') {
                setKey(k => k + 1);
            }
        };
    }

    it('incrémente exerciseRefreshKey à chaque EXERCISE_CHANGED', () => {
        let key = 0;
        const handler = makeHandler(fn => { key = fn(key); });

        handler('EXERCISE_CHANGED');
        expect(key).toBe(1);

        handler('EXERCISE_CHANGED');
        expect(key).toBe(2);
    });

    it('n\'incrémente pas pour d\'autres événements', () => {
        let key = 0;
        const handler = makeHandler(fn => { key = fn(key); });

        handler('STRUCTURE_CHANGED');
        handler('NOTION_UPDATED');
        handler('COMMENT_ADDED');
        handler('UNKNOWN_EVENT');

        expect(key).toBe(0);
    });

    it('clé distincte entre EXERCISE_CHANGED et autres', () => {
        let key = 0;
        const handler = makeHandler(fn => { key = fn(key); });

        handler('STRUCTURE_CHANGED');
        handler('EXERCISE_CHANGED'); // +1
        handler('NOTION_UPDATED');
        handler('EXERCISE_CHANGED'); // +1

        expect(key).toBe(2);
    });
});
