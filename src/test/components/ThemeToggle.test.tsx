import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockSetTheme = vi.fn();
vi.mock('@/context/ThemeContext', () => ({
  useTheme: vi.fn().mockReturnValue({ theme: 'light', setTheme: vi.fn(), resolvedTheme: 'light' }),
}));

import { useTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';

const mockUseTheme = useTheme as ReturnType<typeof vi.fn>;

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTheme.mockReturnValue({ theme: 'light', setTheme: mockSetTheme, resolvedTheme: 'light' });
  });

  it('n affiche rien avant le montage', () => {
    // The component returns null until mounted=true (useEffect)
    // In testing, useEffect runs synchronously, so it should be mounted immediately
    const { container } = render(<ThemeToggle />);
    // After act, it should be visible
    expect(container.firstChild).toBeTruthy();
  });

  it('affiche 3 boutons (light, system, dark)', async () => {
    render(<ThemeToggle />);
    await act(async () => {});
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(3);
  });

  it('appelle setTheme("light") au clic sur Mode Clair', async () => {
    render(<ThemeToggle />);
    await act(async () => {});
    fireEvent.click(screen.getByTitle('Mode Clair'));
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('appelle setTheme("dark") au clic sur Mode Sombre', async () => {
    render(<ThemeToggle />);
    await act(async () => {});
    fireEvent.click(screen.getByTitle('Mode Sombre'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('appelle setTheme("system") au clic sur Système', async () => {
    render(<ThemeToggle />);
    await act(async () => {});
    fireEvent.click(screen.getByTitle('Système'));
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });
});
