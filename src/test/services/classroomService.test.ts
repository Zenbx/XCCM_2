import { describe, it, expect, vi, beforeEach } from 'vitest';
import { classroomService } from '@/services/classroomService';

// classroomService uses raw fetch + authService.getAuthToken()
vi.mock('@/services/authService', () => ({
  authService: { getAuthToken: vi.fn().mockReturnValue('tok-abc') },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

function makeRes(body: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('classroomService.getMyClassrooms', () => {
  it('retourne teaching et enrolled normalisés', async () => {
    const teaching = [{ id: 'c1', name: 'Classe A' }];
    const enrolled = [{ id: 'c2', name: 'Classe B', enrolled_at: '2026-01-01' }];
    mockFetch.mockReturnValue(makeRes({ data: { teaching, enrolled } }));
    const result = await classroomService.getMyClassrooms();
    expect(result.teaching).toEqual(teaching);
    expect(result.enrolled).toEqual(enrolled);
  });

  it('retourne tableaux vides si data manquant', async () => {
    mockFetch.mockReturnValue(makeRes({ data: {} }));
    const result = await classroomService.getMyClassrooms();
    expect(result.teaching).toEqual([]);
    expect(result.enrolled).toEqual([]);
  });

  it('retourne tableaux vides si teaching/enrolled non-tableau', async () => {
    mockFetch.mockReturnValue(makeRes({ data: { teaching: null, enrolled: null } }));
    const result = await classroomService.getMyClassrooms();
    expect(result.teaching).toEqual([]);
    expect(result.enrolled).toEqual([]);
  });

  it('lève une erreur si response not ok', async () => {
    mockFetch.mockReturnValue(makeRes({ message: 'Non autorisé' }, false, 401));
    await expect(classroomService.getMyClassrooms()).rejects.toThrow('Non autorisé');
  });

  it('inclut Authorization header', async () => {
    mockFetch.mockReturnValue(makeRes({ data: {} }));
    await classroomService.getMyClassrooms();
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe('Bearer tok-abc');
  });
});

describe('classroomService.createClassroom', () => {
  it('retourne la classe créée', async () => {
    const classroom = { id: 'c3', name: 'Bio', join_code: 'XY9' };
    mockFetch.mockReturnValue(makeRes({ data: { classroom } }));
    const result = await classroomService.createClassroom('Bio', 'Desc');
    expect(result).toEqual(classroom);
  });

  it('envoie POST /api/classrooms avec name+description', async () => {
    mockFetch.mockReturnValue(makeRes({ data: { classroom: {} } }));
    await classroomService.createClassroom('Chimie', 'Lycée');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/classrooms');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ name: 'Chimie', description: 'Lycée' });
  });

  it('lève une erreur si response not ok', async () => {
    mockFetch.mockReturnValue(makeRes({ message: 'Nom déjà pris' }, false, 409));
    await expect(classroomService.createClassroom('Dup')).rejects.toThrow('Nom déjà pris');
  });
});

describe('classroomService.getClassroom', () => {
  it('retourne le détail de la classe', async () => {
    const classroom = { id: 'c1', name: 'A', projects: [], enrollments: [] };
    mockFetch.mockReturnValue(makeRes({ data: { classroom } }));
    const result = await classroomService.getClassroom('c1');
    expect(result).toEqual(classroom);
  });

  it('appelle GET /api/classrooms/:id', async () => {
    mockFetch.mockReturnValue(makeRes({ data: { classroom: {} } }));
    await classroomService.getClassroom('room-99');
    expect(mockFetch.mock.calls[0][0]).toContain('/api/classrooms/room-99');
  });

  it('lève une erreur si not ok', async () => {
    mockFetch.mockReturnValue(makeRes({ message: 'Classe introuvable' }, false, 404));
    await expect(classroomService.getClassroom('bad')).rejects.toThrow('Classe introuvable');
  });
});

describe('classroomService.updateClassroom', () => {
  it('retourne la classe mise à jour', async () => {
    const classroom = { id: 'c1', name: 'Updated' };
    mockFetch.mockReturnValue(makeRes({ data: { classroom } }));
    const result = await classroomService.updateClassroom('c1', { name: 'Updated' });
    expect(result).toEqual(classroom);
  });

  it('envoie PATCH /api/classrooms/:id', async () => {
    mockFetch.mockReturnValue(makeRes({ data: { classroom: {} } }));
    await classroomService.updateClassroom('c1', { description: 'New desc' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/classrooms/c1');
    expect(opts.method).toBe('PATCH');
  });
});

describe('classroomService.deleteClassroom', () => {
  it('se résout sans valeur si ok', async () => {
    mockFetch.mockReturnValue(makeRes(null));
    await expect(classroomService.deleteClassroom('c1')).resolves.toBeUndefined();
  });

  it('lève une erreur si not ok', async () => {
    mockFetch.mockReturnValue(makeRes({ message: 'Interdit' }, false, 403));
    await expect(classroomService.deleteClassroom('c1')).rejects.toThrow('Interdit');
  });
});

describe('classroomService.joinClassroom', () => {
  it('retourne enrollment', async () => {
    const enrollment = { id: 'e1', class_id: 'c1' };
    mockFetch.mockReturnValue(makeRes({ data: { enrollment } }));
    const result = await classroomService.joinClassroom('CODE123');
    expect(result).toEqual(enrollment);
  });

  it('envoie POST /api/enrollments avec join_code', async () => {
    mockFetch.mockReturnValue(makeRes({ data: { enrollment: {} } }));
    await classroomService.joinClassroom('ABC');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/enrollments');
    expect(JSON.parse(opts.body)).toEqual({ join_code: 'ABC' });
  });

  it('lève le premier message d erreur de validation', async () => {
    mockFetch.mockReturnValue(makeRes({ errors: { join_code: ['Code invalide'] } }, false, 422));
    await expect(classroomService.joinClassroom('BAD')).rejects.toThrow('Code invalide');
  });
});

describe('classroomService.assignProject', () => {
  it('retourne le lien créé', async () => {
    const link = { class_id: 'c1', project_id: 'p1' };
    mockFetch.mockReturnValue(makeRes({ data: { link } }));
    const result = await classroomService.assignProject('c1', 'p1');
    expect(result).toEqual(link);
  });
});

describe('classroomService.syncProject', () => {
  it('retourne doc_id et updated_at', async () => {
    const syncData = { doc_id: 'd1', updated_at: '2026-01-01' };
    mockFetch.mockReturnValue(makeRes({ data: syncData }));
    const result = await classroomService.syncProject('c1', 'p1');
    expect(result).toEqual(syncData);
  });
});
