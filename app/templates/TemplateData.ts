export interface TemplateStructure {
    parts: {
        title: string;
        intro: string;
        chapters: {
            title: string;
            paragraphs: {
                name: string;
            }[];
        }[];
    }[];
}

export const TEMPLATE_DATA: Record<number, TemplateStructure> = {
    1: {
        // Cours Universitaire Standard
        parts: [
            {
                title: "Introduction Générale",
                intro: "Présentation du cours, des objectifs et de la méthodologie.",
                chapters: [
                    {
                        title: "Contexte et Enjeux",
                        paragraphs: [{ name: "Historique" }, { name: "Problématique actuelle" }]
                    },
                    {
                        title: "Objectifs Pédagogiques",
                        paragraphs: [{ name: "Compétences visées" }, { name: "Plan du cours" }]
                    }
                ]
            },
            {
                title: "Fondements Théoriques",
                intro: "Bases conceptuelles nécessaires à la compréhension.",
                chapters: [
                    {
                        title: "Concepts Clés",
                        paragraphs: [{ name: "Définition A" }, { name: "Définition B" }, { name: "Définition C" }]
                    },
                    {
                        title: "Modèles de Référence",
                        paragraphs: [{ name: "Modèle 1" }, { name: "Modèle 2" }]
                    }
                ]
            },
            {
                title: "Applications Pratiques",
                intro: "Mise en œuvre des concepts.",
                chapters: [
                    {
                        title: "Étude de Cas 1",
                        paragraphs: [{ name: "Présentation du cas" }, { name: "Analyse" }, { name: "Résultats" }]
                    }
                ]
            },
            {
                title: "Conclusion",
                intro: "Synthèse et perspectives.",
                chapters: [
                    {
                        title: "Bilan",
                        paragraphs: [{ name: "Résumé des acquis" }]
                    }
                ]
            }
        ]
    },
    2: {
        // Tutoriel Pratique
        parts: [
            {
                title: "Prérequis",
                intro: "Ce dont vous avez besoin avant de commencer.",
                chapters: [
                    {
                        title: "Installation",
                        paragraphs: [{ name: "Outils nécessaires" }, { name: "Configuration de l'environnement" }]
                    }
                ]
            },
            {
                title: "Pas à Pas",
                intro: "Suivez le guide étape par étape.",
                chapters: [
                    {
                        title: "Étape 1 : Création",
                        paragraphs: [{ name: "Initialisation" }, { name: "Premier code" }]
                    },
                    {
                        title: "Étape 2 : Développement",
                        paragraphs: [{ name: "Ajout de fonctionnalités" }, { name: "Tests" }]
                    }
                ]
            },
            {
                title: "Aller plus loin",
                intro: "Améliorations possibles.",
                chapters: [
                    {
                        title: "Optimisations",
                        paragraphs: [{ name: "Performance" }, { name: "Sécurité" }]
                    }
                ]
            }
        ]
    }
};

// Fallback pour les IDs non définis (squelette générique)
export const GENERIC_TEMPLATE: TemplateStructure = {
    parts: [
        {
            title: "Partie 1",
            intro: "Introduction",
            chapters: [
                {
                    title: "Chapitre 1",
                    paragraphs: [{ name: "Section 1.1" }, { name: "Section 1.2" }]
                }
            ]
        },
        {
            title: "Partie 2",
            intro: "Développement",
            chapters: [
                {
                    title: "Chapitre 1",
                    paragraphs: [{ name: "Section 2.1" }]
                }
            ]
        }
    ]
};
