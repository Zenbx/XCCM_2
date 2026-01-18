"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import toast, { Toast, ToastBar } from 'react-hot-toast';

interface CustomToastProps {
    t: Toast;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning' | 'loading';
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const CustomToast: React.FC<CustomToastProps> = ({ t, message, type, action }) => {
    const icons = {
        success: <CheckCircle className="text-green-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />,
        warning: <AlertCircle className="text-amber-500" size={20} />,
        loading: <Loader2 className="text-[#99334C] animate-spin" size={20} />,
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white dark:bg-gray-900 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 border border-white/20 dark:border-gray-700/30 overflow-hidden`}
        >
            <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        {icons[type]}
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {message}
                        </p>
                    </div>
                </div>
            </div>

            {action && (
                <div className="flex border-l border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => {
                            action.onClick();
                            toast.dismiss(t.id);
                        }}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[#99334C] hover:text-[#7a283d] focus:outline-none"
                    >
                        {action.label}
                    </button>
                </div>
            )}

            <div className="flex border-l border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Progress Bar for Auto-dismiss */}
            <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-[#99334C]/30"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: t.duration ? t.duration / 1000 : 4, ease: "linear" }}
            />
        </motion.div>
    );
};

// Helper function to trigger custom toasts
export const showToast = (message: string, type: CustomToastProps['type'] = 'info', action?: CustomToastProps['action']) => {
    toast.custom((t) => (
        <CustomToast t={t} message={message} type={type} action={action} />
    ), {
        duration: type === 'loading' ? Infinity : 4000,
    });
};
