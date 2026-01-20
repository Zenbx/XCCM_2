import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteModalProps {
    config: {
        isOpen: boolean;
        isDeleting: boolean;
        type: string;
        id: string;
        title: string;
    };
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ config, onClose, onConfirm }) => {
    return (
        <AnimatePresence>
            {config.isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="text-red-600" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmer la suppression</h3>
                            <p className="text-gray-600 mb-6">
                                Êtes-vous sûr de vouloir supprimer <strong>{config.title}</strong> ?
                                {config.type !== 'notion' && " Tous les éléments enfants seront également supprimés. Cette action est irréversible."}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    disabled={config.isDeleting}
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    disabled={config.isDeleting}
                                    onClick={onConfirm}
                                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {config.isDeleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Suppression...
                                        </>
                                    ) : (
                                        "Supprimer"
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DeleteModal;
