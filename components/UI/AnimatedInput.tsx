"use client";

import React, { useState, useId, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AnimatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label: string;
    error?: string;
    success?: boolean;
    helperText?: string;
    size?: 'sm' | 'md' | 'lg';
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    showPasswordToggle?: boolean;
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(({
    label,
    error,
    success,
    helperText,
    size = 'md',
    leftIcon,
    rightIcon,
    showPasswordToggle,
    className = '',
    type = 'text',
    disabled,
    value,
    defaultValue,
    onFocus,
    onBlur,
    ...props
}, ref) => {
    const id = useId();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [hasValue, setHasValue] = useState(!!value || !!defaultValue);

    const isFloating = isFocused || hasValue;
    const hasError = !!error;
    const inputType = showPasswordToggle && type === 'password'
        ? (showPassword ? 'text' : 'password')
        : type;

    const sizes = {
        sm: {
            input: "h-10 text-sm",
            label: "text-sm",
            floatingLabel: "-translate-y-6 text-xs",
            padding: leftIcon ? "pl-9 pr-3" : "px-3",
        },
        md: {
            input: "h-12 text-base",
            label: "text-base",
            floatingLabel: "-translate-y-7 text-xs",
            padding: leftIcon ? "pl-11 pr-4" : "px-4",
        },
        lg: {
            input: "h-14 text-lg",
            label: "text-lg",
            floatingLabel: "-translate-y-8 text-sm",
            padding: leftIcon ? "pl-12 pr-5" : "px-5",
        },
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        setHasValue(!!e.target.value);
        onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasValue(!!e.target.value);
        props.onChange?.(e);
    };

    // Shake animation for errors
    const shakeAnimation = {
        x: hasError ? [0, -10, 10, -10, 10, 0] : 0,
        transition: { duration: 0.4 }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Input container */}
            <motion.div
                animate={shakeAnimation}
                className="relative"
            >
                {/* Left icon */}
                {leftIcon && (
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors ${isFocused ? 'text-[#99334C]' : ''}`}>
                        {leftIcon}
                    </span>
                )}

                {/* Input field */}
                <input
                    ref={ref}
                    id={id}
                    type={inputType}
                    disabled={disabled}
                    value={value}
                    defaultValue={defaultValue}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    className={`
                        w-full rounded-xl border-2 bg-white dark:bg-gray-900
                        text-gray-900 dark:text-gray-100
                        placeholder-transparent
                        transition-all duration-200 ease-out
                        outline-none
                        ${sizes[size].input}
                        ${sizes[size].padding}
                        ${rightIcon || showPasswordToggle || success ? 'pr-11' : ''}
                        ${hasError
                            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/30'
                            : success
                                ? 'border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900/30'
                                : 'border-gray-200 dark:border-gray-700 focus:border-[#99334C] focus:ring-2 focus:ring-[#99334C]/20'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : ''}
                    `}
                    placeholder={label}
                    {...props}
                />

                {/* Floating label */}
                <motion.label
                    htmlFor={id}
                    initial={false}
                    animate={{
                        y: isFloating ? -28 : 0,
                        scale: isFloating ? 0.85 : 1,
                        x: isFloating ? (leftIcon ? -8 : 0) : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`
                        absolute left-0 top-1/2 -translate-y-1/2 origin-left
                        pointer-events-none select-none
                        transition-colors duration-200
                        ${sizes[size].label}
                        ${leftIcon ? 'ml-11' : 'ml-4'}
                        ${isFloating
                            ? hasError
                                ? 'text-red-500'
                                : success
                                    ? 'text-green-500'
                                    : 'text-[#99334C]'
                            : 'text-gray-400'
                        }
                        ${isFloating ? 'bg-white dark:bg-gray-900 px-1 ml-3' : ''}
                    `}
                >
                    {label}
                </motion.label>

                {/* Right side icons */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {/* Success checkmark */}
                    <AnimatePresence>
                        {success && !hasError && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="text-green-500"
                            >
                                <Check className="w-5 h-5" />
                            </motion.span>
                        )}
                    </AnimatePresence>

                    {/* Error icon */}
                    <AnimatePresence>
                        {hasError && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="text-red-500"
                            >
                                <AlertCircle className="w-5 h-5" />
                            </motion.span>
                        )}
                    </AnimatePresence>

                    {/* Password toggle */}
                    {showPasswordToggle && type === 'password' && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    )}

                    {/* Custom right icon */}
                    {rightIcon && !showPasswordToggle && !success && !hasError && (
                        <span className="text-gray-400">{rightIcon}</span>
                    )}
                </div>

                {/* Focus ring animation */}
                <motion.div
                    initial={false}
                    animate={{
                        opacity: isFocused ? 1 : 0,
                        scale: isFocused ? 1 : 0.95,
                    }}
                    transition={{ duration: 0.2 }}
                    className={`
                        absolute inset-0 rounded-xl pointer-events-none
                        ${hasError
                            ? 'ring-2 ring-red-200 dark:ring-red-900/30'
                            : success
                                ? 'ring-2 ring-green-200 dark:ring-green-900/30'
                                : 'ring-2 ring-[#99334C]/20'
                        }
                    `}
                    style={{ opacity: 0 }}
                />
            </motion.div>

            {/* Helper text / Error message */}
            <AnimatePresence mode="wait">
                {(error || helperText) && (
                    <motion.p
                        key={error || helperText}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className={`mt-1.5 text-xs ${hasError ? 'text-red-500' : 'text-gray-500'}`}
                    >
                        {error || helperText}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
});

AnimatedInput.displayName = 'AnimatedInput';

/**
 * AnimatedTextarea - Textarea variant with similar animations
 */
interface AnimatedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
    label: string;
    error?: string;
    success?: boolean;
    helperText?: string;
}

export const AnimatedTextarea = forwardRef<HTMLTextAreaElement, AnimatedTextareaProps>(({
    label,
    error,
    success,
    helperText,
    className = '',
    disabled,
    value,
    defaultValue,
    onFocus,
    onBlur,
    ...props
}, ref) => {
    const id = useId();
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value || !!defaultValue);

    const isFloating = isFocused || hasValue;
    const hasError = !!error;

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(false);
        setHasValue(!!e.target.value);
        onBlur?.(e);
    };

    const shakeAnimation = {
        x: hasError ? [0, -10, 10, -10, 10, 0] : 0,
        transition: { duration: 0.4 }
    };

    return (
        <div className={`relative ${className}`}>
            <motion.div animate={shakeAnimation} className="relative">
                <textarea
                    ref={ref}
                    id={id}
                    disabled={disabled}
                    value={value}
                    defaultValue={defaultValue}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={(e) => {
                        setHasValue(!!e.target.value);
                        props.onChange?.(e);
                    }}
                    className={`
                        w-full min-h-[120px] rounded-xl border-2 bg-white dark:bg-gray-900
                        text-gray-900 dark:text-gray-100 p-4 pt-6
                        placeholder-transparent resize-y
                        transition-all duration-200 ease-out outline-none
                        ${hasError
                            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : success
                                ? 'border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                                : 'border-gray-200 dark:border-gray-700 focus:border-[#99334C] focus:ring-2 focus:ring-[#99334C]/20'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
                    `}
                    placeholder={label}
                    {...props}
                />

                <motion.label
                    htmlFor={id}
                    initial={false}
                    animate={{
                        y: isFloating ? -32 : 0,
                        scale: isFloating ? 0.85 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`
                        absolute left-4 top-6 origin-left
                        pointer-events-none select-none
                        transition-colors duration-200
                        ${isFloating
                            ? hasError
                                ? 'text-red-500 bg-white dark:bg-gray-900 px-1'
                                : success
                                    ? 'text-green-500 bg-white dark:bg-gray-900 px-1'
                                    : 'text-[#99334C] bg-white dark:bg-gray-900 px-1'
                            : 'text-gray-400'
                        }
                    `}
                >
                    {label}
                </motion.label>

                {/* Success/Error indicators */}
                <div className="absolute right-3 top-3 flex items-center gap-2">
                    <AnimatePresence>
                        {success && !hasError && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="text-green-500"
                            >
                                <Check className="w-5 h-5" />
                            </motion.span>
                        )}
                        {hasError && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="text-red-500"
                            >
                                <AlertCircle className="w-5 h-5" />
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {(error || helperText) && (
                    <motion.p
                        key={error || helperText}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className={`mt-1.5 text-xs ${hasError ? 'text-red-500' : 'text-gray-500'}`}
                    >
                        {error || helperText}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
});

AnimatedTextarea.displayName = 'AnimatedTextarea';

export default AnimatedInput;
