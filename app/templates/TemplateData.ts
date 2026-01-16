export interface TemplateStructure {
    parts: {
        title: string;
        intro: string;
        chapters: {
            title: string;
            paragraphs: {
                name: string;
                notions?: {
                    name: string;
                    content: string;
                }[];
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
            // ... (structure simplifiée pour les autres)
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
                        paragraphs: [{ name: "Outils nécessaires" }]
                    }
                ]
            }
        ]
    },
    5: {
        // Guide Utilisateur XCCM2 - Version Complète
        parts: [
            {
                title: "1. Découverte et Accès",
                intro: "Tout ce qu'il faut savoir pour bien démarrer sur la plateforme XCCM2, de l'inscription à la gestion de vos projets.",
                chapters: [
                    {
                        title: "Accès à la Plateforme",
                        paragraphs: [
                            {
                                name: "Première Visite",
                                notions: [
                                    {
                                        name: "Page d'Accueil",
                                        content: `
                                            <h3>Bienvenue sur XCCM2</h3>
                                            <p>Lorsque vous accédez au site pour la première fois, vous arrivez sur la <strong>Page d'Accueil (Landing Page)</strong>. Elle présente les fonctionnalités clés de l'outil d'édition pédagogique.</p>
                                            <div style="background:#f0f0f0; padding:20px; text-align:center; margin:10px 0; border: 2px dashed #99334C;">
                                                <strong style="color:#99334C;">[INSÉRER CAPTURE D'ÉCRAN : Landing Page / Page d'accueil publique]</strong>
                                            </div>
                                            <p>Cliquez sur <strong>"Commencer"</strong> ou <strong>"Connexion"</strong> pour accéder à l'application.</p>
                                        `
                                    },
                                    {
                                        name: "Inscription et Connexion",
                                        content: `
                                            <h3>Création de Compte</h3>
                                            <p>Si vous êtes nouveau, créez un compte en renseignant votre email, nom et mot de passe. Sinon, utilisez vos identifiants habituels.</p>
                                            <div style="background:#f0f0f0; padding:20px; text-align:center; margin:10px 0; border: 2px dashed #99334C;">
                                                <strong style="color:#99334C;">[INSÉRER CAPTURE D'ÉCRAN : Page de Connexion / Inscription]</strong>
                                            </div>
                                            <div style="background:#e3f2fd; padding:15px; border-left: 4px solid #2196f3; margin-top:10px;">
                                                <strong>Note :</strong> En cas d'oubli de mot de passe, utilisez le lien "Mot de passe oublié" en bas du formulaire.
                                            </div>
                                        `
                                    }
                                ]
                            },
                        ]
                    },
                    {
                        title: "Le Tableau de Bord",
                        paragraphs: [
                            {
                                name: "Interface Principale",
                                notions: [
                                    {
                                        name: "Vue d'ensemble",
                                        content: `
                                            <h3>Votre Espace de Travail (Edit Home)</h3>
                                            <p>Une fois connecté, vous atterrissez sur le <strong>Tableau de Bord</strong>. C'est le centre de contrôle de tous vos projets.</p>
                                            <div style="background:#f0f0f0; padding:20px; text-align:center; margin:10px 0; border: 2px dashed #99334C;">
                                                <strong style="color:#99334C;">[INSÉRER CAPTURE D'ÉCRAN : Tableau de Bord global]</strong>
                                            </div>
                                            <ul>
                                                <li><strong>Haut :</strong> Bannière de bienvenue et bouton de création rapide.</li>
                                                <li><strong>Centre :</strong> Galerie de modèles (Templates) pour démarrer rapidement.</li>
                                                <li><strong>Bas :</strong> Liste de vos projets récents avec filtres (Mes Projets, Partagés, En Attente).</li>
                                            </ul>
                                        `
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                title: "2. L'Éditeur Avancé",
                intro: "Maîtrisez la création de contenu : structure, imports, et outils d'édition puissants.",
                chapters: [
                    {
                        title: "Structure et Navigation",
                        paragraphs: [
                            {
                                name: "Organisation du Cours",
                                notions: [
                                    {
                                        name: "La Table des Matières",
                                        content: `
                                            <h3>Structurer votre pensée</h3>
                                            <p>Le panneau latéral gauche permet de construire l'arborescence de votre cours : <strong>Parties > Chapitres > Paragraphes > Notions</strong>.</p>
                                            <div style="background:#f0f0f0; padding:20px; text-align:center; margin:10px 0; border: 2px dashed #99334C;">
                                                <strong style="color:#99334C;">[INSÉRER CAPTURE D'ÉCRAN : Colonne de gauche (Arbre de structure)]</strong>
                                            </div>
                                            <p>Utilisez les boutons <strong>(+)</strong> au survol pour ajouter des éléments à n'importe quel niveau.</p>
                                        `
                                    },
                                    {
                                        name: "Réorganisation (Drag & Drop)",
                                        content: `
                                            <h3>Glisser-Déposer Intuitif</h3>
                                            <p>Vous souhaitez changer l'ordre d'un chapitre ou d'une notion ?</p>
                                            <p>Maintenez le clic sur l'élément dans l'arbre et <strong>glissez-le</strong> vers sa nouvelle position. L'interface vous indiquera où il sera déposé.</p>
                                        `
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        title: "Bibliothèque et Imports",
                        paragraphs: [
                            {
                                name: "Le Panneau d'Import",
                                notions: [
                                    {
                                        name: "Accéder à la Bibliothèque",
                                        content: `
                                            <h3>Ressources Externes</h3>
                                            <p>Le panneau de droite (accessible via les onglets latéraux) contient l'onglet <strong>Bibliothèque / Import</strong>.</p>
                                            <div style="background:#f0f0f0; padding:20px; text-align:center; margin:10px 0; border: 2px dashed #99334C;">
                                                <strong style="color:#99334C;">[INSÉRER CAPTURE D'ÉCRAN : Panneau latéral droit ouvert sur l'onglet Import]</strong>
                                            </div>
                                            <p>Vous y trouverez vos grains pédagogiques réutilisables.</p>
                                        `
                                    },
                                    {
                                        name: "Drag & Drop de Contenu",
                                        content: `
                                            <h3>Import Facile</h3>
                                            <p>Pour intégrer un contenu existant :</p>
                                            <ol>
                                                <li>Ouvrez le panneau d'import.</li>
                                                <li>Saisissez l'élément (granule ou média).</li>
                                                <li><strong>Glissez-le directement dans l'éditeur</strong> ou dans la structure à gauche.</li>
                                            </ol>
                                            <div style="background:#f0f0f0; padding:20px; text-align:center; margin:10px 0; border: 2px dashed #99334C;">
                                                <strong style="color:#99334C;">[INSÉRER CAPTURE D'ÉCRAN : Action de Drag & Drop en cours depuis le panneau droit]</strong>
                                            </div>
                                        `
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        title: "L'Outil d'Édition",
                        paragraphs: [
                            {
                                name: "Rédaction et Mise en Page",
                                notions: [
                                    {
                                        name: "Barre d'Outils Riche",
                                        content: `
                                            <h3>Formatage Professionnel</h3>
                                            <p>En haut de l'éditeur, la barre d'outils vous permet de :</p>
                                            <ul>
                                                <li>Changer la police et la taille.</li>
                                                <li>Mettre en gras, italique, souligné.</li>
                                                <li>Créer des listes à puces ou numérotées.</li>
                                                <li>Aligner le texte.</li>
                                            </ul>
                                            <div style="background:#f0f0f0; padding:20px; text-align:center; margin:10px 0; border: 2px dashed #99334C;">
                                                <strong style="color:#99334C;">[INSÉRER CAPTURE D'ÉCRAN : Zoom sur la barre d'outils (Toolbar)]</strong>
                                            </div>
                                        `
                                    },
                                    {
                                        name: "Gestion des Images",
                                        content: `
                                            <h3>Images : Import et Retouche</h3>
                                            <p>L'ajout d'images est ultra-rapide :</p>
                                            <ol>
                                                <li>Copiez une image (ou une capture d'écran) dans votre presse-papier.</li>
                                                <li>Faites <strong>Ctrl+V</strong> dans l'éditeur.</li>
                                            </ol>
                                            <p><strong>Cliquez sur l'image</strong> pour afficher ses outils contextuels :</p>
                                            <ul>
                                                <li><strong>Redimensionnement :</strong> 25%, 50%, 75%, 100%.</li>
                                                <li><strong>Alignement :</strong> Gauche, Centre, Droite.</li>
                                                <li><strong>Suppression :</strong> Icône corbeille.</li>
                                            </ul>
                                            <div style="background:#f0f0f0; padding:20px; text-align:center; margin:10px 0; border: 2px dashed #99334C;">
                                                <strong style="color:#99334C;">[INSÉRER CAPTURE D'ÉCRAN : Image avec sa barre d'outils flottante active]</strong>
                                            </div>
                                        `
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        title: "Assistance Intelligente",
                        paragraphs: [
                            {
                                name: "Le ChatBot IA",
                                notions: [
                                    {
                                        name: "Compagnon de Rédaction",
                                        content: `
                                            <h3>Un Assistant Pédagogique</h3>
                                            <p>Besoin d'aide pour reformuler un paragraphe ?</p>
                                            <div style="background:#f0f0f0; padding:20px; text-align:center; margin:10px 0; border: 2px dashed #99334C;">
                                                <strong style="color:#99334C;">[INSÉRER CAPTURE D'ÉCRAN : Interface du ChatBot ouverte]</strong>
                                            </div>
                                            <p>Le ChatBot (en bas à droite) est conscient du contexte de votre notion. Demandez-lui : <em>"Simplifie ce texte pour des débutants"</em>. Vous pouvez ensuite <strong>Copier</strong> sa réponse en un clic.</p>
                                        `
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                title: "3. Gestion et Collaboration",
                intro: "Collaborez efficacement et configurez votre projet dans les moindres détails.",
                chapters: [
                    {
                        title: "Travail d'Équipe",
                        paragraphs: [
                            {
                                name: "Commentaires et Discussions",
                                notions: [
                                    {
                                        name: "Fil de Commentaires",
                                        content: `
                                            <h3>Discuter autour du contenu</h3>
                                            <p>Le panneau de droite possède un onglet <strong>Commentaires</strong>.</p>
                                            <div style="background:#f0f0f0; padding:20px; text-align:center; margin:10px 0; border: 2px dashed #99334C;">
                                                <strong style="color:#99334C;">[INSÉRER CAPTURE D'ÉCRAN : Panneau des commentaires avec une discussion]</strong>
                                            </div>
                                            <p>Échangez avec vos collaborateurs directement dans le contexte du projet sans passer par des emails externes.</p>
                                        `
                                    },
                                    {
                                        name: "Partage et Invitations",
                                        content: `
                                            <h3>Inviter des Collaborateurs</h3>
                                            <p>Cliquez sur le bouton <strong>Partager</strong> (icône Share) en haut à droite.</p>
                                            <div style="background:#f0f0f0; padding:20px; text-align:center; margin:10px 0; border: 2px dashed #99334C;">
                                                <strong style="color:#99334C;">[INSÉRER CAPTURE D'ÉCRAN : Modale de partage / invitation]</strong>
                                            </div>
                                            <p>Vous pouvez ajouter des utilisateurs par email. Ils recevront une invitation sur leur tableau de bord.</p>
                                        `
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        title: "Configuration du Projet",
                        paragraphs: [
                            {
                                name: "Infos et Paramètres",
                                notions: [
                                    {
                                        name: "Informations Générales",
                                        content: `
                                            <h3>Métadonnées du Projet</h3>
                                            <p>L'onglet <strong>Infos</strong> (panneau de droite) résume les statistiques de votre projet : auteur, date de création, nombre de parties/chapitres.</p>
                                            <div style="background:#f0f0f0; padding:20px; text-align:center; margin:10px 0; border: 2px dashed #99334C;">
                                                <strong style="color:#99334C;">[INSÉRER CAPTURE D'ÉCRAN : Onglet 'Infos' du panneau droit]</strong>
                                            </div>
                                        `
                                    },
                                    {
                                        name: "Paramètres Avancés",
                                        content: `
                                            <h3>Configuration</h3>
                                            <p>Accédez aux paramètres pour modifier le titre du projet, ou gérer les droits d'accès plus finement.</p>
                                            <div style="background:#f0f0f0; padding:20px; text-align:center; margin:10px 0; border: 2px dashed #99334C;">
                                                <strong style="color:#99334C;">[INSÉRER CAPTURE D'ÉCRAN : Modale ou Panneau de Paramètres]</strong>
                                            </div>
                                        `
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                title: "4. Finalisation et Export",
                intro: "Votre projet est prêt ? Il est temps de le publier ou de l'imprimer.",
                chapters: [
                    {
                        title: "Rendu Final",
                        paragraphs: [
                            {
                                name: "Prévisualisation",
                                notions: [
                                    {
                                        name: "Aperçu (Preview)",
                                        content: `
                                            <h3>Voir le résultat final</h3>
                                            <p>Cliquez sur l'icône <strong>Œil (Aperçu)</strong> dans la barre supérieure pour voir votre cours tel que le verront les apprenants.</p>
                                            <div style="background:#f0f0f0; padding:20px; text-align:center; margin:10px 0; border: 2px dashed #99334C;">
                                                <strong style="color:#99334C;">[INSÉRER CAPTURE D'ÉCRAN : Page de Preview du document complet]</strong>
                                            </div>
                                        `
                                    }
                                ]
                            },
                        ]
                    },
                    {
                        title: "Exportation",
                        paragraphs: [
                            {
                                name: "Format PDF",
                                notions: [
                                    {
                                        name: "Générer le PDF",
                                        content: `
                                            <h3>Téléchargement</h3>
                                            <p>Depuis la page d'aperçu, utilisez le bouton <strong>Export PDF</strong>.</p>
                                            <div style="background:#f0f0f0; padding:20px; text-align:center; margin:10px 0; border: 2px dashed #99334C;">
                                                <strong style="color:#99334C;">[INSÉRER CAPTURE D'ÉCRAN : Bouton ou Menu d'export PDF]</strong>
                                            </div>
                                            <p>Le système génère un document paginé, propre, incluant toutes vos images et mises en forme, prêt pour l'impression ou l'archivage.</p>
                                        `
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
};

export const GENERIC_TEMPLATE: TemplateStructure = {
    parts: [
        {
            title: "Structure Vide",
            intro: "",
            chapters: []
        }
    ]
};
