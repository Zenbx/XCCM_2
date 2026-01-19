"use client";

import React, { useEffect, useState } from 'react';
import { Lock, Heart, Clock, Loader2 } from 'lucide-react';
import Granule, { GranuleData } from '../Granule';
import { vaultService, VaultItem } from '@/services/vaultService';
import toast from 'react-hot-toast';

interface VaultPanelProps {
    onDragStart: (e: React.DragEvent, granule: GranuleData) => void;
}

const VaultPanel: React.FC<VaultPanelProps> = ({ onDragStart }) => {
    const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadVaultItems();
    }, []);

    const loadVaultItems = async () => {
        try {
            setIsLoading(true);
            const items = await vaultService.getVaultItems();
            setVaultItems(items);
        } catch (error: any) {
            console.error('Error loading vault items:', error);
            toast.error('Erreur lors du chargement du coffre-fort');
        } finally {
            setIsLoading(false);
        }
    };

    // Convertir VaultItem en GranuleData pour le drag & drop
    const vaultGranules: GranuleData[] = vaultItems.map(item => ({
        id: item.id,
        type: item.type as any,
        content: item.title,
        icon: item.type === 'notion' ? 'File' : item.type === 'paragraph' ? 'FileText' : 'Folder',
        savedAt: new Date(item.added_at).toLocaleDateString('fr-FR')
    }));

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-5 h-5 text-[#99334C]" />
                    <h3 className="text-lg font-bold text-gray-900">Coffre-fort outils</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">Vos granules enregistrés pour une réutilisation rapide.</p>

                <div className="flex gap-2 border-b border-gray-100 mb-4">
                    <button className="pb-2 px-1 text-sm font-bold text-[#99334C] border-b-2 border-[#99334C] flex items-center gap-1.5">
                        <Heart className="w-4 h-4" /> Favoris
                    </button>
                    <button className="pb-2 px-1 text-sm font-medium text-gray-400 hover:text-gray-600 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> Récents
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="text-center py-10">
                        <Loader2 className="w-8 h-8 text-[#99334C] mx-auto mb-3 animate-spin" />
                        <p className="text-gray-400 text-sm">Chargement...</p>
                    </div>
                ) : vaultGranules.length > 0 ? (
                    vaultGranules.map((granule) => (
                        <div key={granule.id}>
                            <Granule granule={granule} onDragStart={onDragStart} />
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                        <Lock className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">Votre coffre-fort est vide</p>
                        <p className="text-xs text-gray-400 mt-2">Ajoutez des granules depuis le Book Reader</p>
                    </div>
                )}
            </div>

            <div className="mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <p className="text-xs text-orange-800 leading-relaxed">
                    <strong>Tip:</strong> Enregistrez n'importe quel granule depuis la bibliothèque ou le Book Reader pour le retrouver ici.
                </p>
            </div>
        </div>
    );
};

export default VaultPanel;
