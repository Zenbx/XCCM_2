"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Link,
    Highlighter,
    Palette,
    AlignLeft,
    AlignCenter,
    AlignRight
} from 'lucide-react';

interface FloatingToolbarProps {
    isVisible: boolean;
    position: { top: number; left: number };
    onFormat: (command: string, value?: string) => void;
    activeFormats: {
        bold: boolean;
        italic: boolean;
        underline: boolean;
        strikethrough: boolean;
    };
}

import GlassPanel from '../UI/GlassPanel';

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
    isVisible,
    position,
    onFormat,
    activeFormats
}) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <GlassPanel
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="fixed z-[998] rounded-full p-1 flex items-center gap-0.5"
                    style={{
                        top: position.top - 50, // Positioned above selection
                        left: position.left,
                        transform: 'translateX(-50%)'
                    }}
                    intensity="medium"
                    blur="md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => onFormat('bold')}
                        className={`p-2 rounded-full transition-colors ${activeFormats.bold ? 'bg-[#99334C] text-white shadow-inner' : 'hover:bg-[#99334C]/10 text-gray-700 dark:text-gray-200'}`}
                        title="Gras (Ctrl+B)"
                    >
                        <Bold size={16} />
                    </button>

                    <button
                        onClick={() => onFormat('italic')}
                        className={`p-2 rounded-full transition-colors ${activeFormats.italic ? 'bg-[#99334C] text-white shadow-inner' : 'hover:bg-[#99334C]/10 text-gray-700 dark:text-gray-200'}`}
                        title="Italique (Ctrl+I)"
                    >
                        <Italic size={16} />
                    </button>

                    <button
                        onClick={() => onFormat('underline')}
                        className={`p-2 rounded-full transition-colors ${activeFormats.underline ? 'bg-[#99334C] text-white shadow-inner' : 'hover:bg-[#99334C]/10 text-gray-700 dark:text-gray-200'}`}
                        title="Souligné (Ctrl+U)"
                    >
                        <Underline size={16} />
                    </button>

                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                    <button
                        onClick={() => onFormat('foreColor', '#99334C')}
                        className="p-2 hover:bg-[#99334C]/10 text-[#99334C] dark:text-[#ff4d7d] rounded-full transition-colors"
                        title="Couleur Thème"
                    >
                        <Palette size={16} />
                    </button>

                    <button
                        onClick={() => onFormat('hiliteColor', '#FFF9C4')}
                        className="p-2 hover:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full transition-colors"
                        title="Surligner"
                    >
                        <Highlighter size={16} />
                    </button>

                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                    <button
                        onClick={() => onFormat('justifyLeft')}
                        className="p-2 hover:bg-[#99334C]/10 text-gray-700 dark:text-gray-200 rounded-full transition-colors"
                        title="Aligner à gauche"
                    >
                        <AlignLeft size={16} />
                    </button>

                    <button
                        onClick={() => onFormat('justifyCenter')}
                        className="p-2 hover:bg-[#99334C]/10 text-gray-700 dark:text-gray-200 rounded-full transition-colors"
                        title="Centrer"
                    >
                        <AlignCenter size={16} />
                    </button>

                    <button
                        onClick={() => onFormat('justifyRight')}
                        className="p-2 hover:bg-[#99334C]/10 text-gray-700 dark:text-gray-200 rounded-full transition-colors"
                        title="Aligner à droite"
                    >
                        <AlignRight size={16} />
                    </button>
                </GlassPanel>
            )}
        </AnimatePresence>
    );
};
