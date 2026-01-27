import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Wifi, Lock, AlertTriangle, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';

export type ErrorType = 'network' | 'validation' | 'permission' | 'conflict' | 'unknown';

export interface ErrorToastProps {
    title: string;
    message: string;
    type: ErrorType;
    action?: {
        label: string;
        onClick: () => void;
    };
    retry?: () => void;
    onDismiss?: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({
    title,
    message,
    type,
    action,
    retry,
    onDismiss
}) => {
    const config = {
        network: {
            icon: Wifi,
            color: '#EF4444',
            bgColor: '#FEE2E2',
            borderColor: '#FCA5A5'
        },
        validation: {
            icon: AlertTriangle,
            color: '#F59E0B',
            bgColor: '#FEF3C7',
            borderColor: '#FCD34D'
        },
        permission: {
            icon: Lock,
            color: '#DC2626',
            bgColor: '#FEE2E2',
            borderColor: '#FCA5A5'
        },
        conflict: {
            icon: AlertCircle,
            color: '#D97706',
            bgColor: '#FEF3C7',
            borderColor: '#FCD34D'
        },
        unknown: {
            icon: AlertCircle,
            color: '#6B7280',
            bgColor: '#F3F4F6',
            borderColor: '#D1D5DB'
        }
    };

    const { icon: Icon, color, bgColor, borderColor } = config[type];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md w-full"
            style={{
                backgroundColor: bgColor,
                border: `1.5px solid ${borderColor}`,
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            }}
        >
            <div className="flex items-start gap-3">
                <div
                    className="flex-shrink-0 p-2 rounded-lg"
                    style={{ backgroundColor: `${color}20` }}
                >
                    <Icon size={20} style={{ color }} />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1" style={{ color }}>
                        {title}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {message}
                    </p>

                    {(action || retry) && (
                        <div className="flex gap-2 mt-3">
                            {retry && (
                                <button
                                    onClick={() => {
                                        retry();
                                        onDismiss?.();
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                    style={{
                                        backgroundColor: color,
                                        color: 'white'
                                    }}
                                >
                                    <RefreshCw size={14} />
                                    Réessayer
                                </button>
                            )}

                            {action && (
                                <button
                                    onClick={() => {
                                        action.onClick();
                                        onDismiss?.();
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                    style={{
                                        backgroundColor: 'white',
                                        color,
                                        border: `1px solid ${borderColor}`
                                    }}
                                >
                                    {action.label}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
                    >
                        <X size={16} className="text-gray-500" />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

// Helper function to show error toasts
export const showError = (props: Omit<ErrorToastProps, 'onDismiss'>) => {
    return toast.custom((t) => (
        <ErrorToast
            {...props}
            onDismiss={() => toast.dismiss(t.id)}
        />
    ), {
        duration: props.retry || props.action ? 8000 : 5000,
        position: 'top-right'
    });
};

export default ErrorToast;
