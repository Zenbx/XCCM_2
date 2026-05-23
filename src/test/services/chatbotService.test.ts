import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatbotService } from '@/services/chatbotService';

vi.mock('@/services/authService', () => ({
  authService: { getAuthToken: vi.fn() },
}));

import { authService } from '@/services/authService';
const mockGetToken = authService.getAuthToken as ReturnType<typeof vi.fn>;

const mockFetch = vi.fn();
global.fetch = mockFetch;

function makeRes(body: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: vi.fn().mockResolvedValue(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetToken.mockReturnValue('tok-chatbot');
});

describe('chatbotService.rephraseNotion', () => {
  const rephrased = { rephrased_content: '<p>Contenu reformulé</p>' };

  it('retourne le contenu reformulé', async () => {
    mockFetch.mockReturnValue(makeRes({ data: rephrased }));
    const result = await chatbotService.rephraseNotion(
      'projet', 'Partie 1', 'Chapitre 1', 'Para 1', 'Notion A', 'simple'
    );
    expect(result).toEqual(rephrased);
  });

  it('encode tous les segments de l URL', async () => {
    mockFetch.mockReturnValue(makeRes({ data: rephrased }));
    await chatbotService.rephraseNotion(
      'mon projet', 'Partie 1', 'Chapitre 1', 'Para 1', 'Notion A', 'simple'
    );
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('mon%20projet');
    expect(url).toContain('/rephrase');
  });

  it('inclut style et content dans le body avec previewOnly=true', async () => {
    mockFetch.mockReturnValue(makeRes({ data: rephrased }));
    await chatbotService.rephraseNotion('p', 'Pa', 'Ch', 'Pa', 'No', 'formel', '<p>texte</p>');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.style).toBe('formel');
    expect(body.content).toBe('<p>texte</p>');
    expect(body.previewOnly).toBe(true);
  });

  it('envoie Authorization Bearer', async () => {
    mockFetch.mockReturnValue(makeRes({ data: rephrased }));
    await chatbotService.rephraseNotion('p', 'Pa', 'Ch', 'Pa', 'No', 'simple');
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBe('Bearer tok-chatbot');
  });

  it('lève "Non authentifié" si pas de token', async () => {
    mockGetToken.mockReturnValue(null);
    await expect(
      chatbotService.rephraseNotion('p', 'Pa', 'Ch', 'Pa', 'No', 's')
    ).rejects.toThrow('Non authentifié');
  });

  it('lève une erreur si not ok', async () => {
    mockFetch.mockReturnValue(makeRes({ message: 'Notion introuvable' }, false));
    await expect(
      chatbotService.rephraseNotion('p', 'Pa', 'Ch', 'Pa', 'No', 's')
    ).rejects.toThrow('Notion introuvable');
  });
});
