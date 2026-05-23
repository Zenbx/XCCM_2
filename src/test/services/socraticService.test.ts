import { describe, it, expect, vi, beforeEach } from 'vitest';
import { socraticService } from '@/services/socraticService';

vi.mock('@/services/authService', () => ({
  authService: { getAuthToken: vi.fn() },
}));

import { authService } from '@/services/authService';
const mockGetToken = authService.getAuthToken as ReturnType<typeof vi.fn>;

const mockFetch = vi.fn();
global.fetch = mockFetch;

function makeRes(body: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetToken.mockReturnValue('tok-socratic');
});

describe('socraticService.auditContent', () => {
  const auditResult = {
    clarityScore: 85,
    bloomLevel: 'analyse',
    engagementScore: 72,
    suggestions: ['Ajouter des exemples'],
    recommendedBlocks: ['quiz', 'video']
  };

  it('retourne le résultat d audit', async () => {
    mockFetch.mockReturnValue(makeRes({ data: auditResult }));
    const result = await socraticService.auditContent('<p>Contenu</p>');
    expect(result).toEqual(auditResult);
  });

  it('envoie POST /api/ai/audit avec content et Authorization', async () => {
    mockFetch.mockReturnValue(makeRes({ data: auditResult }));
    await socraticService.auditContent('<h1>Titre</h1>');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/ai/audit');
    expect(opts.method).toBe('POST');
    expect(opts.headers['Authorization']).toBe('Bearer tok-socratic');
    expect(JSON.parse(opts.body)).toEqual({ content: '<h1>Titre</h1>' });
  });

  it('lève "Non authentifié" si pas de token', async () => {
    mockGetToken.mockReturnValue(null);
    await expect(socraticService.auditContent('x')).rejects.toThrow('Non authentifié');
  });

  it('lève une erreur avec message JSON si not ok', async () => {
    mockFetch.mockReturnValue(makeRes({ message: 'Quota dépassé' }, false, 429));
    await expect(socraticService.auditContent('x')).rejects.toThrow('Quota dépassé');
  });

  it('lève une erreur HTTP si réponse non-JSON', async () => {
    mockFetch.mockReturnValue(Promise.resolve({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error('Not JSON')),
      text: vi.fn().mockResolvedValue('Internal Server Error text'),
    }));
    await expect(socraticService.auditContent('x')).rejects.toThrow(/Erreur HTTP 500/);
  });
});
