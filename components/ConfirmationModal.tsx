"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDanger?: boolean;
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Confirmer",
    cancelLabel = "Annuler",
    isDanger = false,
    isLoading = false
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                        {/* Header / Icon */}
                        <div className={`p-8 text-center ${isDanger ? 'bg-red-50' : 'bg-blue-50'}`}>
                            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                {isDanger ? <AlertTriangle size={32} /> : <AlertTriangle size={32} className="rotate-180" />}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8">
                            <p className="text-gray-600 text-center leading-relaxed">
                                {message}
                            </p>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 mt-8">
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1 px-6 py-3 border-2 border-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`flex-1 px-6 py-3 rounded-2xl font-bold text-white shadow-lg shadow-opacity-20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${isDanger
                                            ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-red-200'
                                            : 'bg-gradient-to-r from-[#99334C] to-[#7a283d] shadow-[#99334C]/20'
                                        }`}
                                >
                                    {isLoading && <Loader2 size={18} className="animate-spin" />}
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-[#99334C]/20 via-[#99334C] to-[#99334C]/20 opacity-30"></div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
