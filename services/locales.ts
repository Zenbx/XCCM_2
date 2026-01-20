export type Language = 'fr' | 'en';

export const translations: Record<Language, any> = {
    fr: {
        editor: {
            homeTitle: "Retour à l'accueil",
            saving: "Sauvegarde en cours...",
            saved: "Sauvegardé !",
            saveError: "Erreur lors de la sauvegarde",
            notionPlaceholder: "✏️ Commencez à rédiger votre notion ici... (Tapez '/' pour les commandes)",
            partPlaceholder: "📦 Glissez-déposez un Chapitre ici pour l'ajouter à cette Partie...",
            chapterPlaceholder: "📄 Glissez-déposez un Paragraphe ici pour l'ajouter à ce Chapitre...",
            paragraphPlaceholder: "💡 Glissez-déposez une Notion ici pour créer une nouvelle notion...",
            selectPrompt: "Sélectionnez un élément pour commencer...",
            updating: "Mise à jour en cours",
            importingPrompt: "Le granule sera importé et ajouté à la table des matières...",
            publishPreview: "Aperçu / Publication",
            comments: "Commentaires",
            settings: "Paramètres du projet",
            part: "Partie",
            chapter: "Chapitre",
            paragraph: "Paragraphe",
            notion: "Notion",
            publish: "Publier / Partager"
        },
        toc: {
            title: "Table des matières",
            addPart: "Ajouter une partie",
            addChapter: "Ajouter un chapitre",
            addParagraph: "Ajouter un paragraphe",
            addNotion: "Ajouter une notion",
            rename: "Renommer",
            delete: "Supprimer"
        },
        header: {
            links: {
                home: "Accueil",
                about: "À propos",
                edit: "Éditer",
                library: "Bibliothèque",
                marketplace: "Marketplace",
                community: "Communauté",
                help: "Aide"
            },
            menu: "Menu"
        },
        auth: {
            register: "S'inscrire",
            login: "Se connecter",
            logout: "Déconnexion",
            admin: "Administration",
            account: "Mon compte",
            settings: "Paramètres",
            analytics: "Statistiques"
        },
        footer: {
            title: "XCCM 2",
            newsletter: {
                title: "Abonnez-vous à notre Newsletter",
                desc: "Recevez les dernières nouveautés, mises à jour et offres directement dans votre boîte.",
                subscribe: "S'abonner",
                emailPlaceholder: "Votre E-mail"
            },
            links: {
                platform: "Plateforme",
                about: "À propos",
                support: "Aide & Support",
                solutions: "Solutions"
            },
            privacy: "Confidentialité",
            terms: "Conditions d'utilisation",
            accessibility: "Accessibilité",
            copyright: "© {year} XCCM 2. Projet Interaction Homme-Machine."
        },
        home: {
            hero: {
                titleLine1: "Créer vos cours",
                emph1: "facilement",
                emph2: "partagez",
                titleLine2: "vos connaissances",
                subtitle: "XCCM 2 est votre outil de création pédagogique moderne, structuré et centré sur l'utilisateur.",
                ctaPrimary: "Commencer",
                ctaSecondary: "En savoir plus",
                discoverFeatures: "Découvrir les fonctionnalités",
                docs: "Voir la documentation"
            },
            tabs: {
                organizations: "Pour les Organisations",
                home: "Pour la Maison",
                education: "Pour l'Éducation"
            },
            features: {
                title: "Fonctionnalités puissantes",
                subtitle: "Tout ce dont vous avez besoin pour créer des contenus exceptionnels",
                composition: { title: "Pour la Composition", desc: "Structurez vos idées en parties, chapitres et notions de manière hiérarchique et logique." },
                courses: { title: "Pour les Cours", desc: "Accédez à une bibliothèque complète et diffusez vos contenus en un seul clic." },
                sharing: { title: "Partage Simplifié", desc: "Partagez vos créations avec votre équipe ou le monde entier en quelques secondes." },
                performance: { title: "Performance Optimale", desc: "Interface rapide et réactive pour une expérience de création fluide." }
            },
            testimonials: { title: "Ils nous font confiance", subtitle: "Découvrez ce que nos utilisateurs disent de XCCM 2" },
            ctaBlock: {
                title: "Prêt à vous lancer ?",
                subtitle: "Rejoignez des milliers d'utilisateurs qui créent déjà des contenus exceptionnels avec XCCM 2",
                primary: "Commencer gratuitement",
                demo: "Planifier une démo",
                bullets: ["Gratuit pour commencer", "Sans carte bancaire", "Support 24/7"]
            },
            previewLabel: "Aperçu"
        },
        about: {
            hero: { title: "À propos de XCCM2", subtitle: "Une plateforme éducative numérique conçue pour faciliter la création, l'organisation et la publication de contenus pédagogiques en ligne." },
            presentation: { title: "Présentation générale", intro: "XCCM 2 est une plateforme éducative numérique conçue pour faciliter la création, l'organisation et la publication de contenus pédagogiques en ligne. Elle s'adresse aux enseignants, formateurs et créateurs de contenus souhaitant structurer leurs cours de manière claire, intuitive et accessible.", paragraph: "Pensée dans une logique de système auteur, la plateforme permet de concevoir des cours modulaires, organisés par parties, chapitres et notions, tout en offrant une expérience utilisateur fluide et cohérente." },
            features: [
                { title: "Création Simplifiée", desc: "Créez des cours structurés avec une interface intuitive" },
                { title: "Organisation Hiérarchique", desc: "Organisez vos contenus en parties, chapitres et notions" },
                { title: "Publication Rapide", desc: "Publiez et partagez vos cours en un clic" },
                { title: "Collaboration", desc: "Travaillez en équipe sur vos projets pédagogiques" }
            ],
            vision: { title: "Vision du projet", subtitle: "Transformer la manière dont les contenus pédagogiques sont créés et partagés", ambitionTitle: "Notre ambition", ambitionParagraph1: "À travers XCCM 2, l'ambition est de proposer une plateforme éducative moderne qui valorise la structuration du savoir, favorise l'autonomie des auteurs et améliore l'expérience d'apprentissage des utilisateurs finaux.", ambitionParagraph2: "XCCM 2 se positionne ainsi comme un outil pédagogique fiable, évolutif et centré sur l'humain, répondant aux besoins actuels de l'enseignement numérique." },
            values: [
                { title: "Innovation", desc: "Repousser les limites de l'éducation numérique" },
                { title: "Accessibilité", desc: "Rendre l'éducation accessible à tous" },
                { title: "Qualité", desc: "Garantir une expérience utilisateur irréprochable" },
                { title: "Évolution", desc: "S'adapter aux besoins de l'enseignement moderne" }
            ],
            team: { title: "Notre équipe", subtitle: "Des passionnés d'éducation et de technologie réunis pour créer la meilleure expérience" },
            contact: { name: "Nom", email: "E-mail", subject: "Sujet", message: "Message", send: "Envoyer", sectionLabel: "Contactez-nous", heading: "Nous contacter", subtitle: "Une question ? Une suggestion ? N'hésitez pas à nous écrire", formTitle: "Envoyez-nous un message", namePlaceholder: "Votre nom", emailPlaceholder: "votre@email.com", subjectPlaceholder: "Objet de votre message", messagePlaceholder: "Écrivez votre message ici...", infoTitle: "Informations de contact", hoursTitle: "Horaires d'ouverture" },
            cta: { title: "Prêt à révolutionner votre enseignement ?", subtitle: "Rejoignez XCCM 2 et créez des contenus pédagogiques exceptionnels", primary: "Commencer maintenant" }
        },
        help: {
            title: "Centre d'aide",
            searchPlaceholder: "Rechercher...",
            sections: {
                documentation: {
                    title: "Documentation",
                    subsections: {
                        intro: "Introduction à XCCM 2",
                        fonctionnalites: "Fonctionnalités principales",
                        interface: "Interface utilisateur",
                        organisation: "Organisation des cours",
                        publication: "Publication et partage"
                    }
                },
                faq: {
                    title: "FAQ",
                    subsections: {
                        compte: "Gestion du compte",
                        creation: "Création de contenu",
                        problemes: "Problèmes courants",
                        securite: "Sécurité et confidentialité"
                    }
                },
                guide: {
                    title: "Guide Auteurs",
                    subsections: {
                        'premier-cours': "Créer votre premier cours",
                        structuration: "Structurer vos contenus",
                        'bonnes-pratiques': "Bonnes pratiques pédagogiques",
                        multimedia: "Ajouter du multimédia",
                        collaboration: "Travailler en équipe"
                    }
                },
                support: {
                    title: "Support Technique",
                    subsections: {
                        contact: "Nous contacter",
                        'bug-report': "Signaler un bug",
                        compatibilite: "Compatibilité navigateurs",
                        api: "Documentation API"
                    }
                }
            },
            contactForm: { name: "Nom", email: "E-mail", subject: "Sujet", description: "Description", send: "Envoyer", formTitle: "Envoyez-nous un message", namePlaceholder: "Votre nom", emailPlaceholder: "votre@email.com", subjectPlaceholder: "Objet de votre message", descriptionPlaceholder: "Décrivez votre message ici...", success: "Message envoyé, merci !", fillAll: "Veuillez remplir tous les champs" }
        },
    },
    en: {
        editor: {
            homeTitle: "Back to home",
            saving: "Saving...",
            saved: "Saved!",
            saveError: "Save failed",
            notionPlaceholder: "✏️ Start writing your notion here... (Type '/' for commands)",
            partPlaceholder: "📦 Drag and drop a Chapter here to add it to this Part...",
            chapterPlaceholder: "📄 Drag and drop a Paragraph here to add it to this Chapter...",
            paragraphPlaceholder: "💡 Drag and drop a Notion here to create a new notion...",
            selectPrompt: "Select an item to start...",
            updating: "Updating...",
            importingPrompt: "The granule will be imported and added to the table of contents...",
            publishPreview: "Preview / Publish",
            comments: "Comments",
            settings: "Project Settings",
            part: "Part",
            chapter: "Chapter",
            paragraph: "Paragraph",
            notion: "Notion",
            publish: "Publish / Share"
        },
        toc: {
            title: "Table of Contents",
            addPart: "Add part",
            addChapter: "Add chapter",
            addParagraph: "Add paragraph",
            addNotion: "Add notion",
            rename: "Rename",
            delete: "Delete"
        },
        header: {
            links: {
                home: "Home",
                about: "About",
                edit: "Edit",
                library: "Library",
                marketplace: "Marketplace",
                community: "Community",
                help: "Help"
            },
            menu: "Menu"
        },
        auth: {
            register: "Register",
            login: "Login",
            logout: "Logout",
            admin: "Administration",
            account: "Account",
            settings: "Settings",
            analytics: "Analytics"
        },
        footer: {
            title: "XCCM 2",
            newsletter: {
                title: "Subscribe to our Newsletter",
                desc: "Receive the latest news, updates and offers directly in your inbox.",
                subscribe: "Subscribe",
                emailPlaceholder: "Your email"
            },
            links: {
                platform: "Platform",
                about: "About",
                support: "Help & Support",
                solutions: "Solutions"
            },
            privacy: "Privacy",
            terms: "Terms of use",
            accessibility: "Accessibility",
            copyright: "© {year} XCCM 2. Interaction Human-Machine Project."
        },
        home: {
            hero: {
                titleLine1: "Create your courses",
                emph1: "easily",
                emph2: "share",
                titleLine2: "your knowledge",
                subtitle: "XCCM 2 is your modern pedagogical creation tool: structured and user-centered.",
                ctaPrimary: "Get started",
                ctaSecondary: "Learn more",
                discoverFeatures: "Discover features",
                docs: "View documentation"
            },
            tabs: {
                organizations: "For Organizations",
                home: "For Home",
                education: "For Education"
            },
            features: {
                title: "Powerful features",
                subtitle: "Everything you need to create exceptional content",
                composition: { title: "For Composition", desc: "Organize your ideas into parts, chapters and notions in a hierarchical, logical way." },
                courses: { title: "For Courses", desc: "Access a complete library and publish your content with a single click." },
                sharing: { title: "Simplified Sharing", desc: "Share your creations with your team or the world in seconds." },
                performance: { title: "Optimal performance", desc: "Fast, responsive UI for a smooth creation experience." }
            },
            testimonials: { title: "Trusted by", subtitle: "See what our users say about XCCM 2" },
            ctaBlock: {
                title: "Ready to get started?",
                subtitle: "Join thousands of users already creating exceptional content with XCCM 2",
                primary: "Start for free",
                demo: "Schedule a demo",
                bullets: ["Free to start", "No card required", "24/7 support"]
            },
            previewLabel: "Preview"
        },
        about: {
            hero: { title: "About XCCM2", subtitle: "A digital educational platform designed to simplify creation, organization and publishing of pedagogical content online." },
            presentation: { title: "Overview", intro: "XCCM 2 is a digital educational platform designed to simplify the creation, organization and publishing of pedagogical content online. It targets teachers, trainers and content creators who want to structure their courses clearly, intuitively and accessibly.", paragraph: "Designed as an authoring system, the platform allows modular course design organized into parts, chapters and notions, while offering a smooth and coherent user experience." },
            features: [
                { title: "Simplified Creation", desc: "Create structured courses with an intuitive interface" },
                { title: "Hierarchical Organization", desc: "Organize your content into parts, chapters and notions" },
                { title: "Fast Publishing", desc: "Publish and share your courses in one click" },
                { title: "Collaboration", desc: "Work as a team on your educational projects" }
            ],
            vision: { title: "Project Vision", subtitle: "Transforming how pedagogical content is created and shared", ambitionTitle: "Our ambition", ambitionParagraph1: "Through XCCM 2, our ambition is to offer a modern educational platform that values knowledge structuring, promotes author autonomy and improves the end-users' learning experience.", ambitionParagraph2: "XCCM 2 positions itself as a reliable, scalable and human-centered educational tool, responding to the current needs of digital education." },
            values: [
                { title: "Innovation", desc: "Pushing the boundaries of digital education" },
                { title: "Accessibility", desc: "Making education accessible to everyone" },
                { title: "Quality", desc: "Ensuring an impeccable user experience" },
                { title: "Evolution", desc: "Adapting to the demands of modern teaching" }
            ],
            team: { title: "Our team", subtitle: "Passionate people in education and technology united to build the best experience" },
            contact: { name: "Name", email: "Email", subject: "Subject", message: "Message", send: "Send", sectionLabel: "Contact us", heading: "Get in touch", subtitle: "Have a question or suggestion? Please write to us.", formTitle: "Send us a message", namePlaceholder: "Your name", emailPlaceholder: "your@email.com", subjectPlaceholder: "Subject of your message", messagePlaceholder: "Write your message here...", infoTitle: "Contact information", hoursTitle: "Opening hours" },
            cta: { title: "Ready to revolutionize your teaching?", subtitle: "Join XCCM 2 and create exceptional pedagogical content", primary: "Get started now" }
        },
        help: {
            title: "Help Center",
            searchPlaceholder: "Search...",
            sections: {
                documentation: {
                    title: "Documentation",
                    subsections: {
                        intro: "Introduction to XCCM 2",
                        fonctionnalites: "Main features",
                        interface: "User interface",
                        organisation: "Course organization",
                        publication: "Publication and sharing"
                    }
                },
                faq: {
                    title: "FAQ",
                    subsections: {
                        compte: "Account management",
                        creation: "Content creation",
                        problemes: "Common issues",
                        securite: "Security & privacy"
                    }
                },
                guide: {
                    title: "Author Guide",
                    subsections: {
                        'premier-cours': "Create your first course",
                        structuration: "Structure your content",
                        'bonnes-pratiques': "Best pedagogical practices",
                        multimedia: "Add multimedia",
                        collaboration: "Work as a team"
                    }
                },
                support: {
                    title: "Technical Support",
                    subsections: {
                        contact: "Contact us",
                        'bug-report': "Report a bug",
                        compatibilite: "Browser compatibility",
                        api: "API documentation"
                    }
                }
            },
            contactForm: { name: "Name", email: "Email", subject: "Subject", description: "Description", send: "Send", formTitle: "Send us a message", namePlaceholder: "Your name", emailPlaceholder: "your@email.com", subjectPlaceholder: "Subject of your message", descriptionPlaceholder: "Describe your message here...", success: "Message sent, thanks!", fillAll: "Please fill in all fields" }
        }
    }
}
