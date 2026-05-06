import {
    BookOpen, Layout, Type, Wand2, MessageSquare, Cpu, PenLine, Share2, CheckCircle,
} from 'lucide-react';
import React from 'react';
import type { TourConfig } from '@/context/OnboardingContext';

export const editorTour: TourConfig = {
    flowId: 'editor',
    title: 'Découvrez l\'éditeur',
    steps: [
        {
            target: '',
            placement: 'center',
            icon: React.createElement(BookOpen, { className: 'w-5 h-5' }),
            accentColor: '#99334C',
            title: 'Votre studio de création',
            description:
                "Bienvenue dans l'éditeur XCCM — votre espace de création collaboratif. Un tour rapide pour vous présenter les zones clés.",
        },
        {
            target: '#toc-panel',
            placement: 'right',
            icon: React.createElement(Layout, { className: 'w-5 h-5' }),
            accentColor: '#8b5cf6',
            title: 'Structure de votre document',
            description:
                'Ce panneau affiche la hiérarchie de votre cours : Parties → Chapitres → Paragraphes → Notions. Glissez-déposez pour réorganiser librement.',
        },
        {
            target: '#editor-toolbar',
            placement: 'bottom',
            icon: React.createElement(Type, { className: 'w-5 h-5' }),
            accentColor: '#0ea5e9',
            title: 'Barre de formatage',
            description:
                'Mettez en forme votre texte : gras, titres, listes, tableaux, formules mathématiques (LaTeX), et bien plus. Survolez les boutons pour en savoir plus.',
        },
        {
            target: '#editor-area',
            placement: 'top',
            icon: React.createElement(PenLine, { className: 'w-5 h-5' }),
            accentColor: '#059669',
            title: 'Zone d\'édition',
            description:
                'Cliquez et commencez à écrire. Tapez "/" pour insérer un bloc spécial (image, tableau, code, citation…). L\'auto-sauvegarde se fait toutes les 5 secondes.',
        },
        {
            target: '#right-panel-tabs',
            placement: 'left',
            icon: React.createElement(MessageSquare, { className: 'w-5 h-5' }),
            accentColor: '#f59e0b',
            title: 'Panneaux latéraux',
            description:
                'À droite, accédez aux commentaires, exercices interactifs, assistant IA, marketplace de contenus, et paramètres du document.',
        },
        {
            target: '#ai-panel-tab',
            placement: 'left',
            icon: React.createElement(Cpu, { className: 'w-5 h-5' }),
            accentColor: '#6366f1',
            title: 'Assistant IA intégré',
            description:
                "L'IA peut générer du contenu, reformuler vos textes, créer des exercices automatiquement, et donner un feedback pédagogique socratique.",
        },
        {
            target: '#exercise-panel-tab',
            placement: 'left',
            icon: React.createElement(Wand2, { className: 'w-5 h-5' }),
            accentColor: '#ec4899',
            title: 'Exercices interactifs',
            description:
                'Créez des QCM, questions ouvertes, exercices de code ou lacunaires directement liés à vos notions. Partagez-les avec vos classes.',
        },
        {
            target: '#share-button',
            placement: 'bottom',
            icon: React.createElement(Share2, { className: 'w-5 h-5' }),
            accentColor: '#0ea5e9',
            title: 'Collaborer en temps réel',
            description:
                'Invitez des collègues pour éditer ensemble simultanément. Chaque collaborateur a son curseur coloré visible en direct.',
        },
        {
            target: '',
            placement: 'center',
            icon: React.createElement(CheckCircle, { className: 'w-5 h-5' }),
            accentColor: '#059669',
            title: 'Vous maîtrisez l\'éditeur ! ✨',
            description:
                "C'est parti ! L'auto-sauvegarde est activée. Retrouvez ce tutoriel à tout moment dans Paramètres → Aide.",
        },
    ],
};
