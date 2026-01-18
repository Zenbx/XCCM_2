"use client";

import React from 'react';
import { Skeleton, SkeletonNotion, SkeletonAvatar } from './Skeleton';

/**
 * Shimmer animation for custom skeleton elements
 */
export const Shimmer = () => (
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/10 to-transparent animate-shimmer" />
);

/**
 * TOCSkeleton - High fidelity skeleton for the Table of Contents
 */
export const TOCSkeleton = () => (
    <div className="space-y-6 p-4">
        {/* Project Title Placeholder */}
        <Skeleton variant="text" height={16} width="40%" className="mb-6 opacity-30" />

        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                    {/* Part placeholder */}
                    <div className="flex items-center gap-2">
                        <Skeleton variant="rectangular" width={18} height={18} className="rounded" />
                        <Skeleton variant="text" height={18} className="flex-1" />
                    </div>

                    {/* Chapter placeholders */}
                    <div className="pl-6 space-y-2">
                        {[...Array(2)].map((_, j) => (
                            <div key={j} className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton variant="rectangular" width={16} height={16} className="rounded" />
                                    <Skeleton variant="text" height={16} className="flex-1" />
                                </div>

                                {/* Notion placeholders */}
                                <div className="pl-6 space-y-1">
                                    {[...Array(2)].map((_, k) => (
                                        <SkeletonNotion key={k} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

/**
 * EditorSkeleton - High fidelity skeleton for the main editor area
 */
export const EditorSkeleton = () => (
    <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8">
        {/* Title */}
        <Skeleton variant="text" height={40} width="60%" className="mb-8" />

        {/* Text lines */}
        <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    height={16}
                    width={`${Math.floor(Math.random() * 40) + 60}%`}
                />
            ))}
        </div>

        {/* Big content block */}
        <Skeleton variant="rounded" height={300} className="w-full" />

        {/* More text */}
        <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    height={16}
                    width={`${Math.floor(Math.random() * 40) + 60}%`}
                />
            ))}
        </div>
    </div>
);

/**
 * ProjectCardSkeleton - Skeleton for project items in the dashboard
 */
export const ProjectCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 space-y-4">
        <div className="flex justify-between items-start">
            <Skeleton variant="rounded" width={48} height={48} className="rounded-xl" />
            <Skeleton variant="text" width={80} height={24} className="rounded-full" />
        </div>
        <div className="space-y-2">
            <Skeleton variant="text" height={24} width="100%" />
            <Skeleton variant="text" height={16} width="70%" />
        </div>
        <div className="flex gap-4 pt-4 border-t border-gray-50 dark:border-gray-700/50">
            <div className="flex gap-2">
                <Skeleton variant="text" width={40} height={12} />
                <Skeleton variant="text" width={40} height={12} />
            </div>
            <Skeleton variant="text" width={60} height={12} className="ml-auto" />
        </div>
    </div>
);

/**
 * HeaderSkeleton - Skeleton for page headers with title and actions
 */
export const HeaderSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                {/* Back button */}
                <Skeleton variant="circular" width={40} height={40} />
                {/* Title */}
                <div className="space-y-1">
                    <Skeleton variant="text" height={24} width={200} />
                    <Skeleton variant="text" height={14} width={120} className="opacity-60" />
                </div>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-3">
                <Skeleton variant="rounded" width={100} height={36} className="rounded-lg" />
                <Skeleton variant="rounded" width={100} height={36} className="rounded-lg" />
                <Skeleton variant="circular" width={36} height={36} />
            </div>
        </div>
    </div>
);

/**
 * RightPanelSkeleton - Skeleton for right panel content (import, comments, etc.)
 */
export const RightPanelSkeleton = () => (
    <div className="p-6 space-y-6">
        {/* Panel header */}
        <div className="flex items-center justify-between">
            <Skeleton variant="text" height={20} width={140} />
            <Skeleton variant="circular" width={24} height={24} />
        </div>

        {/* Search/filter bar */}
        <Skeleton variant="rounded" height={40} className="w-full rounded-lg" />

        {/* List items */}
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <Skeleton variant="rounded" width={40} height={40} className="rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton variant="text" height={14} width="80%" />
                        <Skeleton variant="text" height={12} width="50%" className="opacity-60" />
                    </div>
                    <Skeleton variant="circular" width={24} height={24} />
                </div>
            ))}
        </div>

        {/* Bottom action */}
        <Skeleton variant="rounded" height={44} className="w-full rounded-xl" />
    </div>
);

/**
 * BreadcrumbSkeleton - Skeleton for breadcrumb navigation
 */
export const BreadcrumbSkeleton = () => (
    <div className="flex items-center gap-2 py-2">
        <Skeleton variant="text" height={12} width={60} />
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <Skeleton variant="text" height={12} width={80} />
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <Skeleton variant="text" height={12} width={100} />
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <Skeleton variant="text" height={14} width={120} className="font-medium" />
    </div>
);

/**
 * FormSkeleton - Skeleton for forms and inputs
 */
export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => (
    <div className="space-y-6">
        {[...Array(fields)].map((_, i) => (
            <div key={i} className="space-y-2">
                {/* Label */}
                <Skeleton variant="text" height={14} width={100} />
                {/* Input */}
                <Skeleton variant="rounded" height={44} className="w-full rounded-xl" />
            </div>
        ))}
        {/* Submit button */}
        <div className="flex gap-3 pt-4">
            <Skeleton variant="rounded" height={44} width={120} className="rounded-xl" />
            <Skeleton variant="rounded" height={44} width={100} className="rounded-xl opacity-60" />
        </div>
    </div>
);

/**
 * TableSkeleton - Skeleton for data tables
 */
export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
    <div className="w-full">
        {/* Header */}
        <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            {[...Array(cols)].map((_, i) => (
                <Skeleton key={i} variant="text" height={14} className="flex-1" />
            ))}
        </div>
        {/* Rows */}
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-800">
                {[...Array(cols)].map((_, j) => (
                    <Skeleton
                        key={j}
                        variant="text"
                        height={16}
                        className="flex-1"
                        width={j === 0 ? "60%" : undefined}
                    />
                ))}
            </div>
        ))}
    </div>
);

/**
 * CommentSkeleton - Skeleton for comment items
 */
export const CommentSkeleton = () => (
    <div className="flex gap-3 p-4">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
                <Skeleton variant="text" height={14} width={100} />
                <Skeleton variant="text" height={12} width={60} className="opacity-50" />
            </div>
            <Skeleton variant="text" height={14} width="90%" />
            <Skeleton variant="text" height={14} width="70%" />
        </div>
    </div>
);

/**
 * StatCardSkeleton - Skeleton for analytics stat cards
 */
export const StatCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4 border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
            <Skeleton variant="circular" width={48} height={48} />
            <Skeleton variant="text" height={12} width={60} className="opacity-60" />
        </div>
        <div className="space-y-1">
            <Skeleton variant="text" height={32} width={80} />
            <Skeleton variant="text" height={14} width={120} className="opacity-60" />
        </div>
    </div>
);
