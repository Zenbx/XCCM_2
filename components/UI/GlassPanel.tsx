"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassPanelProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    blur?: 'sm' | 'md' | 'lg' | 'xl';
    opacity?: number;
    intensity?: 'low' | 'medium' | 'high';
    border?: boolean;
}

const GlassPanel: React.FC<GlassPanelProps> = ({
    children,
    blur = 'md',
    intensity = 'medium',
    border = true,
    className = '',
    ...props
}) => {
    const blurClasses = {
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg',
        xl: 'backdrop-blur-xl',
    };

    const intensityClasses = {
        low: 'bg-white/40 dark:bg-gray-900/40',
        medium: 'bg-white/60 dark:bg-gray-900/60',
        high: 'bg-white/80 dark:bg-gray-900/80',
    };

    const borderClasses = border
        ? 'border border-white/20 dark:border-gray-700/30'
        : '';

    return (
        <motion.div
            className={`
        ${blurClasses[blur]}
        ${intensityClasses[intensity]}
        ${borderClasses}
        shadow-xl shadow-black/5
        ${className}
      `}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassPanel;
