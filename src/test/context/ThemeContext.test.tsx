import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderHook } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

// Mock next-themes since it requires a real browser environment for system theme detection
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTheme: vi.fn().mockReturnValue({
    theme: 'light',
    setTheme: vi.fn(),
    resolvedTheme: 'light',
  }),
}));

import { useTheme as useNextTheme } from 'next-themes';
const mockUseNextTheme = useNextTheme as ReturnType<typeof vi.fn>;

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('useTheme', () => {
  it('retourne le thème courant', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });
    expect(result.current.theme).toBe('light');
  });

  it('retourne resolvedTheme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('expose setTheme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });
    expect(typeof result.current.setTheme).toBe('function');
  });

  it('utilise "system" par défaut si theme est undefined', () => {
    mockUseNextTheme.mockReturnValue({ theme: undefined, setTheme: vi.fn(), resolvedTheme: 'dark' });
    const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });
    expect(result.current.theme).toBe('system');
  });
});
