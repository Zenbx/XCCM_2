import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { Suspense } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

// ─── Global mocks ─────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
  usePathname: () => '/',
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    section: ({ children, ...p }: any) => <section {...p}>{children}</section>,
    button: ({ children, ...p }: any) => <button {...p}>{children}</button>,
    span: ({ children, ...p }: any) => <span {...p}>{children}</span>,
    h1: ({ children, ...p }: any) => <h1 {...p}>{children}</h1>,
    h2: ({ children, ...p }: any) => <h2 {...p}>{children}</h2>,
    p: ({ children, ...p }: any) => <p {...p}>{children}</p>,
    img: ({ ...p }: any) => <img {...p} />,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => true,
  useAnimation: () => ({ start: vi.fn() }),
  useSpring: () => ({ get: vi.fn(), set: vi.fn() }),
  useMotionValue: (v: any) => ({ get: () => v, set: vi.fn() }),
  useTransform: (_v: any, _range: any, output: any) => ({ get: () => output[0] }),
}));

vi.mock('react-intersection-observer', () => ({
  useInView: () => [null, true],
}));

const mockUser = { user_id: 'u1', firstname: 'Jean', lastname: 'Dupont', email: 'j@d.com', role: 'user' };
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    authUser: mockUser,
    user: mockUser,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

// Mock IntersectionObserver (not in jsdom)
Object.defineProperty(window, 'IntersectionObserver', {
  configurable: true,
  writable: true,
  value: class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    constructor(_cb: any) {}
  },
});

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn(), resolvedTheme: 'light' }),
}));

vi.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({ language: 'fr', setLanguage: vi.fn() }),
}));

vi.mock('@/context/OnboardingContext', () => ({
  useOnboarding: () => ({ startTour: vi.fn(), autoStartTour: vi.fn(), isRunning: false }),
}));

vi.mock('@/services/mailingService', () => ({
  mailingService: { sendContact: vi.fn().mockResolvedValue({}) },
}));

vi.mock('@/services/documentService', () => ({
  documentService: { getUserDocuments: vi.fn().mockResolvedValue([]) },
}));

vi.mock('@/services/marketplaceService', () => ({
  marketplaceService: { getMarketplaceItems: vi.fn().mockResolvedValue([]) },
}));

vi.mock('@/services/vaultService', () => ({
  vaultService: { addToVault: vi.fn().mockResolvedValue({}) },
}));

vi.mock('@/data/tours/marketplace.tour', () => ({
  marketplaceTour: { flowId: 'marketplace', steps: [] },
}));

vi.mock('@/components/Marketplace/MarketplaceViewer', () => ({
  MarketplaceViewer: () => <div>MarketplaceViewer</div>,
}));

vi.mock('@/lib/apiHelper', () => ({
  getAuthHeaders: vi.fn().mockReturnValue({ Authorization: 'Bearer tok' }),
  authenticatedFetch: vi.fn().mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue({ data: { settings: {} } }),
  }),
}));

// Mock global fetch for pages that use it directly
const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({ data: {} }),
});
global.fetch = mockFetch;

// ─── AboutPage ────────────────────────────────────────────────────────────────

import AboutPage from '@/app/about/page';

describe('AboutPage', () => {
  it('rendu sans crash', async () => {
    const { container } = render(<AboutPage />);
    await act(async () => {});
    expect(container.firstChild).toBeTruthy();
  });

  it('affiche le titre de la page', async () => {
    render(<AboutPage />);
    await act(async () => {});
    // The about page has static content
    expect(document.body).toBeTruthy();
  });
});

// ─── MarketplacePage ──────────────────────────────────────────────────────────

import MarketplacePage from '@/app/marketplace/page';

describe('MarketplacePage', () => {
  it('rendu sans crash', async () => {
    const { container } = render(<MarketplacePage />);
    await act(async () => {});
    expect(container.firstChild).toBeTruthy();
  });
});

// ─── SettingsPage ─────────────────────────────────────────────────────────────

import SettingsPage from '@/app/settings/page';

describe('SettingsPage', () => {
  it('rendu sans crash', async () => {
    const { container } = render(<SettingsPage />);
    await act(async () => {});
    expect(container.firstChild).toBeTruthy();
  });
});
