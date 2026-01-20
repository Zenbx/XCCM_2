# Documentation - Page Bibliothèque (Library)

## Vue d'ensemble
La page `/library` affiche une bibliothèque de cours avec filtrage, recherche, pagination et favoris. C'est une interface complète de découverte de contenu pédagogique.

## Structure du code

### 1. **En-tête avec recherche et filtres**
```tsx
<div className="sticky top-0 z-40 bg-white shadow-sm">
  {/* Search bar avec input */}
  {/* Boutons de filtre : Catégories, Niveau, Durée, Trier */}
</div>
```
- Barre de recherche sticky en haut
- Boutons de filtre interactifs avec icônes
- Tri des résultats (Pertinence, Plus récent, Plus populaire)

### 2. **Layout principal**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  {/* Sidebar filtrés à gauche (responsive) */}
  {/* Grille de cours à droite */}
</div>
```

### 3. **Sidebar gauche - Filtres**
- Catégories (Informatique, Développement, Bureautique, etc.)
- Niveaux (Débutant, Intermédiaire, Avancé)
- Durée (< 5h, 5-10h, 10-20h, > 20h)
- Chaque filtre est un checkbox interactif

### 4. **Grille de cours - Carte (Card)**
Chaque cours affiche :
```tsx
<div className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg">
  {/* Image du cours avec overlay au hover */}
  <div className="aspect-video bg-gradient-to-br from-[#99334C] to-[#662D3A]">
    {/* Overlay: boutons Voir/Télécharger au survol */}
  </div>
  
  {/* Info du cours */}
  <div className="p-4">
    <h3 className="font-semibold text-gray-900">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
    
    {/* Meta info */}
    <div className="flex items-center justify-between mt-3">
      <span className="text-xs font-semibold text-[#99334C]">{category}</span>
      <button onClick={() => toggleBookmark(id)}>
        {/* Icône cœur/favori */}
      </button>
    </div>
    
    {/* Stats: views, downloads, rating */}
    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
      <Eye size={14} /> {views}
      <Download size={14} /> {downloads}
      <Star size={14} /> {rating}
    </div>
    
    {/* Author info */}
    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
      <Avatar>{author}</Avatar>
      <span className="text-sm text-gray-700">{author}</span>
    </div>
  </div>
</div>
```

### 5. **Interactions**
- **Recherche** : Filtre les cours par titre/description
- **Filtres** : Affiche/masque courses selon catégorie, niveau, durée
- **Pagination** : 6 cours par page avec navigation
- **Favoris** : Toggle cœur pour ajouter/retirer des favoris
- **Hover** : Overlay sur image + boutons Voir/Télécharger

### 6. **Design & Styles**
- **Couleur primaire** : `#99334C` (marron XCCM)
- **Couleur secondaire** : `#662D3A`
- **Gradient** : `from-[#99334C] to-[#662D3A]`
- **Responsive** : Mobile (1 col) → Tablet (2 col) → Desktop (3 col)
- **Cards** : Rounded corners, shadows, hover effects
- **Icons** : lucide-react (Eye, Download, Star, Heart, etc.)

### 7. **États de la page**
- `searchQuery` : texte de recherche
- `activeCategory` : filtre catégorie active
- `activeLevel` : filtre niveau actif
- `activeDuration` : filtre durée actif
- `currentPage` : numéro page actuelle (pagination)
- `bookmarkedCourses` : liste des IDs favorisés
- `sortBy` : type de tri appliqué

## Prochaines étapes

### Backend Integration
1. **API Endpoint** : `GET /api/courses?search=...&category=...&level=...&page=...`
2. **Réponse** : 
```json
{
  "courses": [
    {
      "id": 1,
      "title": "...",
      "description": "...",
      "author": "...",
      "category": "...",
      "level": "...",
      "rating": 4.8,
      "views": 1250,
      "downloads": 340,
      "duration": "12h",
      "date": "2024-12-15"
    }
  ],
  "totalPages": 5,
  "totalCourses": 28
}
```

3. **Remplacer** la variable `courses` par un `useEffect` qui fetch l'API
4. **Ajouter** loading states et error handling

## Fichier concerné
- `app/library/page.tsx` - Page complète avec design, filtres et interactions

## Notes
- Les données mockées ont été supprimées
- Le design et structure JSX sont conservés
- Prêt pour intégration backend
- Tous les styles et interactions sont fonctionnels
