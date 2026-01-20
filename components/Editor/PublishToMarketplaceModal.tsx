"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, DollarSign, Tag } from 'lucide-react';
import { marketplaceService } from '@/services/marketplaceService';
import toast from 'react-hot-toast';

interface PublishToMarketplaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    granuleData: {
        type: string;
        title: string;
        content?: string;
    } | null;
}

const PublishToMarketplaceModal: React.FC<PublishToMarketplaceModalProps> = ({ isOpen, onClose, granuleData }) => {
    const [formData, setFormData] = useState({
        description: '',
        price: 0,
        tags: '',
        category: ''
    });
    const [isPublishing, setIsPublishing] = useState(false);

    const handlePublish = async () => {
        if (!granuleData) return;

        setIsPublishing(true);
        try {
            await marketplaceService.publishItem({
                type: granuleData.type,
                title: granuleData.title,
                description: formData.description,
                price: parseFloat(formData.price.toString()),
                content: granuleData.content || '',
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                category: formData.category
            });

            toast.success('✨ Publié sur la Marketplace !');
            onClose();
            setFormData({ description: '', price: 0, tags: '', category: '' });
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la publication');
        } finally {
            setIsPublishing(false);
        }
    };

    if (!isOpen || !granuleData) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Publier sur la Marketplace</h3>
                        <p className="text-sm text-gray-500 mt-1">Partagez "{granuleData.title}" avec la communauté</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Décrivez ce granule et son utilité..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99334C] focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <DollarSign size={16} />
                            Prix (FCFA)
                        </label>
                        <input
                            type="number"
                            step="100"
                            min="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                            placeholder="0 (gratuit)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99334C] focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Tag size={16} />
                            Tags (séparés par des virgules)
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="mathématiques, algèbre, niveau lycée"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99334C] focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="Ex: Sciences, Histoire..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#99334C] focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={isPublishing}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[#99334C] to-[#DC3545] text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPublishing && <Loader2 size={16} className="animate-spin" />}
                        Publier
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PublishToMarketplaceModal;
