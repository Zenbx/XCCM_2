import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDiscovery } from '@/hooks/useDiscovery';

vi.mock('@/services/onboardingService', () => ({
  onboardingService: {
    hasDiscovered: vi.fn(),
    markDiscovered: vi.fn(),
  },
}));

import { onboardingService } from '@/services/onboardingService';
const mockHasDiscovered = onboardingService.hasDiscovered as ReturnType<typeof vi.fn>;
const mockMarkDiscovered = onboardingService.markDiscovered as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useDiscovery', () => {
  it('isNew=true si la feature n a pas été découverte', () => {
    mockHasDiscovered.mockReturnValue(false);
    const { result } = renderHook(() => useDiscovery('ai-panel'));
    expect(result.current.isNew).toBe(true);
  });

  it('isNew=false si la feature a déjà été découverte', () => {
    mockHasDiscovered.mockReturnValue(true);
    const { result } = renderHook(() => useDiscovery('ai-panel'));
    expect(result.current.isNew).toBe(false);
  });

  it('dismiss() appelle markDiscovered et met isNew à false', () => {
    mockHasDiscovered.mockReturnValue(false);
    const { result } = renderHook(() => useDiscovery('new-feature'));
    expect(result.current.isNew).toBe(true);

    act(() => { result.current.dismiss(); });

    expect(mockMarkDiscovered).toHaveBeenCalledWith('new-feature');
    expect(result.current.isNew).toBe(false);
  });

  it('expose la fonction dismiss', () => {
    mockHasDiscovered.mockReturnValue(false);
    const { result } = renderHook(() => useDiscovery('x'));
    expect(typeof result.current.dismiss).toBe('function');
  });
});
