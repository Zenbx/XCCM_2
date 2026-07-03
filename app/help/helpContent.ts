/**
 * Documentation du centre d'aide XCCM 2.
 * Contenu aligné sur les fonctionnalités réelles (éditeur, classes, Moodle, API).
 */

export type HelpLocale = 'fr' | 'en';

export type HelpArticle = {
  title: string;
  content?: string;
  isForm?: boolean;
};

export type HelpContentMap = Record<string, Record<string, HelpArticle>>;

const fr: HelpContentMap = {
  documentation: {
    intro: {
      title: 'Introduction à XCCM 2',
      content: `XCCM 2 est une plateforme de création et de diffusion de contenus pédagogiques structurés. Elle s’adresse aux enseignants, auteurs et établissements qui veulent concevoir des cours hiérarchiques, collaborer en temps réel, et les diffuser via des classes ou un LMS externe (Moodle).

Ce que vous pouvez faire avec XCCM 2 :
• Créer des projets de cours organisés en Parties → Chapitres → Paragraphes → Notions
• Éditer le contenu dans un éditeur riche (TipTap), avec sauvegarde et collaboration
• Utiliser l’assistant IA pédagogique (aide à la rédaction, méthode socratique côté apprenant)
• Gérer des classes, devoirs et exercices interactifs
• Publier des documents dans la bibliothèque et partager des granules via la marketplace
• Intégrer l’éditeur dans Moodle grâce au plugin mod_xccm (iframe sécurisée)

XCCM 2 sépare clairement l’espace de création (vos projets) de l’espace de diffusion (classes, bibliothèque, Moodle).`,
    },
    demarrage: {
      title: 'Démarrage rapide',
      content: `1. Créez un compte
Allez sur Inscription, renseignez email, prénom, nom et mot de passe. Vous pouvez aussi vous connecter via les fournisseurs OAuth configurés.

2. Ouvrez vos projets
Après connexion, la page d’accueil des projets (/edit-home) liste vos cours. Cliquez sur « Nouveau projet », donnez un nom (3 à 100 caractères), puis ouvrez l’éditeur.

3. Construisez la structure
Dans la table des matières à gauche, ajoutez des Parties, puis des Chapitres, Paragraphes et Notions. Sélectionnez une notion pour rédiger dans la zone centrale.

4. Utilisez le panneau de droite
Import de fichiers, marketplace, coffre-fort, IA, commentaires, exercices, paramètres du projet et tutoriel intégré.

5. Sauvegardez et prévisualisez
Ctrl+S enregistre. Le bouton Aperçu montre le rendu publié. Partagez le projet avec des co-auteurs via le bouton Partager.

Astuce : un tour guidé démarre automatiquement la première fois dans l’éditeur.`,
    },
    fonctionnalites: {
      title: 'Fonctionnalités principales',
      content: `Éditeur de cours
• Structure granulaire à 4 niveaux (Partie, Chapitre, Paragraphe, Notion)
• Éditeur WYSIWYG (gras, italique, listes, alignement, images, formules)
• Mode Zen pour se concentrer sur le texte
• Import intelligent de documents (PDF, DOCX) découpés en structure
• Historique local d’actions (annuler / rétablir structure)
• Blame / révisions de granules en contexte collaboratif

Collaboration
• Invitations par email avec rôles
• Présence en temps réel (utilisateurs connectés, curseurs)
• Commentaires sur le projet
• Synchronisation structure via Synapse

Intelligence artificielle
• Panneau XCCM AI dans l’éditeur (génération, reformulation, aide pédagogique)
• Mode socratique pour les apprenants (guide sans donner la réponse brute)

Classes (LMS intégré)
• Création de classes et code d’invitation
• Flux d’annonces
• Devoirs (texte ou fichier) et suivi des rendus
• Lien projet ↔ classe avec synchronisation
• Exercices (QCM, questions ouvertes, etc.) attachés aux notions
• Analytics de classe et de projet

Bibliothèque & partage
• Publication de documents consultables
• Marketplace de granules réutilisables
• Coffre-fort personnel (vault)

Intégration Moodle
• Activité mod_xccm dans un cours Moodle
• Authentification automatique (JWT) et ouverture de l’éditeur en iframe
• Création automatique du projet s’il n’existe pas encore pour l’utilisateur Moodle`,
    },
    interface: {
      title: 'Interface de l’éditeur',
      content: `L’éditeur (/edit?projectName=…) est organisé en trois zones :

Gauche — Table des matières
• Arborescence du cours
• Création, renommage, réordonnancement et déplacement des granules
• Ouverture mobile via le bouton menu

Centre — Rédaction
• En-tête : nom du projet, fil d’Ariane, présence des collaborateurs, Enregistrer
• Barre d’outils de formatage et Mode Zen
• Zone TipTap pour le contenu de la notion ou de l’intro de partie sélectionnée

Droite — Panneau d’outils
• Importer un fichier
• Marketplace
• Coffre-fort
• XCCM AI
• Commentaires
• Informations du projet
• Paramètres (métadonnées, export, publication)
• Exercices liés au granule courant
• Tutoriel

En mode Moodle (iframe /embed/editor), certains liens de navigation hors éditeur (Accueil, Aperçu, Partager) sont masqués pour rester dans le cadre Moodle.`,
    },
    structure: {
      title: 'Structure d’un cours',
      content: `Tout projet suit la hiérarchie :

Partie
  └─ Chapitre
       └─ Paragraphe
            └─ Notion  ← unité de contenu principale (texte riche, exercices)

Règles utiles
• Une Partie peut avoir une introduction (contenu au niveau partie)
• Les Notions portent le contenu pédagogique détaillé
• Les exercices se rattachent au granule sélectionné
• Les noms de projet sont uniques par propriétaire (3–100 caractères, lettres, chiffres, espaces et ponctuation courante)

Bonnes pratiques de nommage
• Parties : thèmes larges (« Algèbre linéaire »)
• Chapitres : séquences (« Matrices et déterminants »)
• Notions : objectifs précis (« Calcul du déterminant 2×2 »)`,
    },
    collaboration: {
      title: 'Collaboration en temps réel',
      content: `Inviter des co-auteurs
1. Ouvrez le projet dans l’éditeur
2. Cliquez sur Partager
3. Envoyez une invitation par email
4. Le co-auteur accepte l’invitation depuis le lien reçu

Pendant l’édition
• Les avatars des membres connectés apparaissent dans l’en-tête
• Les modifications de structure se synchronisent entre sessions
• Les commentaires permettent de discuter sans quitter l’éditeur

Permissions
• Propriétaire : administration complète, invitations, suppression
• Invité accepté : accès selon le rôle défini à l’invitation

Si la connexion temps réel se coupe, un indicateur de statut apparaît ; vous pouvez forcer une reconnexion depuis l’en-tête.`,
    },
    ia: {
      title: 'Assistant IA',
      content: `Panneau XCCM AI (éditeur)
Accessible depuis l’icône étincelles à droite. Il s’appuie sur le contexte du granule sélectionné et le contenu affiché pour :
• Proposer ou reformuler du contenu pédagogique
• Aider à structurer une notion
• Auditer la clarté du texte

Mode socratique (apprenants)
Dans le lecteur / parcours étudiant, l’IA ne donne pas la réponse finale : elle pose des questions pour faire progresser l’apprenant. Elle connaît la notion courante.

Conseils
• Sélectionnez d’abord la bonne notion avant d’appeler l’IA
• Relisez toujours le contenu généré avant de publier
• L’IA complète l’auteur, elle ne le remplace pas`,
    },
    classes: {
      title: 'Classes et LMS',
      content: `Projets vs Classes
• Projet : espace de création et d’édition (bibliothèque personnelle)
• Classe : espace de diffusion vers des élèves, avec annonces, devoirs et analytics

Créer une classe
1. Menu Classes → Nouvelle classe
2. Donnez un nom et récupérez le code d’invitation
3. Transmettez le code aux élèves (Classes → Rejoindre)

Lier un cours
Ajoutez un projet à la classe, puis synchronisez pour que les élèves voient la version publiée / à jour.

Devoirs
Types supportés : réponse texte ou dépôt de fichier. Suivez les rendus depuis l’onglet Devoirs de la classe.

Exercices dans le cours
Depuis l’éditeur, panneau Exercices : créez des activités liées à une notion (QCM, question ouverte, etc.). Les élèves les retrouvent dans leur parcours.`,
    },
    moodle: {
      title: 'Intégration Moodle',
      content: `XCCM 2 s’intègre à Moodle via le plugin d’activité mod_xccm.

Côté enseignant Moodle
1. L’administrateur installe le plugin et configure :
   • URL de base XCCM 2 (ex. https://xccm-2.vercel.app) — le front doit proxyfier /api/*
   • Secret API (PLUGIN_API_SECRET), identique à celui de l’API XCCM 2
2. Dans un cours Moodle, ajoutez une activité « XCCM2 »
3. Indiquez le nom du projet XCCM (option individuelle : modèle avec {user_id})

Côté étudiant / auteur dans Moodle
• À l’ouverture de l’activité, Moodle obtient un JWT via POST /api/auth/external
• L’éditeur s’affiche dans une iframe : /embed/editor?projectName=…&token=…
• Si le projet n’existe pas encore pour cet utilisateur XCCM, il est créé automatiquement
• L’édition reste dans l’iframe Moodle (pas de redirection vers l’accueil XCCM)

Points d’attention
• L’utilisateur Moodle est provisionné dans XCCM (email Moodle) : ce n’est pas forcément le même compte que votre admin web XCCM
• En cas de « Session invalide », rechargez l’activité depuis Moodle (nouveau token)
• Le secret API ne doit jamais être exposé côté navigateur : seul le serveur Moodle l’utilise`,
    },
    publication: {
      title: 'Publication et partage',
      content: `Aperçu
Utilisez Aperçu pour voir le rendu avant diffusion.

Publication document
Depuis les paramètres du projet ou le flux de publication, rendez un cours accessible dans la bibliothèque selon la visibilité choisie.

Marketplace
Publiez un granule (partie, notion…) pour le réutiliser ou le partager avec la communauté. Importez des granules depuis le panneau Marketplace de l’éditeur.

Export
Exportez le projet (PDF / formats supportés selon la configuration) depuis les actions d’export / aperçu.

Classes
Pour les élèves d’une classe, préférez le lien projet + synchronisation plutôt qu’un simple lien public.`,
    },
    shortcuts: {
      title: 'Raccourcis clavier',
      content: `Éditeur
• Ctrl + S — Enregistrer
• Ctrl + B / I / U — Gras / Italique / Souligné
• Alt + Z — Mode Zen
• Alt + P — Aperçu (hors embed Moodle)
• Alt + H — Accueil projets (hors embed Moodle)
• Échap — Fermer menus et dialogues

Édition de texte (raccourcis navigateur / TipTap)
• Ctrl + Z / Ctrl + Y — Annuler / Rétablir dans le texte
• Les actions de structure (déplacer, renommer) disposent aussi d’un historique dédié dans l’éditeur`,
    },
    'slash-commands': {
      title: 'Commandes Slash (/)',
      content: `Dans la zone d’édition, tapez / pour ouvrir le menu d’actions rapides (selon la configuration de l’éditeur) :

• /part ou /p — Nouvelle partie
• /chap ou /c — Nouveau chapitre
• /para — Nouveau paragraphe
• /notion ou /n — Nouvelle notion
• /img — Insérer une image
• /ai ou /bot — Ouvrir l’assistant IA
• /math — Formule (LaTeX)
• /note — Bloc note

Vous pouvez aussi créer la structure depuis la table des matières (recommandé pour les gros cours).`,
    },
  },

  faq: {
    compte: {
      title: 'Compte et connexion',
      content: `Q : Comment créer un compte ?
R : Page Inscription, puis validation du formulaire. Connexion ensuite via /login.

Q : Mot de passe oublié ?
R : Lien « Mot de passe oublié » sur la page de connexion ; un email de réinitialisation est envoyé.

Q : Puis-je modifier mon profil ?
R : Oui, depuis Compte / Paramètres (nom, photo, préférences).

Q : Je me connecte depuis Moodle : ai-je besoin d’un compte séparé ?
R : Moodle crée / réutilise un compte XCCM basé sur votre email Moodle. Ce n’est pas automatiquement le même compte que celui créé manuellement sur le site, sauf si les emails coïncident.`,
    },
    editeur: {
      title: 'Éditeur et projets',
      content: `Q : Combien de projets puis-je avoir ?
R : Autant que nécessaire ; chaque nom de projet est unique pour votre compte.

Q : Que signifie « Erreur lors de la récupération du projet » ?
R : Le projet n’existe pas pour votre utilisateur, ou le token a expiré. Depuis Moodle, rechargez l’activité (création auto du projet). Depuis le web, créez le projet sur /edit-home ou vérifiez le nom exact.

Q : Mes modifications sont-elles sauvegardées automatiquement ?
R : Utilisez Ctrl+S / le bouton Enregistrer pour une sauvegarde explicite. Ne fermez pas l’onglet avec des changements non enregistrés (indicateur dans l’en-tête).

Q : Puis-je travailler hors ligne ?
R : Non, une connexion est requise pour l’API et la collaboration temps réel.`,
    },
    classes: {
      title: 'Classes et élèves',
      content: `Q : Comment un élève rejoint-il une classe ?
R : Avec le code d’invitation fourni par l’enseignant (Classes → Rejoindre).

Q : Les élèves voient-ils mes brouillons ?
R : Non. Ils accèdent aux contenus liés / synchronisés dans la classe, pas à vos projets privés non partagés.

Q : Comment mettre à jour un cours déjà dans une classe ?
R : Modifiez le projet, puis synchronisez depuis la classe.`,
    },
    moodle: {
      title: 'Moodle',
      content: `Q : L’iframe affiche une erreur de session
R : Le JWT a expiré ou est invalide. Rouvrez l’activité depuis Moodle (un nouveau token est émis).

Q : Le projet est vide / inexistant pour mon compte Moodle
R : Normal au premier accès : XCCM crée le projet au nom configuré dans l’activité. Vérifiez le nom du projet dans les paramètres de l’activité Moodle.

Q : Je suis redirigé vers la liste des projets dans l’iframe
R : Ancien comportement corrigé : restez sur /embed/editor. Rechargez après mise à jour du front, et n’utilisez pas les liens Accueil hors embed.

Q : Qui configure le secret API ?
R : Uniquement l’administrateur Moodle (réglages du plugin) et l’administrateur de l’API XCCM (variable PLUGIN_API_SECRET).`,
    },
    problemes: {
      title: 'Problèmes courants',
      content: `Q : L’éditeur ne répond plus
R : Rechargez la page (F5). Vérifiez votre connexion. Réenregistrez après rechargement.

Q : Boucle de chargement / trop d’appels réseau
R : Déconnectez-vous, videz le cache du site pour le domaine XCCM, reconnectez-vous. Signalez le bug si cela continue.

Q : L’aperçu ne correspond pas au contenu
R : Enregistrez d’abord, puis rouvrez l’aperçu. Videz le cache navigateur si besoin.

Q : Import PDF/DOCX incomplet
R : Vérifiez le format et la taille du fichier. Relancez l’import ; pour les très gros documents, découpez-les.`,
    },
    securite: {
      title: 'Sécurité et confidentialité',
      content: `Q : Qui voit mes projets non publiés ?
R : Vous et les collaborateurs explicitement invités.

Q : Les communications sont-elles chiffrées ?
R : Oui, en HTTPS (TLS) sur les déploiements de production.

Q : Où est le secret Moodle ?
R : Uniquement côté serveur Moodle et variables d’environnement API — jamais dans le front public ni dans l’URL de l’iframe (seul un JWT temporaire y figure).

Q : Suppression de compte
R : Contactez le support via le formulaire du centre d’aide (compte connecté requis).`,
    },
  },

  guide: {
    'premier-projet': {
      title: 'Créer votre premier projet',
      content: `1. Connectez-vous et ouvrez /edit-home
2. Cliquez sur Nouveau projet et choisissez un nom clair (ex. « Analyse 1 — Semestre A »)
3. Dans l’éditeur, créez une première Partie et une Notion
4. Rédigez le contenu, insérez une image si besoin
5. Enregistrez (Ctrl+S)
6. Ouvrez l’Aperçu pour valider le rendu
7. (Optionnel) Invitez un collègue via Partager

Objectif : un squelette Partie → Chapitre → Notion avant de rédiger en masse.`,
    },
    structuration: {
      title: 'Bien structurer un cours',
      content: `Méthode recommandée
1. Découpez le programme en Parties (modules)
2. Chaque Partie : 2 à 5 Chapitres
3. Chaque Chapitre : Paragraphes thématiques
4. Chaque Paragraphe : Notions atomiques (une idée = une notion)

Évitez
• Une seule notion géante de 20 pages
• Des titres ambigus (« Suite », « Suite 2 »)
• De mélanger exercices et théorie sans granule dédié

Exercices
Attachez les exercices à la notion concernée via le panneau Exercices, pour que le parcours étudiant reste cohérent.`,
    },
    exercices: {
      title: 'Exercices interactifs',
      content: `1. Sélectionnez une notion dans la TOC
2. Ouvrez le panneau Exercices à droite
3. Créez un exercice (QCM, question ouverte, etc. selon les types disponibles)
4. Enregistrez le projet

Les élèves rencontrent ces exercices dans leur parcours de lecture / classe. Corrigez et suivez les soumissions depuis l’espace classe lorsque le cours y est lié.`,
    },
    'classes-guide': {
      title: 'Animer une classe',
      content: `1. Créez la classe et partagez le code
2. Liez votre projet stabilisé
3. Synchronisez après chaque mise à jour majeure
4. Publiez des annonces pour les échéances
5. Créez des devoirs (texte ou fichier) avec date limite
6. Consultez les analytics pour repérer les notions difficiles

Séparez bien « version de travail » (projet) et « version élèves » (dernière sync classe).`,
    },
    collaboration: {
      title: 'Travailler en équipe',
      content: `• Un propriétaire unique par projet, co-auteurs invités
• Répartissez les Parties par auteur pour limiter les conflits
• Utilisez les commentaires pour les relectures
• Convenez d’une convention de titres avant d’écrire
• Faites une passe Aperçu commune avant publication ou sync classe`,
    },
    'bonnes-pratiques': {
      title: 'Bonnes pratiques pédagogiques',
      content: `• Une notion = un objectif d’apprentissage mesurable
• Alternez explication courte et exercice
• Utilisez l’IA pour reformuler, pas pour publier sans relecture
• En Moodle, testez l’activité avec un compte étudiant
• Gardez des noms de projets stables : ils apparaissent dans les URLs et l’activité Moodle`,
    },
  },

  support: {
    contact: {
      title: 'Nous contacter',
      isForm: true,
    },
    'bug-report': {
      title: 'Signaler un bug',
      content: `Utilisez le formulaire de contact (section Support) en indiquant :

• Navigateur et version (ex. Chrome 125)
• Système d’exploitation
• URL exacte (edit, embed Moodle, classe…)
• Compte concerné (web ou Moodle) — sans mot de passe
• Étapes de reproduction
• Message d’erreur affiché
• Capture d’écran si possible

Exemple
« Navigateur : Firefox 126 / Windows 11
Contexte : activité Moodle, iframe /embed/editor
Projet : Cours-Analyse-L1
Étapes : ouvrir l’activité → erreur Session invalide
Attendu : éditeur du projet
Obtenu : message session invalide »

Plus le rapport est précis, plus le correctif est rapide.`,
    },
    compatibilite: {
      title: 'Compatibilité',
      content: `Navigateurs supportés
• Google Chrome 100+ (recommandé)
• Microsoft Edge 100+
• Mozilla Firefox 100+
• Safari 15+

Requis
• JavaScript activé
• Cookies / stockage local autorisés pour le domaine XCCM (auth JWT)
• Largeur d’écran confortable : 1280px+ pour l’éditeur complet (TOC + panneau)

Moodle
• Testé avec les thèmes standards ; l’iframe nécessite une hauteur suffisante (recommandé ≥ 900px)
• L’URL de base XCCM doit être en HTTPS en production

Non supporté
• Internet Explorer
• Navigateurs très anciens (> 3 ans sans mise à jour)`,
    },
    api: {
      title: 'API et intégration',
      content: `Architecture
• Front (Next.js) : interface, page /embed/editor, proxy /api/* vers l’API
• API (Next.js) : authentification, projets, structure, classes, etc.
• Synapse : temps réel / collaboration

Authentification classique
• POST /api/auth/login — connexion
• POST /api/auth/register — inscription
• GET /api/auth/me — profil (Bearer JWT)

Authentification externe (Moodle / plugins)
• POST /api/auth/external
• Corps JSON : api_secret, email, firstname, lastname, source (ex. "moodle")
• Réponse : JWT à passer à l’iframe

Embed éditeur
• URL : {FRONT}/embed/editor?projectName={nom}&token={jwt}
• Messages postMessage : XCCM_EDITOR_READY, XCCM_CONTENT_SAVED

Projets
• GET /api/projects — liste
• POST /api/projects — création { pr_name }
• GET /api/projects/{pr_name} — détail
• PATCH /api/projects/{pr_name} — mise à jour

Sécurité
• Toutes les routes projet exigent un Bearer token (sauf routes publiques listées côté API)
• PLUGIN_API_SECRET : secret partagé Moodle ↔ API, minimum long et aléatoire

SDK
Un package @xccm/editor-sdk permet d’embarquer l’éditeur dans une app React tierce via iframe + postMessage.

Les URLs exactes dépendent de votre déploiement (ex. front et API sur Vercel, ou VM interne).`,
    },
    'moodle-admin': {
      title: 'Administration du plugin Moodle',
      content: `Installation
1. Déployez le dossier mod_xccm dans mod/xccm de Moodle (ou public/mod/xccm selon la version)
2. Allez dans Administration du site → Notifications pour installer le plugin
3. Réglages du plugin mod_xccm :
   • URL de base = URL du front XCCM (avec rewrites /api/*)
   • Secret API = même valeur que PLUGIN_API_SECRET sur l’API

Création d’activité
• Ajouter une activité → XCCM2
• Nom affiché dans le cours
• Nom du projet XCCM (et mode individuel avec {user_id} si besoin)
• Hauteur de l’iframe (900px ou plus recommandé)

Vérifications
• POST manuel vers /api/auth/external avec le secret doit renvoyer un token
• L’iframe doit charger /embed/editor sans erreur de session
• Un premier accès crée le projet pour l’utilisateur Moodle

Dépannage
• « Token manquant » côté API : la route /api/auth/external doit être publique dans le middleware API
• Secret refusé : écart entre Moodle et PLUGIN_API_SECRET
• Projet introuvable : vérifier le nom exact et le compte provisionné`,
    },
  },
};

const en: HelpContentMap = {
  documentation: {
    intro: {
      title: 'Introduction to XCCM 2',
      content: `XCCM 2 is a platform for creating and delivering structured learning content. Teachers and institutions can build hierarchical courses, collaborate in real time, and publish through classes or an external LMS (Moodle).

What you can do:
• Build courses as Parts → Chapters → Paragraphs → Notions
• Edit with a rich TipTap editor, save, and collaborate
• Use the pedagogical AI assistant (authoring help; Socratic mode for learners)
• Manage classes, assignments, and interactive exercises
• Publish to the library and share granules on the marketplace
• Embed the editor in Moodle with the mod_xccm activity plugin

Creation (projects) stays separate from delivery (classes, library, Moodle).`,
    },
    demarrage: {
      title: 'Quick start',
      content: `1. Create an account (Register) or sign in (/login).
2. Open /edit-home, create a project (name length 3–100), open the editor.
3. Build the outline on the left (Parts, Chapters, Paragraphs, Notions).
4. Use the right panel: import, marketplace, vault, AI, comments, exercises, settings.
5. Save with Ctrl+S; use Preview and Share when not in Moodle embed.

A guided tour starts on first editor visit.`,
    },
    fonctionnalites: {
      title: 'Main features',
      content: `Course editor — 4-level structure, WYSIWYG, Zen mode, PDF/DOCX import, structure history, collaborative blame.

Collaboration — email invites, live presence, comments, Synapse sync.

AI — authoring panel; Socratic help for learners.

Classes — invite codes, announcements, assignments, project sync, exercises, analytics.

Library & sharing — published documents, marketplace granules, personal vault.

Moodle — mod_xccm activity, JWT auth, /embed/editor iframe, auto-create project when missing.`,
    },
    interface: {
      title: 'Editor interface',
      content: `Left: course outline (TOC). Center: header, formatting toolbar, TipTap content. Right: import, marketplace, vault, AI, comments, info, settings, exercises, tutorial.

In Moodle embed (/embed/editor), Home / Preview / Share navigation is hidden so you stay inside the iframe.`,
    },
    structure: {
      title: 'Course structure',
      content: `Part → Chapter → Paragraph → Notion (main rich-text unit). Parts may have an intro. Exercises attach to the selected granule. Project names are unique per owner.`,
    },
    collaboration: {
      title: 'Real-time collaboration',
      content: `Share → invite by email → co-author accepts. Connected members appear in the header. Structure changes sync live. Owner manages invites; guests access per invitation role.`,
    },
    ia: {
      title: 'AI assistant',
      content: `XCCM AI (right panel) uses the current granule context to draft or refine content. Learner Socratic mode asks guiding questions instead of giving the final answer. Always review AI output before publishing.`,
    },
    classes: {
      title: 'Classes & LMS',
      content: `Projects are for authoring; classes are for learners. Create a class, share the invite code, link a project, sync updates, post announcements, and collect assignments (text or file).`,
    },
    moodle: {
      title: 'Moodle integration',
      content: `Admin installs mod_xccm, sets XCCM front base URL (with /api/* proxy) and PLUGIN_API_SECRET. Teachers add an XCCM2 activity with a project name (optional {user_id} in individual mode). Opening the activity requests POST /api/auth/external, then loads /embed/editor?projectName=…&token=…. Missing projects are created automatically. Stay in the iframe; reload from Moodle if the session expires.`,
    },
    publication: {
      title: 'Publishing & sharing',
      content: `Use Preview, publish to the library, share granules on the marketplace, export supported formats, and sync class-linked projects for students.`,
    },
    shortcuts: {
      title: 'Keyboard shortcuts',
      content: `Ctrl+S save · Ctrl+B/I/U formatting · Alt+Z Zen · Alt+P preview (not in Moodle embed) · Alt+H home (not in embed) · Esc close dialogs.`,
    },
    'slash-commands': {
      title: 'Slash commands (/)',
      content: `/part /chap /para /notion /img /ai /math /note — quick actions in the editor. Prefer the TOC for large course structures.`,
    },
  },
  faq: {
    compte: {
      title: 'Account & sign-in',
      content: `Register on the sign-up page; use Forgot password on /login. Profile is under Account / Settings. Moodle provisions an XCCM user from the Moodle email — it may differ from a manually created web account.`,
    },
    editeur: {
      title: 'Editor & projects',
      content: `Project names are unique per user. “Failed to load project” means missing project or expired token — reload from Moodle or create the project on /edit-home. Save explicitly with Ctrl+S. Online connection required.`,
    },
    classes: {
      title: 'Classes & learners',
      content: `Learners join with an invite code. They do not see private drafts. After editing a linked project, sync from the class.`,
    },
    moodle: {
      title: 'Moodle',
      content: `Invalid session → reopen the activity. Empty project on first open → auto-created for the Moodle user. Stay on /embed/editor. Only admins configure PLUGIN_API_SECRET.`,
    },
    problemes: {
      title: 'Common issues',
      content: `Editor freeze → refresh and save again. Network loops → sign out, clear site data, sign in. Preview mismatch → save first. Incomplete import → check file format/size.`,
    },
    securite: {
      title: 'Security & privacy',
      content: `Unpublished projects are visible only to you and invited collaborators. Production uses HTTPS. Moodle secret stays on the server; the iframe only receives a short-lived JWT. Request account deletion via the contact form.`,
    },
  },
  guide: {
    'premier-projet': {
      title: 'Create your first project',
      content: `Open /edit-home → New project → add Part + Notion → write → Ctrl+S → Preview → optional Share. Build a small outline before writing everything.`,
    },
    structuration: {
      title: 'Structure a course well',
      content: `Parts = modules, Chapters = sequences, Notions = atomic objectives. Avoid huge single notions and vague titles. Attach exercises to the relevant notion.`,
    },
    exercices: {
      title: 'Interactive exercises',
      content: `Select a notion → Exercises panel → create (MCQ, open question, …) → save. Learners see them in their reading path / class.`,
    },
    'classes-guide': {
      title: 'Run a class',
      content: `Create class → share code → link project → sync after major edits → announcements → assignments → analytics.`,
    },
    collaboration: {
      title: 'Teamwork',
      content: `One owner, invited co-authors, split Parts by author, use comments for review, shared Preview before publish/sync.`,
    },
    'bonnes-pratiques': {
      title: 'Pedagogical tips',
      content: `One notion = one learning objective. Alternate explanation and practice. Review AI output. Test Moodle with a student account. Keep stable project names.`,
    },
  },
  support: {
    contact: { title: 'Contact us', isForm: true },
    'bug-report': {
      title: 'Report a bug',
      content: `Use the contact form with browser, OS, exact URL, web vs Moodle account (no password), steps, error message, and screenshot.`,
    },
    compatibilite: {
      title: 'Compatibility',
      content: `Chrome / Edge / Firefox 100+, Safari 15+. JavaScript and storage required. Editor works best at 1280px+. Moodle iframe height ≥ 900px. HTTPS in production. No Internet Explorer.`,
    },
    api: {
      title: 'API & integration',
      content: `Front proxies /api/* to the API. Auth: /api/auth/login, /register, /me. External (Moodle): POST /api/auth/external → JWT. Embed: /embed/editor?projectName=&token=. Projects: GET/POST /api/projects, GET/PATCH /api/projects/{name}. Use PLUGIN_API_SECRET only on the server. Optional @xccm/editor-sdk for React hosts.`,
    },
    'moodle-admin': {
      title: 'Moodle plugin administration',
      content: `Install mod_xccm, set base URL + API secret, add XCCM2 activity with project name and iframe height. Test /api/auth/external and first embed open (auto-creates project). Fix public route and secret mismatches if auth fails.`,
    },
  },
};

export function getHelpContent(locale: string): HelpContentMap {
  return locale.startsWith('en') ? en : fr;
}

/** Ordre et ids des sous-sections (titres i18n dans messages/*.json). */
export const HELP_SECTION_IDS = {
  documentation: [
    'intro',
    'demarrage',
    'fonctionnalites',
    'interface',
    'structure',
    'collaboration',
    'ia',
    'classes',
    'moodle',
    'publication',
    'shortcuts',
    'slash-commands',
  ],
  faq: ['compte', 'editeur', 'classes', 'moodle', 'problemes', 'securite'],
  guide: [
    'premier-projet',
    'structuration',
    'exercices',
    'classes-guide',
    'collaboration',
    'bonnes-pratiques',
  ],
  support: ['contact', 'bug-report', 'compatibilite', 'api', 'moodle-admin'],
} as const;
