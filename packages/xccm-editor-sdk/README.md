# @xccm/editor-sdk

Il s'agit du kit de développement officiel pour intégrer l'Éditeur Avancé XCCM2 (Composition de Contenu) à l'intérieur d'applications tierces (comme Moodle Client) construites en React.

## Fonctionnement

Ce composant React encapsule l'éditeur XCCM2 via une Iframe sécurisée.
- L'éditeur tourne sur l'infrastructure XCCM2 (sauvegardes, IA, websockets temps-réel pris en charge nativement).
- Les panneaux latéraux et la barre d'outils complexe sont masqués automatiquement grâce au "Mode Embed", concentrant l'utilisateur sur la composition pure.
- L'application parente est notifiée des sauvegardes via des événements Javascript (`window.postMessage`).

## Installation (Pour les développeurs Moodle Client)

```bash
npm install @xccm/editor-sdk
# ou
yarn add @xccm/editor-sdk
```

*(Note : ce package est actuellement distribué en code source, vous pouvez le compiler ou l'importer directement dans un environnement NextJS/CreateReactApp/Vite/Webpack.)*

## Usage de l'activité "Composition de Contenu"

```tsx
import React, { useState } from 'react';
import { XccmEditor } from '@xccm/editor-sdk';

export function ContentCompositionActivity() {
  const [saveStatus, setSaveStatus] = useState("Non sauvegardé");

  return (
    <div className="activity-container">
      <h2>Activité Moodle : Composition de Texte</h2>
      <p>Statut : {saveStatus}</p>

      {/* Ligne ci-dessous : Composant Moodle qui charge notre éditeur */}
      <XccmEditor 
        baseUrl="http://localhost:3000" // ou l'URL de prod XCCM2
        projectName="MoodleCourse-101"   // L'ID du projet/cours lié
        token="votre_token_JWT_d_authentification"
        height="600px"
        onSave={({ context, content }) => {
          console.log("XCCM2 a enregistré les données:", context, "Contenu:", content);
          setSaveStatus(`Dernière sauvegarde à ${new Date().toLocaleTimeString()}`);
          
          // Moodle Client peut enregistrer ce statut ou valider l'activité de l'étudiant
          // Ex: markActivityCompleted(activityId)
        }}
      />
    </div>
  )
}
```

## Structure de Retour (`onSave`)

Lorsque l'utilisateur sauvegarde (ou que l'Auto-Save se déclenche), la fonction receive un objet avec :
- `content`: Le code HTML généré
- `context`: Les métadonnées XCCM2 indiquant à quel paragraphe/notion cela correspond.
