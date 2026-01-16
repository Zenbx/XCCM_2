"use client";

import React from 'react';

export const Shimmer = () => (
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
);

export const TOCSkeleton = () => (
    <div className="space-y-4 p-4">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="relative overflow-hidden bg-gray-100 rounded-lg h-8 w-full">
                <Shimmer />
            </div>
        ))}
        <div className="pt-4 border-t border-gray-200 space-y-2">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="relative overflow-hidden bg-gray-50 rounded h-6 w-3/4 ml-4">
                    <Shimmer />
                </div>
            ))}
        </div>
    </div>
);

export const EditorSkeleton = () => (
    <div className="max-w-4xl mx-auto p-10 space-y-8">
        <div className="relative overflow-hidden bg-gray-100 h-10 w-2/3 rounded">
            <Shimmer />
        </div>
        <div className="space-y-4">
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="relative overflow-hidden bg-gray-50 h-5 rounded"
                    style={{ width: `${Math.random() * 40 + 60}%` }}
                >
                    <Shimmer />
                </div>
            ))}
        </div>
        <div className="relative overflow-hidden bg-gray-100 h-64 w-full rounded-xl">
            <Shimmer />
        </div>
    </div>
);

export const ProjectCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex justify-between items-start">
            <div className="relative overflow-hidden bg-gray-200 h-10 w-10 rounded-lg">
                <Shimmer />
            </div>
            <div className="relative overflow-hidden bg-gray-100 h-6 w-20 rounded-full">
                <Shimmer />
            </div>
        </div>
        <div className="space-y-2">
            <div className="relative overflow-hidden bg-gray-100 h-6 w-full rounded">
                <Shimmer />
            </div>
            <div className="relative overflow-hidden bg-gray-50 h-4 w-2/3 rounded">
                <Shimmer />
            </div>
        </div>
        <div className="flex gap-2 pt-2">
            <div className="relative overflow-hidden bg-gray-100 h-4 w-16 rounded">
                <Shimmer />
            </div>
            <div className="relative overflow-hidden bg-gray-100 h-4 w-16 rounded">
                <Shimmer />
            </div>
        </div>
    </div>
);
