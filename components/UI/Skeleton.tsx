"use client";

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'shimmer' | 'pulse' | 'none';
}

/**
 * Skeleton - Composant de placeholder avec animation shimmer
 * Utilisé pour simuler le chargement de contenu
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'shimmer'
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  };

  const animationClasses = {
    shimmer: 'skeleton-shimmer',
    pulse: 'animate-pulse',
    none: ''
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  return (
    <div
      className={`
        relative overflow-hidden
        bg-gray-200 dark:bg-gray-700
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={style}
    >
      {animation === 'shimmer' && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-gray-500/20 to-transparent animate-shimmer" />
      )}
    </div>
  );
};

/**
 * SkeletonText - Plusieurs lignes de texte skeleton
 */
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}> = ({ lines = 3, className = '', lastLineWidth = '60%' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          width={i === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
};

/**
 * SkeletonCard - Card skeleton avec image et texte
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 space-y-4 ${className}`}>
      <Skeleton variant="rounded" height={160} className="w-full" />
      <div className="space-y-2">
        <Skeleton variant="text" height={20} width="80%" />
        <Skeleton variant="text" height={16} width="60%" />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rounded" height={32} width={80} />
        <Skeleton variant="rounded" height={32} width={80} />
      </div>
    </div>
  );
};

/**
 * SkeletonAvatar - Avatar skeleton circulaire
 */
export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80
  };

  return (
    <Skeleton
      variant="circular"
      width={sizes[size]}
      height={sizes[size]}
      className={className}
    />
  );
};

/**
 * SkeletonButton - Bouton skeleton
 */
export const SkeletonButton: React.FC<{
  width?: string | number;
  className?: string;
}> = ({ width = 100, className = '' }) => {
  return (
    <Skeleton
      variant="rounded"
      width={width}
      height={40}
      className={className}
    />
  );
};

/**
 * SkeletonList - Liste de lignes skeleton
 */
export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({ items = 5, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" height={16} className="flex-1" />
        </div>
      ))}
    </div>
  );
};

/**
 * SkeletonCourseCard - Skeleton spécifique pour les cartes de cours (Library)
 */
export const SkeletonCourseCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 space-y-4 shadow-sm ${className}`}>
      {/* Thumbnail placeholder */}
      <Skeleton variant="rounded" height={180} className="w-full rounded-xl" animation="shimmer" />

      <div className="space-y-3">
        {/* Title */}
        <Skeleton variant="text" height={24} width="85%" />
        {/* Subtitle/Metadata */}
        <div className="flex gap-2">
          <Skeleton variant="text" height={14} width={60} />
          <Skeleton variant="text" height={14} width={40} />
        </div>
      </div>

      {/* Footer / Buttons */}
      <div className="pt-2 flex justify-between items-center">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="rounded" height={36} width={100} className="rounded-xl" />
      </div>
    </div>
  );
};

/**
 * SkeletonNotion - Skeleton pour les notions du TOC
 */
export const SkeletonNotion: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2 py-1.5 px-3 ${className}`}>
      <Skeleton variant="rectangular" width={4} height={16} className="rounded-full" />
      <Skeleton variant="text" height={14} className="flex-1" />
    </div>
  );
};

export default Skeleton;
