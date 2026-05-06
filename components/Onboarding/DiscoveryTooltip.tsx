'use client';

/**
 * DiscoveryTooltip — "new feature" badge + popover
 *
 * Wraps any element and overlays a pulsing dot when the feature hasn't been
 * seen yet. Hovering reveals a small popover card. Interacting (click or
 * hover-leave after first reveal) dismisses permanently via onboardingService.
 */

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useDiscovery } from '@/hooks/useDiscovery';

interface DiscoveryTooltipProps {
    featureId: string;
    title: string;
    description: string;
    /** Where the popover should appear relative to the trigger. Default: 'top' */
    placement?: 'top' | 'bottom' | 'left' | 'right';
    /** Accent color for badge + popover top bar. Default: '#99334C' */
    accentColor?: string;
    children: ReactNode;
}

const OFFSET = 10; // px gap between trigger and popover

export const DiscoveryTooltip: React.FC<DiscoveryTooltipProps> = ({
    featureId,
    title,
    description,
    placement = 'top',
    accentColor = '#99334C',
    children,
}) => {
    const { isNew, dismiss } = useDiscovery(featureId);
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Auto-dismiss after 8s once opened
    useEffect(() => {
        if (!open) return;
        const t = setTimeout(dismiss, 8000);
        return () => clearTimeout(t);
    }, [open, dismiss]);

    // Close popover when user clicks outside
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                dismiss();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open, dismiss]);

    if (!isNew) return <>{children}</>;

    const popoverMotion = {
        top: { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 6 } },
        bottom: { initial: { opacity: 0, y: -6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } },
        left: { initial: { opacity: 0, x: 6 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 6 } },
        right: { initial: { opacity: 0, x: -6 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -6 } },
    }[placement];

    const popoverStyle: React.CSSProperties = (() => {
        switch (placement) {
            case 'top':    return { bottom: `calc(100% + ${OFFSET}px)`, left: '50%', transform: 'translateX(-50%)' };
            case 'bottom': return { top: `calc(100% + ${OFFSET}px)`, left: '50%', transform: 'translateX(-50%)' };
            case 'left':   return { right: `calc(100% + ${OFFSET}px)`, top: '50%', transform: 'translateY(-50%)' };
            case 'right':  return { left: `calc(100% + ${OFFSET}px)`, top: '50%', transform: 'translateY(-50%)' };
        }
    })();

    return (
        <div ref={wrapperRef} className="relative inline-flex">
            {/* Original element */}
            <div
                onMouseEnter={() => setOpen(true)}
                onFocus={() => setOpen(true)}
            >
                {children}
            </div>

            {/* Pulsing badge dot */}
            <span
                aria-label="Nouvelle fonctionnalité"
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full pointer-events-none z-10"
                style={{ backgroundColor: accentColor }}
            >
                <span
                    className="absolute inset-0 rounded-full animate-ping opacity-75"
                    style={{ backgroundColor: accentColor }}
                />
            </span>

            {/* Popover card */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        role="tooltip"
                        aria-live="polite"
                        {...popoverMotion}
                        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                        style={{ ...popoverStyle, position: 'absolute', zIndex: 9990, width: 240 }}
                        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                    >
                        {/* Accent bar */}
                        <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}55)` }} />

                        <div className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: accentColor }} aria-hidden="true" />
                                    <span
                                        className="text-[10px] font-black uppercase tracking-widest"
                                        style={{ color: accentColor }}
                                    >
                                        Nouveau
                                    </span>
                                </div>
                                <button
                                    onClick={dismiss}
                                    aria-label="Fermer"
                                    className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors -mt-0.5"
                                >
                                    <X className="w-3 h-3 text-gray-400" aria-hidden="true" />
                                </button>
                            </div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">{title}</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DiscoveryTooltip;
