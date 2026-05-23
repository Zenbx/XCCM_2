import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

const mockSetLanguage = vi.fn();
vi.mock('@/context/LanguageContext', () => ({
  useLanguage: vi.fn().mockReturnValue({ language: 'fr', setLanguage: vi.fn() }),
}));

import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';

const mockUseLanguage = useLanguage as ReturnType<typeof vi.fn>;

describe('LanguageToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLanguage.mockReturnValue({ language: 'fr', setLanguage: mockSetLanguage });
  });

  it('affiche les boutons FR et EN', () => {
    render(<LanguageToggle />);
    expect(screen.getByText('FR')).toBeTruthy();
    expect(screen.getByText('EN')).toBeTruthy();
  });

  it('appelle setLanguage("fr") au clic sur FR', () => {
    render(<LanguageToggle />);
    fireEvent.click(screen.getByTitle('Français'));
    expect(mockSetLanguage).toHaveBeenCalledWith('fr');
  });

  it('appelle setLanguage("en") au clic sur EN', () => {
    render(<LanguageToggle />);
    fireEvent.click(screen.getByTitle('English'));
    expect(mockSetLanguage).toHaveBeenCalledWith('en');
  });

  it('applique la classe active sur le bouton fr quand language=fr', () => {
    mockUseLanguage.mockReturnValue({ language: 'fr', setLanguage: mockSetLanguage });
    render(<LanguageToggle />);
    const frBtn = screen.getByTitle('Français');
    expect(frBtn).toHaveClass('bg-[#99334C]');
  });

  it('applique la classe active sur le bouton en quand language=en', () => {
    mockUseLanguage.mockReturnValue({ language: 'en', setLanguage: mockSetLanguage });
    render(<LanguageToggle />);
    const enBtn = screen.getByTitle('English');
    expect(enBtn).toHaveClass('bg-[#99334C]');
  });
});
