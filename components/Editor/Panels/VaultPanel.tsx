"use client";

import React from 'react';
import { Lock, Heart, Clock } from 'lucide-react';
import Granule, { GranuleData } from '../Granule';

interface VaultPanelProps {
    onDragStart: (e: React.DragEvent, granule: GranuleData) => void;
}

const VaultPanel: React.FC<VaultPanelProps> = ({ onDragStart }) => {
    // Données mockées pour le coffre-fort
    const vaultGranules: GranuleData[] = [
        {
            id: 'v1',
            type: 'notion',
            content: 'Ma Notion Préférée',
            icon: 'File',
            savedAt: '2 jours'
        },
        {
            id: 'v2',
            type: 'paragraph',
            content: 'Structure Paragraph Standard',
            icon: 'FileText',
            savedAt: '1 semaine'
        }
    ];

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
                {vaultGranules.length > 0 ? (
                    vaultGranules.map((granule) => (
                        <div key={granule.id} className="group relative bg-white border border-gray-100 rounded-xl p-1 hover:border-[#99334C]/30 hover:shadow-md transition-all">
                            <Granule granule={granule} onDragStart={onDragStart} />
                            <div className="px-3 pb-2 text-[10px] text-gray-400 flex justify-between items-center">
                                <span>Enregistré il y a {granule.savedAt}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                        <Lock className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">Votre coffre-fort est vide</p>
                        <button className="mt-4 text-xs text-[#99334C] font-bold hover:underline">
                            Comment ajouter des granules ?
                        </button>
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
