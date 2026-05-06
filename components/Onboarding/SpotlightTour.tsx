"use client";

/**
 * SpotlightTour — Game-style guided tour with animated spotlight
 *
 * Renders via React Portal on top of everything.
 * Uses an SVG mask to cut a transparent hole in the dark overlay,
 * revealing the target element. Springs animate the hole between steps.
 */

import React, { useEffect, useState, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import {
    motion,
    AnimatePresence,
    useMotionValue,
    useSpring,
} from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    X,
    Sparkles,
} from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const PADDING = 12;           // px around highlighted element
const TOOLTIP_WIDTH = 340;    // px
const TOOLTIP_GAP = 20;       // distance between target and tooltip
const SPRING = { stiffness: 380, damping: 32 };

// ─── Types ────────────────────────────────────────────────────────────────────

interface Rect { x: number; y: number; w: number; h: number; }
interface TooltipPos { top: number; left: number; placement: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function measureTarget(selector: string): Rect | null {
    if (!selector) return null;
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
        x: r.left - PADDING,
        y: r.top - PADDING,
        w: r.width + PADDING * 2,
        h: r.height + PADDING * 2,
    };
}

function calcTooltipPos(
    target: Rect | null,
    placement: string,
): TooltipPos {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

    if (!target || placement === 'center') {
        return {
            top: vh / 2 - 140,
            left: Math.max(16, vw / 2 - TOOLTIP_WIDTH / 2),
            placement: 'center',
        };
    }

    let top = 0;
    let left = 0;

    switch (placement) {
        case 'bottom':
            top = target.y + target.h + TOOLTIP_GAP;
            left = target.x + target.w / 2 - TOOLTIP_WIDTH / 2;
            break;
        case 'top':
            top = target.y - TOOLTIP_GAP - 230;
            left = target.x + target.w / 2 - TOOLTIP_WIDTH / 2;
            break;
        case 'right':
            top = target.y + target.h / 2 - 110;
            left = target.x + target.w + TOOLTIP_GAP;
            break;
        case 'left':
            top = target.y + target.h / 2 - 110;
            left = target.x - TOOLTIP_GAP - TOOLTIP_WIDTH;
            break;
        default:
            top = target.y + target.h + TOOLTIP_GAP;
            left = target.x + target.w / 2 - TOOLTIP_WIDTH / 2;
    }

    // Clamp to viewport
    left = Math.max(16, Math.min(left, vw - TOOLTIP_WIDTH - 16));
    top = Math.max(16, Math.min(top, vh - 260));

    return { top, left, placement };
}

// Arrow CSS classes per tooltip placement
function arrowClass(placement: string): string {
    switch (placement) {
        case 'bottom': return 'top-[-7px] left-1/2 -translate-x-1/2 border-b-white dark:border-b-gray-900';
        case 'top':    return 'bottom-[-7px] left-1/2 -translate-x-1/2 rotate-180 border-b-white dark:border-b-gray-900';
        case 'right':  return 'left-[-7px] top-1/2 -translate-y-1/2 -rotate-90 border-b-white dark:border-b-gray-900';
        case 'left':   return 'right-[-7px] top-1/2 -translate-y-1/2 rotate-90 border-b-white dark:border-b-gray-900';
        default:       return 'hidden';
    }
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SpotlightTour: React.FC = () => {
    const { activeTour, currentStep, nextStep, prevStep, endTour, isRunning } =
        useOnboarding();

    const [mounted, setMounted] = useState(false);
    const [targetRect, setTargetRect] = useState<Rect | null>(null);
    const [tooltipPos, setTooltipPos] = useState<TooltipPos>({ top: 0, left: 0, placement: 'center' });
    const [stepKey, setStepKey] = useState(0); // Forces tooltip re-animation

    // Unique mask ID per component instance (avoids conflicts)
    const uniqueId = useId().replace(/:/g, '');
    const maskId = `tour-mask-${uniqueId}`;

    // Spring-animated spotlight rect
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const mw = useMotionValue(200);
    const mh = useMotionValue(80);
    const sx = useSpring(mx, SPRING);
    const sy = useSpring(my, SPRING);
    const sw = useSpring(mw, SPRING);
    const sh = useSpring(mh, SPRING);

    useEffect(() => { setMounted(true); }, []);

    // Update spotlight and tooltip when step changes
    const applyStep = useCallback(() => {
        if (!activeTour) return;
        const step = activeTour.steps[currentStep];
        if (!step) return;

        const doMeasure = () => {
            if (!step.target || step.placement === 'center') {
                setTargetRect(null);
                setTooltipPos(calcTooltipPos(null, 'center'));
                setStepKey(k => k + 1);
                return;
            }

            const el = document.querySelector(step.target);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            // Measure after scroll settles
            setTimeout(() => {
                const r = measureTarget(step.target);
                setTargetRect(r);

                if (r) {
                    mx.set(r.x);
                    my.set(r.y);
                    mw.set(r.w);
                    mh.set(r.h);
                }

                setTooltipPos(calcTooltipPos(r, step.placement));
                setStepKey(k => k + 1);
            }, 160);
        };

        if (step.beforeShow) {
            step.beforeShow();
            setTimeout(doMeasure, 350);
        } else {
            doMeasure();
        }
    }, [activeTour, currentStep, mx, my, mw, mh]);

    useEffect(() => {
        if (isRunning) applyStep();
    }, [isRunning, applyStep]);

    // Re-measure on window resize
    useEffect(() => {
        if (!isRunning) return;
        const handler = () => applyStep();
        window.addEventListener('resize', handler, { passive: true });
        return () => window.removeEventListener('resize', handler);
    }, [isRunning, applyStep]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isRunning && activeTour && (() => {
                const step = activeTour.steps[currentStep];
                if (!step) return null;
                const accent = step.accentColor ?? '#99334C';
                const isFirst = currentStep === 0;
                const isLast = currentStep === activeTour.steps.length - 1;

                return (
                    <>
                        {/* ── SVG Overlay with Spotlight Hole ── */}
                        <motion.svg
                            key="tour-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100vw',
                                height: '100vh',
                                zIndex: 9997,
                                pointerEvents: 'all',
                            }}
                            aria-hidden="true"
                            onClick={endTour}
                        >
                            <defs>
                                <mask id={maskId}>
                                    {/* White = overlay visible; Black = overlay hidden (spotlight) */}
                                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                                    {targetRect && (
                                        <motion.rect
                                            style={{ x: sx, y: sy, width: sw, height: sh }}
                                            rx={14}
                                            ry={14}
                                            fill="black"
                                        />
                                    )}
                                </mask>
                            </defs>
                            <rect
                                x="0"
                                y="0"
                                width="100%"
                                height="100%"
                                fill="rgba(0,0,0,0.72)"
                                mask={`url(#${maskId})`}
                            />
                        </motion.svg>

                        {/* ── Spotlight ring glow ── */}
                        {targetRect && (
                            <motion.div
                                key="tour-ring"
                                style={{
                                    position: 'fixed',
                                    zIndex: 9998,
                                    pointerEvents: 'none',
                                    borderRadius: 14,
                                    x: sx,
                                    y: sy,
                                    width: sw,
                                    height: sh,
                                    boxShadow: `0 0 0 2px ${accent}80, 0 0 24px ${accent}40`,
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                aria-hidden="true"
                            />
                        )}

                        {/* ── Tooltip Card ── */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`tour-tooltip-${stepKey}`}
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="tour-step-title"
                                aria-describedby="tour-step-desc"
                                initial={{ opacity: 0, scale: 0.92, y: 8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 8 }}
                                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                                style={{
                                    position: 'fixed',
                                    top: tooltipPos.top,
                                    left: tooltipPos.left,
                                    width: TOOLTIP_WIDTH,
                                    zIndex: 9999,
                                }}
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Arrow pointing to spotlight */}
                                {tooltipPos.placement !== 'center' && (
                                    <div
                                        aria-hidden="true"
                                        className={`absolute w-0 h-0 border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent ${arrowClass(tooltipPos.placement)}`}
                                    />
                                )}

                                {/* Card */}
                                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                                    {/* Accent top bar */}
                                    <div
                                        className="h-1"
                                        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}66)` }}
                                    />

                                    {/* Header */}
                                    <div className="flex items-center justify-between px-5 pt-4 pb-1">
                                        <div className="flex items-center gap-1.5">
                                            <Sparkles
                                                className="w-3.5 h-3.5"
                                                style={{ color: accent }}
                                                aria-hidden="true"
                                            />
                                            <span
                                                className="text-[10px] font-bold uppercase tracking-widest"
                                                style={{ color: accent }}
                                            >
                                                {currentStep + 1} / {activeTour.steps.length}
                                            </span>
                                        </div>
                                        <button
                                            onClick={endTour}
                                            aria-label="Fermer le tutoriel"
                                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="px-5 py-3">
                                        <div className="flex items-start gap-3">
                                            {step.icon && (
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: `${accent}15`, color: accent }}
                                                    aria-hidden="true"
                                                >
                                                    {step.icon}
                                                </div>
                                            )}
                                            <div>
                                                <h3
                                                    id="tour-step-title"
                                                    className="text-sm font-bold text-gray-900 dark:text-white mb-1"
                                                >
                                                    {step.title}
                                                </h3>
                                                <p
                                                    id="tour-step-desc"
                                                    className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed"
                                                >
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="px-5 pb-4 flex items-center justify-between">
                                        {/* Step dots */}
                                        <div className="flex items-center gap-1" aria-hidden="true">
                                            {activeTour.steps.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="rounded-full transition-all duration-300"
                                                    style={{
                                                        width: i === currentStep ? 20 : 6,
                                                        height: 6,
                                                        backgroundColor: i === currentStep ? accent : '#e5e7eb',
                                                    }}
                                                />
                                            ))}
                                        </div>

                                        {/* Navigation buttons */}
                                        <div className="flex items-center gap-1.5">
                                            {!isFirst && (
                                                <button
                                                    onClick={prevStep}
                                                    aria-label="Étape précédente"
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                                >
                                                    <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                                                    Préc.
                                                </button>
                                            )}
                                            <button
                                                onClick={nextStep}
                                                aria-label={isLast ? 'Terminer le tutoriel' : 'Étape suivante'}
                                                className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow transition-all hover:opacity-90"
                                                style={{ backgroundColor: accent }}
                                            >
                                                {isLast ? 'Terminé !' : 'Suivant'}
                                                {!isLast && <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* ── Skip link (keyboard accessible) ── */}
                        <div
                            style={{
                                position: 'fixed',
                                bottom: 24,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 9999,
                            }}
                        >
                            <button
                                onClick={endTour}
                                className="text-xs text-white/60 hover:text-white/90 underline underline-offset-2 transition-colors"
                                aria-label="Passer le tutoriel"
                            >
                                Passer le tutoriel
                            </button>
                        </div>
                    </>
                );
            })()}
        </AnimatePresence>,
        document.body,
    );
};

export default SpotlightTour;
