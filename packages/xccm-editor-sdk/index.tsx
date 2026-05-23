import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface XccmSavePayload {
  /** Contenu HTML du granule actif au moment de la sauvegarde. */
  content: string;
  /** Métadonnées XCCM2 indiquant à quel granule (partie/chapitre/notion) la sauvegarde correspond. */
  context: {
    type: 'notion' | 'part' | string;
    partTitle?: string;
    chapterTitle?: string;
    paraName?: string;
    notionName?: string;
  } | null;
}

export interface XccmEditorProps {
  /** JWT fourni par l'application parente (ex: Moodle) pour authentifier l'utilisateur côté XCCM2. */
  token: string;
  /** URL de base de l'instance XCCM2 hébergée (ex: https://xccm2.mon-ecole.com). */
  baseUrl: string;
  /** Nom du projet XCCM2 à charger dans l'éditeur. */
  projectName: string;
  /** Déclenché à chaque sauvegarde (manuelle ou automatique). */
  onSave?: (payload: XccmSavePayload) => void;
  /** Déclenché quand l'éditeur est chargé et prêt à recevoir des interactions. */
  onReady?: () => void;
  /** Déclenché si l'éditeur rencontre une erreur critique (ex: token invalide). */
  onError?: (error: { code: string; message: string }) => void;
  width?: string | number;
  height?: string | number;
  /** Texte affiché pendant le chargement de l'éditeur. */
  loadingText?: string;
}

export const XccmEditor: React.FC<XccmEditorProps> = ({
  token,
  baseUrl,
  projectName,
  onSave,
  onReady,
  onError,
  width = '100%',
  height = '800px',
  loadingText = "Chargement de l'éditeur XCCM2…",
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Derive the allowed origin once — avoids re-creating the listener on every render.
  const allowedOrigin = new URL(baseUrl).origin;

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Security: reject messages from unexpected origins.
      if (event.origin !== allowedOrigin) return;

      switch (event.data?.type) {
        case 'XCCM_EDITOR_READY':
          setIsReady(true);
          onReady?.();
          break;

        case 'XCCM_CONTENT_SAVED':
          onSave?.(event.data.payload as XccmSavePayload);
          break;

        case 'XCCM_ERROR':
          onError?.(event.data.payload as { code: string; message: string });
          break;

        default:
          break;
      }
    },
    [allowedOrigin, onSave, onReady, onError],
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const embedUrl =
    `${baseUrl}/embed/editor` +
    `?projectName=${encodeURIComponent(projectName)}` +
    `&token=${encodeURIComponent(token)}`;

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#f8fafc',
      }}
    >
      {!isReady && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#64748b', fontFamily: 'sans-serif', fontSize: '14px' }}>
            {loadingText}
          </span>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        style={{ width: '100%', height: '100%', border: 'none', display: isReady ? 'block' : 'none' }}
        title="XCCM2 Content Composer"
        allow="clipboard-read; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
};
