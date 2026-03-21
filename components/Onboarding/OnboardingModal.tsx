"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { onboardingService } from '@/services/onboardingService';

export interface OnboardingStep {
    icon: React.ReactNode;
    title: string;
    description: string;
    image?: string; // optional illustration
    accentColor?: string;
}

interface OnboardingModalProps {
    flowId: string;
    steps: OnboardingStep[];
    title?: string;
    subtitle?: string;
    onComplete?: () => void;
    /** If true, show even if already seen */
    forceShow?: boolean;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({
    flowId, steps, title, subtitle, onComplete, forceShow = false
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(0); // -1 = prev, 1 = next

    useEffect(() => {
        if (forceShow || !onboardingService.hasSeenFlow(flowId)) {
            // Small delay for page to render first
            const timer = setTimeout(() => setIsVisible(true), 600);
            return () => clearTimeout(timer);
        }
    }, [flowId, forceShow]);

    const handleClose = () => {
        onboardingService.markFlowSeen(flowId);
        setIsVisible(false);
        onComplete?.();
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setDirection(1);
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep(prev => prev - 1);
        }
    };

    if (!isVisible || steps.length === 0) return null;

    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;
    const isFirst = currentStep === 0;
    const accentColor = step.accentColor || '#99334C';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.85, opacity: 0, y: 30 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Top accent gradient */}
                    <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }} />

                    {/* Close button */}
                    <button onClick={handleClose}
                        className="absolute top-4 right-4 p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>

                    {/* Welcome header (first step only) */}
                    {isFirst && title && (
                        <div className="px-8 pt-8 pb-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-5 h-5" style={{ color: accentColor }} />
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>Bienvenue</span>
                            </div>
                            {title && <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>}
                            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                        </div>
                    )}

                    {/* Step content */}
                    <div className="px-8 py-6 min-h-[200px]">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentStep}
                                custom={direction}
                                initial={{ x: direction > 0 ? 80 : -80, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: direction > 0 ? -80 : 80, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                                        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                                        {step.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer: dots + controls */}
                    <div className="px-8 pb-6 flex items-center justify-between">
                        {/* Step dots */}
                        <div className="flex items-center gap-1.5">
                            {steps.map((_, i) => (
                                <button key={i} onClick={() => { setDirection(i > currentStep ? 1 : -1); setCurrentStep(i); }}
                                    className="transition-all duration-300"
                                    style={{
                                        width: i === currentStep ? 24 : 8,
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: i === currentStep ? accentColor : '#e5e7eb',
                                    }}
                                />
                            ))}
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-2">
                            {!isFirst && (
                                <button onClick={handlePrev}
                                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                                    <ChevronLeft className="w-4 h-4" /> Précédent
                                </button>
                            )}
                            <button onClick={handleNext}
                                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all"
                                style={{ backgroundColor: accentColor }}>
                                {isLast ? 'C\'est parti !' : 'Suivant'}
                                {!isLast && <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Step counter */}
                    <div className="absolute top-5 left-8 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {currentStep + 1}/{steps.length}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OnboardingModal;
