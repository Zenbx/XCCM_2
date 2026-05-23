import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invitationService } from '@/services/invitationService';

// Most methods use authenticatedFetch; getInvitationByToken uses raw fetch
vi.mock('@/lib/apiHelper', () => ({
  authenticatedFetch: vi.fn(),
}));

import { authenticatedFetch } from '@/lib/apiHelper';

const mockAuthFetch = authenticatedFetch as ReturnType<typeof vi.fn>;
const mockFetch = vi.fn();
global.fetch = mockFetch;

function makeRes(body: unknown, ok = true) {
  return { ok, json: vi.fn().mockResolvedValue(body) };
}
function makeRawRes(body: unknown, ok = true) {
  return Promise.resolve({ ok, json: vi.fn().mockResolvedValue(body) });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('invitationService.sendInvitation', () => {
  it('retourne data de la réponse', async () => {
    const invData = { invitation: { id: 'inv1' } };
    mockAuthFetch.mockResolvedValue(makeRes({ data: invData }));
    const result = await invitationService.sendInvitation('mon-projet', { guestEmail: 'a@b.com' });
    expect(result).toEqual(invData);
  });

  it('encode le nom de projet dans l URL', async () => {
    mockAuthFetch.mockResolvedValue(makeRes({ data: {} }));
    await invitationService.sendInvitation('projet test', { guestEmail: 'x@y.com' });
    const url = mockAuthFetch.mock.calls[0][0] as string;
    expect(url).toContain('projet%20test');
    expect(url).toContain('/invitations/email');
  });

  it('lève une erreur si not ok', async () => {
    mockAuthFetch.mockResolvedValue(makeRes({ message: 'Email déjà invité' }, false));
    await expect(invitationService.sendInvitation('p', { guestEmail: 'x@y.com' }))
      .rejects.toThrow('Email déjà invité');
  });
});

describe('invitationService.getInvitationByToken', () => {
  it('retourne les détails de l invitation (raw fetch)', async () => {
    const invitation = { id: 'inv1', projectName: 'Bio', status: 'Pending' };
    mockFetch.mockReturnValue(makeRawRes({ data: { invitation } }));
    const result = await invitationService.getInvitationByToken('tok-xyz');
    expect(result).toEqual(invitation);
  });

  it('appelle /api/invitations/:token sans authentification', async () => {
    mockFetch.mockReturnValue(makeRawRes({ data: { invitation: {} } }));
    await invitationService.getInvitationByToken('my-token');
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('/api/invitations/my-token');
    // Verify it's raw fetch, not authenticatedFetch
    expect(mockAuthFetch).not.toHaveBeenCalled();
  });

  it('lève une erreur si not ok', async () => {
    mockFetch.mockReturnValue(makeRawRes({ message: 'Invitation expirée' }, false));
    await expect(invitationService.getInvitationByToken('bad')).rejects.toThrow('Invitation expirée');
  });
});

describe('invitationService.acceptInvitation', () => {
  it('retourne data', async () => {
    mockAuthFetch.mockResolvedValue(makeRes({ data: { redirect_to: '/edit' } }));
    const result = await invitationService.acceptInvitation('tok-1');
    expect(result).toEqual({ redirect_to: '/edit' });
  });

  it('envoie PATCH /api/invitations/:token/accept', async () => {
    mockAuthFetch.mockResolvedValue(makeRes({ data: {} }));
    await invitationService.acceptInvitation('tok-1');
    const [url, opts] = mockAuthFetch.mock.calls[0];
    expect(url).toContain('/api/invitations/tok-1/accept');
    expect(opts.method).toBe('PATCH');
  });

  it('lève une erreur si not ok', async () => {
    mockAuthFetch.mockResolvedValue(makeRes({ message: 'Déjà acceptée' }, false));
    await expect(invitationService.acceptInvitation('tok')).rejects.toThrow('Déjà acceptée');
  });
});

describe('invitationService.declineInvitation', () => {
  it('envoie PATCH /api/invitations/:token/decline', async () => {
    mockAuthFetch.mockResolvedValue(makeRes({ data: {} }));
    await invitationService.declineInvitation('tok-2');
    const [url, opts] = mockAuthFetch.mock.calls[0];
    expect(url).toContain('/api/invitations/tok-2/decline');
    expect(opts.method).toBe('PATCH');
  });

  it('lève une erreur si not ok', async () => {
    mockAuthFetch.mockResolvedValue(makeRes({ message: 'Erreur refus' }, false));
    await expect(invitationService.declineInvitation('tok')).rejects.toThrow('Erreur refus');
  });
});

describe('invitationService.revokeInvitation', () => {
  it('envoie DELETE /api/invitations/:token/revoke', async () => {
    mockAuthFetch.mockResolvedValue(makeRes({ data: {} }));
    await invitationService.revokeInvitation('tok-3');
    const [url, opts] = mockAuthFetch.mock.calls[0];
    expect(url).toContain('/api/invitations/tok-3/revoke');
    expect(opts.method).toBe('DELETE');
  });

  it('lève une erreur si not ok', async () => {
    mockAuthFetch.mockResolvedValue(makeRes({ message: 'Non propriétaire' }, false));
    await expect(invitationService.revokeInvitation('tok')).rejects.toThrow('Non propriétaire');
  });
});

describe('invitationService.getProjectInvitations', () => {
  it('retourne la liste des invitations', async () => {
    const invitations = [{ id: 'i1' }, { id: 'i2' }];
    mockAuthFetch.mockResolvedValue(makeRes({ data: { invitations } }));
    const result = await invitationService.getProjectInvitations('mon-projet');
    expect(result).toEqual(invitations);
  });

  it('encode le nom de projet', async () => {
    mockAuthFetch.mockResolvedValue(makeRes({ data: { invitations: [] } }));
    await invitationService.getProjectInvitations('projet avec espaces');
    expect(mockAuthFetch.mock.calls[0][0]).toContain('projet%20avec%20espaces');
  });

  it('lève une erreur si not ok', async () => {
    mockAuthFetch.mockResolvedValue(makeRes({ message: 'Accès refusé' }, false));
    await expect(invitationService.getProjectInvitations('p')).rejects.toThrow('Accès refusé');
  });
});
