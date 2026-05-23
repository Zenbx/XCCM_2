# @xccm/editor-sdk

SDK officiel pour intégrer l'éditeur de contenu XCCM2 dans n'importe quelle application React — Moodle, Canvas, LMS tiers ou portail interne.

## Comment ça fonctionne

L'éditeur XCCM2 tourne sur votre infrastructure (ou la nôtre en SaaS). Le SDK l'encapsule dans une `<iframe>` sécurisée et expose une API React simple via `postMessage`. L'application parente n'embarque que ce composant léger — toute la logique de sauvegarde, collaboration temps réel et IA pédagogique reste côté XCCM2.

```
Application parente (Moodle, etc.)
        │
        │  <XccmEditor onSave={...} />
        │
        ▼
┌─────────────────────────────────────┐
│  iframe → /embed/editor             │
│  ┌─────────────────────────────┐    │
│  │  Éditeur XCCM2 complet      │    │
│  │  (Tiptap + IA + Collab)     │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
        │
        │  postMessage XCCM_CONTENT_SAVED
        ▼
  onSave({ content, context })
```

## Installation

```bash
npm install @xccm/editor-sdk
# ou
yarn add @xccm/editor-sdk
# ou
pnpm add @xccm/editor-sdk
```

**Prérequis :** React ≥ 18

## Usage

```tsx
import { XccmEditor } from '@xccm/editor-sdk';

export function ContentActivity() {
  return (
    <XccmEditor
      baseUrl="https://xccm2.mon-ecole.com"
      projectName="cours-chimie-terminale"
      token={currentUser.xccmToken}
      height="650px"
      onReady={() => console.log('Éditeur prêt')}
      onSave={({ content, context }) => {
        // Appelé à chaque sauvegarde (manuelle ou auto-save)
        console.log('Contenu HTML :', content);
        console.log('Granule actif :', context);
        markActivityProgress(currentUser.id, content);
      }}
      onError={({ code, message }) => {
        console.error(`XCCM2 [${code}] :`, message);
      }}
    />
  );
}
```

## Props

| Prop | Type | Requis | Description |
|---|---|---|---|
| `baseUrl` | `string` | ✅ | URL de base de votre instance XCCM2 |
| `projectName` | `string` | ✅ | Nom du projet XCCM2 à charger |
| `token` | `string` | ✅ | JWT d'authentification de l'utilisateur |
| `onSave` | `(payload: XccmSavePayload) => void` | — | Déclenché à chaque sauvegarde |
| `onReady` | `() => void` | — | Déclenché quand l'éditeur est initialisé |
| `onError` | `(error: { code: string; message: string }) => void` | — | Déclenché en cas d'erreur critique |
| `width` | `string \| number` | — | Largeur du conteneur (défaut : `'100%'`) |
| `height` | `string \| number` | — | Hauteur du conteneur (défaut : `'800px'`) |
| `loadingText` | `string` | — | Texte affiché pendant le chargement |

## Structure du payload `onSave`

```ts
interface XccmSavePayload {
  content: string;       // HTML du granule actif
  context: {
    type: 'notion' | 'part' | string;
    partTitle?: string;
    chapterTitle?: string;
    paraName?: string;
    notionName?: string;
  } | null;
}
```

## Événements postMessage

Le SDK utilise le protocole suivant entre l'iframe et l'application parente :

| Type | Direction | Description |
|---|---|---|
| `XCCM_EDITOR_READY` | iframe → parent | Éditeur initialisé |
| `XCCM_CONTENT_SAVED` | iframe → parent | Sauvegarde effectuée |
| `XCCM_ERROR` | iframe → parent | Erreur critique |
| `XCCM_LOAD_CONTENT` | parent → iframe | (Futur) Chargement de contenu externe |

## Sécurité

- Les messages `postMessage` sont filtrés par origine (`event.origin === new URL(baseUrl).origin`).
- Le token JWT est transmis uniquement via l'URL de l'iframe (paramètre `token`), jamais stocké par le SDK.
- L'iframe utilise l'attribut `sandbox="allow-scripts allow-same-origin allow-forms allow-popups"`.

## Build local (contributeurs)

```bash
cd packages/xccm-editor-sdk
npm install
npm run build
# → génère dist/index.js, dist/index.esm.js, dist/index.d.ts
```

## Licence

MIT — © 2026 Équipe XCCM2
