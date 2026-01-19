import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, X, Check, Loader2, Sparkles } from 'lucide-react';
import { PedagogicalFeedback, BloomScore } from '@/hooks/useSocraticAnalysis';
import { BloomMeter } from './BloomMeter';

interface SocraticPanelProps {
    feedback: PedagogicalFeedback[];
    bloomScore: BloomScore | null;
    isAnalyzing: boolean;
    onApplySuggestion: (feedbackId: string, suggestion: string) => void;
    onDismissFeedback: (feedbackId: string) => void;
    isVisible: boolean;
    onClose: () => void;
}

export const SocraticPanel = ({
    feedback,
    bloomScore,
    isAnalyzing,
    onApplySuggestion,
    onDismissFeedback,
    isVisible,
    onClose
}: SocraticPanelProps) => {

    const getIcon = (severity: string) => {
        switch (severity) {
            case 'error': return <AlertTriangle size={16} className="text-red-500" />;
            case 'warning': return <AlertCircle size={16} className="text-orange-500" />;
            default: return <Info size={16} className="text-yellow-500" />;
        }
    };

    const getBgColor = (severity: string) => {
        switch (severity) {
            case 'error': return 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30';
            case 'warning': return 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30';
            default: return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/30';
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="fixed right-4 top-24 bottom-4 w-80 bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-800 z-40 flex flex-col rounded-xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                        <div className="flex items-center gap-2">
                            <Sparkles className="text-[#99334C]" size={18} />
                            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Socratic AI</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {isAnalyzing && <Loader2 size={16} className="animate-spin text-gray-400" />}
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">

                        {/* Bloom Meter Section */}
                        {bloomScore ? (
                            <BloomMeter score={bloomScore} />
                        ) : isAnalyzing ? (
                            <div className="h-32 flex items-center justify-center text-gray-400 text-sm italic border border-dashed rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                Analyse cognitive en cours...
                            </div>
                        ) : (
                            <div className="h-24 flex items-center justify-center text-gray-400 text-sm border border-dashed rounded-lg">
                                En attente de contenu...
                            </div>
                        )}

                        {/* Suggestions List */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center justify-between">
                                <span>Suggestions ({feedback.length})</span>
                                {feedback.length > 0 && (
                                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-500">
                                        {feedback.filter(f => f.severity === 'error').length} critiques
                                    </span>
                                )}
                            </h3>

                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {feedback.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className={`p-3 rounded-lg border text-sm ${getBgColor(item.severity)}`}
                                        >
                                            <div className="flex items-start gap-2 mb-2">
                                                <span className="mt-0.5 text-gray-400">{getIcon(item.severity)}</span>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800 dark:text-gray-100 mb-1 leading-snug">
                                                        {item.comment}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-mono bg-white/50 dark:bg-black/20 p-1 rounded mb-2 line-clamp-2">
                                                        "{item.text}"
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => onDismissFeedback(item.id)}
                                                    className="text-gray-400 hover:text-gray-600 p-0.5"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>

                                            {item.suggestions.length > 0 && (
                                                <div className="ml-6 space-y-1.5">
                                                    {item.suggestions.map((sug, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => onApplySuggestion(item.id, sug)}
                                                            className="flex items-center gap-2 text-xs w-full text-left p-1.5 hover:bg-white/80 dark:hover:bg-black/30 rounded transition-colors text-gray-700 dark:text-gray-300 group"
                                                        >
                                                            <span className="shrink-0 w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center bg-white dark:bg-gray-800 group-hover:border-[#99334C]">
                                                                <Sparkles size={8} className="text-[#99334C] opacity-0 group-hover:opacity-100" />
                                                            </span>
                                                            {sug}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}

                                    {feedback.length === 0 && !isAnalyzing && bloomScore && (
                                        <div className="text-center py-8 text-gray-400">
                                            <Check className="mx-auto mb-2 text-green-500 opacity-50" size={32} />
                                            <p>Aucun problème détecté.</p>
                                            <p className="text-xs">Excellent travail pédagogique !</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
