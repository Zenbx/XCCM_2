import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonText, SkeletonCard } from '@/components/UI/Skeleton';

describe('Skeleton', () => {
  it('rendu sans crash', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it('applique la variante text (rounded)', () => {
    const { container } = render(<Skeleton variant="text" />);
    expect(container.firstChild).toHaveClass('rounded');
  });

  it('applique la variante circular (rounded-full)', () => {
    const { container } = render(<Skeleton variant="circular" />);
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('applique la variante rounded (rounded-lg)', () => {
    const { container } = render(<Skeleton variant="rounded" />);
    expect(container.firstChild).toHaveClass('rounded-lg');
  });

  it('applique l animation pulse', () => {
    const { container } = render(<Skeleton animation="pulse" />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('pas d animation quand animation=none', () => {
    const { container } = render(<Skeleton animation="none" />);
    expect(container.firstChild).not.toHaveClass('animate-pulse');
    expect(container.firstChild).not.toHaveClass('skeleton-shimmer');
  });

  it('applique les dimensions en pixels', () => {
    const { container } = render(<Skeleton width={200} height={50} />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.width).toBe('200px');
    expect(div.style.height).toBe('50px');
  });

  it('applique les dimensions en string (pourcentage)', () => {
    const { container } = render(<Skeleton width="80%" height="auto" />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.width).toBe('80%');
  });

  it('applique le className custom', () => {
    const { container } = render(<Skeleton className="my-custom-class" />);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('affiche le shimmer gradient par défaut', () => {
    const { container } = render(<Skeleton animation="shimmer" />);
    const shimmer = container.querySelector('.animate-shimmer');
    expect(shimmer).toBeTruthy();
  });
});

describe('SkeletonText', () => {
  it('rendu avec 3 lignes par défaut', () => {
    const { container } = render(<SkeletonText />);
    const skeletons = container.querySelectorAll('.rounded');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it('rendu avec le nombre de lignes spécifié', () => {
    const { container } = render(<SkeletonText lines={5} />);
    const skeletons = container.querySelectorAll('.rounded');
    expect(skeletons.length).toBe(5);
  });
});

describe('SkeletonCard', () => {
  it('rendu sans crash', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeTruthy();
  });

  it('applique le className custom', () => {
    const { container } = render(<SkeletonCard className="card-custom" />);
    expect(container.firstChild).toHaveClass('card-custom');
  });
});
