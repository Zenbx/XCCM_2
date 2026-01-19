import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Info } from 'lucide-react';
import { BloomScore } from '@/hooks/useSocraticAnalysis';
import RichTooltip from '../UI/RichTooltip';

export const BloomMeter = ({ score }: { score: BloomScore | null }) => {
    if (!score) return null;

    const levels = [
        { name: 'Remember', value: score.remember, color: '#93c5fd', label: 'Rappel' },     // blue-300
        { name: 'Understand', value: score.understand, color: '#a5b4fc', label: 'Compr.' }, // indigo-300
        { name: 'Apply', value: score.apply, color: '#c4b5fd', label: 'Appli.' },           // violet-300
        { name: 'Analyze', value: score.analyze, color: '#f9a8d4', label: 'Anal.' },        // pink-300
        { name: 'Evaluate', value: score.evaluate, color: '#fda4af', label: 'Éval.' },      // rose-300
        { name: 'Create', value: score.create, color: '#fbbf24', label: 'Créa.' },          // amber-400
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    📊 Taxonomie de Bloom
                    <RichTooltip title="Taxonomie de Bloom" description="Évalue la complexité cognitive de votre contenu. Visez les niveaux supérieurs (Analyser, Créer) pour un apprentissage plus profond.">
                        <Info size={14} className="text-gray-400 cursor-help" />
                    </RichTooltip>
                </h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                    Niveau : {score.dominant}
                </span>
            </div>

            <div className="space-y-2">
                {levels.map(level => (
                    <div key={level.name} className="flex items-center gap-2 text-xs">
                        <span className="w-12 text-gray-500 dark:text-gray-400">{level.label}</span>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: level.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${level.value}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                        <span className="w-8 text-right font-medium text-gray-600 dark:text-gray-300">{level.value}%</span>
                    </div>
                ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 flex gap-2">
                <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="italic">{score.recommendation}</p>
            </div>
        </div>
    );
};
