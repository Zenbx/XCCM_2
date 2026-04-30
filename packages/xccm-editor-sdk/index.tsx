import React, { useEffect, useRef, useState } from 'react';

export interface XccmEditorProps {
  /**
   * Clé ou token d'autorisation JWT fourni par Moodle.
   */
  token: string;
  /**
   * L'URL de base où est hébergé l'éditeur XCCM2 (ex: https://xccm2.my-school.com)
   */
  baseUrl: string;
  /**
   * L'identifiant du projet cible côté XCCM2.
   */
  projectName: string;
  /**
   * Callback déclenché chaque fois que l'auteur sauvegarde le contenu.
   */
  onSave?: (data: { context: any, content: string }) => void;
  width?: string | number;
  height?: string | number;
}

export const XccmEditor: React.FC<XccmEditorProps> = ({
  token,
  baseUrl,
  projectName,
  onSave,
  width = '100%',
  height = '800px',
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Pour des raisons de sécurité, nous vérifions l'origine en production
      if (event.origin !== new URL(baseUrl).origin) return;

      if (event.data?.type === 'XCCM_EDITOR_READY') {
        setIsReady(true);
      } else if (event.data?.type === 'XCCM_CONTENT_SAVED') {
        if (onSave) onSave(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [baseUrl, onSave]);

  // Construit l'URL avec les paramètres nécessaires pour le mode Embedded
  const embedUrl = `${baseUrl}/embed/editor?projectName=${encodeURIComponent(projectName)}&token=${encodeURIComponent(token)}`;

  return (
    <div style={{ width, height, position: 'relative', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
      {!isReady && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
          <span style={{ color: '#64748b', fontFamily: 'sans-serif' }}>Chargement de l'éditeur XCCM2...</span>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="XCCM2 Content Composer"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
};
