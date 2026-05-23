import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vaultService } from '@/services/vaultService';

vi.mock('@/lib/apiHelper', () => ({
  authenticatedFetch: vi.fn(),
}));

import { authenticatedFetch } from '@/lib/apiHelper';

const mockFetch = authenticatedFetch as ReturnType<typeof vi.fn>;

function makeRes(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('vaultService.addToVault', () => {
  const item = { type: 'text', title: 'Note', original_id: 'abc123' };

  it('retourne data de la réponse', async () => {
    const vault = { id: 'v1', ...item, added_at: '2026-01-01' };
    mockFetch.mockResolvedValue(makeRes({ data: vault }));
    const result = await vaultService.addToVault(item);
    expect(result).toEqual(vault);
  });

  it('envoie POST /api/vault avec le corps JSON', async () => {
    mockFetch.mockResolvedValue(makeRes({ data: {} }));
    await vaultService.addToVault(item);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/vault'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify(item) })
    );
  });

  it('lève une erreur si response not ok', async () => {
    mockFetch.mockResolvedValue(makeRes({ message: 'Vault plein' }, false, 422));
    await expect(vaultService.addToVault(item)).rejects.toThrow('Vault plein');
  });

  it('lève une erreur générique si pas de message', async () => {
    mockFetch.mockResolvedValue(makeRes({}, false, 500));
    await expect(vaultService.addToVault(item)).rejects.toThrow('Erreur Vault (500)');
  });
});

describe('vaultService.getVaultItems', () => {
  it('retourne items depuis data.items', async () => {
    const items = [{ id: 'v1' }, { id: 'v2' }];
    mockFetch.mockResolvedValue(makeRes({ data: { items } }));
    const result = await vaultService.getVaultItems();
    expect(result).toEqual(items);
  });

  it('retourne items depuis data (tableau direct)', async () => {
    const items = [{ id: 'v3' }];
    mockFetch.mockResolvedValue(makeRes({ data: items }));
    const result = await vaultService.getVaultItems();
    expect(result).toEqual(items);
  });

  it('retourne [] si data est null', async () => {
    mockFetch.mockResolvedValue(makeRes({ data: null }));
    const result = await vaultService.getVaultItems();
    expect(result).toEqual([]);
  });

  it('retourne [] si data est undefined', async () => {
    mockFetch.mockResolvedValue(makeRes({}));
    const result = await vaultService.getVaultItems();
    expect(result).toEqual([]);
  });

  it('lève une erreur si response not ok', async () => {
    mockFetch.mockResolvedValue(makeRes({ message: 'Non autorisé' }, false, 401));
    await expect(vaultService.getVaultItems()).rejects.toThrow('Non autorisé');
  });
});

describe('vaultService.removeFromVault', () => {
  it('appelle DELETE /api/vault/:id', async () => {
    mockFetch.mockResolvedValue(makeRes(null));
    await vaultService.removeFromVault('item-42');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/vault/item-42'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('se résout sans valeur si ok', async () => {
    mockFetch.mockResolvedValue(makeRes(null));
    await expect(vaultService.removeFromVault('item-1')).resolves.toBeUndefined();
  });

  it('lève une erreur si response not ok', async () => {
    mockFetch.mockResolvedValue(makeRes({ message: 'Item introuvable' }, false, 404));
    await expect(vaultService.removeFromVault('bad-id')).rejects.toThrow('Item introuvable');
  });
});
