/**
 * NotionMentionPicker
 * A searchable modal that appears when the author types /refnotion in the editor.
 * It fetches all notions of the current project, lets the author pick one,
 * and inserts a <a data-type="notion-mention"> anchor into the TipTap content.
 */
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Link, X, Hash } from 'lucide-react';

interface FlatNotion {
    notion_id: string;
    notion_name: string;
    para_name: string;
    chapter_title: string;
    part_title: string;
}

interface NotionMentionPickerProps {
    isOpen: boolean;
    onClose: () => void;
    /** Called with the chosen notion so the editor can insert the cross-ref node */
    onSelect: (notion: FlatNotion) => void;
    /** All notions pre-flattened from the TOC store to avoid extra API calls */
    notions: FlatNotion[];
}

export const NotionMentionPicker: React.FC<NotionMentionPickerProps> = ({
    isOpen,
    onClose,
    onSelect,
    notions,
}) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = notions.filter(n =>
        n.notion_name.toLowerCase().includes(query.toLowerCase()) ||
        n.para_name.toLowerCase().includes(query.toLowerCase()) ||
        n.chapter_title.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => { setSelectedIndex(0); }, [query]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[selectedIndex]) { onSelect(filtered[selectedIndex]); onClose(); }
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [isOpen, filtered, selectedIndex, onSelect, onClose]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1100]"
                        onClick={onClose}
                    />
                    {/* Panel */}
                    <div className="fixed inset-0 flex items-start justify-center pt-20 z-[1101] pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                                <div className="p-2 bg-[#99334C]/10 rounded-lg">
                                    <Link className="w-4 h-4 text-[#99334C]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-gray-800 dark:text-white">Lier une Notion</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Les lecteurs seront redirigés vers cette notion au clic</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Chercher une notion..."
                                    className="w-full bg-transparent border-none focus:outline-none text-gray-800 dark:text-white text-sm"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                />
                            </div>

                            {/* List */}
                            <div className="max-h-72 overflow-y-auto custom-scrollbar py-2">
                                {filtered.length === 0 ? (
                                    <div className="p-6 text-center text-gray-400 text-sm">
                                        Aucune notion trouvée pour "{query}"
                                    </div>
                                ) : (
                                    filtered.map((notion, index) => (
                                        <button
                                            key={notion.notion_id}
                                            onClick={() => { onSelect(notion); onClose(); }}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-all border-l-2 ${index === selectedIndex
                                                    ? 'bg-[#99334C10] dark:bg-[#99334C20] border-[#99334C]'
                                                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${index === selectedIndex ? 'bg-[#99334C] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                                <Hash size={12} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`text-sm font-semibold truncate ${index === selectedIndex ? 'text-[#99334C]' : 'text-gray-800 dark:text-white'}`}>
                                                    {notion.notion_name}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {notion.part_title} › {notion.chapter_title} › {notion.para_name}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 flex justify-between items-center text-[10px] text-gray-400">
                                <div className="flex gap-3">
                                    <span><kbd className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-1 rounded shadow-sm">↑↓</kbd> Naviguer</span>
                                    <span><kbd className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-1 rounded shadow-sm">⏎</kbd> Insérer</span>
                                </div>
                                <span>ESC pour fermer</span>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
