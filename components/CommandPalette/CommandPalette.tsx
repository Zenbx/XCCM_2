"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useCommandPalette, filterCommands } from '@/hooks/useCommandPalette';
import CommandItem from './CommandItem';

const CommandPalette: React.FC = () => {
    const { isOpen, commands, recentCommands, close, addToRecent } = useCommandPalette();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const filteredCommands = filterCommands(commands, query);
    const recentCommandObjects = commands.filter((cmd) => recentCommands.includes(cmd.id));

    const displayCommands = query.trim() ? filteredCommands : recentCommandObjects.length > 0 ? recentCommandObjects : commands;

    // Group commands by category
    const groupedCommands = displayCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = [];
        acc[cmd.category].push(cmd);
        return acc;
    }, {} as Record<string, typeof commands>);

    const categoryLabels = {
        navigation: 'Navigation',
        editor: 'Actions Éditeur',
        settings: 'Paramètres',
        help: 'Aide',
    };

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev + 1) % displayCommands.length);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev - 1 + displayCommands.length) % displayCommands.length);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (displayCommands[selectedIndex]) {
                        executeCommand(displayCommands[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    close();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, displayCommands, close]);

    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current) {
            const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
            selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [selectedIndex]);

    const executeCommand = (command: typeof commands[0]) => {
        addToRecent(command.id);
        command.action();
        close();
        setQuery('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                    />

                    {/* Command Palette */}
                    <motion.div
                        className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                            <Search size={20} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                placeholder="Rechercher une commande..."
                                className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none text-lg"
                            />
                            <button
                                onClick={close}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Commands List */}
                        <div
                            ref={listRef}
                            className="max-h-[60vh] overflow-y-auto custom-scrollbar"
                        >
                            {displayCommands.length === 0 ? (
                                <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <p className="text-sm">Aucune commande trouvée</p>
                                    <p className="text-xs mt-1">Essayez une autre recherche</p>
                                </div>
                            ) : (
                                Object.entries(groupedCommands).map(([category, cmds]) => (
                                    <div key={category} className="py-2">
                                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {categoryLabels[category as keyof typeof categoryLabels]}
                                        </div>
                                        {cmds.map((command, index) => {
                                            const globalIndex = displayCommands.indexOf(command);
                                            return (
                                                <CommandItem
                                                    key={command.id}
                                                    command={command}
                                                    isSelected={globalIndex === selectedIndex}
                                                    onClick={() => executeCommand(command)}
                                                />
                                            );
                                        })}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">↑↓</kbd>
                                    Naviguer
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">↵</kbd>
                                    Sélectionner
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">Esc</kbd>
                                    Fermer
                                </span>
                            </div>
                            <span>{displayCommands.length} commande{displayCommands.length > 1 ? 's' : ''}</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
