"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Type,
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Image as ImageIcon,
    Bot,
    Layout,
    BookOpen,
    FileText,
    PlusCircle,
    Hash,
    Maximize,
    Info,
    Sigma,
    HelpCircle,
    Eye,
    Code
} from 'lucide-react';

interface SlashCommand {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    action: () => void;
    category: string;
}

interface SlashMenuProps {
    position: { top: number; left: number };
    onClose: () => void;
    onSelect: (command: SlashCommand) => void;
    filter: string;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({
    position,
    onClose,
    onSelect,
    filter
}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);

    const commands: SlashCommand[] = [
        {
            id: 'h1',
            label: 'Titre 1',
            description: 'Grand titre de section',
            icon: <Heading1 size={18} />,
            action: () => { },
            category: 'Formatage'
        },
        {
            id: 'h2',
            label: 'Titre 2',
            description: 'Sous-titre moyen',
            icon: <Heading2 size={18} />,
            action: () => { },
            category: 'Formatage'
        },
        {
            id: 'ul',
            label: 'Liste à puces',
            description: 'Liste non-ordonnée simple',
            icon: <List size={18} />,
            action: () => { },
            category: 'Formatage'
        },
        {
            id: 'ol',
            label: 'Liste numérotée',
            description: 'Liste ordonnée séquentielle',
            icon: <ListOrdered size={18} />,
            action: () => { },
            category: 'Formatage'
        },
        {
            id: 'image',
            label: 'Image',
            description: 'Insérer une image depuis votre PC',
            icon: <ImageIcon size={18} />,
            action: () => { }, // Sera géré par le parent
            category: 'Média'
        },
        {
            id: 'ai',
            label: 'Assistant IA',
            description: 'Demander à l\'IA de rédiger',
            icon: <Bot size={18} />,
            action: () => { }, // Sera géré par le parent
            category: 'Avancé'
        },
        {
            id: 'part',
            label: 'Nouvelle Partie',
            description: 'Ajouter une Part structurelle',
            icon: <Layout size={18} />,
            action: () => { }, // Sera géré par le parent
            category: 'Structure'
        },
        {
            id: 'chapter',
            label: 'Nouveau Chapitre',
            description: 'Ajouter un Chapitre au plan',
            icon: <BookOpen size={18} />,
            action: () => { }, // Sera géré par le parent
            category: 'Structure'
        },
        {
            id: 'notion',
            label: 'Nouvelle Notion',
            description: 'Ajouter un grain de contenu',
            icon: <FileText size={18} />,
            action: () => { }, // Sera géré par le parent
            category: 'Structure'
        },
        {
            id: 'capture',
            label: 'Zone de Capture',
            description: 'Encadré pour capture d\'écran',
            icon: <Maximize size={18} />,
            action: () => { }, // Sera géré par le parent
            category: 'Design'
        },
        {
            id: 'note',
            label: 'Bloc Note',
            description: 'Encadré bleu pour remarques',
            icon: <Info size={18} />,
            action: () => { }, // Sera géré par le parent
            category: 'Design'
        },
        {
            id: 'math',
            label: 'Mathématiques',
            description: 'Formule LaTeX (KaTeX)',
            icon: <Sigma size={18} />,
            action: () => { }, // Sera géré par le parent
            category: 'Pédagogie'
        },
        {
            id: 'quiz',
            label: 'Quiz Rapide',
            description: 'Question à choix multiples',
            icon: <HelpCircle size={18} />,
            action: () => { }, // Sera géré par le parent
            category: 'Pédagogie'
        },
        {
            id: 'hint',
            label: 'Indice / Découverte',
            description: 'Bloc pliable pour révéler des infos',
            icon: <Eye size={18} />,
            action: () => { }, // Sera géré par le parent
            category: 'Pédagogie'
        },
        {
            id: 'code',
            label: 'Code Interactif',
            description: 'Bloc de code avec exécution',
            icon: <Code size={18} />,
            action: () => { }, // Sera géré par le parent
            category: 'Pédagogie'
        }
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(filter.toLowerCase()) ||
        cmd.category.toLowerCase().includes(filter.toLowerCase())
    );

    useEffect(() => {
        setSelectedIndex(0);
    }, [filter]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    onSelect(filteredCommands[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredCommands, selectedIndex, onSelect, onClose]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    if (filteredCommands.length === 0) return null;

    return (
        <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-[999] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden w-72 max-h-[384px] flex flex-col"
            style={{
                top: position.top + 400 > (typeof window !== 'undefined' ? window.innerHeight : 1000)
                    ? Math.max(10, position.top - 400)
                    : position.top + 25,
                left: Math.min(position.left, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 300),
            }}
        >
            <div className="p-2 bg-gray-50/50 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Actions Rapides</span>
            </div>

            <div className="overflow-y-auto py-1 custom-scrollbar">
                {filteredCommands.map((cmd, index) => (
                    <button
                        key={cmd.id}
                        className={`w-full px-3 py-2.5 flex items-start gap-3 transition-colors text-left ${index === selectedIndex ? 'bg-[#99334C15] border-l-2 border-[#99334C]' : 'border-l-2 border-transparent hover:bg-gray-50'
                            }`}
                        onClick={() => onSelect(cmd)}
                        onMouseEnter={() => setSelectedIndex(index)}
                    >
                        <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-[#99334C] text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {cmd.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-semibold ${index === selectedIndex ? 'text-[#99334C]' : 'text-gray-700'}`}>
                                    {cmd.label}
                                </span>
                                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase font-medium">
                                    {cmd.category}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                {cmd.description}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            <div className="p-2 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <kbd className="bg-white border border-gray-200 px-1 rounded shadow-sm">↑↓</kbd> Naviguer
                    <kbd className="bg-white border border-gray-200 px-1 rounded shadow-sm">⏎</kbd> Choisir
                </span>
            </div>
        </motion.div>
    );
};
