"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Command,
    Save,
    Eye,
    Share2,
    Download,
    Plus,
    Layout,
    BookOpen,
    FileText,
    Bot
} from 'lucide-react';

interface CommandItem {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    category: string;
    shortcut?: string;
    action: () => void;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    commands: CommandItem[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
    isOpen,
    onClose,
    commands
}) => {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredCommands, selectedIndex, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 flex items-start justify-center pt-24 z-[1001] pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden pointer-events-auto"
                        >
                            <div className="flex items-center px-4 py-4 border-b border-gray-100">
                                <Search className="w-5 h-5 text-gray-400 mr-3" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Tapez une commande ou recherchez une action..."
                                    className="w-full bg-transparent border-none focus:outline-none text-gray-800 text-lg"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-gray-400 text-xs font-mono ml-2">
                                    <Command size={12} />
                                    <span>K</span>
                                </div>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto py-2 custom-scrollbar">
                                {filteredCommands.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <p>Aucun résultat pour "{query}"</p>
                                    </div>
                                ) : (
                                    Object.entries(
                                        filteredCommands.reduce((acc, cmd) => {
                                            if (!acc[cmd.category]) acc[cmd.category] = [];
                                            acc[cmd.category].push(cmd);
                                            return acc;
                                        }, {} as Record<string, CommandItem[]>)
                                    ).map(([category, items]) => (
                                        <div key={category}>
                                            <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                                                {category}
                                            </div>
                                            {items.map((cmd) => {
                                                const globalIndex = filteredCommands.findIndex(c => c.id === cmd.id);
                                                return (
                                                    <button
                                                        key={cmd.id}
                                                        className={`w-full px-4 py-3 flex items-center justify-between text-left transition-all ${globalIndex === selectedIndex ? 'bg-[#99334C10] border-l-4 border-[#99334C]' : 'border-l-4 border-transparent hover:bg-gray-50'
                                                            }`}
                                                        onClick={() => {
                                                            cmd.action();
                                                            onClose();
                                                        }}
                                                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${globalIndex === selectedIndex ? 'bg-[#99334C] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                                {cmd.icon}
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-semibold ${globalIndex === selectedIndex ? 'text-[#99334C]' : 'text-gray-700'}`}>
                                                                    {cmd.label}
                                                                </p>
                                                                <p className="text-xs text-gray-500">{cmd.description}</p>
                                                            </div>
                                                        </div>
                                                        {cmd.shortcut && (
                                                            <div className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                                                                {cmd.shortcut}
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
                                <div className="flex gap-4">
                                    <span className="flex items-center gap-1">
                                        <kbd className="bg-white border border-gray-200 px-1 rounded shadow-sm">↑↓</kbd> Naviguer
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="bg-white border border-gray-200 px-1 rounded shadow-sm">⏎</kbd> Exécuter
                                    </span>
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
