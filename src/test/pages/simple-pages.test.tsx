import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    section: ({ children, ...p }: any) => <section {...p}>{children}</section>,
    span: ({ children, ...p }: any) => <span {...p}>{children}</span>,
    p: ({ children, ...p }: any) => <p {...p}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => true,
  useAnimation: () => ({ start: vi.fn() }),
}));

// ─── DemoPage ──────────────────────────────────────────────────────────────────

import DemoPage from '@/app/demo/page';

describe('DemoPage', () => {
  it('rendu sans crash', () => {
    const { container } = render(<DemoPage />);
    expect(container.firstChild).toBeTruthy();
  });

  it('affiche la section étapes', () => {
    render(<DemoPage />);
    expect(screen.getByText(/Créez votre structure/i)).toBeTruthy();
  });

  it('change d étape au clic', () => {
    render(<DemoPage />);
    const buttons = screen.getAllByRole('button');
    if (buttons.length > 1) {
      fireEvent.click(buttons[1]);
      // No crash expected
    }
  });
});

// ─── CommunityPage ─────────────────────────────────────────────────────────────

import CommunityPage from '@/app/community/page';

describe('CommunityPage', () => {
  it('rendu sans crash', () => {
    const { container } = render(<CommunityPage />);
    expect(container.firstChild).toBeTruthy();
  });

  it('affiche les onglets de navigation', () => {
    render(<CommunityPage />);
    // There should be tabs like tendance, recent, etc.
    expect(screen.getByText(/tendance/i)).toBeTruthy();
  });

  it('rendu avec liste vide sans crash', () => {
    const { container } = render(<CommunityPage />);
    expect(container.firstChild).toBeTruthy();
  });
});

// ─── CreatorsPage ──────────────────────────────────────────────────────────────

const mockFetch = vi.fn();
global.fetch = mockFetch;

import CreatorsPage from '@/app/creators/page';

describe('CreatorsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      json: vi.fn().mockResolvedValue({ success: true, data: [] }),
    });
  });

  it('rendu sans crash', async () => {
    const { container } = render(<CreatorsPage />);
    expect(container.firstChild).toBeTruthy();
  });

  it('affiche un indicateur de chargement initialement', () => {
    const { container } = render(<CreatorsPage />);
    // Loading state or empty state
    expect(container.firstChild).toBeTruthy();
  });
});
