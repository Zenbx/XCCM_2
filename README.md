# XCCM2 — Frontend

Interface utilisateur de la plateforme XCCM 2. Construit avec Next.js 16, React 19 et TailwindCSS 4.

## Table des matières

- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Structure du projet](#structure-du-projet)
- [Pages et fonctionnalités](#pages-et-fonctionnalités)
- [Composants clés](#composants-clés)
- [Hooks personnalisés](#hooks-personnalisés)
- [Tests](#tests)
- [Déploiement](#déploiement)

---

## Stack technique

| Outil | Rôle |
|---|---|
| Next.js 16 (App Router) | Framework frontend |
| React 19 | UI |
| TailwindCSS 4 | Styles |
| Zustand 5 | État global |
| TipTap + Yjs | Éditeur collaboratif CRDT |
| Hocuspocus | Fournisseur WebSocket (collaboration) |
| Framer Motion | Animations |
| Recharts | Graphiques / analytics |
| next-intl | Internationalisation (i18n) |
| Vitest + RTL | Tests unitaires (36 tests) |
| Playwright | Tests E2E |

---

## Installation

```bash
cd front-xccm2
npm install --legacy-peer-deps

# Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos URLs

# Démarrer en développement (port 3000)
npm run dev
```

---

## Variables d'environnement

| Variable | Valeur développement | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | URL de l'API backend |
| `NEXT_PUBLIC_HOCUSPOCUS_URL` | `ws://localhost:1234` | URL du serveur WebSocket Synapse |
| `JWT_SECRET` | (même que le backend) | Vérification côté serveur Next.js |

En production, remplacer par les URLs Vercel / Railway.

---

## Structure du projet

```
front-xccm2/
├── app/                     # Pages (Next.js App Router)
│   ├── (auth)/              # Pages auth (login, register, reset)
│   ├── (dashboard)/         # Interface principale après login
│   │   ├── account/         # Tableau de bord utilisateur
│   │   ├── editor/          # Éditeur de cours
│   │   ├── classrooms/      # Gestion des classes
│   │   ├── marketplace/     # Marketplace
│   │   └── vault/           # Coffre-fort
│   └── api/                 # Routes API Next.js (auth proxy, etc.)
├── components/
│   ├── ui/                  # Composants atomiques (Button, Input, Modal…)
│   ├── editor/              # Éditeur TipTap + outils
│   ├── classroom/           # Composants LMS
│   ├── ai/                  # Panneau IA éditeur
│   └── ErrorBoundary.tsx    # Gestion d'erreurs React
├── hooks/
│   ├── useDebounce.ts       # useDebounce, useDebouncedCallback, useDebouncedState
│   ├── useAutoReconnect.ts  # Reconnexion WebSocket avec backoff exponentiel
│   └── useSynapseSync.ts    # Synchronisation Yjs / Hocuspocus
├── lib/
│   ├── fetchWithRetry.ts    # fetch avec retry auto + timeout (500/429/408 retried)
│   └── authService.ts       # Login, logout, refresh token
├── context/
│   └── AuthContext.tsx      # Contexte d'authentification global
├── e2e/                     # Tests Playwright
└── src/test/                # Tests Vitest (36 tests)
```

---

## Pages et fonctionnalités

### Authentification
- Inscription / Connexion par email + mot de passe
- OAuth Google et Microsoft (via NextAuth)
- Réinitialisation de mot de passe par email
- Gestion automatique du refresh token

### Éditeur de cours
- Structure hiérarchique : **Parties → Chapitres → Paragraphes → Notions**
- Éditeur WYSIWYG TipTap avec collaboration temps réel (Yjs CRDT)
- Présence des curseurs collaborateurs
- Assistant IA Mistral intégré dans le panneau latéral
- Export PDF / JSON

### LMS (Classes)
- Création et gestion de classes
- Rejoindre une classe via un code d'invitation
- Publication de devoirs, suivi des soumissions
- Exercices interactifs (QCU, QCM, code, texte à trous)
- Tableau de bord analytique par classe

### Autres
- **Marketplace** — navigation et achat de contenus pédagogiques
- **Vault** — bibliothèque personnelle
- **Profil** — paramètres, avatar, statistiques
- **Mode sombre / clair** — via `next-themes`

---

## Composants clés

### `ErrorBoundary`
```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary fallback={<p>Erreur inattendue</p>}>
  <MonComposant />
</ErrorBoundary>
```
Capture les erreurs React, affiche un fallback. Prop `onReset` pour un bouton "Réessayer".

---

## Hooks personnalisés

### `useDebounce(value, delay)`
Retarde la mise à jour d'une valeur jusqu'à ce qu'elle n'ait pas changé pendant `delay` ms.

```ts
const debouncedSearch = useDebounce(searchTerm, 300);
```

### `useDebouncedCallback(fn, delay)`
Version debounce d'une fonction callback.

```ts
const handleSearch = useDebouncedCallback((q: string) => fetchResults(q), 300);
```

### `useDebouncedState(initial, delay)`
État avec valeur immédiate (UI) et valeur debounce (API).

```ts
const [query, debouncedQuery, setQuery] = useDebouncedState('', 300);
```

### `useAutoReconnect(options)`
Reconnexion automatique avec backoff exponentiel et jitter, pour les WebSocket.

```ts
const { startReconnect, stopReconnect, notifySuccess, reconnectState } = useAutoReconnect({
  maxRetries: 10,
  initialDelay: 1000,
  onReconnectAttempt: (n) => console.log(`Tentative ${n}`),
  onReconnectFailed: () => toast.error('Connexion impossible'),
});

// Quand la connexion est perdue :
startReconnect(() => provider.connect());

// Quand la connexion est rétablie :
notifySuccess();
```

### `useNetworkStatus()`
Détecte les événements `online` / `offline` du navigateur.

```ts
const { isOnline } = useNetworkStatus();
```

### `fetchWithRetry(url, options)`
`fetch` avec retry automatique sur erreurs réseau, HTTP 5xx, 429 et 408. Backoff exponentiel + jitter.

```ts
const res = await fetchWithRetry('/api/projects', {
  retries: 3,
  retryDelay: 1000,
  timeout: 10000,
  onRetry: (attempt, err) => console.warn(`Retry ${attempt}:`, err.message),
});
```

---

## Tests

```bash
npm test                       # 36 tests unitaires (Vitest)
npm run test:watch             # Mode watch
npm run test:coverage          # Couverture v8
npm run test:e2e               # E2E Playwright (nécessite le serveur démarré)
npm run test:e2e:ui            # E2E avec interface graphique
```

**Couverture unitaire :**
- `components/ErrorBoundary` — rendu, fallback, retry
- `lib/fetchWithRetry` — succès, retry réseau, retry 500, exhaust, 401 non-retried, callback
- `context/AuthContext` — unauthenticated, login, logout
- `hooks/useDebounce` — délai, reset, useDebouncedCallback, useDebouncedState
- `hooks/useAutoReconnect` — start/stop/success, maxRetries, useNetworkStatus

**Tests E2E (`e2e/`) :**
- Login / Logout golden path
- Identifiants invalides → message d'erreur
- Route protégée → redirection login

---

## Déploiement

```bash
# Build
npm run build

# Déployer sur Vercel
vercel --prod
```

Variables d'environnement à configurer sur Vercel :

```
NEXT_PUBLIC_API_URL=https://xccm-2-api.vercel.app
NEXT_PUBLIC_HOCUSPOCUS_URL=wss://votre-synapse.up.railway.app
JWT_SECRET=<même valeur que le backend>
```

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (port 3000) |
| `npm run build` | Build production |
| `npm start` | Serveur production |
| `npm run lint` | ESLint |
| `npm test` | Tests Vitest |
| `npm run test:coverage` | Tests + couverture |
| `npm run test:e2e` | Tests Playwright |
