import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { Suspense } from 'react';
import { render, screen, act } from '@testing-library/react';

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
    li: ({ children, ...p }: any) => <li {...p}>{children}</li>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => true,
  useAnimation: () => ({ start: vi.fn() }),
}));

vi.mock('react-intersection-observer', () => ({
  useInView: () => [null, true],
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    authUser: { user_id: 'u1', firstname: 'Jean', lastname: 'Dupont', email: 'j@d.com', role: 'user' },
    user: { user_id: 'u1', firstname: 'Jean', lastname: 'Dupont', email: 'j@d.com', role: 'user' },
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
    isAdmin: false,
  }),
}));

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn(), resolvedTheme: 'light' }),
}));

vi.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({ language: 'fr', setLanguage: vi.fn() }),
}));

vi.mock('@/context/OnboardingContext', () => ({
  useOnboarding: () => ({ startTour: vi.fn(), autoStartTour: vi.fn(), isRunning: false }),
}));

vi.mock('@/services/vaultService', () => ({
  vaultService: { getVaultItems: vi.fn().mockResolvedValue([]), addToVault: vi.fn().mockResolvedValue({}) },
}));

vi.mock('@/services/authService', () => ({
  authService: {
    getAuthToken: vi.fn().mockReturnValue('tok'),
    getCurrentUser: vi.fn().mockResolvedValue({ user_id: 'u1', firstname: 'Jean', role: 'user' }),
  },
}));

vi.mock('@/services/documentService', () => ({
  documentService: { getUserDocuments: vi.fn().mockResolvedValue([]), toggleLike: vi.fn() },
}));

vi.mock('@/services/projectService', () => ({
  projectService: {
    getUserProjects: vi.fn().mockResolvedValue([]),
    createProject: vi.fn().mockResolvedValue({ pr_name: 'test' }),
    deleteProject: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@/services/structureService', () => ({
  structureService: { getProjectStructureOptimized: vi.fn().mockResolvedValue([]) },
}));

vi.mock('@/lib/apiHelper', () => ({
  getAuthHeaders: vi.fn().mockReturnValue({ Authorization: 'Bearer tok' }),
  authenticatedFetch: vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ data: {} }) }),
}));

vi.mock('@/lib/cookies', () => ({
  getCookie: vi.fn().mockReturnValue('tok'),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
}));

Object.defineProperty(window, 'IntersectionObserver', {
  configurable: true,
  writable: true,
  value: class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn(); constructor(_cb: any) {} },
});

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({ data: {}, success: true }),
});

// ─── AccountPage ──────────────────────────────────────────────────────────────

import AccountPage from '@/app/account/page';

describe('AccountPage', () => {
  it('rendu sans crash', async () => {
    const { container } = render(<AccountPage />);
    await act(async () => {});
    expect(container.firstChild).toBeTruthy();
  });
});

// ─── LibraryPage ──────────────────────────────────────────────────────────────

import LibraryPage from '@/app/library/page';

describe('LibraryPage', () => {
  it('rendu sans crash', async () => {
    const { container } = render(<LibraryPage />);
    await act(async () => {});
    expect(container.firstChild).toBeTruthy();
  });
});

// ─── AuthCallbackPage ─────────────────────────────────────────────────────────

import AuthCallbackPage from '@/app/auth/callback/page';

describe('AuthCallbackPage', () => {
  it('rendu sans crash', async () => {
    const { container } = render(
      <Suspense fallback={<div>Loading...</div>}>
        <AuthCallbackPage />
      </Suspense>
    );
    await act(async () => {});
    expect(container.firstChild).toBeTruthy();
  });
});

// ─── EditHomePage ─────────────────────────────────────────────────────────────

import EditHomePage from '@/app/edit-home/page';

describe('EditHomePage', () => {
  it('rendu sans crash', async () => {
    const { container } = render(<EditHomePage />);
    await act(async () => {});
    expect(container.firstChild).toBeTruthy();
  });
});
