# XCCM 2 - Analyse Complète du Projet

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du Projet](#architecture-du-projet)
3. [Technologies Utilisées](#technologies-utilisées)
4. [Fonctionnalités Principales](#fonctionnalités-principales)
5. [Structure des Composants](#structure-des-composants)
6. [Flux de Données](#flux-de-données)
7. [Système de Routing](#système-de-routing)
8. [Sécurité et Authentification](#sécurité-et-authentification)
9. [Patterns Architecturaux](#patterns-architecturaux)
10. [Configuration et Déploiement](#configuration-et-déploiement)
11. [Statistiques du Projet](#statistiques-du-projet)

---

## Vue d'ensemble

**XCCM 2** est une application web moderne de composition et de gestion de documents pédagogiques. Elle permet aux utilisateurs de créer, éditer, organiser et partager des contenus structurés de manière hiérarchique avec un éditeur WYSIWYG riche en fonctionnalités.

### Objectifs du Projet

- **Création de contenu pédagogique** : Fournir un éditeur intuitif pour composer des cours
- **Structure hiérarchique** : Organiser le contenu en 4 niveaux (Parties → Chapitres → Paragraphes → Notions)
- **Collaboration** : Partager des projets avec des collaborateurs
- **Export** : Générer des PDF professionnels
- **Bibliothèque** : Découvrir et consulter des cours publiés

---

## Architecture du Projet

### Structure des Dossiers

```
front-xccm2/
├── app/                          # Pages Next.js (App Router)
│   ├── layout.tsx               # Layout racine avec métadonnées
│   ├── page.tsx                 # Page d'accueil (landing)
│   ├── providers.tsx            # Wrapper de contextes
│   ├── globals.css              # Styles globaux
│   │
│   ├── about/                   # Page "À propos"
│   ├── help/                    # Centre d'aide
│   ├── library/                 # Bibliothèque de cours
│   ├── login/                   # Connexion
│   ├── register/                # Inscription
│   ├── account/                 # Compte utilisateur
│   ├── settings/                # Paramètres
│   ├── edit-home/               # Dashboard des projets
│   ├── edit/                    # Éditeur principal
│   ├── preview/                 # Aperçu et export PDF
│   └── book-reader/             # Lecteur de livres
│
├── components/                  # Composants réutilisables
│   ├── Header.tsx               # En-tête de navigation
│   ├── Footer.tsx               # Pied de page
│   └── Editor/                  # Composants de l'éditeur
│       ├── EditorArea.tsx       # Zone d'édition principale
│       ├── EditorToolBar.tsx    # Barre d'outils de formatage
│       ├── TableOfContents.tsx  # Table des matières hiérarchique
│       ├── RightPanel.tsx       # Panneau latéral à onglets
│       ├── ChatBotOverlay.tsx   # Assistant IA
│       ├── ShareOverlay.tsx     # Modal de partage
│       ├── Granule.tsx          # Unité de contenu déplaçable
│       └── Panels/              # Sous-composants du panneau droit
│           ├── ImportPanel.tsx
│           ├── CommentsPanel.tsx
│           ├── InfoPanel.tsx
│           └── SettingsPanel.tsx
│
├── context/                     # Gestion d'état globale
│   └── AuthContext.tsx          # Contexte d'authentification
│
├── services/                    # Couche de services API
│   ├── projectService.ts        # Opérations CRUD sur les projets
│   └── structureService.ts      # API de structure hiérarchique
│
├── lib/                         # Utilitaires
│   ├── apiHelper.ts             # Helpers pour les requêtes API
│   └── authService.ts           # Logique d'authentification
│
├── types/                       # Définitions TypeScript
│   └── header.ts                # Types pour le header
│
├── constants/                   # Constantes de configuration
│   └── colors.ts                # Palette de couleurs
│
├── middleware.ts                # Middleware Next.js (protection routes)
├── package.json                 # Dépendances et scripts
├── tsconfig.json                # Configuration TypeScript
├── next.config.ts              # Configuration Next.js
├── eslint.config.mjs            # Configuration ESLint
├── postcss.config.mjs           # Configuration PostCSS
└── .env.local                   # Variables d'environnement
```

### Architecture en Couches

```
┌─────────────────────────────────────────────┐
│            Couche Présentation              │
│     (Pages, Composants, UI, Routing)        │
├─────────────────────────────────────────────┤
│          Couche Logique Métier              │
│     (Contexts, Hooks, State Management)     │
├─────────────────────────────────────────────┤
│            Couche Services                  │
│   (API Calls, Authentication, Data Flow)    │
├─────────────────────────────────────────────┤
│             Couche Backend                  │
│        (API REST externe - Node.js)         │
└─────────────────────────────────────────────┘
```

---

## Technologies Utilisées

### Framework et Bibliothèques Core

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Next.js** | 16.1.1 | Framework React avec App Router |
| **React** | 19.2.3 | Bibliothèque UI |
| **TypeScript** | 5.x | Typage statique |
| **Tailwind CSS** | 4.x | Framework CSS utility-first |

### Bibliothèques UI et Styling

| Bibliothèque | Version | Usage |
|--------------|---------|-------|
| **lucide-react** | 0.562.0 | Icônes (562+ icônes) |
| **react-icons** | 5.5.0 | Icônes supplémentaires (Font Awesome, etc.) |
| **framer-motion** | 12.23.26 | Animations fluides |
| **clsx** | 2.1.1 | Gestion conditionnelle des classes CSS |

### Traitement de Documents

| Bibliothèque | Version | Usage |
|--------------|---------|-------|
| **html2canvas** | 1.4.1 | Conversion HTML vers Canvas |
| **jsPDF** | 4.0.0 | Génération de PDF |
| **html2pdf.js** | 0.12.1 | Conversion HTML vers PDF |

### Sécurité et Authentification

| Bibliothèque | Version | Usage |
|--------------|---------|-------|
| **jose** | 6.1.3 | Gestion des JWT (JSON Web Tokens) |

### Outils de Développement

| Outil | Version | Usage |
|-------|---------|-------|
| **ESLint** | 9.x | Linting du code |
| **PostCSS** | 4.x | Transformation CSS |
| **@types/*** | - | Définitions TypeScript |

---

## Fonctionnalités Principales

### 1. Gestion des Utilisateurs

#### Authentification
- **Inscription** : Formulaire multi-étapes (informations personnelles → mot de passe)
- **Connexion** : Email + mot de passe avec support JWT
- **OAuth (Ready)** : Placeholders pour Google et Microsoft
- **Session** : Tokens JWT stockés dans des cookies HttpOnly
- **Déconnexion** : Invalidation du token et redirection

#### Profil Utilisateur
- Prénom, nom, email
- Occupation (enseignant, étudiant, professionnel)
- Organisation d'appartenance
- Photo de profil (UI prête)

### 2. Gestion des Projets

#### Opérations CRUD
- **Créer** : Nouveau projet avec nom unique
- **Lire** : Liste de tous les projets de l'utilisateur
- **Modifier** : Renommer un projet
- **Supprimer** : Suppression avec confirmation

#### Dashboard de Projets
- Affichage en grille avec cartes de projets
- Métadonnées : nom, propriétaire, dates de création/modification
- Recherche et filtrage (UI prête)
- Actions rapides : ouvrir, renommer, supprimer

### 3. Structure Hiérarchique du Document

Le système utilise une hiérarchie à 4 niveaux :

```
Projet
└── Partie (Part)
    ├── Introduction (facultatif)
    └── Chapitre (Chapter)
        └── Paragraphe (Paragraph)
            └── Notion (Granule)
                └── Contenu texte (notion_content)
```

#### Caractéristiques par Niveau

| Niveau | Attributs | Actions |
|--------|-----------|---------|
| **Partie** | `part_title`, `part_intro` | Créer, modifier, supprimer, réorganiser |
| **Chapitre** | `chapter_title`, `chapter_intro` | Créer, modifier, supprimer, réorganiser |
| **Paragraphe** | `para_name`, `para_intro` | Créer, modifier, supprimer, réorganiser |
| **Notion** | `notion_name`, `notion_content` | Créer, modifier, supprimer, éditer contenu |

### 4. Éditeur de Texte Riche

#### Fonctionnalités de Formatage
- **Texte** : Gras, italique, souligné, barré
- **Alignement** : Gauche, centre, droite, justifié
- **Listes** : À puces et numérotées
- **Police** : Sélection de la famille de police et de la taille
- **Images** : Insertion d'images via upload

#### Éditeur WYSIWYG
- Zone d'édition `contenteditable`
- Support drag-and-drop
- Placeholder dynamique
- **Auto-sauvegarde** : Sauvegarde automatique après 2 secondes d'inactivité

#### Barre d'Outils Contextuelle
```
[Font] [Size] | [B] [I] [U] [S] | [←] [≡] [→] [≡≡] | [• List] [1. List] | [🖼️ Image]
```

### 5. Table des Matières Interactive

- **Arborescence hiérarchique** : Affichage de la structure complète
- **Expand/Collapse** : Développer/réduire les sections
- **Navigation** : Cliquer pour sélectionner une notion à éditer
- **Drag & Drop** : Réorganisation par glisser-déposer (UI prête)
- **Actions CRUD** : Boutons pour ajouter/modifier/supprimer chaque niveau

### 6. Panneau Latéral à Onglets

#### Onglet "Importer"
- Drag-and-drop de fichiers
- Navigateur de granules (contenu réutilisable)
- Importation de contenu externe

#### Onglet "Commentaires"
- Soumission de commentaires
- Affichage des commentaires avec auteur et date
- Système de discussion (UI prête)

#### Onglet "Informations"
- **Statistiques du projet** :
  - Nombre de parties
  - Nombre de chapitres
  - Nombre de paragraphes
  - Nombre de notions
- Date de création et dernière modification

#### Onglet "Paramètres"
- Préférences de l'éditeur
- Langue de l'interface
- Options de numérotation automatique

### 7. Export et Génération de Documents

#### Export PDF
- Conversion HTML → Canvas → PDF via `html2canvas` + `jsPDF`
- **Format A4** avec gestion automatique des sauts de page
- Préservation du formatage (polices, couleurs, images)
- Génération multi-pages pour les longs documents

#### Page de Prévisualisation
- Aperçu avant export
- Bouton de téléchargement direct
- Option d'impression

### 8. Partage et Collaboration

#### Modal de Partage
- **Lien de partage** : Génération de lien unique
- **Gestion des collaborateurs** :
  - Ajouter des collaborateurs par email
  - Définir les permissions (Propriétaire, Édition, Lecture)
  - Retirer des collaborateurs
- **Contrôle d'accès** : Gestion des rôles

#### Rôles et Permissions
| Rôle | Permissions |
|------|-------------|
| **Propriétaire** | Tous les droits, suppression du projet |
| **Édition** | Modifier le contenu, ajouter/supprimer des sections |
| **Lecture** | Consulter uniquement, pas de modification |

### 9. Assistant IA (ChatBot)

- **Interface de Chat** : Overlay avec zone de saisie
- **Historique des messages** : Conversation persistante
- **Assistance pédagogique** : Aide à la conception de cours
- **Suggestions** : Propositions de structure et de contenu
- **Indicateur de saisie** : Animation "bot is typing..."

### 10. Bibliothèque de Cours

#### Découverte de Contenu
- **Affichage** : Mode grille ou liste
- **Filtrage** : Par catégorie, niveau, tags
- **Recherche** : Recherche par mot-clé
- **Tri** : Par popularité, date, note

#### Métadonnées des Cours
- Titre, description, auteur
- Note moyenne (étoiles)
- Nombre de vues et de téléchargements
- Catégorie et tags
- Date de publication
- Miniature/couverture

#### Actions
- **Consulter** : Ouvrir en lecture
- **Favoris** : Ajouter aux favoris
- **Télécharger** : Export PDF du cours
- **Importer** : Importer dans ses projets (UI prête)

### 11. Centre d'Aide

#### Sections de Documentation
- **FAQ** : Questions fréquentes
- **Guides** : Tutoriels pas à pas
- **Support** : Formulaire de contact
- **Documentation API** : Liens vers la référence API
- **Vidéos** : Tutoriels vidéo (UI prête)

---

## Structure des Composants

### Composants de Layout

#### Header.tsx
**Rôle** : Navigation principale et authentification

**Fonctionnalités** :
- Logo et branding
- Liens de navigation (Accueil, Bibliothèque, Aide, À propos)
- État d'authentification :
  - **Non connecté** : Boutons Connexion/Inscription
  - **Connecté** : Menu utilisateur avec photo et nom
- Menu burger pour mobile
- Dropdown utilisateur (Compte, Paramètres, Déconnexion)

**Props** :
```typescript
interface HeaderProps {
  isAuthenticated?: boolean;
  userName?: string;
  userAvatar?: string;
}
```

#### Footer.tsx
**Rôle** : Pied de page global

**Sections** :
- Newsletter : Inscription par email
- Liens rapides : Navigation, légal, social
- Informations de contact
- Crédits de l'équipe
- Copyright et mentions légales

### Composants de l'Éditeur

#### EditorArea.tsx
**Rôle** : Zone d'édition principale du contenu

**Fonctionnalités** :
- `contenteditable` div pour l'édition WYSIWYG
- Gestion du placeholder dynamique
- Binding bidirectionnel avec l'état parent
- Support du formatage riche

**Props** :
```typescript
interface EditorAreaProps {
  content: string;
  onChange: (newContent: string) => void;
  placeholder?: string;
}
```

#### EditorToolBar.tsx
**Rôle** : Barre d'outils de formatage

**Contrôles** :
- Sélecteur de police (Font family)
- Sélecteur de taille (Font size)
- Boutons de formatage : B, I, U, S
- Alignement : Gauche, Centre, Droite, Justifié
- Listes : À puces, Numérotées
- Insertion d'image

**Props** :
```typescript
interface EditorToolBarProps {
  font: string;
  fontSize: string;
  onFontChange: (font: string) => void;
  onFontSizeChange: (size: string) => void;
  onFormatText: (format: string) => void;
  onAlign: (align: string) => void;
  onInsertImage: () => void;
}
```

#### TableOfContents.tsx
**Rôle** : Navigation hiérarchique de la structure

**Fonctionnalités** :
- Affichage de l'arborescence (Parties → Chapitres → Paragraphes → Notions)
- Expand/Collapse des sections
- Sélection d'une notion pour édition
- Boutons d'action CRUD par niveau
- Indicateur visuel de l'élément sélectionné

**Props** :
```typescript
interface TableOfContentsProps {
  structure: Part[];
  currentContext: CurrentContext;
  expandedItems: Record<string, boolean>;
  onToggleExpand: (key: string) => void;
  onSelectNotion: (context: CurrentContext) => void;
  onCreatePart: () => void;
  onCreateChapter: (partTitle: string) => void;
  // ... autres handlers CRUD
}
```

#### RightPanel.tsx
**Rôle** : Panneau latéral à onglets

**Onglets** :
- Import : Importation de contenu
- Commentaires : Système de discussion
- Informations : Statistiques du projet
- Paramètres : Configuration de l'éditeur

**Props** :
```typescript
interface RightPanelProps {
  activeTab: 'import' | 'comments' | 'info' | 'settings' | null;
  onTabChange: (tab: string) => void;
  projectData: Project;
  structure: Part[];
}
```

#### ShareOverlay.tsx
**Rôle** : Modal de partage et collaboration

**Fonctionnalités** :
- Génération de lien de partage
- Liste des collaborateurs actuels
- Ajout de collaborateurs par email
- Sélection du niveau de permission
- Suppression de collaborateurs
- Copie du lien dans le presse-papiers

**Props** :
```typescript
interface ShareOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  currentUser: User;
}
```

#### ChatBotOverlay.tsx
**Rôle** : Assistant IA en overlay

**Fonctionnalités** :
- Interface de chat conversationnelle
- Historique des messages
- Zone de saisie avec bouton d'envoi
- Réponses du bot avec animation de typing
- Bouton de fermeture

**Props** :
```typescript
interface ChatBotOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}
```

### Composants des Pages

#### Page d'accueil (page.tsx)
**Sections** :
- Hero : Titre accrocheur et CTA
- Fonctionnalités : Cartes des principales fonctionnalités
- Témoignages : Avis d'utilisateurs
- Statistiques : Chiffres clés
- CTA final : Appel à l'action

#### Page de Connexion (login/page.tsx)
**Formulaire** :
- Email (validation)
- Mot de passe (masqué)
- Bouton "Se connecter"
- Liens : "Mot de passe oublié", "Créer un compte"
- Boutons OAuth : Google, Microsoft (UI prête)

#### Page d'Inscription (register/page.tsx)
**Étapes** :
1. **Étape 1** : Informations personnelles
   - Prénom, Nom
   - Email (validation)
   - Occupation, Organisation
2. **Étape 2** : Mot de passe
   - Mot de passe (min. 6 caractères)
   - Confirmation du mot de passe
   - Acceptation des CGU

#### Dashboard de Projets (edit-home/page.tsx)
**Éléments** :
- Barre de recherche
- Bouton "Nouveau projet"
- Grille de cartes de projets
- Modals : Créer, Renommer, Supprimer

**Carte de Projet** :
- Nom du projet
- Date de création
- Dernière modification
- Boutons : Ouvrir, Renommer, Supprimer

#### Page de l'Éditeur (edit/page.tsx)
**Layout** :
```
┌────────────────────────────────────────────────┐
│               EditorToolBar                    │
├───────────┬──────────────────┬─────────────────┤
│           │                  │                 │
│  Table    │   EditorArea     │   RightPanel    │
│   of      │   (Content)      │   (Tabs)        │
│ Contents  │                  │                 │
│           │                  │                 │
└───────────┴──────────────────┴─────────────────┘
```

**Overlays** :
- ChatBot : Assistant IA
- Share : Partage et collaboration

#### Page de Prévisualisation (preview/page.tsx)
**Fonctionnalités** :
- Chargement de la structure complète du projet
- Rendu HTML de tout le contenu
- Génération PDF multi-pages
- Bouton de téléchargement
- Retour à l'éditeur

---

## Flux de Données

### 1. Flux d'Authentification

```
┌─────────────────────────────────────────────────────────┐
│  Utilisateur entre email + mot de passe                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  AuthService.login(email, password)                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  API: POST /api/auth/login                              │
│  Body: { email, password }                              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Réponse: { token, user: { id, email, ... } }          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Stockage:                                              │
│  - Cookie HttpOnly: "auth_token" = token                │
│  - SessionStorage: user data                            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  AuthContext mis à jour                                 │
│  setUser(userData), setIsAuthenticated(true)            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Redirection vers /edit-home                            │
└─────────────────────────────────────────────────────────┘
```

### 2. Flux de Chargement des Projets

```
┌─────────────────────────────────────────────────────────┐
│  Page /edit-home se charge                              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  useEffect(() => { fetchProjects() }, [])               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  projectService.getAllProjects()                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  API: GET /api/projects                                 │
│  Headers: { Authorization: "Bearer <token>" }           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Réponse: Project[]                                     │
│  [{ project_name, owner, created_at, updated_at }, ...] │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  setProjects(data)                                      │
│  setIsLoading(false)                                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Rendu des cartes de projets dans la grille            │
└─────────────────────────────────────────────────────────┘
```

### 3. Flux d'Édition de Contenu

```
┌─────────────────────────────────────────────────────────┐
│  Utilisateur sélectionne une notion dans la TOC         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  handleSelectNotion(context)                            │
│  context = { type, projectName, partTitle,              │
│              chapterTitle, paraName, notionName }       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  setCurrentContext(context)                             │
│  setEditorContent(notion.notion_content)                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  EditorArea affiche le contenu                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Utilisateur modifie le texte                           │
│  onChange event triggered                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  setEditorContent(newContent)                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Debounce 2 secondes                                    │
│  setTimeout(() => handleSave(), 2000)                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  handleSave()                                           │
│  structureService.updateNotion(...)                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  API: PATCH /api/projects/{name}/parts/{part}/          │
│       chapters/{chapter}/paragraphs/{para}/             │
│       notions/{notion}                                  │
│  Body: { notion_content: newContent }                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Réponse: { success: true, message: "Updated" }        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Toast notification: "Sauvegardé ✓"                    │
└─────────────────────────────────────────────────────────┘
```

### 4. Gestion d'État

#### État Global (AuthContext)
```typescript
// context/AuthContext.tsx
{
  user: User | null,
  isAuthenticated: boolean,
  login: (email: string, password: string) => Promise<void>,
  logout: () => Promise<void>,
  checkAuth: () => Promise<void>
}
```

#### État Local des Pages

**EditHome (/edit-home)**
```typescript
const [projects, setProjects] = useState<Project[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState("");
const [searchQuery, setSearchQuery] = useState("");
const [showCreateModal, setShowCreateModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [showRenameModal, setShowRenameModal] = useState(false);
const [selectedProject, setSelectedProject] = useState<Project | null>(null);
const [newProjectName, setNewProjectName] = useState("");
```

**Editor (/edit)**
```typescript
const [projectData, setProjectData] = useState<Project | null>(null);
const [structure, setStructure] = useState<Part[]>([]);
const [editorContent, setEditorContent] = useState("");
const [currentContext, setCurrentContext] = useState<CurrentContext>({});
const [textFormat, setTextFormat] = useState({ font: "Arial", fontSize: "16px" });
const [rightPanel, setRightPanel] = useState<string | null>(null);
const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
const [showChatBot, setShowChatBot] = useState(false);
const [showShareOverlay, setShowShareOverlay] = useState(false);
```

---

## Système de Routing

### Routes de l'Application

#### Routes Publiques
| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Page d'accueil (landing) |
| `/login` | LoginPage | Connexion utilisateur |
| `/register` | RegisterPage | Inscription utilisateur |
| `/about` | AboutPage | À propos de l'équipe |
| `/help` | HelpPage | Centre d'aide |
| `/library` | LibraryPage | Bibliothèque de cours |
| `/accueil` | AccueilPage | Page d'accueil en français |
| `/book-reader` | BookReaderPage | Lecteur de livres |

#### Routes Protégées (Authentification requise)
| Route | Page | Description |
|-------|------|-------------|
| `/edit-home` | EditHomePage | Dashboard des projets |
| `/edit` | EditorPage | Éditeur principal |
| `/preview` | PreviewPage | Aperçu et export PDF |
| `/account` | AccountPage | Compte utilisateur |
| `/settings` | SettingsPage | Paramètres de l'application |

### Protection des Routes (Middleware)

**Fichier** : [middleware.ts](middleware.ts)

#### Fonctionnement
```typescript
// Extraction du token JWT du cookie HttpOnly
const token = request.cookies.get('auth_token')?.value;

// Vérification du token avec jose
const { payload } = await jwtVerify(token, secret);

// Routes protégées
const protectedRoutes = ['/edit-home', '/edit', '/account', '/settings'];

if (protectedRoutes.some(route => pathname.startsWith(route))) {
  if (!token) {
    // Redirection vers /login avec retour prévu
    return NextResponse.redirect(`/login?redirect=${pathname}`);
  }
}

// Routes d'authentification (login/register)
const authRoutes = ['/login', '/register'];

if (authRoutes.some(route => pathname.startsWith(route))) {
  if (token) {
    // Si déjà authentifié, redirection vers /edit-home
    return NextResponse.redirect('/edit-home');
  }
}

// Ajout de l'userId dans les headers pour les requêtes API
response.headers.set('x-user-id', payload.userId);
```

### Paramètres de Query

#### Page de l'Éditeur
```
/edit?projectName=NomDuProjet
```

#### Page de Prévisualisation
```
/preview?projectName=NomDuProjet
```

**Extraction** :
```typescript
const searchParams = useSearchParams();
const projectName = searchParams.get('projectName');
```

---

## Sécurité et Authentification

### 1. Système d'Authentification JWT

#### Workflow Complet

**Inscription** :
```
POST /api/auth/register
Body: {
  firstname: string,
  lastname: string,
  email: string,
  password: string,
  occupation: string,
  organisation: string
}

Response: {
  success: true,
  message: "Utilisateur créé",
  data: { userId, email }
}
```

**Connexion** :
```
POST /api/auth/login
Body: { email, password }

Response: {
  success: true,
  message: "Connexion réussie",
  data: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    user: { id, email, firstname, lastname, ... }
  }
}
```

**Vérification de session** :
```
GET /api/auth/me
Headers: { Authorization: "Bearer <token>" }

Response: {
  success: true,
  data: { id, email, firstname, lastname, ... }
}
```

**Déconnexion** :
```
POST /api/auth/logout
Headers: { Authorization: "Bearer <token>" }

Response: { success: true, message: "Déconnexion réussie" }
```

### 2. Stockage des Tokens

#### Cookie HttpOnly (Recommandé)
```typescript
// Backend définit le cookie après login
Set-Cookie: auth_token=<JWT>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800
```

**Avantages** :
- Protection contre XSS (JavaScript ne peut pas accéder)
- Envoyé automatiquement avec chaque requête
- Secure flag pour HTTPS uniquement

#### SessionStorage (Données utilisateur)
```typescript
// Stockage des données utilisateur (non sensibles)
sessionStorage.setItem('user', JSON.stringify(userData));
```

### 3. Protection Middleware

**Configuration** : [middleware.ts](middleware.ts)

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
```

**Vérification JWT** :
```typescript
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const { payload } = await jwtVerify(token, secret);
```

### 4. Headers d'Autorisation

**Toutes les requêtes API protégées** :
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### 5. Validation Côté Client

#### Email
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  setError("Email invalide");
}
```

#### Mot de passe
```typescript
if (password.length < 6) {
  setError("Le mot de passe doit contenir au moins 6 caractères");
}

if (password !== confirmPassword) {
  setError("Les mots de passe ne correspondent pas");
}
```

### 6. Gestion des Erreurs

#### Erreurs d'Authentification
```typescript
try {
  const response = await authService.login(email, password);
  // Success
} catch (error) {
  if (error.status === 401) {
    setError("Email ou mot de passe incorrect");
  } else if (error.status === 404) {
    setError("Compte introuvable");
  } else {
    setError("Erreur de connexion");
  }
}
```

#### Token Expiré
```typescript
// Middleware détecte le token expiré
if (error.code === 'ERR_JWT_EXPIRED') {
  // Redirection vers /login
  return NextResponse.redirect('/login?error=session_expired');
}
```

### 7. Bonnes Pratiques Implémentées

✅ **JWT stockés dans des cookies HttpOnly** (pas dans localStorage)
✅ **Middleware de vérification de token** sur les routes protégées
✅ **Bearer token dans les headers** pour les requêtes API
✅ **Validation des entrées** côté client et serveur
✅ **Messages d'erreur génériques** (pas de fuite d'informations)
✅ **HTTPS recommandé** en production (Secure flag)
✅ **SameSite=Strict** pour protection CSRF
✅ **Expiration des tokens** (7 jours configurables)

### 8. OAuth (Préparé mais non implémenté)

#### UI Prête
```tsx
<button className="oauth-button google">
  <FaGoogle /> Connexion avec Google
</button>

<button className="oauth-button microsoft">
  <FaMicrosoft /> Connexion avec Microsoft
</button>
```

#### Workflow Futur
```
1. Utilisateur clique sur "Connexion avec Google"
2. Redirection vers OAuth provider
3. Callback avec authorization code
4. Backend échange le code contre un token
5. Création/login de l'utilisateur
6. JWT généré et renvoyé au client
```

---

## Patterns Architecturaux

### 1. Container/Presentational Pattern

**Containers (Smart Components)** :
- Pages (app/*/page.tsx)
- Gèrent la logique et l'état
- Effectuent les appels API
- Passent les props aux composants présentationnels

**Presentational (Dumb Components)** :
- Composants UI (components/*)
- Reçoivent les données via props
- Pas d'appels API directs
- Purement visuels et réutilisables

**Exemple** :
```typescript
// Container: edit/page.tsx
const EditorPage = () => {
  const [editorContent, setEditorContent] = useState("");

  const handleSave = async () => {
    await structureService.updateNotion(...);
  };

  return (
    <EditorArea
      content={editorContent}
      onChange={setEditorContent}
    />
  );
};

// Presentational: EditorArea.tsx
const EditorArea = ({ content, onChange }) => {
  return (
    <div
      contentEditable
      onInput={(e) => onChange(e.target.innerHTML)}
    >
      {content}
    </div>
  );
};
```

### 2. Service Layer Pattern

**Services** : Couche d'abstraction pour les appels API

```
Components
    ↓
Services (projectService, structureService, authService)
    ↓
API Helper (apiHelper.ts)
    ↓
Backend API
```

**Avantages** :
- Centralisation de la logique API
- Réutilisabilité du code
- Facilité de test (mock des services)
- Séparation des responsabilités

**Exemple** :
```typescript
// services/projectService.ts
export const projectService = {
  getAllProjects: async (): Promise<Project[]> => {
    const response = await apiHelper.get('/api/projects');
    return response.data;
  },

  createProject: async (name: string): Promise<Project> => {
    const response = await apiHelper.post('/api/projects', { name });
    return response.data;
  },

  // ... autres méthodes
};
```

### 3. Context Provider Pattern

**AuthContext** : État global d'authentification

```typescript
// context/AuthContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
```

**Usage** :
```typescript
// Dans un composant
const { user, isAuthenticated, logout } = useAuth();

if (!isAuthenticated) {
  return <Navigate to="/login" />;
}
```

### 4. Compound Components Pattern

**TableOfContents + Editor** : Composants qui travaillent ensemble

```typescript
// edit/page.tsx
<div className="editor-layout">
  <TableOfContents
    structure={structure}
    onSelectNotion={(notion) => {
      setCurrentContext(notion);
      setEditorContent(notion.content);
    }}
  />

  <EditorArea
    content={editorContent}
    onChange={setEditorContent}
  />

  <RightPanel
    activeTab={rightPanel}
    onTabChange={setRightPanel}
  />
</div>
```

### 5. Modal Management Pattern

**Plusieurs modaux gérés par état booléen** :

```typescript
const [showCreateModal, setShowCreateModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [showRenameModal, setShowRenameModal] = useState(false);

// Affichage conditionnel
{showCreateModal && (
  <CreateProjectModal
    onClose={() => setShowCreateModal(false)}
    onCreate={handleCreateProject}
  />
)}
```

### 6. Debounce Pattern (Auto-save)

**Auto-sauvegarde différée** :

```typescript
const [editorContent, setEditorContent] = useState("");
const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const handleContentChange = (newContent: string) => {
  setEditorContent(newContent);

  // Annuler le timeout précédent
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);
  }

  // Nouveau timeout de 2 secondes
  saveTimeoutRef.current = setTimeout(() => {
    handleSave(newContent);
  }, 2000);
};

const handleSave = async (content: string) => {
  await structureService.updateNotion(..., content);
  // Toast: "Sauvegardé ✓"
};
```

### 7. Error Boundary Pattern

**Gestion des erreurs API** :

```typescript
const fetchProjects = async () => {
  try {
    setIsLoading(true);
    setError("");
    const data = await projectService.getAllProjects();
    setProjects(data);
  } catch (err: any) {
    setError(err.message || "Erreur lors du chargement");
  } finally {
    setIsLoading(false);
  }
};
```

### 8. Optimistic Updates Pattern

**Mise à jour de l'UI avant la réponse API** :

```typescript
const handleDeleteProject = async (projectName: string) => {
  // Mise à jour optimiste
  setProjects(prev => prev.filter(p => p.project_name !== projectName));
  setShowDeleteModal(false);

  try {
    await projectService.deleteProject(projectName);
    // Toast: "Projet supprimé ✓"
  } catch (error) {
    // Rollback en cas d'erreur
    setProjects(previousProjects);
    // Toast: "Erreur lors de la suppression ✗"
  }
};
```

### 9. Controlled Components Pattern

**Tous les inputs sont contrôlés par React state** :

```typescript
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

<input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
```

### 10. Render Props Pattern (RightPanel)

**Panels avec rendu conditionnel** :

```typescript
const RightPanel = ({ activeTab, ...props }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'import':
        return <ImportPanel {...props} />;
      case 'comments':
        return <CommentsPanel {...props} />;
      case 'info':
        return <InfoPanel {...props} />;
      case 'settings':
        return <SettingsPanel {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="right-panel">
      <Tabs activeTab={activeTab} onChange={...} />
      {renderContent()}
    </div>
  );
};
```

---

## Configuration et Déploiement

### 1. Variables d'Environnement

**Fichier** : `.env.local`

```bash
# URL de l'API backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Secret pour signer les JWT (minimum 32 caractères)
JWT_SECRET=xccm_super_secret_key_2024_change_me_in_production_minimum_32chars_minimum

# Durée de validité du token
JWT_EXPIRES_IN=7d
```

**Usage dans le code** :
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const secret = process.env.JWT_SECRET;
```

### 2. Scripts npm

**Fichier** : [package.json](package.json)

```json
{
  "scripts": {
    "dev": "next dev",           // Développement (http://localhost:3000)
    "build": "next build",       // Build de production
    "start": "next start",       // Serveur de production
    "lint": "eslint"             // Linting du code
  }
}
```

**Commandes** :
```bash
# Installation des dépendances
npm install

# Développement
npm run dev

# Build pour production
npm run build

# Démarrer en production
npm start

# Linting
npm run lint
```

### 3. Configuration TypeScript

**Fichier** : [tsconfig.json](tsconfig.json)

**Points clés** :
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]  // Alias d'import
    }
  }
}
```

**Avantage des alias** :
```typescript
// Au lieu de:
import Header from '../../../components/Header';

// On peut faire:
import Header from '@/components/Header';
```

### 4. Configuration Next.js

**Fichier** : [next.config.ts](next.config.ts)

**Configuration actuelle** : Vide (utilise les defaults)

**Recommandations pour la production** :
```typescript
const nextConfig = {
  // Optimisation des images
  images: {
    domains: ['api.example.com'],
  },

  // Variables d'environnement publiques
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Redirections
  async redirects() {
    return [
      {
        source: '/old-route',
        destination: '/new-route',
        permanent: true,
      },
    ];
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};
```

### 5. Configuration ESLint

**Fichier** : [eslint.config.mjs](eslint.config.mjs)

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

### 6. Configuration Tailwind CSS

**Fichier** : [postcss.config.mjs](postcss.config.mjs)

```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

### 7. Déploiement

#### Option 1: Vercel (Recommandé pour Next.js)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Déployer en production
vercel --prod
```

**Avantages** :
- Déploiement automatique depuis GitHub
- Optimisations Next.js natives
- Edge functions pour le middleware
- SSL/HTTPS automatique

#### Option 2: Docker

**Dockerfile** :
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

**docker-compose.yml** :
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - backend
```

#### Option 3: Serveur traditionnel (Ubuntu)

```bash
# Sur le serveur
git clone <repo-url>
cd front-xccm2

# Installer Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer les dépendances et build
npm install
npm run build

# Utiliser PM2 pour gérer le processus
npm install -g pm2
pm2 start npm --name "xccm-frontend" -- start
pm2 save
pm2 startup
```

### 8. Checklist de Déploiement

#### Avant le Déploiement

✅ **Build local réussi** : `npm run build`
✅ **Tests lint passés** : `npm run lint`
✅ **Variables d'environnement configurées** dans la plateforme
✅ **JWT_SECRET changé** (pas la valeur par défaut)
✅ **NEXT_PUBLIC_API_URL** pointant vers le backend de production
✅ **Cookies HttpOnly Secure flag activé** (HTTPS)

#### Après le Déploiement

✅ **Tester l'inscription et la connexion**
✅ **Vérifier le middleware** (redirection sur routes protégées)
✅ **Tester la création de projet**
✅ **Vérifier l'éditeur et l'auto-save**
✅ **Tester l'export PDF**
✅ **Vérifier les performances** (Lighthouse score)

---

## Statistiques du Projet

### Métriques Générales

```
📊 Statistiques du Frontend XCCM 2

Fichiers Source:                  ~44 fichiers
├── Composants TSX:              ~25 fichiers
├── Services TypeScript:         ~4 fichiers
├── Fichiers de configuration:   ~7 fichiers
└── Autres:                      ~8 fichiers

Lines of Code (estimé):
├── Composants:                  4,000-5,000 LOC
├── Pages:                       3,000-4,000 LOC
├── Services:                    1,500-2,000 LOC
├── Configuration:               500-700 LOC
└── Total:                       ~9,000-12,000 LOC
```

### Dépendances

**Production** :
```
Total: 28 packages

Core:
- next: 16.1.1
- react: 19.2.3
- react-dom: 19.2.3
- typescript: 5.x

UI & Styling:
- tailwindcss: 4.x
- lucide-react: 0.562.0
- react-icons: 5.5.0
- framer-motion: 12.23.26

Documents:
- html2canvas: 1.4.1
- jspdf: 4.0.0
- html2pdf.js: 0.12.1

Security:
- jose: 6.1.3

Utilities:
- clsx: 2.1.1
```

**Development** :
```
Total: 8 packages

- @types/node: 20.x
- @types/react: 19.x
- @types/react-dom: 19.x
- eslint: 9.x
- eslint-config-next: 16.1.1
- @tailwindcss/postcss: 4.x
```

### Structure par Type de Composant

```
Composants UI:                    12 composants
├── Header
├── Footer
├── EditorArea
├── EditorToolBar
├── TableOfContents
├── RightPanel
├── ChatBotOverlay
├── ShareOverlay
├── Granule
└── 4 Panels (Import, Comments, Info, Settings)

Pages:                            13 pages
├── HomePage (landing)
├── LoginPage
├── RegisterPage
├── AboutPage
├── HelpPage
├── LibraryPage
├── AccountPage
├── SettingsPage
├── EditHomePage
├── EditorPage
├── PreviewPage
├── BookReaderPage
└── AccueilPage

Services:                         3 services
├── projectService
├── structureService
└── authService

Contexts:                         1 context
└── AuthContext
```

### Endpoints API Utilisés

```
Total: ~20 endpoints

Authentification (4):
├── POST   /api/auth/login
├── POST   /api/auth/register
├── GET    /api/auth/me
└── POST   /api/auth/logout

Projets (5):
├── GET    /api/projects
├── POST   /api/projects
├── GET    /api/projects/{name}
├── PATCH  /api/projects/{name}
└── DELETE /api/projects/{name}

Structure hiérarchique (11):
├── GET    /api/projects/{name}/parts
├── POST   /api/projects/{name}/parts
├── PATCH  /api/projects/{name}/parts/{title}
├── DELETE /api/projects/{name}/parts/{title}
├── (similaire pour chapters, paragraphs, notions)
└── ...
```

### Hiérarchie des Composants (Profondeur)

```
Profondeur maximale: 4 niveaux

Exemple:
RootLayout (1)
└── Providers (2)
    └── EditorPage (3)
        ├── Header (4)
        ├── TableOfContents (4)
        │   └── PartItem (5)
        ├── EditorArea (4)
        └── RightPanel (4)
            └── ImportPanel (5)
```

### Taille des Fichiers (estimée)

```
Fichiers les plus volumineux:

1. edit/page.tsx             ~800-1000 lignes
2. TableOfContents.tsx       ~600-800 lignes
3. edit-home/page.tsx        ~500-600 lignes
4. Header.tsx                ~400-500 lignes
5. library/page.tsx          ~400-500 lignes
6. EditorToolBar.tsx         ~300-400 lignes
7. RightPanel.tsx            ~300-400 lignes
8. preview/page.tsx          ~300-400 lignes
```

### Technologies par Catégorie

```
Frontend Framework:           Next.js 16 (App Router)
UI Library:                   React 19
Type System:                  TypeScript 5
Styling:                      Tailwind CSS 4
State Management:             Context API + useState
Routing:                      Next.js App Router
Authentication:               JWT (jose)
Document Processing:          html2canvas + jsPDF
Animation:                    Framer Motion
Icons:                        Lucide React + React Icons
API Communication:            Fetch API (native)
```

### Compatibilité Navigateurs

```
Navigateurs supportés (grâce à Next.js):
- Chrome/Edge: Dernières versions
- Firefox: Dernières versions
- Safari: 14+
- Mobile (iOS Safari, Chrome Android): Dernières versions

Polyfills automatiques:
- Next.js gère automatiquement les polyfills nécessaires
```

---

## Conclusion

### Points Forts du Projet

✅ **Architecture moderne** : Next.js 16 avec App Router, React 19, TypeScript
✅ **Système d'authentification robuste** : JWT avec HttpOnly cookies
✅ **Structure hiérarchique flexible** : 4 niveaux de contenu
✅ **Éditeur riche** : WYSIWYG avec auto-save
✅ **Export PDF professionnel** : Multi-pages avec formatage préservé
✅ **UI/UX soignée** : Tailwind CSS, animations Framer Motion
✅ **Code bien organisé** : Séparation des responsabilités (services, components, pages)
✅ **Middleware de sécurité** : Protection des routes sensibles
✅ **Typage fort** : TypeScript pour moins d'erreurs
✅ **Composants réutilisables** : Architecture modulaire

### Améliorations Futures Possibles

🔄 **Tests** : Ajouter des tests unitaires et d'intégration (Jest, React Testing Library)
🔄 **i18n** : Système de traduction multilingue (react-i18next)
🔄 **Dark Mode** : Thème sombre avec persistance
🔄 **Offline Mode** : Support hors ligne avec Service Workers
🔄 **Real-time Collaboration** : WebSockets pour édition collaborative
🔄 **Drag & Drop réel** : Implémenter la réorganisation par drag-and-drop
🔄 **Optimisation SEO** : Métadonnées dynamiques, sitemap
🔄 **Analytics** : Tracking utilisateur (Google Analytics, Mixpanel)
🔄 **Notifications** : Système de notifications push
🔄 **Versioning** : Historique des versions de documents

---

**Document généré le** : 2026-01-13
**Version du projet** : 1.0
**Framework** : Next.js 16.1.1
**Auteur** : Équipe XCCM 2
