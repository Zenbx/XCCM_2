"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle2, AlertCircle, Lightbulb, Sparkles, Plus, RefreshCw } from 'lucide-react';
import { socraticService, SocraticAuditResult } from '@/services/socraticService';
import TactileButton from '../../UI/TactileButton';
import GlassPanel from '../../UI/GlassPanel';

interface SocraticPanelProps {
    content: string;
}

const SocraticPanel = ({ content }: SocraticPanelProps) => {
    const [audit, setAudit] = useState<SocraticAuditResult | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [lastAuditedContent, setLastAuditedContent] = useState('');

    const runAudit = async () => {
        if (!content || content === lastAuditedContent) return;

        setIsAuditing(true);
        try {
            const result = await socraticService.auditContent(content);
            setAudit(result);
            setLastAuditedContent(content);
        } catch (error) {
            console.error('Audit failed:', error);
        } finally {
            setIsAuditing(false);
        }
    };

    // Auto-audit on content change (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (content && content.length > 50) {
                runAudit();
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [content]);

    if (!content) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <Brain size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Sélectionnez ou écrivez du contenu pour lancer l'audit Socratique.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header with Pulse */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-raspberry/10 text-raspberry ${isAuditing ? 'animate-pulse' : ''}`}>
                        <Brain size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Audit Socratique</h4>
                        <p className="text-xs text-gray-500 italic">Par Intelligence Artificielle</p>
                    </div>
                </div>
                <TactileButton
                    onClick={runAudit}
                    className="p-2 text-gray-400 hover:text-raspberry transition-colors"
                >
                    <RefreshCw size={16} className={isAuditing ? 'animate-spin' : ''} />
                </TactileButton>
            </div>

            <AnimatePresence mode="wait">
                {isAuditing && !audit ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        <div className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
                        <div className="h-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
                    </motion.div>
                ) : audit ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Scores */}
                        <div className="grid grid-cols-2 gap-3">
                            <GlassPanel className="p-4 text-center">
                                <span className="block text-2xl font-black text-raspberry">{audit.clarityScore}%</span>
                                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Clarté</span>
                            </GlassPanel>
                            <GlassPanel className="p-4 text-center">
                                <span className="block text-sm font-bold text-gray-900 dark:text-white truncate">{audit.bloomLevel}</span>
                                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Taxonomie</span>
                            </GlassPanel>
                        </div>

                        {/* Suggestions */}
                        <div className="space-y-3">
                            <h5 className="text-xs font-black uppercase text-gray-400 flex items-center gap-2">
                                <Lightbulb size={14} className="text-yellow-500" />
                                Conseils de Socrate
                            </h5>
                            {audit.suggestions.map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 flex gap-3"
                                >
                                    <Sparkles size={16} className="text-raspberry shrink-0 mt-0.5" />
                                    {s}
                                </motion.div>
                            ))}
                        </div>

                        {/* Recommendations */}
                        {audit.recommendedBlocks.length > 0 && (
                            <div className="space-y-3">
                                <h5 className="text-xs font-black uppercase text-gray-400 flex items-center gap-2">
                                    <Plus size={14} className="text-raspberry" />
                                    Blocs Suggérés
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                    {audit.recommendedBlocks.map((block, i) => (
                                        <TactileButton
                                            key={i}
                                            className="px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium flex items-center gap-2 hover:border-raspberry hover:text-raspberry transition-colors"
                                        >
                                            <span className="capitalize">{block}</span>
                                            <Plus size={12} />
                                        </TactileButton>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};

export default SocraticPanel;
