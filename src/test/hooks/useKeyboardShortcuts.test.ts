import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { useKeyboardShortcuts, formatShortcut, getShortcutParts } from '@/hooks/useKeyboardShortcuts';

beforeEach(() => vi.clearAllMocks());

function triggerKey(key: string, opts: Partial<KeyboardEventInit> = {}) {
  fireEvent.keyDown(window, { key, ...opts });
}

describe('useKeyboardShortcuts', () => {
  it('appelle le handler sur la touche correspondante', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ 'esc': handler }));
    triggerKey('Escape');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('n appelle pas le handler pour d autres touches', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ 'esc': handler }));
    triggerKey('Enter');
    expect(handler).not.toHaveBeenCalled();
  });

  it('respecte l option enabled=false', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({ 'esc': handler }, { enabled: false })
    );
    triggerKey('Escape');
    expect(handler).not.toHaveBeenCalled();
  });

  it('gère les combos avec ctrl', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ 'ctrl+s': handler }));
    triggerKey('s', { ctrlKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('ignore les raccourcis dans les inputs (sauf cmd+s)', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({ 'k': handler }, { ignoreInputs: true })
    );
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    fireEvent.keyDown(input, { key: 'k' });
    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('config object avec enabled=false ne déclenche pas le handler', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({ 'enter': { handler, enabled: false } })
    );
    triggerKey('Enter');
    expect(handler).not.toHaveBeenCalled();
  });

  it('supporte target=document', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({ 'esc': handler }, { target: 'document' })
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('formatShortcut', () => {
  it('formate esc comme "Esc"', () => {
    expect(formatShortcut('esc')).toContain('Esc');
  });

  it('formate enter comme "↵"', () => {
    expect(formatShortcut('enter')).toContain('↵');
  });

  it('formate les lettres en majuscules', () => {
    expect(formatShortcut('k')).toContain('K');
  });

  it('formate les flèches', () => {
    expect(formatShortcut('up')).toContain('↑');
    expect(formatShortcut('down')).toContain('↓');
    expect(formatShortcut('left')).toContain('←');
    expect(formatShortcut('right')).toContain('→');
  });
});

describe('getShortcutParts', () => {
  it('retourne un tableau de parties', () => {
    const parts = getShortcutParts('ctrl+s');
    expect(Array.isArray(parts)).toBe(true);
    expect(parts.length).toBe(2);
  });

  it('convertit esc', () => {
    expect(getShortcutParts('esc')).toContain('Esc');
  });
});
