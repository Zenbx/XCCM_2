import { BookTemplate, Plus, Filter, MoreHorizontal, Star, CheckCircle } from 'lucide-react';
import React from 'react';
import type { TourConfig } from '@/context/OnboardingContext';

export const editHomeTour: TourConfig = {
    flowId: 'edit-home',
    title: 'Bienvenue sur XCCM',
    steps: [
        {
            target: '',
            placement: 'center',
            icon: React.createElement(BookTemplate, { className: 'w-5 h-5' }),
            accentColor: '#99334C',
            title: 'Votre espace de création',
            description:
                "Bienvenue ! Ici vous retrouvez tous vos projets de cours et compositions. C'est votre point de départ pour créer du contenu pédagogique de qualité.",
        },
        {
            target: '#templates-section',
            placement: 'bottom',
            icon: React.createElement(Star, { className: 'w-5 h-5' }),
            accentColor: '#8b5cf6',
            title: 'Templates prêts à l\'emploi',
            description:
                'Gagnez du temps avec nos modèles prédéfinis. Choisissez un template et commencez avec une structure déjà en place — cours universitaire, tutoriel, formation pro…',
        },
        {
            target: '#create-project-btn',
            placement: 'bottom',
            icon: React.createElement(Plus, { className: 'w-5 h-5' }),
            accentColor: '#059669',
            title: 'Créer une composition',
            description:
                'Cliquez ici pour démarrer un projet vide. Donnez-lui un nom et vous serez redirigé vers l\'éditeur pour structurer votre contenu.',
        },
        {
            target: '#filter-tabs',
            placement: 'bottom',
            icon: React.createElement(Filter, { className: 'w-5 h-5' }),
            accentColor: '#0ea5e9',
            title: 'Filtrez vos projets',
            description:
                'Utilisez ces onglets pour trier : Tous, Mes projets, Partagés avec moi, ou En attente. Pratique quand vous collaborez avec d\'autres auteurs.',
        },
        {
            target: '#projects-table',
            placement: 'top',
            icon: React.createElement(MoreHorizontal, { className: 'w-5 h-5' }),
            accentColor: '#f59e0b',
            title: 'Gérez vos projets',
            description:
                'Chaque projet a un menu d\'actions : renommer, télécharger en PDF, supprimer. Cliquez sur le nom du projet pour l\'ouvrir dans l\'éditeur.',
        },
        {
            target: '',
            placement: 'center',
            icon: React.createElement(CheckCircle, { className: 'w-5 h-5' }),
            accentColor: '#059669',
            title: 'Vous êtes prêt ! 🎉',
            description:
                'Vous connaissez maintenant les bases. Créez votre première composition ou choisissez un template pour commencer. Bonne création !',
        },
    ],
};
