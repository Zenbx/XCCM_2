"use client";

import { useEffect } from 'react';
import { useCommandPalette } from '@/hooks/useCommandPalette';

export function useGlobalKeyboardShortcuts() {
    const { toggle, commands } = useCommandPalette();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K or Ctrl+K to open command palette
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                toggle();
            }

            // Alt+Z to toggle Zen Mode
            if (e.altKey && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                const zenCommand = commands.find(c => c.id === 'editor.zen');
                if (zenCommand) {
                    zenCommand.action();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggle, commands]);
}
