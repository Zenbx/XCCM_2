import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onboardingService } from '@/services/onboardingService';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function makeRes(body: unknown, ok = true) {
  return Promise.resolve({ ok, json: vi.fn().mockResolvedValue(body) });
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('onboardingService — Flow API', () => {
  it('hasSeenFlow retourne false pour un flow inconnu', () => {
    expect(onboardingService.hasSeenFlow('welcome')).toBe(false);
  });

  it('markFlowSeen marque le flow comme vu', () => {
    onboardingService.markFlowSeen('welcome');
    expect(onboardingService.hasSeenFlow('welcome')).toBe(true);
  });

  it('hasSeenFlow retourne false après resetFlow', () => {
    onboardingService.markFlowSeen('welcome');
    onboardingService.resetFlow('welcome');
    expect(onboardingService.hasSeenFlow('welcome')).toBe(false);
  });

  it('hasSeenFlow retourne false après resetAllFlows', () => {
    onboardingService.markFlowSeen('a');
    onboardingService.markFlowSeen('b');
    onboardingService.resetAllFlows();
    expect(onboardingService.hasSeenFlow('a')).toBe(false);
    expect(onboardingService.hasSeenFlow('b')).toBe(false);
  });

  it('persist flow state in localStorage', () => {
    onboardingService.markFlowSeen('tutorial');
    const raw = localStorage.getItem('xccm2_onboarding');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toMatchObject({ tutorial: true });
  });
});

describe('onboardingService — Discovery API', () => {
  it('hasDiscovered retourne false pour feature inconnue', () => {
    expect(onboardingService.hasDiscovered('ai-panel')).toBe(false);
  });

  it('markDiscovered marque la feature comme découverte', () => {
    onboardingService.markDiscovered('ai-panel');
    expect(onboardingService.hasDiscovered('ai-panel')).toBe(true);
  });

  it('resetDiscovery supprime la feature', () => {
    onboardingService.markDiscovered('ai-panel');
    onboardingService.resetDiscovery('ai-panel');
    expect(onboardingService.hasDiscovered('ai-panel')).toBe(false);
  });

  it('resetAllDiscoveries vide toutes les découvertes', () => {
    onboardingService.markDiscovered('x');
    onboardingService.markDiscovered('y');
    onboardingService.resetAllDiscoveries();
    expect(onboardingService.hasDiscovered('x')).toBe(false);
    expect(onboardingService.hasDiscovered('y')).toBe(false);
  });
});

describe('onboardingService.loadFromServer', () => {
  it('fusionne state serveur avec local (serveur prioritaire)', async () => {
    onboardingService.markFlowSeen('local-only');
    const serverState = {
      flows: { 'welcome': true, 'local-only': true },
      discoveries: { 'feature-x': true }
    };
    mockFetch.mockReturnValue(makeRes({ data: { settings: { onboarding_state: serverState } } }));
    await onboardingService.loadFromServer('token-xyz');
    expect(onboardingService.hasSeenFlow('welcome')).toBe(true);
    expect(onboardingService.hasSeenFlow('local-only')).toBe(true);
    expect(onboardingService.hasDiscovered('feature-x')).toBe(true);
  });

  it('ne lève pas d erreur si response not ok', async () => {
    mockFetch.mockReturnValue(makeRes({}, false));
    await expect(onboardingService.loadFromServer('tok')).resolves.toBeUndefined();
  });

  it('ne lève pas d erreur si serverState absent', async () => {
    mockFetch.mockReturnValue(makeRes({ data: { settings: {} } }));
    await expect(onboardingService.loadFromServer('tok')).resolves.toBeUndefined();
  });

  it('ne lève pas d erreur si fetch échoue', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    await expect(onboardingService.loadFromServer('tok')).resolves.toBeUndefined();
  });
});

describe('onboardingService.syncToServer', () => {
  it('ne fait rien si pas de token getter enregistré', async () => {
    await onboardingService.syncToServer();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('envoie POST /api/user/settings avec le token', async () => {
    onboardingService.registerAuthTokenGetter(() => 'my-token');
    mockFetch.mockReturnValue(makeRes({}));
    onboardingService.markFlowSeen('test-flow');
    await onboardingService.syncToServer();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/user/settings');
    expect(opts.method).toBe('POST');
    expect(opts.headers['Authorization']).toBe('Bearer my-token');
    const body = JSON.parse(opts.body);
    expect(body.onboarding_state.flows).toMatchObject({ 'test-flow': true });
    // Reset getter
    onboardingService.registerAuthTokenGetter(() => null);
  });

  it('ne lève pas d erreur si fetch échoue', async () => {
    onboardingService.registerAuthTokenGetter(() => 'tok');
    mockFetch.mockRejectedValue(new Error('Network'));
    await expect(onboardingService.syncToServer()).resolves.toBeUndefined();
    onboardingService.registerAuthTokenGetter(() => null);
  });
});
