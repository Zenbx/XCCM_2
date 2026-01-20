"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Command } from '@/hooks/useCommandPalette';
import { ChevronRight } from 'lucide-react';

interface CommandItemProps {
    command: Command;
    isSelected: boolean;
    onClick: () => void;
}

const CommandItem: React.FC<CommandItemProps> = ({ command, isSelected, onClick }) => {
    return (
        <motion.button
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isSelected
                    ? 'bg-[#99334C]/10 dark:bg-[#99334C]/20 text-[#99334C] dark:text-[#ff9daf]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            onClick={onClick}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.15 }}
        >
            {command.icon && (
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {command.icon}
                </div>
            )}

            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{command.label}</div>
                {command.keywords.length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {command.keywords.slice(0, 2).join(', ')}
                    </div>
                )}
            </div>

            {command.shortcut && (
                <div className="flex-shrink-0 flex items-center gap-1">
                    {command.shortcut.split('+').map((key, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && <span className="text-gray-400">+</span>}
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                                {key}
                            </kbd>
                        </React.Fragment>
                    ))}
                </div>
            )}

            {isSelected && (
                <ChevronRight size={16} className="flex-shrink-0 text-[#99334C] dark:text-[#ff9daf]" />
            )}
        </motion.button>
    );
};

export default CommandItem;
