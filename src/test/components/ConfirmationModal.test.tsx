import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock framer-motion to avoid animation issues in jsdom
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) =>
      <div ref={ref} {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import ConfirmationModal from '@/components/UI/ConfirmationModal';

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  title: 'Supprimer le projet',
  message: 'Cette action est irréversible.',
};

describe('ConfirmationModal', () => {
  it('n affiche rien quand isOpen=false', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('affiche le modal quand isOpen=true', () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('affiche le titre et le message', () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText('Supprimer le projet')).toBeTruthy();
    expect(screen.getByText('Cette action est irréversible.')).toBeTruthy();
  });

  it('affiche les textes de boutons par défaut', () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText('Confirmer')).toBeTruthy();
    expect(screen.getByText('Annuler')).toBeTruthy();
  });

  it('affiche les textes de boutons personnalisés', () => {
    render(<ConfirmationModal {...defaultProps} confirmText="Oui, supprimer" cancelText="Non" />);
    expect(screen.getByText('Oui, supprimer')).toBeTruthy();
    expect(screen.getByText('Non')).toBeTruthy();
  });

  it('appelle onConfirm au clic sur confirmer', () => {
    const onConfirm = vi.fn();
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('Confirmer'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('appelle onClose au clic sur annuler', () => {
    const onClose = vi.fn();
    render(<ConfirmationModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('appelle onClose au clic sur le bouton X', () => {
    const onClose = vi.fn();
    render(<ConfirmationModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Fermer'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('affiche le spinner quand isLoading=true', () => {
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);
    // Loader2 is rendered instead of confirmText
    expect(screen.queryByText('Confirmer')).toBeNull();
  });

  it('désactive les boutons quand isLoading=true', () => {
    render(<ConfirmationModal {...defaultProps} isLoading={true} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => {
      expect(btn).toHaveProperty('disabled');
    });
  });

  it('variante warning change les styles', () => {
    const { container } = render(<ConfirmationModal {...defaultProps} variant="warning" />);
    expect(container.querySelector('.bg-amber-50')).toBeTruthy();
  });

  it('variante info utilise les styles par défaut', () => {
    const { container } = render(<ConfirmationModal {...defaultProps} variant="info" />);
    expect(container.querySelector('[class*="99334C"]')).toBeTruthy();
  });
});
