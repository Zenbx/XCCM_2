"use client"

import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Book, HelpCircle, FileText, Headphones, Menu, X, Send, Mail, Phone, MapPin, Clock } from 'lucide-react';

const HelpCenter = () => {
  const [activeSection, setActiveSection] = useState('documentation');
  const [activeSubSection, setActiveSubSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  // État du formulaire de contact
  const [contactForm, setContactForm] = useState({
    nom: '',
    email: '',
    sujet: '',
    description: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Structure du contenu
  const sections = {
    documentation: {
      title: 'Documentation',
      icon: Book,
      subsections: [
        { id: 'intro', title: 'Introduction à XCCM 2' },
        { id: 'fonctionnalites', title: 'Fonctionnalités principales' },
        { id: 'interface', title: 'Interface utilisateur' },
        { id: 'organisation', title: 'Organisation des cours' },
        { id: 'publication', title: 'Publication et partage' }
      ]
    },
    faq: {
      title: 'FAQ',
      icon: HelpCircle,
      subsections: [
        { id: 'compte', title: 'Gestion du compte' },
        { id: 'creation', title: 'Création de contenu' },
        { id: 'problemes', title: 'Problèmes courants' },
        { id: 'securite', title: 'Sécurité et confidentialité' }
      ]
    },
    guide: {
      title: 'Guide Auteurs',
      icon: FileText,
      subsections: [
        { id: 'premier-cours', title: 'Créer votre premier cours' },
        { id: 'structuration', title: 'Structurer vos contenus' },
        { id: 'bonnes-pratiques', title: 'Bonnes pratiques pédagogiques' },
        { id: 'multimedia', title: 'Ajouter du multimédia' },
        { id: 'collaboration', title: 'Travailler en équipe' }
      ]
    },
    support: {
      title: 'Support Technique',
      icon: Headphones,
      subsections: [
        { id: 'contact', title: 'Nous contacter' },
        { id: 'bug-report', title: 'Signaler un bug' },
        { id: 'compatibilite', title: 'Compatibilité navigateurs' },
        { id: 'api', title: 'Documentation API' }
      ]
    }
  };

  const handleContactSubmit = () => {
    if (!contactForm.nom || !contactForm.email || !contactForm.sujet || !contactForm.description) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    console.log('Formulaire de contact:', contactForm);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setContactForm({ nom: '', email: '', sujet: '', description: '' });
    }, 3000);
  };

  // Contenu détaillé
  const content = {
    documentation: {
      intro: {
        title: 'Introduction à XCCM 2',
        content: `XCCM 2 est une plateforme numérique dédiée à la création, la structuration et la publication de cours en ligne. Conçue comme un système auteur, elle permet aux enseignants, formateurs et créateurs de contenus pédagogiques de produire des cours clairs, modulaires et facilement accessibles aux apprenants.

Développé dans le cadre d'un projet d'Interaction Homme-Machine (IHM), XCCM 2 place l'utilisateur au centre de la conception, en mettant l'accent sur l'ergonomie, la simplicité d'usage et la qualité de l'expérience utilisateur.`
      },
      fonctionnalites: {
        title: 'Fonctionnalités principales',
        content: `XCCM 2 propose un ensemble de fonctionnalités essentielles pour la conception de cours en ligne :

• Création et édition de cours pédagogiques
• Organisation hiérarchique des contenus (cours, parties, chapitres, paragraphes)
• Gestion d'une bibliothèque de cours
• Publication des contenus sur une plateforme accessible aux apprenants
• Navigation fluide et structurée entre les différents contenus
• Import automatique de documents avec division en granules
• Collaboration en temps réel avec d'autres auteurs`
      },
      interface: {
        title: 'Interface utilisateur',
        content: `L'interface de XCCM 2 est organisée en trois zones principales :

Table des matières (gauche) : Visualisez et naviguez dans la structure hiérarchique de votre cours. Utilisez les flèches pour déplier/replier les sections.

Zone d'édition (centre) : Créez et modifiez vos contenus avec un éditeur de texte riche, similaire à Word. La barre d'outils offre toutes les options de formatage nécessaires.

Panneau latéral (droite) : Accédez rapidement aux fonctionnalités d'import, commentaires, informations du cours et paramètres via les icônes verticales.`
      },
      organisation: {
        title: 'Organisation des cours',
        content: `Un cours dans XCCM 2 suit une structure hiérarchique claire :

Cours : Le niveau le plus élevé, contient toutes vos ressources pédagogiques
├── Parties : Grandes divisions thématiques de votre cours
│   ├── Chapitres : Sous-divisions logiques d'une partie
│   │   ├── Paragraphes : Sections de contenu au sein d'un chapitre
│   │   │   └── Notions : Concepts spécifiques ou points clés

Cette organisation modulaire facilite la navigation et la réutilisation des contenus.`
      },
      publication: {
        title: 'Publication et partage',
        content: `Une fois votre cours terminé, vous pouvez le publier en quelques clics :

1. Vérifiez votre contenu avec le bouton "Aperçu"
2. Configurez les paramètres de visibilité (Privé, Public, Partagé)
3. Cliquez sur "Publier" pour rendre votre cours accessible
4. Partagez le lien avec vos apprenants

Les cours publiés sont automatiquement indexés dans la bibliothèque XCCM 2 et peuvent être découverts par d'autres utilisateurs selon vos paramètres de visibilité.`
      }
    },
    faq: {
      compte: {
        title: 'Gestion du compte',
        content: `Q: Comment créer un compte sur XCCM 2 ?
R: Cliquez sur "S'inscrire" en haut à droite, remplissez le formulaire avec vos informations, et validez votre email.

Q: J'ai oublié mon mot de passe, que faire ?
R: Utilisez le lien "Mot de passe oublié" sur la page de connexion. Un email de réinitialisation vous sera envoyé.

Q: Puis-je changer mon nom d'utilisateur ?
R: Oui, rendez-vous dans Paramètres > Mon Compte > Modifier le profil.

Q: Comment supprimer mon compte ?
R: Contactez le support technique via le formulaire de contact. Notez que cette action est irréversible.`
      },
      creation: {
        title: 'Création de contenu',
        content: `Q: Combien de cours puis-je créer ?
R: Il n'y a pas de limite au nombre de cours que vous pouvez créer avec XCCM 2.

Q: Puis-je importer mes anciens cours ?
R: Oui, utilisez la fonction d'import dans le panneau latéral droit. XCCM 2 supporte les formats PDF, DOCX, et TXT.

Q: Comment ajouter des images et vidéos ?
R: Utilisez le bouton "Import" dans le panneau latéral, puis glissez-déposez vos fichiers multimédias.

Q: Mes modifications sont-elles sauvegardées automatiquement ?
R: Oui, si vous activez la sauvegarde automatique dans les paramètres. Sinon, pensez à sauvegarder régulièrement.`
      },
      problemes: {
        title: 'Problèmes courants',
        content: `Q: Mon éditeur ne répond plus, que faire ?
R: Actualisez la page (F5). Vos modifications récentes seront sauvegardées si l'auto-save est activé.

Q: Je ne vois pas mes cours dans la bibliothèque
R: Vérifiez que vous êtes bien connecté et que le filtre "Mes cours" est actif.

Q: L'aperçu ne correspond pas à mon contenu
R: Videz le cache de votre navigateur et réessayez. Si le problème persiste, contactez le support.

Q: Les caractères spéciaux ne s'affichent pas correctement
R: Assurez-vous d'utiliser l'encodage UTF-8 dans les paramètres de votre cours.`
      },
      securite: {
        title: 'Sécurité et confidentialité',
        content: `Q: Mes données sont-elles sécurisées ?
R: Oui, XCCM 2 utilise le chiffrement SSL/TLS pour toutes les communications et stocke vos données de manière sécurisée.

Q: Qui peut voir mes cours non publiés ?
R: Seuls vous et les collaborateurs que vous avez explicitement ajoutés peuvent accéder à vos brouillons.

Q: Puis-je exporter mes données ?
R: Oui, vous pouvez exporter vos cours au format PDF ou DOCX à tout moment depuis les paramètres.

Q: Comment signaler un contenu inapproprié ?
R: Utilisez le bouton "Signaler" sous le cours concerné ou contactez directement le support.`
      }
    },
    guide: {
      'premier-cours': {
        title: 'Créer votre premier cours',
        content: `Bienvenue dans XCCM 2 ! Suivez ces étapes pour créer votre premier cours :

Étape 1 : Accéder à l'éditeur
Cliquez sur "Éditer" dans le menu principal ou sur le bouton "+ Nouveau cours" dans votre bibliothèque.

Étape 2 : Définir la structure
Commencez par créer au moins une partie dans la table des matières. Cliquez sur le bouton "+" à côté de "Table des matières".

Étape 3 : Ajouter du contenu
Sélectionnez une section dans la table des matières et commencez à écrire dans la zone d'édition centrale.

Étape 4 : Formater votre texte
Utilisez la barre d'outils pour mettre en forme votre contenu (gras, italique, listes, etc.).

Étape 5 : Enregistrer et prévisualiser
Cliquez sur "Aperçu" pour voir le rendu final, puis sur "Publier" quand vous êtes satisfait.`
      },
      structuration: {
        title: 'Structurer vos contenus',
        content: `Une bonne structuration facilite l'apprentissage et la navigation :

Principes de structuration :

1. Hiérarchie claire : Utilisez parties > chapitres > paragraphes > notions
2. Titres descriptifs : Choisissez des titres explicites pour chaque section
3. Granularité : Divisez les concepts complexes en notions plus simples
4. Progression logique : Organisez vos contenus du général au particulier
5. Cohérence : Maintenez le même niveau de détail dans chaque section

Astuce : Utilisez la fonction d'import pour convertir automatiquement vos documents en structure hiérarchique.`
      },
      'bonnes-pratiques': {
        title: 'Bonnes pratiques pédagogiques',
        content: `Pour créer des cours efficaces sur XCCM 2 :

Clarté et concision
• Utilisez des phrases courtes et un vocabulaire adapté à votre public
• Évitez le jargon technique inutile
• Définissez les termes importants dès leur première apparition

Engagement des apprenants
• Posez des questions tout au long du cours
• Proposez des exemples concrets et des cas pratiques
• Utilisez des visuels pour illustrer vos propos

Accessibilité
• Structurez bien vos contenus avec des titres clairs
• Ajoutez des descriptions alternatives aux images
• Utilisez un contraste suffisant pour la lisibilité

Évaluation
• Incluez des quiz ou des exercices pratiques
• Donnez des feedbacks constructifs
• Permettez la révision des concepts clés`
      },
      multimedia: {
        title: 'Ajouter du multimédia',
        content: `Enrichissez vos cours avec des éléments multimédias :

Images
1. Cliquez sur l'icône "Cloud" dans le panneau latéral droit
2. Glissez-déposez vos images ou parcourez vos fichiers
3. Formats acceptés : JPG, PNG, GIF, SVG

Vidéos
• Hébergez vos vidéos sur YouTube ou Vimeo
• Copiez le lien de partage
• Collez-le dans votre contenu (conversion automatique)

Documents
• PDF, DOCX, XLSX supportés
• Taille maximale : 50 MB par fichier
• Les documents seront automatiquement convertis en granules

Bonnes pratiques
✓ Optimisez vos images (max 1 MB recommandé)
✓ Ajoutez des légendes explicatives
✓ Testez la lecture sur différents appareils
✓ Respectez les droits d'auteur`
      },
      collaboration: {
        title: 'Travailler en équipe',
        content: `XCCM 2 facilite la collaboration entre auteurs :

Inviter des collaborateurs
1. Ouvrez les paramètres du cours (icône engrenage)
2. Activez le "Mode collaboratif"
3. Entrez les emails de vos co-auteurs
4. Définissez leurs permissions (Lecture, Édition, Admin)

Gestion des versions
• Chaque modification est automatiquement horodatée
• Consultez l'historique dans Paramètres > Versions
• Restaurez une version antérieure si nécessaire

Commentaires et révisions
• Utilisez le panneau Commentaires pour échanger
• Mentionnez un collaborateur avec @nom
• Marquez les sections à réviser

Bonnes pratiques collaboratives
→ Définissez des conventions de nommage
→ Communiquez régulièrement avec votre équipe
→ Assignez des sections spécifiques à chaque auteur
→ Faites des révisions croisées avant publication`
      }
    },
    support: {
      contact: {
        title: 'Nous contacter',
        isForm: true
      },
      'bug-report': {
        title: 'Signaler un bug',
        content: `Vous avez rencontré un problème technique ? Aidez-nous à l'identifier :

Informations à fournir
• Navigateur et version (ex: Chrome 120)
• Système d'exploitation (Windows, Mac, Linux)
• Description détaillée du problème
• Étapes pour reproduire le bug
• Captures d'écran si possible

Où signaler ?
→ Email : bugs@xccm2.com
→ GitHub : github.com/xccm2/issues
→ Formulaire de bug : xccm2.com/report-bug

Statut des bugs connus
Consultez notre page de statut pour voir les problèmes connus et leur résolution : status.xccm2.com

Exemple de rapport :
"Navigateur: Firefox 121
OS: Windows 11
Problème: Le bouton 'Publier' ne répond pas
Étapes: 1) Créer un cours 2) Ajouter du contenu 3) Cliquer sur Publier
Résultat attendu: Le cours devrait être publié
Résultat obtenu: Rien ne se passe"

Votre feedback est précieux pour améliorer XCCM 2 !`
      },
      compatibilite: {
        title: 'Compatibilité navigateurs',
        content: `XCCM 2 fonctionne sur les navigateurs modernes :

Navigateurs supportés ✓
• Google Chrome 100+ (recommandé)
• Mozilla Firefox 100+
• Microsoft Edge 100+
• Safari 15+
• Opera 85+

Fonctionnalités par navigateur

Chrome / Edge
✓ Support complet
✓ Performance optimale
✓ Toutes les fonctionnalités disponibles

Firefox
✓ Support complet
✓ Bonne performance
⚠ Import de gros fichiers peut être plus lent

Safari
✓ Support de base
⚠ Certaines animations peuvent différer
⚠ Testez l'aperçu avant publication

Navigateurs non supportés ✗
• Internet Explorer (toutes versions)
• Navigateurs obsolètes (> 3 ans)

Configuration recommandée
• Écran : 1366x768 minimum (1920x1080 recommandé)
• RAM : 4 GB minimum
• Connexion : 5 Mbps minimum
• JavaScript activé
• Cookies activés`
      },
      api: {
        title: 'Documentation API',
        content: `Intégrez XCCM 2 dans vos applications avec notre API REST :

URL de base
https://api.xccm2.com/v1

Authentication
Utilisez un token Bearer dans le header :
Authorization: Bearer YOUR_API_TOKEN

Endpoints principaux

GET /courses
Liste tous les cours accessibles

POST /courses
Crée un nouveau cours

GET /courses/:id
Récupère un cours spécifique

PUT /courses/:id
Met à jour un cours

DELETE /courses/:id
Supprime un cours

Exemple de requête (JavaScript)
fetch('https://api.xccm2.com/v1/courses', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
})

Documentation complète
→ Consultez notre documentation Swagger : api.xccm2.com/docs
→ Exemples de code : github.com/xccm2/api-examples
→ SDK disponibles : JavaScript, Python, PHP, Ruby

Limites de taux
• 1000 requêtes / heure pour les comptes gratuits
• 10000 requêtes / heure pour les comptes Premium
• Contactez-nous pour des besoins personnalisés`
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const subsections = sections[activeSection]?.subsections || [];
      const scrollPosition = window.scrollY + 150;

      for (const subsection of subsections) {
        const element = document.getElementById(subsection.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSubSection(subsection.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const [section, subsection] = hash.split('#');
      if (sections[section]) {
        setActiveSection(section);
        setTimeout(() => {
          const element = document.getElementById(subsection || sections[section].subsections[0].id);
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, []);

  const scrollToSection = (subsectionId) => {
    const element = document.getElementById(subsectionId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSubSection(subsectionId);
    setIsMobileTocOpen(false);
  };

  const changeSection = (sectionKey) => {
    setActiveSection(sectionKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const firstSubsection = sections[sectionKey].subsections[0].id;
    setActiveSubSection(firstSubsection);
    setIsMobileSidebarOpen(false);
  };

  const currentSection = sections[activeSection];
  const Icon = currentSection?.icon || Book;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 text-gray-900">
      {/* Header Mobile */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">XCCM 2</h1>
            <p className="text-xs text-gray-600">Centre d'aide</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg text-[#99334C]"
        >
          <FileText size={20} />
        </button>
      </div>

      {/* Overlay Mobile */}
      {(isMobileSidebarOpen || isMobileTocOpen) && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => {
            setIsMobileSidebarOpen(false);
            setIsMobileTocOpen(false);
          }}
        />
      )}

      {/* Sidebar Gauche */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-40
        w-72 md:w-64 bg-white border-r border-gray-200 overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">XCCM 2</h1>
            <p className="text-sm text-gray-600">Centre d'aide</p>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#99334C] transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <nav className="p-4">
          <div className="space-y-1">
            {Object.entries(sections).map(([key, section]) => {
              const SectionIcon = section.icon;
              return (
                <button
                  key={key}
                  onClick={() => changeSection(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeSection === key
                    ? 'bg-[#99334C] text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  <SectionIcon size={18} />
                  <span className="font-medium">{section.title}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 mt-auto">
          <p className="text-xs text-gray-500">Version 2.0.0</p>
          <p className="text-xs text-gray-500 mt-1">Projet IHM 2025</p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24">
          <div className="mb-8 md:mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 md:p-3 bg-[#99334C] rounded-lg">
                <Icon size={20} className="text-white md:w-6 md:h-6" />
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900">{currentSection?.title}</h1>
            </div>
            <p className="text-gray-600 text-sm md:text-lg">
              {activeSection === 'documentation' && 'Découvrez toutes les fonctionnalités de XCCM 2'}
              {activeSection === 'faq' && 'Réponses aux questions fréquemment posées'}
              {activeSection === 'guide' && 'Apprenez à créer des cours de qualité'}
              {activeSection === 'support' && 'Obtenez de l\'aide technique'}
            </p>
          </div>

          {currentSection?.subsections.map((subsection) => {
            const subsectionContent = content[activeSection]?.[subsection.id];

            // Cas spécial pour le formulaire de contact
            if (subsectionContent?.isForm) {
              return (
                <section
                  key={subsection.id}
                  id={subsection.id}
                  className="mb-12 md:mb-16 scroll-mt-24"
                >
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                    Nous contacter
                  </h2>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Formulaire */}
                    <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h3>

                      {formSubmitted ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send className="w-8 h-8 text-green-600" />
                          </div>
                          <h4 className="text-lg font-bold text-green-900 mb-2">Message envoyé !</h4>
                          <p className="text-green-700">Nous vous répondrons dans les 24-48h.</p>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Nom complet
                            </label>
                            <input
                              type="text"
                              value={contactForm.nom}
                              onChange={(e) => setContactForm({ ...contactForm, nom: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                              placeholder="Votre nom"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              value={contactForm.email}
                              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                              placeholder="votre@email.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Sujet
                            </label>
                            <input
                              type="text"
                              value={contactForm.sujet}
                              onChange={(e) => setContactForm({ ...contactForm, sujet: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                              placeholder="Objet de votre message"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Description du problème
                            </label>
                            <textarea
                              value={contactForm.description}
                              onChange={(e) => setContactForm({ ...contactForm, description: e.target.value })}
                              rows={5}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all resize-none"
                              placeholder="Décrivez votre problème en détail..."
                            />
                          </div>

                          <button
                            onClick={handleContactSubmit}
                            className="w-full bg-[#99334C] text-white py-3 rounded-xl font-semibold hover:bg-[#7a283d] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                          >
                            <Send className="w-5 h-5" />
                            Envoyer le message
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Informations de contact */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-2xl p-6 md:p-8 text-white">
                        <h3 className="text-xl font-bold mb-6">Informations de contact</h3>

                        <div className="space-y-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                              <Mail className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-semibold mb-1">Email</p>
                              <p className="text-white/90 text-sm">support@xccm2.com</p>
                              <p className="text-white/90 text-sm">contact@xccm2.com</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                              <Phone className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-semibold mb-1">Téléphone</p>
                              <p className="text-white/90 text-sm">+237 6XX XXX XXX</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-semibold mb-1">Localisation</p>
                              <p className="text-white/90 text-sm">Douala, Cameroun</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                              <Clock className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-semibold mb-1">Horaires</p>
                              <p className="text-white/90 text-sm">Lun-Ven : 9h - 18h</p>
                              <p className="text-white/90 text-sm">Sam : 10h - 14h</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                        <h4 className="text-lg font-bold text-blue-900 mb-3">Délai de réponse</h4>
                        <p className="text-blue-800 text-sm mb-4">
                          Notre équipe s'engage à vous répondre sous 24-48h ouvrées.
                        </p>
                        <div className="bg-white rounded-lg p-3 text-sm">
                          <p className="text-gray-700"><strong>Support Premium :</strong> Réponse sous 4h</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            // Contenu standard
            return (
              <section
                key={subsection.id}
                id={subsection.id}
                className="mb-12 md:mb-16 scroll-mt-24"
              >
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 pb-3 border-b border-gray-200">
                  {subsectionContent?.title || subsection.title}
                </h2>
                <div className="prose prose-sm md:prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
                    {subsectionContent?.content}
                  </p>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Sidebar Droite - TOC */}
      <div className={`
        fixed xl:relative inset-y-0 right-0 z-40
        w-72 xl:w-64 bg-white border-l border-gray-200 overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isMobileTocOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
      `}>
        <div className="p-6 sticky top-0 bg-white">
          <div className="flex items-center justify-between mb-4 md:mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Sur cette page
            </h3>
            <button
              onClick={() => setIsMobileTocOpen(false)}
              className="xl:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X size={18} />
            </button>
          </div>
          <nav>
            <ul className="space-y-2">
              {currentSection?.subsections.map((subsection) => (
                <li key={subsection.id}>
                  <button
                    onClick={() => scrollToSection(subsection.id)}
                    className={`w-full text-left text-sm py-2 px-3 rounded transition-colors flex items-center gap-2 ${activeSubSection === subsection.id
                      ? 'text-[#99334C] font-medium bg-[#99334C]/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    {activeSubSection === subsection.id && (
                      <ChevronRight size={14} className="flex-shrink-0" />
                    )}
                    <span className={activeSubSection === subsection.id ? '' : 'ml-5'}>
                      {subsection.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Bouton TOC flottant pour tablettes */}
      <button
        onClick={() => setIsMobileTocOpen(true)}
        className="fixed bottom-6 right-6 xl:hidden bg-[#99334C] text-white p-4 rounded-full shadow-lg z-30 hover:bg-[#7a283d] transition-colors"
      >
        <FileText size={24} />
      </button>
    </div>
  );
};

export default HelpCenter;