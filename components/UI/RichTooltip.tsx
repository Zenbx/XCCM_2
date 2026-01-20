"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface RichTooltipProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    shortcut?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

const RichTooltip: React.FC<RichTooltipProps> = ({
    children,
    title,
    description,
    shortcut,
    position = 'bottom',
    delay = 400,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [actualPosition, setActualPosition] = useState(position);
    const [arrowOffset, setArrowOffset] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const updatePosition = useCallback(() => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const tooltipWidth = 256;
        const tooltipHeight = 120; // Estimated max height
        const gap = 12;
        const screenPadding = 8;

        let newPos = position;

        // --- 1. Smart Flip Logic ---
        if (position === 'bottom' && rect.bottom + tooltipHeight + gap > window.innerHeight) {
            newPos = 'top';
        } else if (position === 'top' && rect.top - tooltipHeight - gap < 0) {
            newPos = 'bottom';
        }

        if (position === 'right' && rect.right + tooltipWidth + gap > window.innerWidth) {
            newPos = 'left';
        } else if (position === 'left' && rect.left - tooltipWidth - gap < 0) {
            newPos = 'right';
        }

        // --- 2. Initial Coordinate Calculation (Top-Left corner of tooltip) ---
        let top = 0;
        let left = 0;

        switch (newPos) {
            case 'top':
                top = rect.top - gap - tooltipHeight; // Start with estimated height
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                break;
            case 'bottom':
                top = rect.bottom + gap;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                break;
            case 'left':
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.left - gap - tooltipWidth;
                break;
            case 'right':
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.right + gap;
                break;
        }

        // --- 3. Horizontal Nudging (for Top/Bottom) ---
        let offset = 0;
        if (newPos === 'top' || newPos === 'bottom') {
            const minLeft = screenPadding;
            const maxLeft = window.innerWidth - tooltipWidth - screenPadding;

            const originalLeft = left;
            left = Math.max(minLeft, Math.min(left, maxLeft));
            offset = originalLeft - left; // How much we nudged
        }

        // --- 4. Vertical Adjustment for Side Tooltips ---
        if (newPos === 'left' || newPos === 'right') {
            const minTop = screenPadding;
            const maxTop = window.innerHeight - tooltipHeight - screenPadding;
            top = Math.max(minTop, Math.min(top, maxTop));
        }

        setCoords({ top, left });
        setActualPosition(newPos);
        setArrowOffset(offset);
    }, [position]);

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => {
            updatePosition();
            setIsVisible(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    const variants = {
        top: { initial: { opacity: 0, scale: 0.95, y: 10 }, animate: { opacity: 1, scale: 1, y: 0 } },
        bottom: { initial: { opacity: 0, scale: 0.95, y: -10 }, animate: { opacity: 1, scale: 1, y: 0 } },
        left: { initial: { opacity: 0, scale: 0.95, x: 10 }, animate: { opacity: 1, scale: 1, x: 0 } },
        right: { initial: { opacity: 0, scale: 0.95, x: -10 }, animate: { opacity: 1, scale: 1, x: 0 } },
    };

    return (
        <div
            ref={containerRef}
            className="inline-flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {mounted && createPortal(
                <AnimatePresence mode="wait">
                    {isVisible && (
                        <motion.div
                            initial={variants[actualPosition].initial}
                            animate={variants[actualPosition].animate}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.1, ease: "easeOut" }}
                            style={{
                                position: 'fixed',
                                top: coords.top,
                                left: coords.left,
                                width: '256px',
                                pointerEvents: 'none',
                                zIndex: 999999,
                            }}
                            className="bg-white border border-gray-200 shadow-2xl rounded-xl p-3"
                        >
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center bg-gray-50 -m-3 p-3 rounded-t-xl border-b border-gray-100 mb-2">
                                    <span className="font-bold text-gray-900 text-sm whitespace-nowrap overflow-hidden text-ellipsis mr-2">{title}</span>
                                    {shortcut && (
                                        <span className="text-[10px] font-mono bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0">
                                            {shortcut}
                                        </span>
                                    )}
                                </div>
                                {description && (
                                    <p className="text-xs text-gray-500 leading-relaxed font-normal p-1">
                                        {description}
                                    </p>
                                )}
                            </div>

                            {/* Arrow with offset correction */}
                            <div
                                className={`absolute w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45 transition-all duration-200 ${actualPosition === 'bottom' ? '-top-1.5' :
                                        actualPosition === 'top' ? '-bottom-1.5 rotate-[225deg]' :
                                            actualPosition === 'left' ? '-right-1.5 top-1/2 -translate-y-1/2 rotate-[135deg]' :
                                                '-left-1.5 top-1/2 -translate-y-1/2 rotate-[315deg]'
                                    }`}
                                style={
                                    actualPosition === 'top' || actualPosition === 'bottom'
                                        ? { left: `calc(50% + ${arrowOffset}px)`, transform: `translateX(-50%) rotate(${actualPosition === 'top' ? '225deg' : '45deg'})` }
                                        : undefined
                                }
                            />
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default RichTooltip;
