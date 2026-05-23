import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

// Use static imports so v8 coverage properly instruments the source files
import ConditionsPage from '@/app/conditions/page';
import AccessibilitePage from '@/app/accessibilite/page';
import ConfidentialitePage from '@/app/confidentialite/page';

describe('ConditionsPage', () => {
  it('rendu sans crash', () => {
    const { container } = render(<ConditionsPage />);
    expect(container.firstChild).toBeTruthy();
  });

  it('affiche le contenu des conditions', () => {
    render(<ConditionsPage />);
    expect(screen.getByText(/Acceptation des conditions/i)).toBeTruthy();
  });

  it('affiche la section Services proposés', () => {
    render(<ConditionsPage />);
    expect(screen.getByText(/Services proposés/i)).toBeTruthy();
  });
});

describe('AccessibilitePage', () => {
  it('rendu sans crash', () => {
    const { container } = render(<AccessibilitePage />);
    expect(container.firstChild).toBeTruthy();
  });

  it('affiche la section accessibilité', () => {
    render(<AccessibilitePage />);
    expect(screen.getAllByText(/Navigation au clavier/i).length).toBeGreaterThan(0);
  });

  it('affiche les indicateurs de conformité', () => {
    render(<AccessibilitePage />);
    expect(screen.getByText(/Contrastes de couleurs suffisants/i)).toBeTruthy();
  });
});

describe('ConfidentialitePage', () => {
  it('rendu sans crash', () => {
    const { container } = render(<ConfidentialitePage />);
    expect(container.firstChild).toBeTruthy();
  });

  it('affiche la section collecte des données', () => {
    render(<ConfidentialitePage />);
    expect(screen.getByText(/Collecte des données/i)).toBeTruthy();
  });

  it('affiche la section partage avec des tiers', () => {
    render(<ConfidentialitePage />);
    expect(screen.getByText(/Partage avec des tiers/i)).toBeTruthy();
  });
});
