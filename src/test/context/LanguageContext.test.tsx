import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}

beforeEach(() => {
  localStorage.clear();
});

describe('LanguageProvider / useLanguage', () => {
  it('fournit la langue par défaut "fr" si navigator.language n est pas anglais', async () => {
    // In jsdom navigator.language may be 'en', so stub it to French
    vi.stubGlobal('navigator', { ...navigator, language: 'fr-FR' });
    const { result } = renderHook(() => useLanguage(), { wrapper: Wrapper });
    await act(async () => {});
    expect(result.current.language).toBe('fr');
    vi.unstubAllGlobals();
  });

  it('lit la langue depuis localStorage si présente', async () => {
    localStorage.setItem('xccm2_language', 'en');
    const { result } = renderHook(() => useLanguage(), { wrapper: Wrapper });
    // Wait for useEffect
    await act(async () => {});
    expect(result.current.language).toBe('en');
  });

  it('setLanguage change la langue', async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: Wrapper });
    act(() => { result.current.setLanguage('en'); });
    expect(result.current.language).toBe('en');
  });

  it('lève une erreur si useLanguage est utilisé hors Provider', () => {
    // Suppress the console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useLanguage())).toThrow(
      'useLanguage must be used within LanguageProvider'
    );
    spy.mockRestore();
  });
});
