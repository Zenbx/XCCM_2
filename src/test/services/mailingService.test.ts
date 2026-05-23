import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mailingService } from '@/services/mailingService';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function makeRes(body: unknown, ok = true) {
  return Promise.resolve({ ok, json: vi.fn().mockResolvedValue(body) });
}

beforeEach(() => vi.clearAllMocks());

describe('mailingService.subscribeNewsletter', () => {
  it('retourne la réponse JSON si ok', async () => {
    const resp = { success: true, message: 'Inscrit' };
    mockFetch.mockReturnValue(makeRes(resp));
    const result = await mailingService.subscribeNewsletter('test@mail.com');
    expect(result).toEqual(resp);
  });

  it('envoie POST /api/newsletter/subscribe avec l email', async () => {
    mockFetch.mockReturnValue(makeRes({}));
    await mailingService.subscribeNewsletter('user@example.com');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/newsletter/subscribe');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ email: 'user@example.com' });
  });

  it('lève une erreur si not ok', async () => {
    mockFetch.mockReturnValue(makeRes({ message: 'Email déjà inscrit' }, false));
    await expect(mailingService.subscribeNewsletter('x@y.com')).rejects.toThrow('Email déjà inscrit');
  });

  it('lève une erreur générique si pas de message', async () => {
    mockFetch.mockReturnValue(makeRes({}, false));
    await expect(mailingService.subscribeNewsletter('x@y.com')).rejects.toThrow("Erreur lors de l'abonnement");
  });
});

describe('mailingService.sendContact', () => {
  const contactData = {
    name: 'Jean Dupont',
    email: 'jean@example.com',
    subject: 'Question',
    message: 'Bonjour, comment ça marche?',
  };

  it('retourne la réponse JSON si ok', async () => {
    const resp = { success: true };
    mockFetch.mockReturnValue(makeRes(resp));
    const result = await mailingService.sendContact(contactData);
    expect(result).toEqual(resp);
  });

  it('envoie POST /api/contact avec les données', async () => {
    mockFetch.mockReturnValue(makeRes({}));
    await mailingService.sendContact(contactData);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/contact');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual(contactData);
  });

  it('lève une erreur si not ok', async () => {
    mockFetch.mockReturnValue(makeRes({ message: 'Serveur mail en panne' }, false));
    await expect(mailingService.sendContact(contactData)).rejects.toThrow('Serveur mail en panne');
  });

  it('lève une erreur générique si pas de message', async () => {
    mockFetch.mockReturnValue(makeRes({}, false));
    await expect(mailingService.sendContact(contactData)).rejects.toThrow("Erreur lors de l'envoi");
  });
});
