import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, className, style, ...props }: any, ref: any) =>
      <div ref={ref} className={className} style={style} {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import GlassPanel from '@/components/UI/GlassPanel';

describe('GlassPanel', () => {
  it('rendu sans crash', () => {
    const { container } = render(<GlassPanel>Contenu</GlassPanel>);
    expect(container.firstChild).toBeTruthy();
  });

  it('affiche les enfants', () => {
    render(<GlassPanel><span>Hello</span></GlassPanel>);
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('applique backdrop-blur-sm pour blur=sm', () => {
    const { container } = render(<GlassPanel blur="sm">x</GlassPanel>);
    expect(container.firstChild).toHaveClass('backdrop-blur-sm');
  });

  it('applique backdrop-blur-md par défaut', () => {
    const { container } = render(<GlassPanel>x</GlassPanel>);
    expect(container.firstChild).toHaveClass('backdrop-blur-md');
  });

  it('applique backdrop-blur-xl pour blur=xl', () => {
    const { container } = render(<GlassPanel blur="xl">x</GlassPanel>);
    expect(container.firstChild).toHaveClass('backdrop-blur-xl');
  });

  it('applique l intensité low', () => {
    const { container } = render(<GlassPanel intensity="low">x</GlassPanel>);
    expect(container.firstChild).toHaveClass('bg-white/40');
  });

  it('applique l intensité high', () => {
    const { container } = render(<GlassPanel intensity="high">x</GlassPanel>);
    expect(container.firstChild).toHaveClass('bg-white/80');
  });

  it('ajoute une bordure par défaut (border=true)', () => {
    const { container } = render(<GlassPanel>x</GlassPanel>);
    expect(container.firstChild).toHaveClass('border');
  });

  it('pas de bordure quand border=false', () => {
    const { container } = render(<GlassPanel border={false}>x</GlassPanel>);
    expect(container.firstChild).not.toHaveClass('border');
  });

  it('applique le className custom', () => {
    const { container } = render(<GlassPanel className="my-class">x</GlassPanel>);
    expect(container.firstChild).toHaveClass('my-class');
  });
});
