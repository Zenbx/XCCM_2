import React from 'react';
import { Loader2 } from 'lucide-react';
import { EditorSkeleton } from '@/components/UI/SkeletonScreens';

const EditorSkeletonView = () => {
    return (
        <div className="flex h-screen w-full bg-white dark:bg-gray-950 overflow-hidden">
            {/* Sidebar Skeleton */}
            <div className="w-[320px] h-full border-r border-gray-200 dark:border-gray-800 p-4 space-y-4 shrink-0">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
                <div className="space-y-2 mt-8">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse" />
                            <div className="ml-4 h-4 bg-gray-100 dark:bg-gray-900 rounded w-2/3 animate-pulse" />
                            <div className="ml-4 h-4 bg-gray-100 dark:bg-gray-900 rounded w-2/3 animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-950 relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-[#99334C] animate-spin" />
                        <p className="text-gray-400 font-medium animate-pulse">Chargement de votre espace créatif...</p>
                    </div>
                </div>
                <div className="p-8">
                    <EditorSkeleton />
                </div>
            </div>
        </div>
    );
};

export default EditorSkeletonView;
