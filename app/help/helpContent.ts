/**
 * Documentation utilisateur du centre d'aide XCCM 2.
 * Langage orienté interface (boutons, menus), sans chemins techniques.
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
      title: 'Qu’est-ce que XCCM 2 ?',
      content: `XCCM 2 vous aide à créer des cours structurés, à collaborer avec d’autres auteurs, et à les partager avec vos élèves — directement sur la plateforme ou depuis Moodle.

Avec XCCM 2, vous pouvez :
• Concevoir un cours en Parties, Chapitres, Paragraphes et Notions
• Rédiger dans un éditeur de texte riche (mise en forme, images, formules)
• Travailler à plusieurs en même temps sur le même projet
• Vous faire aider par l’assistant IA pour rédiger ou guider les apprenants
• Animer des classes (annonces, devoirs, exercices)
• Publier des contenus dans la bibliothèque ou les réutiliser via la marketplace
• Ouvrir l’éditeur depuis une activité Moodle, sans quitter votre cours

Vos projets restent votre espace de création. Les classes, la bibliothèque et Moodle servent à diffuser le contenu aux apprenants.`,
    },
    demarrage: {
      title: 'Premiers pas',
      content: `1. Créez votre compte
Cliquez sur « S’inscrire », renseignez votre email, votre nom et un mot de passe, puis validez. Vous pourrez ensuite vous connecter avec « Se connecter ».

2. Créez un projet
Une fois connecté, vous arrivez sur la liste de vos projets. Cliquez sur « Nouveau projet », donnez-lui un nom clair (par exemple le titre du cours), puis ouvrez-le.

3. Construisez le plan du cours
À gauche, la table des matières permet d’ajouter des Parties, puis des Chapitres, des Paragraphes et des Notions. Cliquez sur une notion pour écrire dans la zone centrale.

4. Explorez le panneau de droite
Vous y trouverez l’import de fichiers, la marketplace, votre coffre-fort, l’assistant IA, les commentaires, les exercices, les paramètres du projet et un tutoriel.

5. Enregistrez et regardez le résultat
Utilisez le bouton « Enregistrer » (ou le raccourci clavier indiqué dans l’éditeur). « Aperçu » montre le rendu pour les lecteurs. « Partager » invite des co-auteurs.

Astuce : la première fois, un petit tour guidé vous présente l’éditeur.`,
    },
    fonctionnalites: {
      title: 'Ce que propose XCCM 2',
      content: `Éditeur de cours
• Plan en quatre niveaux : Partie, Chapitre, Paragraphe, Notion
• Mise en forme du texte, listes, images, formules
• Mode Zen pour écrire sans distraction
• Import de documents (PDF, Word) découpés automatiquement en plan de cours
• Annuler / rétablir les actions sur la structure

Travail en équipe
• Invitation de co-auteurs par email
• Voir qui est connecté en même temps que vous
• Commentaires sur le projet
• Mises à jour visibles en direct

Assistant IA
• Aide à la rédaction et à la reformulation dans l’éditeur
• Pour les élèves : questions guidantes (méthode socratique), sans donner la réponse toute faite

Classes
• Créer une classe et inviter les élèves avec un code
• Annonces, devoirs (texte ou fichier), suivi des rendus
• Lier un projet à une classe et le mettre à jour pour les élèves
• Exercices liés aux notions (QCM, questions ouvertes, etc.)
• Statistiques de suivi

Bibliothèque et partage
• Publier un cours consultable
• Partager ou récupérer des briques de contenu dans la marketplace
• Garder vos éléments favoris dans le coffre-fort

Moodle
• Activité XCCM 2 dans un cours Moodle
• Connexion automatique : l’éditeur s’ouvre dans la page Moodle
• Le projet est préparé pour vous dès la première ouverture`,
    },
    interface: {
      title: 'L’écran d’édition',
      content: `Quand vous ouvrez un projet, l’écran se divise en trois zones.

À gauche — Table des matières
• Le plan complet de votre cours
• Ajouter, renommer, réordonner ou déplacer les éléments
• Sur mobile, ouvrez-la avec le bouton menu

Au centre — Zone d’écriture
• En haut : nom du projet, où vous vous trouvez dans le plan, collègues connectés, bouton Enregistrer
• Barre d’outils de mise en forme et mode Zen
• Zone de texte pour la notion (ou l’introduction de partie) sélectionnée

À droite — Outils
• Importer un fichier
• Marketplace
• Coffre-fort
• Assistant IA
• Commentaires
• Informations du projet
• Paramètres
• Exercices
• Tutoriel

Si vous travaillez depuis Moodle, certains boutons inutiles dans ce contexte (retour à la liste des projets, aperçu externe, partage web) sont masqués pour que vous restiez dans votre activité Moodle.`,
    },
    structure: {
      title: 'Comment est organisé un cours',
      content: `Chaque projet suit le même plan :

Partie
  └─ Chapitre
       └─ Paragraphe
            └─ Notion  ← c’est ici que vous rédigez le contenu principal

À retenir
• Une Partie peut aussi avoir une courte introduction
• Les exercices se rattachent à la notion que vous avez sélectionnée
• Le nom du projet doit être unique parmi vos projets (quelques caractères minimum, pas de symboles exotiques)

Conseils de nommage
• Parties : grands thèmes (« Algèbre linéaire »)
• Chapitres : séquences (« Matrices et déterminants »)
• Notions : un objectif précis (« Calculer un déterminant 2×2 »)`,
    },
    collaboration: {
      title: 'Travailler à plusieurs',
      content: `Inviter quelqu’un
1. Ouvrez le projet
2. Cliquez sur « Partager »
3. Saisissez l’email de la personne
4. Elle reçoit une invitation à accepter

Pendant le travail
• Les avatars des personnes connectées apparaissent en haut de l’éditeur
• Les changements de plan se mettent à jour pour tout le monde
• Les commentaires servent à discuter sans quitter la page

Rôles
• Le propriétaire gère le projet, les invitations et la suppression
• Les co-auteurs invités peuvent contribuer selon les droits accordés

Si la connexion en direct se coupe, un indicateur apparaît en haut de l’écran : vous pourrez vous reconnecter depuis là.`,
    },
    ia: {
      title: 'L’assistant IA',
      content: `Dans l’éditeur
Ouvrez le panneau IA à droite (icône en forme d’étincelles). L’assistant s’appuie sur la notion en cours pour vous aider à :
• Rédiger ou reformuler un passage
• Clarifier une explication
• Structurer une idée

Pour les élèves
Dans le parcours de lecture, l’aide IA pose des questions pour faire réfléchir, plutôt que de livrer la réponse complète. Elle connaît le contenu de la notion affichée.

Conseils
• Sélectionnez d’abord la bonne notion
• Relisez toujours ce que propose l’IA avant d’enregistrer ou de publier
• L’IA est un assistant, pas un auteur à votre place`,
    },
    classes: {
      title: 'Classes et élèves',
      content: `Projets et classes, deux usages différents
• Le projet : vous créez et modifiez le cours
• La classe : vous le diffusez à des élèves, avec annonces et devoirs

Créer une classe
1. Allez dans « Classes », puis « Nouvelle classe »
2. Donnez un nom et notez le code d’invitation
3. Transmettez ce code aux élèves : ils le saisissent dans « Rejoindre une classe »

Ajouter un cours à la classe
Liez l’un de vos projets à la classe, puis synchronisez pour que les élèves voient la version à jour.

Devoirs
Créez un devoir en réponse texte ou en dépôt de fichier, avec une date limite si besoin. Suivez les rendus dans l’onglet dédié.

Exercices dans le cours
Dans l’éditeur, panneau « Exercices » : créez des activités liées à une notion. Les élèves les retrouvent dans leur parcours.`,
    },
    moodle: {
      title: 'Utiliser XCCM 2 dans Moodle',
      content: `Si votre établissement a installé l’activité XCCM 2 dans Moodle, vous pouvez éditer un cours sans quitter Moodle.

Pour l’enseignant dans Moodle
1. Dans un cours Moodle, ajoutez une activité « XCCM 2 »
2. Indiquez le nom du projet (celui qui apparaîtra dans XCCM)
3. Enregistrez l’activité

Pour l’utilisateur qui ouvre l’activité
• Vous êtes reconnu automatiquement (pas besoin de vous reconnecter à la main)
• L’éditeur XCCM s’affiche dans la page Moodle
• Au premier accès, le projet est créé pour vous s’il n’existait pas encore
• Vous restez dans Moodle pendant toute l’édition

En cas de message d’erreur de session
Rechargez simplement l’activité depuis Moodle (menu du cours), pour obtenir une nouvelle connexion.

Bon à savoir
Le compte utilisé depuis Moodle est lié à votre adresse email Moodle. Ce n’est pas forcément le même compte que celui créé à la main sur le site XCCM, sauf si vous utilisez le même email.`,
    },
    publication: {
      title: 'Publier et partager',
      content: `Aperçu
Le bouton « Aperçu » montre le cours tel qu’un lecteur le verra.

Bibliothèque
Vous pouvez publier un document pour le rendre consultable selon les options de visibilité choisies.

Marketplace
Partagez une partie de votre cours (une brique de contenu) pour la réutiliser plus tard, ou importez des briques proposées par d’autres auteurs depuis le panneau Marketplace.

Export
Exportez votre projet (par exemple en PDF) depuis les options d’export disponibles dans l’éditeur.

Pour une classe
Préférez lier le projet à la classe et synchroniser, plutôt que de seulement partager un lien public.`,
    },
    shortcuts: {
      title: 'Raccourcis clavier utiles',
      content: `Dans l’éditeur
• Enregistrer : Ctrl + S (Cmd + S sur Mac)
• Gras / Italique / Souligné : Ctrl + B / I / U
• Mode Zen : Alt + Z
• Fermer un menu ou une fenêtre : Échap

Les raccourcis d’aperçu ou de retour à la liste des projets ne s’appliquent pas lorsque vous travaillez depuis Moodle (pour rester dans l’activité).`,
    },
    'slash-commands': {
      title: 'Le menu « / » dans le texte',
      content: `Dans la zone d’écriture, tapez le caractère / pour ouvrir un menu d’actions rapides, par exemple :
• créer une partie, un chapitre, un paragraphe ou une notion
• insérer une image
• ouvrir l’assistant IA
• ajouter une formule ou une note

Pour un gros cours, il est souvent plus simple de construire le plan depuis la table des matières à gauche.`,
    },
  },

  faq: {
    compte: {
      title: 'Compte et connexion',
      content: `Q : Comment créer un compte ?
R : Cliquez sur « S’inscrire », remplissez le formulaire, puis connectez-vous avec « Se connecter ».

Q : J’ai oublié mon mot de passe
R : Sur la page de connexion, utilisez « Mot de passe oublié ». Un email vous indiquera la marche à suivre.

Q : Où modifier mon profil ?
R : Dans « Compte » ou « Paramètres » (nom, photo, préférences).

Q : Moodle et le site XCCM, est-ce le même compte ?
R : Moodle ouvre XCCM avec l’email de votre compte Moodle. Si vous vous êtes inscrit à la main avec un autre email, ce sont deux comptes différents.`,
    },
    editeur: {
      title: 'Éditeur et projets',
      content: `Q : Combien de projets puis-je avoir ?
R : Autant que vous voulez. Chaque projet doit avoir un nom différent parmi les vôtres.

Q : Message « impossible de récupérer le projet »
R : Soit le projet n’existe pas encore pour votre compte, soit votre session a expiré. Depuis Moodle, rechargez l’activité. Depuis le site, créez le projet dans votre liste ou vérifiez le nom.

Q : Faut-il enregistrer à la main ?
R : Oui, utilisez le bouton « Enregistrer ». Ne fermez pas la page s’il reste des modifications non enregistrées (indiquées en haut de l’éditeur).

Q : Puis-je travailler sans Internet ?
R : Non, une connexion est nécessaire.`,
    },
    classes: {
      title: 'Classes et élèves',
      content: `Q : Comment un élève rejoint-il ma classe ?
R : Donnez-lui le code d’invitation. Il le saisit dans « Classes », puis « Rejoindre ».

Q : Les élèves voient-ils mes brouillons ?
R : Non. Ils voient uniquement ce qui est lié et synchronisé dans la classe.

Q : J’ai modifié mon cours, les élèves ne voient rien
R : Ouvrez la classe et lancez la synchronisation du projet lié.`,
    },
    moodle: {
      title: 'Moodle',
      content: `Q : Message de session invalide dans Moodle
R : Rouvrez l’activité depuis le cours Moodle pour vous reconnecter automatiquement.

Q : Le projet est vide au premier accès
R : C’est normal : XCCM prépare le projet pour vous. Vérifiez le nom du projet dans les paramètres de l’activité Moodle.

Q : Je me retrouve sur la liste des projets dans Moodle
R : Rechargez l’activité Moodle. L’éditeur doit rester affiché dans la page du cours.

Q : Qui configure le lien entre Moodle et XCCM ?
R : L’administrateur Moodle de votre établissement, dans les réglages du plugin.`,
    },
    problemes: {
      title: 'Problèmes fréquents',
      content: `Q : L’éditeur ne répond plus
R : Actualisez la page, puis enregistrez à nouveau.

Q : La page charge en boucle
R : Déconnectez-vous, reconnectez-vous. Si le problème continue, signalez-le via le formulaire de contact.

Q : L’aperçu ne correspond pas à ce que j’ai écrit
R : Enregistrez d’abord, puis rouvrez l’aperçu.

Q : L’import d’un document est incomplet
R : Vérifiez le format (PDF ou Word) et la taille. Réessayez, ou découpez le document en plusieurs fichiers.`,
    },
    securite: {
      title: 'Confidentialité',
      content: `Q : Qui voit mes projets non publiés ?
R : Uniquement vous et les personnes que vous avez invitées.

Q : Mes échanges sont-ils protégés ?
R : Oui, la connexion au site utilise une liaison sécurisée (cadenas dans le navigateur).

Q : Puis-je supprimer mon compte ?
R : Oui, contactez-nous via le formulaire de cette page (vous devez être connecté).`,
    },
  },

  guide: {
    'premier-projet': {
      title: 'Créer votre premier projet',
      content: `1. Connectez-vous
2. Dans la liste de vos projets, cliquez sur « Nouveau projet »
3. Donnez un nom clair (ex. « Analyse 1 — semestre A »)
4. Ajoutez une Partie et une Notion dans la table des matières
5. Rédigez le contenu de la notion
6. Cliquez sur « Enregistrer »
7. Ouvrez « Aperçu » pour vérifier le rendu
8. (Optionnel) Invitez un collègue avec « Partager »

Commencez par un petit plan avant d’écrire tout le cours d’un coup.`,
    },
    structuration: {
      title: 'Bien structurer un cours',
      content: `Méthode simple
1. Découpez le programme en Parties (grands modules)
2. Chaque Partie : quelques Chapitres
3. Chaque Chapitre : des Paragraphes thématiques
4. Chaque Paragraphe : des Notions courtes (une idée claire par notion)

À éviter
• Une seule notion très longue
• Des titres vagues (« Suite », « Suite 2 »)
• Mélanger théorie et exercices sans les séparer

Exercices
Attachez chaque exercice à la notion concernée (panneau « Exercices »), pour que le parcours des élèves reste logique.`,
    },
    exercices: {
      title: 'Ajouter des exercices',
      content: `1. Sélectionnez une notion dans la table des matières
2. Ouvrez le panneau « Exercices » à droite
3. Créez un exercice (QCM, question ouverte, etc.)
4. Enregistrez le projet

Les élèves rencontrent ces exercices dans leur parcours de lecture ou dans la classe, selon la façon dont le cours est diffusé.`,
    },
    'classes-guide': {
      title: 'Animer une classe',
      content: `1. Créez la classe et partagez le code d’invitation
2. Liez un projet déjà bien avancé
3. Synchronisez après chaque mise à jour importante
4. Publiez des annonces pour les échéances
5. Créez des devoirs avec date limite
6. Consultez les statistiques pour repérer les notions difficiles

Gardez à l’esprit : le projet est votre atelier ; la classe est ce que voient les élèves après synchronisation.`,
    },
    collaboration: {
      title: 'Travailler en équipe',
      content: `• Un propriétaire par projet, des co-auteurs invités
• Répartissez les Parties entre vous pour limiter les conflits
• Utilisez les commentaires pour les relectures
• Mettez-vous d’accord sur les titres avant d’écrire
• Faites un aperçu commun avant de publier ou de synchroniser une classe`,
    },
    'bonnes-pratiques': {
      title: 'Bonnes pratiques',
      content: `• Une notion = un objectif d’apprentissage clair
• Alternez courte explication et exercice
• Relisez toujours le texte proposé par l’IA
• Si vous utilisez Moodle, testez l’activité avec un compte élève
• Choisissez des noms de projets stables : ils servent aussi dans Moodle`,
    },
  },

  support: {
    contact: {
      title: 'Nous contacter',
      isForm: true,
    },
    'bug-report': {
      title: 'Signaler un problème',
      content: `Utilisez le formulaire de contact en indiquant :

• Votre navigateur (Chrome, Firefox, Edge, Safari…)
• Votre ordinateur (Windows, Mac, Linux…) ou téléphone
• Où le problème apparaît (liste des projets, éditeur, classe, activité Moodle…)
• Ce que vous avez fait juste avant
• Le message d’erreur affiché, s’il y en a un
• Une capture d’écran si possible

Exemple
« Navigateur : Firefox, Windows
Lieu : activité XCCM dans mon cours Moodle
Actions : j’ouvre l’activité et un message de session s’affiche
Attendu : l’éditeur du cours
Obtenu : message d’erreur »

Plus votre description est précise, plus nous pourrons vous aider rapidement.`,
    },
    compatibilite: {
      title: 'Navigateurs et appareils',
      content: `Navigateurs recommandés
• Google Chrome (recommandé)
• Microsoft Edge
• Mozilla Firefox
• Safari (versions récentes)

Pour bien travailler
• JavaScript activé (réglage par défaut des navigateurs modernes)
• Autoriser le site à mémoriser votre connexion
• Un écran assez large pour voir la table des matières et le panneau d’outils en même temps

Dans Moodle
• L’éditeur s’affiche dans la page du cours : une hauteur confortable est recommandée
• Utilisez de préférence une connexion sécurisée (cadenas dans la barre d’adresse)

Non supporté
• Internet Explorer et navigateurs très anciens`,
    },
    api: {
      title: 'Connecter XCCM à d’autres outils',
      content: `XCCM 2 peut s’ouvrir depuis d’autres plateformes pédagogiques, en particulier Moodle.

Pour les enseignants
• Demandez à votre administrateur d’activer l’activité XCCM 2 dans Moodle
• Ajoutez ensuite l’activité dans votre cours et indiquez le nom du projet
• Vos étudiants ouvrent l’éditeur directement dans Moodle

Pour les établissements
• L’administrateur configure une seule fois le lien entre Moodle et XCCM (adresse du service et clé secrète partagée)
• Aucune installation n’est demandée aux enseignants au quotidien

Si vous développez votre propre outil
• Un kit d’intégration permet d’afficher l’éditeur dans une autre application
• Contactez l’équipe via le formulaire pour obtenir les informations d’intégration adaptées à votre cas`,
    },
    'moodle-admin': {
      title: 'Configurer Moodle (administrateurs)',
      content: `Installation (une fois)
1. Installez le plugin d’activité XCCM 2 dans Moodle
2. Dans les réglages du plugin, renseignez :
   • l’adresse du site XCCM fournie par votre équipe technique
   • la clé secrète partagée (la même que côté XCCM)
3. Enregistrez

Pour les enseignants
Ils ajoutent une activité « XCCM 2 » dans un cours, indiquent le nom du projet et, si besoin, une hauteur d’affichage confortable.

Vérifications rapides
• Ouvrir l’activité affiche l’éditeur sans message d’erreur
• Au premier accès, le projet apparaît pour l’utilisateur
• En cas d’échec de connexion, vérifiez que l’adresse du site et la clé secrète sont identiques des deux côtés

En cas de doute, contactez l’équipe XCCM via le formulaire de support.`,
    },
  },
};

const en: HelpContentMap = {
  documentation: {
    intro: {
      title: 'What is XCCM 2?',
      content: `XCCM 2 helps you build structured courses, collaborate with co-authors, and share them with learners — on the platform or from Moodle.

You can:
• Organize a course into Parts, Chapters, Paragraphs, and Notions
• Write in a rich text editor (formatting, images, formulas)
• Work with others on the same project at the same time
• Use the AI assistant to draft content or guide learners
• Run classes (announcements, assignments, exercises)
• Publish to the library or reuse content from the marketplace
• Open the editor from a Moodle activity without leaving your course

Projects are your authoring space. Classes, the library, and Moodle are how you deliver content to learners.`,
    },
    demarrage: {
      title: 'Getting started',
      content: `1. Create your account
Click “Sign up”, enter your email, name, and password. Then use “Sign in”.

2. Create a project
After signing in, open your project list. Click “New project”, give it a clear name, and open it.

3. Build the outline
On the left, use the table of contents to add Parts, Chapters, Paragraphs, and Notions. Select a notion to write in the center.

4. Use the right-hand tools
Import files, marketplace, vault, AI assistant, comments, exercises, project settings, and a tutorial.

5. Save and review
Use “Save”. “Preview” shows the reader view. “Share” invites co-authors.

Tip: a short guided tour appears the first time you open the editor.`,
    },
    fonctionnalites: {
      title: 'What XCCM 2 offers',
      content: `Course editor — four-level outline, rich formatting, Zen mode, PDF/Word import, undo/redo for structure.

Teamwork — email invites, live presence, comments, live updates.

AI assistant — writing help in the editor; guiding questions for learners (Socratic style).

Classes — invite codes, announcements, assignments, link a project and sync, exercises, stats.

Library & sharing — publish documents, marketplace bricks, personal vault.

Moodle — XCCM 2 activity, automatic sign-in, editor inside the Moodle page, project ready on first open.`,
    },
    interface: {
      title: 'The editing screen',
      content: `Left: table of contents (outline). Center: project name, formatting toolbar, writing area. Right: import, marketplace, vault, AI, comments, info, settings, exercises, tutorial.

In Moodle, some buttons (project list, external preview, web share) are hidden so you stay inside the activity.`,
    },
    structure: {
      title: 'How a course is organized',
      content: `Part → Chapter → Paragraph → Notion (main writing unit). Parts can have a short intro. Exercises attach to the selected notion. Project names must be unique among yours.`,
    },
    collaboration: {
      title: 'Working together',
      content: `Open the project → Share → enter an email → co-author accepts. Connected people appear at the top. Outline changes update for everyone. The owner manages invites; co-authors contribute with their granted rights.`,
    },
    ia: {
      title: 'AI assistant',
      content: `Open the AI panel on the right. It uses the current notion to help you draft or clarify text. For learners, it asks guiding questions instead of giving the full answer. Always review AI suggestions before saving.`,
    },
    classes: {
      title: 'Classes and learners',
      content: `Projects are for authoring; classes are for learners. Create a class, share the invite code, link a project, sync updates, post announcements, and collect assignments (text or file).`,
    },
    moodle: {
      title: 'Using XCCM 2 in Moodle',
      content: `If your institution enabled the XCCM 2 activity, add it to a Moodle course, set the project name, and open it. You are signed in automatically and the editor appears inside Moodle. On first open, the project is prepared for you. If you see a session error, reopen the activity from the course page.`,
    },
    publication: {
      title: 'Publish and share',
      content: `Use Preview, publish to the library, share content bricks on the marketplace, export when available, and sync class-linked projects for students.`,
    },
    shortcuts: {
      title: 'Useful keyboard shortcuts',
      content: `Save: Ctrl+S (Cmd+S on Mac). Bold / Italic / Underline: Ctrl+B / I / U. Zen mode: Alt+Z. Close a dialog: Esc. Some shortcuts are disabled in Moodle so you stay in the activity.`,
    },
    'slash-commands': {
      title: 'The “/” menu while writing',
      content: `Type / in the writing area for quick actions (new part, chapter, notion, image, AI, formula, note). For large courses, build the outline from the left-hand table of contents.`,
    },
  },
  faq: {
    compte: {
      title: 'Account and sign-in',
      content: `Sign up, then sign in. Use “Forgot password” if needed. Edit your profile under Account / Settings. Moodle uses your Moodle email — it may differ from a manually created XCCM account.`,
    },
    editeur: {
      title: 'Editor and projects',
      content: `You can have as many projects as you need, each with a unique name. “Could not load project” means it is missing or your session expired — reload from Moodle or create it in your project list. Always use Save. An internet connection is required.`,
    },
    classes: {
      title: 'Classes and learners',
      content: `Learners join with an invite code. They do not see private drafts. After editing a linked project, sync from the class.`,
    },
    moodle: {
      title: 'Moodle',
      content: `Invalid session → reopen the activity. Empty project on first open is normal. Stay in the Moodle page while editing. Only your Moodle administrator configures the link to XCCM.`,
    },
    problemes: {
      title: 'Common issues',
      content: `Editor frozen → refresh, then save. Endless loading → sign out and sign in again. Preview outdated → save first. Incomplete import → check file format and size.`,
    },
    securite: {
      title: 'Privacy',
      content: `Unpublished projects are only visible to you and people you invite. The site uses a secure connection. Request account deletion through the contact form while signed in.`,
    },
  },
  guide: {
    'premier-projet': {
      title: 'Create your first project',
      content: `Sign in → New project → add a Part and a Notion → write → Save → Preview → optional Share. Start with a small outline.`,
    },
    structuration: {
      title: 'Structure a course well',
      content: `Parts = modules, Chapters = sequences, Notions = clear objectives. Avoid huge single notions and vague titles. Attach exercises to the right notion.`,
    },
    exercices: {
      title: 'Add exercises',
      content: `Select a notion → Exercises panel → create (quiz, open question, …) → Save. Learners see them in their reading path or class.`,
    },
    'classes-guide': {
      title: 'Run a class',
      content: `Create the class → share the code → link a project → sync after major edits → announcements → assignments → stats.`,
    },
    collaboration: {
      title: 'Teamwork',
      content: `One owner, invited co-authors, split Parts, use comments for review, shared Preview before publish or class sync.`,
    },
    'bonnes-pratiques': {
      title: 'Best practices',
      content: `One notion = one learning goal. Alternate explanation and practice. Review AI text. Test Moodle with a student account. Keep stable project names.`,
    },
  },
  support: {
    contact: { title: 'Contact us', isForm: true },
    'bug-report': {
      title: 'Report a problem',
      content: `Use the contact form with your browser, device, where it happened (projects, editor, class, Moodle), steps, error message, and a screenshot if possible.`,
    },
    compatibilite: {
      title: 'Browsers and devices',
      content: `Chrome (recommended), Edge, Firefox, recent Safari. Allow the site to remember your session. A wide screen is more comfortable for the editor. In Moodle, the editor appears inside the course page. Internet Explorer is not supported.`,
    },
    api: {
      title: 'Connect XCCM to other tools',
      content: `Teachers: ask your admin to enable the XCCM 2 activity in Moodle, then add it to your course. Institutions: admins configure the link once. For custom tools, contact us through the form for integration details.`,
    },
    'moodle-admin': {
      title: 'Set up Moodle (administrators)',
      content: `Install the XCCM 2 activity plugin, set the XCCM site address and shared secret provided by your technical team, then let teachers add the activity to courses. If connection fails, check that address and secret match on both sides. Contact support if needed.`,
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
