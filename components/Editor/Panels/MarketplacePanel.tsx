"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingBag, Folder, Book, FileText, File, Loader2 } from 'lucide-react';
import Granule, { GranuleData } from '../Granule';
import { marketplaceService, MarketplaceItem } from '@/services/marketplaceService';
import toast from 'react-hot-toast';

interface MarketplacePanelProps {
    onDragStart: (e: React.DragEvent, granule: GranuleData) => void;
}

type GranuleType = GranuleData['type'];

const MarketplacePanel: React.FC<MarketplacePanelProps> = ({ onDragStart }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | GranuleType>('all');
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadItems();
    }, [filterType]);

    const loadItems = async () => {
        try {
            setIsLoading(true);
            const fetchedItems = await marketplaceService.getItems({
                type: filterType === 'all' ? undefined : filterType,
                search: searchTerm || undefined
            });
            setItems(fetchedItems);
        } catch (error: any) {
            console.error('Error loading marketplace items:', error);
            toast.error('Erreur lors du chargement de la marketplace');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        loadItems();
    };

    const handleDownload = async (item: MarketplaceItem) => {
        await marketplaceService.recordDownload(item.id);
    };

    // Convertir MarketplaceItem en GranuleData
    const marketplaceGranules: GranuleData[] = items.map(item => ({
        id: item.id,
        type: item.type as any,
        content: item.title,
        icon: item.type === 'notion' ? 'File' : item.type === 'paragraph' ? 'FileText' : item.type === 'chapter' ? 'Book' : 'Folder',
        author: `${item.seller.firstname} ${item.seller.lastname}`,
        price: item.price,
        downloads: item.downloads,
        previewContent: item.content // Stocke le JSON ou le contenu brut ici
    }));

    const filteredGranules = marketplaceGranules.filter(g => {
        const matchesSearch = g.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || g.type === filterType;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Marketplace Granules</h3>
                <p className="text-sm text-gray-500 mb-4">Découvrez et utilisez des granules partagés par la communauté.</p>

                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Rechercher un granule..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 text-sm focus:ring-2 focus:ring-[#99334C] focus:bg-white outline-none transition-all"
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#99334C] text-white rounded-lg text-xs hover:bg-[#7a283d]"
                    >
                        Chercher
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filterType === 'all' ? 'bg-[#99334C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Tous
                    </button>
                    {([
                        { id: 'part' as const, label: 'Parties', icon: Folder },
                        { id: 'chapter' as const, label: 'Chapitres', icon: Book },
                        { id: 'paragraph' as const, label: 'Paragraphes', icon: FileText },
                        { id: 'notion' as const, label: 'Notions', icon: File }
                    ]).map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilterType(f.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filterType === f.id ? 'bg-[#99334C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            <f.icon className="w-3 h-3" />
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="text-center py-10">
                        <Loader2 className="w-8 h-8 text-[#99334C] mx-auto mb-3 animate-spin" />
                        <p className="text-gray-400 text-sm">Chargement de la marketplace...</p>
                    </div>
                ) : marketplaceGranules.length > 0 ? (
                    marketplaceGranules.map((granule) => (
                        <div key={granule.id} onClick={() => items.find(i => i.id === granule.id) && handleDownload(items.find(i => i.id === granule.id)!)}>
                            <Granule granule={granule} onDragStart={onDragStart} />
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10">
                        <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">Aucun granule trouvé</p>
                        <p className="text-xs text-gray-400 mt-1">Essayez de modifier vos filtres</p>
                    </div>
                )}
            </div>

            <div className="mt-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <p className="text-xs text-purple-800 leading-relaxed">
                    <strong>Note:</strong> Les granules de la marketplace peuvent être glissés directement dans votre projet pour être clonés.
                </p>
            </div>
        </div>
    );
};

export default MarketplacePanel;
