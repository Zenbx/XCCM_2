'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Traps keyboard focus inside the returned containerRef when isActive is true.
 * Restores focus to the previously focused element on cleanup.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(isActive: boolean) {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (!isActive || !ref.current) return;

        const container = ref.current;
        const previouslyFocused = document.activeElement as HTMLElement | null;

        // Move focus into the dialog
        const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE);
        focusable[0]?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            const els = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
            if (els.length === 0) return;
            const first = els[0];
            const last = els[els.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            previouslyFocused?.focus();
        };
    }, [isActive]);

    return ref;
}
