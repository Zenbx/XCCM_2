import { GraduationCap, Hash, BookOpen, Bell, CheckCircle } from 'lucide-react';
import React from 'react';
import type { TourConfig } from '@/context/OnboardingContext';

export const classroomTour: TourConfig = {
    flowId: 'classroom',
    title: 'Gérez vos classes',
    steps: [
        {
            target: '',
            placement: 'center',
            icon: React.createElement(GraduationCap, { className: 'w-5 h-5' }),
            accentColor: '#99334C',
            title: 'Votre espace LMS',
            description:
                'Bienvenue dans la gestion des classes ! Créez des classes, invitez vos étudiants, publiez des devoirs et suivez leur progression.',
        },
        {
            target: '#create-classroom-btn',
            placement: 'bottom',
            icon: React.createElement(GraduationCap, { className: 'w-5 h-5' }),
            accentColor: '#059669',
            title: 'Créez votre première classe',
            description:
                "Donnez un nom à votre classe. Un code d'accès unique sera généré automatiquement pour que vos étudiants puissent la rejoindre.",
        },
        {
            target: '#join-code-display',
            placement: 'bottom',
            icon: React.createElement(Hash, { className: 'w-5 h-5' }),
            accentColor: '#0ea5e9',
            title: 'Code d\'invitation',
            description:
                "Partagez ce code à vos étudiants. Ils n'ont qu'à le saisir dans leur interface pour rejoindre votre classe instantanément.",
        },
        {
            target: '#assignments-tab',
            placement: 'bottom',
            icon: React.createElement(BookOpen, { className: 'w-5 h-5' }),
            accentColor: '#8b5cf6',
            title: 'Devoirs et évaluations',
            description:
                'Publiez des devoirs avec une date limite. Les étudiants soumettent leurs réponses directement ici. Vous pouvez noter et laisser des commentaires.',
        },
        {
            target: '#stream-tab',
            placement: 'bottom',
            icon: React.createElement(Bell, { className: 'w-5 h-5' }),
            accentColor: '#f59e0b',
            title: 'Fil de la classe',
            description:
                'Postez des annonces, partagez des ressources et discutez avec vos étudiants. Ils reçoivent des notifications pour chaque nouveau message.',
        },
        {
            target: '',
            placement: 'center',
            icon: React.createElement(CheckCircle, { className: 'w-5 h-5' }),
            accentColor: '#059669',
            title: 'Votre LMS est prêt ! 🎓',
            description:
                'Votre classe est opérationnelle. Invitez vos premiers étudiants et partagez vos cours avec eux.',
        },
    ],
};
