import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { exportService } from '@/services/exportService';

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Patch only the static methods on URL — do NOT replace the URL constructor
// (replacing window.URL breaks jsdom's tough-cookie which calls `new URL(...)`)
const origCreate = (URL as any).createObjectURL;
const origRevoke = (URL as any).revokeObjectURL;

beforeAll(() => {
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    writable: true,
    value: vi.fn(() => 'blob:http://localhost/fake-url'),
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
});

afterAll(() => {
  (URL as any).createObjectURL = origCreate;
  (URL as any).revokeObjectURL = origRevoke;
});

function setCookie(token: string) {
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    writable: true,
    value: token ? `auth_token=${token}` : '',
  });
}

const fakeBlob = new Blob(['pdf-content'], { type: 'application/pdf' });

function makeRes(ok = true, blobData: Blob = fakeBlob, jsonBody: unknown = { message: 'Erreur' }) {
  return Promise.resolve({
    ok,
    blob: vi.fn().mockResolvedValue(blobData),
    json: vi.fn().mockResolvedValue(jsonBody),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setCookie('test-token');
});

describe('exportService.exportProject', () => {
  it('retourne un Blob si ok', async () => {
    mockFetch.mockReturnValue(makeRes(true));
    const result = await exportService.exportProject('mon-cours');
    expect(result).toBeInstanceOf(Blob);
  });

  it('encode le nom de projet et inclut le format dans la query', async () => {
    mockFetch.mockReturnValue(makeRes(true));
    await exportService.exportProject('cours de bio', 'docx');
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('cours%20de%20bio');
    expect(url).toContain('format=docx');
  });

  it('inclut Authorization Bearer', async () => {
    mockFetch.mockReturnValue(makeRes(true));
    await exportService.exportProject('p');
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBe('Bearer test-token');
  });

  it('utilise pdf comme format par défaut', async () => {
    mockFetch.mockReturnValue(makeRes(true));
    await exportService.exportProject('p');
    expect(mockFetch.mock.calls[0][0]).toContain('format=pdf');
  });

  it('lève "Non authentifié" si pas de token', async () => {
    setCookie('');
    await expect(exportService.exportProject('p')).rejects.toThrow('Non authentifié');
  });

  it('lève une erreur si response not ok', async () => {
    mockFetch.mockReturnValue(makeRes(false, fakeBlob, { message: 'Accès refusé' }));
    await expect(exportService.exportProject('p')).rejects.toThrow('Accès refusé');
  });
});

describe('exportService.downloadFile', () => {
  it('crée un lien et déclenche le téléchargement', async () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((el: Node) => el);
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((el: Node) => el);
    const clickMock = vi.fn();
    const fakeAnchor = { href: '', download: '', click: clickMock } as any;
    vi.spyOn(document, 'createElement').mockReturnValue(fakeAnchor);

    await exportService.downloadFile(fakeBlob, 'rapport.pdf');

    expect(URL.createObjectURL).toHaveBeenCalledWith(fakeBlob);
    expect(clickMock).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();

    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });
});

describe('exportService.exportAndDownload', () => {
  it('enchaîne export + download', async () => {
    mockFetch.mockReturnValue(makeRes(true));
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((el: Node) => el);
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((el: Node) => el);
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() } as any);

    await expect(exportService.exportAndDownload('mon cours', 'pdf')).resolves.toBeUndefined();
    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('lève une erreur si export échoue', async () => {
    setCookie('');
    await expect(exportService.exportAndDownload('p')).rejects.toThrow('Non authentifié');
  });
});
