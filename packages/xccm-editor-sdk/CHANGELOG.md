# Changelog — @xccm/editor-sdk

Toutes les modifications notables de ce package sont documentées ici.
Format : [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
Versioning : [Semantic Versioning](https://semver.org/lang/fr/)

---

## [1.0.0] — 2026-05-22

### Ajouté
- Composant `XccmEditor` — wrapper iframe React pour l'éditeur XCCM2
- Protocole `postMessage` sécurisé : `XCCM_EDITOR_READY`, `XCCM_CONTENT_SAVED`, `XCCM_ERROR`
- Callback `onSave(payload: XccmSavePayload)` — déclenché à chaque sauvegarde (manuelle ou auto-save)
- Callback `onReady()` — déclenché quand l'éditeur est initialisé et prêt
- Callback `onError({ code, message })` — déclenché en cas d'erreur critique côté éditeur
- Prop `loadingText` — personnalisation du message de chargement
- Filtre d'origine strict (`event.origin === allowedOrigin`) — sécurité postMessage
- Attribut `sandbox` sur l'iframe — isolation des permissions
- `useCallback` sur le listener postMessage — optimisation des re-renders
- Affichage conditionnel de l'iframe (`display: none` pendant le chargement)
- Type exporté `XccmSavePayload` — contrat de données typé pour `onSave`
- `tsconfig.json` — configuration de build TypeScript
- `package.json` complet — scripts, `files`, `exports` (ESM + CJS), `engines`
- README complet avec exemples, tableau des props, protocole postMessage, sécurité

### Corrigé
- `postMessage('*')` remplacé par un `targetOrigin` dérivé de `document.referrer` — élimination de la faille XSS
- Sandbox `/embed/editor` : `baseUrl` dynamique via `NEXT_PUBLIC_XCCM_BASE_URL` ou `window.location.origin`

---

## [0.1.0] — 2026-03-01 *(initial — non publié)*

- Prototype initial du composant `XccmEditor` (iframe + postMessage basique)
- Page `/embed/editor` fonctionnelle avec injection de token
- Page `/sandbox/plugin` de démonstration style Moodle
