import { describe, it, expect, vi, beforeEach } from 'vitest';
import { classroomStreamService } from '@/services/classroomStreamService';

vi.mock('@/lib/apiHelper', () => ({
  authenticatedFetch: vi.fn(),
}));

import { authenticatedFetch } from '@/lib/apiHelper';
const mockFetch = authenticatedFetch as ReturnType<typeof vi.fn>;

function makeRes(body: unknown, ok = true) {
  return { ok, json: vi.fn().mockResolvedValue(body) };
}

beforeEach(() => vi.clearAllMocks());

// ─── Announcements ────────────────────────────────────────────────────────────

describe('classroomStreamService.getAnnouncements', () => {
  it('retourne les annonces', async () => {
    const announcements = [{ id: 'a1', content: 'Bonjour', comments: [] }];
    mockFetch.mockResolvedValue(makeRes({ data: { announcements } }));
    const result = await classroomStreamService.getAnnouncements('c1');
    expect(result).toEqual(announcements);
  });

  it('appelle GET /api/classrooms/:id/announcements', async () => {
    mockFetch.mockResolvedValue(makeRes({ data: { announcements: [] } }));
    await classroomStreamService.getAnnouncements('room-42');
    expect(mockFetch.mock.calls[0][0]).toContain('/api/classrooms/room-42/announcements');
  });

  it('lève une erreur si not ok', async () => {
    mockFetch.mockResolvedValue(makeRes({}, false));
    await expect(classroomStreamService.getAnnouncements('c1')).rejects.toThrow('Erreur récupération annonces');
  });
});

describe('classroomStreamService.postAnnouncement', () => {
  it('retourne l annonce créée', async () => {
    const announcement = { id: 'a2', content: 'Devoir rendu', comments: [] };
    mockFetch.mockResolvedValue(makeRes({ data: { announcement } }));
    const result = await classroomStreamService.postAnnouncement('c1', 'Devoir rendu');
    expect(result).toEqual(announcement);
  });

  it('envoie POST avec content', async () => {
    mockFetch.mockResolvedValue(makeRes({ data: { announcement: {} } }));
    await classroomStreamService.postAnnouncement('c1', 'Hello');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/announcements');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ content: 'Hello' });
  });

  it('lève une erreur si not ok', async () => {
    mockFetch.mockResolvedValue(makeRes({}, false));
    await expect(classroomStreamService.postAnnouncement('c1', 'x')).rejects.toThrow('Erreur publication annonce');
  });
});

describe('classroomStreamService.postComment', () => {
  it('retourne le commentaire créé', async () => {
    const comment = { id: 'cm1', content: 'Merci', created_at: '2026-01-01', author: { user_id: 'u1', firstname: 'A', lastname: 'B' } };
    mockFetch.mockResolvedValue(makeRes({ data: { comment } }));
    const result = await classroomStreamService.postComment('c1', 'a1', 'Merci');
    expect(result).toEqual(comment);
  });

  it('inclut announcementId dans l URL', async () => {
    mockFetch.mockResolvedValue(makeRes({ data: { comment: {} } }));
    await classroomStreamService.postComment('c1', 'ann-99', 'x');
    expect(mockFetch.mock.calls[0][0]).toContain('/announcements/ann-99/comments');
  });

  it('lève une erreur si not ok', async () => {
    mockFetch.mockResolvedValue(makeRes({}, false));
    await expect(classroomStreamService.postComment('c1', 'a1', 'x')).rejects.toThrow('Erreur ajout commentaire');
  });
});

describe('classroomStreamService.deleteComment', () => {
  it('se résout sans valeur si ok', async () => {
    mockFetch.mockResolvedValue(makeRes(null));
    await expect(classroomStreamService.deleteComment('c1', 'a1', 'cm1')).resolves.toBeUndefined();
  });

  it('inclut commentId comme query param', async () => {
    mockFetch.mockResolvedValue(makeRes(null));
    await classroomStreamService.deleteComment('c1', 'a1', 'cid-5');
    expect(mockFetch.mock.calls[0][0]).toContain('?commentId=cid-5');
  });

  it('lève une erreur si not ok', async () => {
    mockFetch.mockResolvedValue(makeRes({}, false));
    await expect(classroomStreamService.deleteComment('c1', 'a1', 'c2')).rejects.toThrow('Erreur suppression commentaire');
  });
});

// ─── Assignments ──────────────────────────────────────────────────────────────

describe('classroomStreamService.getAssignments', () => {
  it('retourne assignments et isTeacher', async () => {
    const data = { assignments: [{ id: 'dv1', title: 'TP 1', type: 'TEXT', _count: { submissions: 3 }, submissions: [] }], isTeacher: true };
    mockFetch.mockResolvedValue(makeRes({ data }));
    const result = await classroomStreamService.getAssignments('c1');
    expect(result).toEqual(data);
  });

  it('lève une erreur si not ok', async () => {
    mockFetch.mockResolvedValue(makeRes({}, false));
    await expect(classroomStreamService.getAssignments('c1')).rejects.toThrow('Erreur récupération devoirs');
  });
});

describe('classroomStreamService.createAssignment', () => {
  it('retourne le devoir créé', async () => {
    const assignment = { id: 'dv2', title: 'Examen', type: 'TEXT', _count: { submissions: 0 }, submissions: [] };
    mockFetch.mockResolvedValue(makeRes({ data: { assignment } }));
    const result = await classroomStreamService.createAssignment('c1', { title: 'Examen', type: 'TEXT' });
    expect(result).toEqual(assignment);
  });

  it('lève une erreur si not ok', async () => {
    mockFetch.mockResolvedValue(makeRes({}, false));
    await expect(classroomStreamService.createAssignment('c1', { title: 'x', type: 'TEXT' })).rejects.toThrow('Erreur création devoir');
  });
});

describe('classroomStreamService.submitAssignment', () => {
  it('retourne la soumission', async () => {
    const submission = { id: 's1', content: 'Ma réponse', submitted_at: '2026-01-01' };
    mockFetch.mockResolvedValue(makeRes({ data: { submission } }));
    const result = await classroomStreamService.submitAssignment('c1', 'dv1', 'Ma réponse');
    expect(result).toEqual(submission);
  });

  it('lève une erreur si not ok', async () => {
    mockFetch.mockResolvedValue(makeRes({}, false));
    await expect(classroomStreamService.submitAssignment('c1', 'dv1', 'x')).rejects.toThrow('Erreur soumission devoir');
  });
});

describe('classroomStreamService.gradeSubmission', () => {
  it('retourne la soumission notée', async () => {
    const submission = { id: 's1', content: 'x', score: 18, feedback: 'Excellent', submitted_at: '2026-01-01' };
    mockFetch.mockResolvedValue(makeRes({ data: { submission } }));
    const result = await classroomStreamService.gradeSubmission('c1', 'dv1', 's1', 18, 'Excellent');
    expect(result).toEqual(submission);
  });

  it('envoie PATCH avec score et feedback', async () => {
    mockFetch.mockResolvedValue(makeRes({ data: { submission: {} } }));
    await classroomStreamService.gradeSubmission('c1', 'dv1', 's1', 15);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.score).toBe(15);
    expect(body.submissionId).toBe('s1');
  });

  it('lève une erreur si not ok', async () => {
    mockFetch.mockResolvedValue(makeRes({}, false));
    await expect(classroomStreamService.gradeSubmission('c1', 'dv1', 's1', 10)).rejects.toThrow('Erreur notation');
  });
});

// ─── Notifications ────────────────────────────────────────────────────────────

describe('classroomStreamService.getNotifications', () => {
  it('retourne notifications et unreadCount', async () => {
    const data = { notifications: [{ id: 'n1', type: 'NEW_ASSIGNMENT', message: 'Nouveau devoir', is_read: false, created_at: '2026-01-01' }], unreadCount: 1 };
    mockFetch.mockResolvedValue(makeRes({ data }));
    const result = await classroomStreamService.getNotifications();
    expect(result).toEqual(data);
  });

  it('lève une erreur si not ok', async () => {
    mockFetch.mockResolvedValue(makeRes({}, false));
    await expect(classroomStreamService.getNotifications()).rejects.toThrow('Erreur récupération notifications');
  });
});

describe('classroomStreamService.markAllRead', () => {
  it('envoie PATCH /api/notifications avec all=true', async () => {
    mockFetch.mockResolvedValue(makeRes({}));
    await classroomStreamService.markAllRead();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/notifications');
    expect(JSON.parse(opts.body)).toEqual({ all: true });
  });
});

describe('classroomStreamService.markRead', () => {
  it('envoie PATCH avec notificationId', async () => {
    mockFetch.mockResolvedValue(makeRes({}));
    await classroomStreamService.markRead('n1');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.notificationId).toBe('n1');
  });
});
