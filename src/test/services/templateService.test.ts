import { describe, it, expect, vi, beforeEach } from 'vitest';
import { templateService } from '@/services/templateService';

vi.mock('@/lib/apiHelper', () => ({
  authenticatedFetch: vi.fn(),
}));

import { authenticatedFetch } from '@/lib/apiHelper';
const mockFetch = authenticatedFetch as ReturnType<typeof vi.fn>;

function makeRes(body: unknown, ok = true) {
  return { ok, json: vi.fn().mockResolvedValue(body) };
}

beforeEach(() => vi.clearAllMocks());

describe('templateService.convertProjectToTemplate', () => {
  const data = { template_name: 'Mon template', is_public: true };

  it('retourne la réponse JSON', async () => {
    const resp = { data: { template: { id: 't1' } } };
    mockFetch.mockResolvedValue(makeRes(resp));
    const result = await templateService.convertProjectToTemplate('mon-projet', data);
    expect(result).toEqual(resp);
  });

  it('encode le nom de projet et appelle convert-to-template', async () => {
    mockFetch.mockResolvedValue(makeRes({}));
    await templateService.convertProjectToTemplate('projet test', data);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('projet%20test');
    expect(url).toContain('convert-to-template');
  });

  it('envoie POST avec le body JSON', async () => {
    mockFetch.mockResolvedValue(makeRes({}));
    await templateService.convertProjectToTemplate('p', data);
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual(data);
  });

  it('lève une erreur si not ok', async () => {
    mockFetch.mockResolvedValue(makeRes({ message: 'Projet introuvable' }, false));
    await expect(templateService.convertProjectToTemplate('p', data))
      .rejects.toThrow('Projet introuvable');
  });
});

describe('templateService.getTemplates', () => {
  it('retourne la liste des templates', async () => {
    const templates = [{ id: 't1', name: 'Cours de bio' }];
    mockFetch.mockResolvedValue(makeRes({ data: { templates } }));
    const result = await templateService.getTemplates();
    expect(result).toEqual(templates);
  });

  it('retourne [] si data.templates absent', async () => {
    mockFetch.mockResolvedValue(makeRes({ data: {} }));
    const result = await templateService.getTemplates();
    expect(result).toEqual([]);
  });

  it('retourne [] si fetch échoue (catch silencieux)', async () => {
    mockFetch.mockRejectedValue(new Error('Network'));
    const result = await templateService.getTemplates();
    expect(result).toEqual([]);
  });

  it('retourne [] si response not ok (catch silencieux)', async () => {
    mockFetch.mockResolvedValue(makeRes({}, false));
    const result = await templateService.getTemplates();
    expect(result).toEqual([]);
  });
});
