"use client";

import React from 'react';
import { Trophy, Target } from 'lucide-react';

interface ProgressBarProps {
    completed: number;
    total: number;
    percentage: number;
    attempted: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total, percentage, attempted }) => {
    if (total === 0) return null;

    const getColor = () => {
        if (percentage >= 80) return { bar: 'bg-green-500', glow: 'shadow-green-500/30', text: 'text-green-600', bg: 'bg-green-50' };
        if (percentage >= 50) return { bar: 'bg-amber-500', glow: 'shadow-amber-500/30', text: 'text-amber-600', bg: 'bg-amber-50' };
        if (percentage > 0) return { bar: 'bg-[#99334C]', glow: 'shadow-[#99334C]/30', text: 'text-[#99334C]', bg: 'bg-[#99334C]/5' };
        return { bar: 'bg-gray-300', glow: '', text: 'text-gray-500', bg: 'bg-gray-50' };
    };

    const color = getColor();

    return (
        <div className={`sticky top-[73px] z-20 ${color.bg} border-b border-gray-200 px-4 py-2.5 print:hidden`}>
            <div className="max-w-4xl mx-auto flex items-center gap-4">
                {/* Icon */}
                <div className={`flex items-center gap-1.5 ${color.text} flex-shrink-0`}>
                    {percentage >= 100 ? (
                        <Trophy className="w-4 h-4" />
                    ) : (
                        <Target className="w-4 h-4" />
                    )}
                    <span className="text-xs font-bold">
                        {percentage >= 100 ? 'Terminé !' : 'Progression'}
                    </span>
                </div>

                {/* Bar */}
                <div className="flex-1 h-2.5 bg-white/80 rounded-full overflow-hidden border border-gray-200/50">
                    <div
                        className={`h-full ${color.bar} rounded-full transition-all duration-700 ease-out ${color.glow} shadow-lg`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-sm font-bold ${color.text}`}>
                        {percentage}%
                    </span>
                    <span className="text-[10px] text-gray-400">
                        {completed}/{total} exercices
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
