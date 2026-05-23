import { describe, it, expect, vi, beforeEach } from 'vitest';
import { commentService } from '@/services/commentService';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function setCookie(token: string) {
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: token ? `auth_token=${token}` : '',
  });
}

function makeRes(body: unknown, ok = true) {
  return Promise.resolve({ ok, json: vi.fn().mockResolvedValue(body) });
}

beforeEach(() => {
  vi.clearAllMocks();
  setCookie('tok-xyz');
});

describe('commentService.getComments', () => {
  const comments = [
    { comment_id: 'c1', content: 'Super', created_at: '2026-01-01', author_id: 'u1', author: { user_id: 'u1', firstname: 'Jean', lastname: 'Dupont', email: 'j@d.com' } }
  ];

  it('retourne les commentaires', async () => {
    mockFetch.mockReturnValue(makeRes({ data: { comments } }));
    const result = await commentService.getComments('mon-projet');
    expect(result).toEqual(comments);
  });

  it('encode le nom de projet dans l URL', async () => {
    mockFetch.mockReturnValue(makeRes({ data: { comments: [] } }));
    await commentService.getComments('projet test');
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('projet%20test');
    expect(url).toContain('/comments');
  });

  it('inclut Authorization header', async () => {
    mockFetch.mockReturnValue(makeRes({ data: { comments: [] } }));
    await commentService.getComments('p');
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBe('Bearer tok-xyz');
  });

  it('lève "Non authentifié" si pas de token', async () => {
    setCookie('');
    await expect(commentService.getComments('p')).rejects.toThrow('Non authentifié');
  });

  it('lève une erreur si response not ok', async () => {
    mockFetch.mockReturnValue(makeRes({}, false));
    await expect(commentService.getComments('p')).rejects.toThrow('Erreur recup commentaires');
  });
});

describe('commentService.addComment', () => {
  it('retourne le commentaire créé', async () => {
    const comment = { comment_id: 'c2', content: 'Nouveau', created_at: '2026-01-02', author_id: 'u2', author: { user_id: 'u2', firstname: 'A', lastname: 'B', email: 'a@b.com' } };
    mockFetch.mockReturnValue(makeRes({ data: { comment } }));
    const result = await commentService.addComment('mon-projet', 'Nouveau');
    expect(result).toEqual(comment);
  });

  it('envoie POST avec content dans le body', async () => {
    mockFetch.mockReturnValue(makeRes({ data: { comment: {} } }));
    await commentService.addComment('p', 'Hello world');
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ content: 'Hello world' });
  });

  it('lève "Non authentifié" si pas de token', async () => {
    setCookie('');
    await expect(commentService.addComment('p', 'x')).rejects.toThrow('Non authentifié');
  });

  it('lève une erreur si response not ok', async () => {
    mockFetch.mockReturnValue(makeRes({}, false));
    await expect(commentService.addComment('p', 'x')).rejects.toThrow('Erreur ajout commentaire');
  });
});

describe('commentService.deleteComment', () => {
  it('se résout sans valeur si ok', async () => {
    mockFetch.mockReturnValue(makeRes(null));
    await expect(commentService.deleteComment('p', 'c1')).resolves.toBeUndefined();
  });

  it('envoie DELETE /api/projects/:name/comments/:id', async () => {
    mockFetch.mockReturnValue(makeRes(null));
    await commentService.deleteComment('mon-projet', 'cid-99');
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('/comments/cid-99');
    expect(mockFetch.mock.calls[0][1].method).toBe('DELETE');
  });

  it('lève "Non authentifié" si pas de token', async () => {
    setCookie('');
    await expect(commentService.deleteComment('p', 'c1')).rejects.toThrow('Non authentifié');
  });

  it('lève une erreur si response not ok', async () => {
    mockFetch.mockReturnValue(makeRes({}, false));
    await expect(commentService.deleteComment('p', 'c1')).rejects.toThrow('Erreur suppression commentaire');
  });
});
