import { describe, it, expect, vi, beforeEach } from 'vitest';
import { publishService } from '@/services/publishService';

// publishService reads auth_token from document.cookie
const mockFetch = vi.fn();
global.fetch = mockFetch;

function setCookie(token: string) {
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: `auth_token=${token}`,
  });
}

function makeRes(body: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setCookie('test-token');
});

describe('publishService.publishProject', () => {
  const doc = { doc_id: 'd1', doc_name: 'Rapport', url_content: 'http://x.com/file.pdf', pages: 3, doc_size: 12000, published_at: '2026-01-01', format: 'pdf' };

  it('retourne le document publié', async () => {
    mockFetch.mockReturnValue(makeRes({ data: { document: doc } }));
    const result = await publishService.publishProject('mon-cours');
    expect(result).toEqual(doc);
  });

  it('encode le nom de projet dans l URL', async () => {
    mockFetch.mockReturnValue(makeRes({ data: { document: doc } }));
    await publishService.publishProject('cours de bio');
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('cours%20de%20bio');
    expect(url).toContain('/publish');
  });

  it('envoie POST avec Authorization Bearer', async () => {
    mockFetch.mockReturnValue(makeRes({ data: { document: doc } }));
    await publishService.publishProject('p');
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.method).toBe('POST');
    expect(opts.headers['Authorization']).toBe('Bearer test-token');
  });

  it('inclut format, doc_name, category, level, tags dans le body', async () => {
    mockFetch.mockReturnValue(makeRes({ data: { document: doc } }));
    await publishService.publishProject('p', 'docx', 'Mon doc', undefined, 'sciences', 'lycee', 'bio,chimie');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.format).toBe('docx');
    expect(body.doc_name).toBe('Mon doc');
    expect(body.category).toBe('sciences');
    expect(body.level).toBe('lycee');
    expect(body.tags).toBe('bio,chimie');
  });

  it('utilise pdf comme format par défaut', async () => {
    mockFetch.mockReturnValue(makeRes({ data: { document: doc } }));
    await publishService.publishProject('p');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.format).toBe('pdf');
  });

  it('lève "Non authentifié" si pas de token dans le cookie', async () => {
    Object.defineProperty(document, 'cookie', { writable: true, value: '' });
    await expect(publishService.publishProject('p')).rejects.toThrow('Non authentifié');
  });

  it('lève une erreur avec message + détails si not ok', async () => {
    mockFetch.mockReturnValue(makeRes({ message: 'Echec', error: 'Quota dépassé' }, false, 429));
    await expect(publishService.publishProject('p')).rejects.toThrow('Echec: Quota dépassé');
  });
});
