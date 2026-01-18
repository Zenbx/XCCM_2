"use client";

import React, { useState, useRef, useCallback } from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';

interface RippleEffect {
    id: number;
    x: number;
    y: number;
    size: number;
}

interface TactileButtonProps extends Omit<HTMLMotionProps<"button">, 'onAnimationStart'> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    state?: 'idle' | 'loading' | 'success' | 'error';
    showRipple?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const TactileButton = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    state = 'idle',
    showRipple = true,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    onClick,
    ...props
}: TactileButtonProps) => {
    const [ripples, setRipples] = useState<RippleEffect[]>([]);
    const rippleIdRef = useRef(0);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Determine effective state
    const effectiveState = isLoading ? 'loading' : state;
    const isDisabled = disabled || effectiveState === 'loading';

    const baseStyles = "relative flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 overflow-hidden select-none";

    const variants = {
        primary: "bg-[#99334C] text-white hover:bg-[#7a283d] shadow-sm focus-visible:ring-[#99334C]/50",
        secondary: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus-visible:ring-gray-400",
        ghost: "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-gray-400",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 focus-visible:ring-red-400",
        success: "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 focus-visible:ring-green-400",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs gap-1.5 min-h-[32px]",
        md: "px-4 py-2 text-sm gap-2 min-h-[40px]",
        lg: "px-6 py-3 text-base gap-3 min-h-[48px]",
    };

    const disabledStyles = "opacity-50 cursor-not-allowed pointer-events-none";

    // State-based variant override
    const getStateVariant = () => {
        if (effectiveState === 'success') return 'success';
        if (effectiveState === 'error') return 'danger';
        return variant;
    };

    // Ripple effect handler
    const handleRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (!showRipple || isDisabled) return;

        const button = buttonRef.current;
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const newRipple: RippleEffect = {
            id: rippleIdRef.current++,
            x,
            y,
            size,
        };

        setRipples(prev => [...prev, newRipple]);

        // Remove ripple after animation
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 600);
    }, [showRipple, isDisabled]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        handleRipple(e);
        onClick?.(e);
    };

    // State icon
    const renderStateIcon = () => {
        if (effectiveState === 'loading') {
            return (
                <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute"
                >
                    <Loader2 className="w-4 h-4 animate-spin" />
                </motion.span>
            );
        }
        if (effectiveState === 'success') {
            return (
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute"
                >
                    <Check className="w-4 h-4" />
                </motion.span>
            );
        }
        if (effectiveState === 'error') {
            return (
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute"
                >
                    <X className="w-4 h-4" />
                </motion.span>
            );
        }
        return null;
    };

    const currentVariant = getStateVariant();

    return (
        <motion.button
            ref={buttonRef}
            whileHover={isDisabled ? {} : { y: -2, scale: 1.02 }}
            whileTap={isDisabled ? {} : { scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`${baseStyles} ${variants[currentVariant]} ${sizes[size]} ${isDisabled ? disabledStyles : ''} ${className}`}
            disabled={isDisabled}
            onClick={handleClick}
            {...props}
        >
            {/* Ripple effects */}
            {ripples.map(ripple => (
                <motion.span
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute rounded-full bg-white/30 pointer-events-none"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: ripple.size,
                        height: ripple.size,
                    }}
                />
            ))}

            {/* Content */}
            <AnimatePresence mode="wait">
                {effectiveState !== 'idle' ? (
                    <motion.span
                        key="state-icon"
                        className="flex items-center justify-center"
                    >
                        {renderStateIcon()}
                    </motion.span>
                ) : (
                    <motion.span
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                    >
                        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
                        {children}
                        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

/**
 * Icon-only tactile button variant
 */
interface TactileIconButtonProps extends Omit<TactileButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
    icon: React.ReactNode;
    'aria-label': string;
}

export const TactileIconButton = ({
    icon,
    size = 'md',
    className = '',
    ...props
}: TactileIconButtonProps) => {
    const iconSizes = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
    };

    return (
        <TactileButton
            size={size}
            className={`${iconSizes[size]} !p-0 !min-h-0 ${className}`}
            {...props}
        >
            {icon}
        </TactileButton>
    );
};
