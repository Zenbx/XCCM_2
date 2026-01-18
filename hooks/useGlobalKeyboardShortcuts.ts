"use client";

import { useEffect } from 'react';
import { useCommandPalette } from '@/hooks/useCommandPalette';

export function useGlobalKeyboardShortcuts() {
    const { toggle } = useCommandPalette();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K or Ctrl+K to open command palette
            // Using e.key.toLowerCase() for robustness
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                console.log("⌨️ Command Palette shortcut triggered");
                toggle();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggle]);
}
