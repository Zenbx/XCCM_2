import { ShoppingBag, Search, Filter, Download, CheckCircle } from 'lucide-react';
import React from 'react';
import type { TourConfig } from '@/context/OnboardingContext';

export const marketplaceTour: TourConfig = {
    flowId: 'marketplace',
    title: 'La Marketplace XCCM',
    steps: [
        {
            target: '',
            placement: 'center',
            icon: React.createElement(ShoppingBag, { className: 'w-5 h-5' }),
            accentColor: '#99334C',
            title: 'Le marché de contenus',
            description:
                'La Marketplace vous permet de découvrir et réutiliser des contenus pédagogiques partagés par la communauté XCCM.',
        },
        {
            target: '#marketplace-search',
            placement: 'bottom',
            icon: React.createElement(Search, { className: 'w-5 h-5' }),
            accentColor: '#0ea5e9',
            title: 'Recherchez du contenu',
            description:
                'Cherchez par mot-clé dans le titre ou la description. Ex : "mathématiques lycée", "algorithmique Python", "histoire médiévale".',
        },
        {
            target: '#marketplace-filters',
            placement: 'bottom',
            icon: React.createElement(Filter, { className: 'w-5 h-5' }),
            accentColor: '#8b5cf6',
            title: 'Filtrez les résultats',
            description:
                'Filtrez par type (partie, chapitre, notion), par catégorie, ou par tarif (gratuit / payant). Les contenus gratuits sont nombreux !',
        },
        {
            target: '#marketplace-import-btn',
            placement: 'left',
            icon: React.createElement(Download, { className: 'w-5 h-5' }),
            accentColor: '#059669',
            title: 'Importez en un clic',
            description:
                "Trouvé quelque chose d'intéressant ? Cliquez sur Importer pour l'ajouter directement dans votre projet ouvert. C'est immédiat.",
        },
        {
            target: '',
            placement: 'center',
            icon: React.createElement(CheckCircle, { className: 'w-5 h-5' }),
            accentColor: '#059669',
            title: 'Explorez et inspirez-vous ! 🛍️',
            description:
                'Des centaines de granules pédagogiques vous attendent. Et vous pouvez aussi publier vos propres contenus pour aider la communauté.',
        },
    ],
};
