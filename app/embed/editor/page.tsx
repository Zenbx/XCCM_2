"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCCM2Editor } from '@/app/edit/XCCM2Editor';
import EditorSkeletonView from '@/app/edit/components/EditorSkeletonView';
import { authService } from '@/services/authService';
import { projectService } from '@/services/projectService';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function EmbeddedEditorPage() {
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const { setTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Moodle / iframe : toujours le thème clair
  useEffect(() => {
    setTheme('light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.documentElement.style.colorScheme = 'light';
  }, [setTheme]);

  // Init unique par montage / clic Réessayer (pas de boucle sur refreshUser)
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setReady(false);
      setInitError(null);
      setGuestMode(false);

      const token = searchParams.get('token');
      const projectName = searchParams.get('projectName')?.trim() || '';

      if (!token) {
        if (!cancelled) {
          setGuestMode(true);
          setReady(true);
        }
        return;
      }

      authService.setAuthToken(token);

      try {
        await refreshUser();
      } catch {
        if (!cancelled) {
          setInitError('Session invalide. Rechargez la page depuis Moodle.');
        }
        return;
      }

      // Créer le projet Moodle s'il n'existe pas encore (avant d'ouvrir l'éditeur)
      if (projectName) {
        try {
          await projectService.ensureProjectExists(projectName);
        } catch (err: any) {
          if (cancelled) return;
          const msg = String(err?.message || '');
          if (msg.includes('Token invalide') || msg.includes('Non authentifié')) {
            setInitError('Session invalide. Rechargez la page depuis Moodle.');
          } else {
            setInitError(msg || 'Impossible de préparer le projet pour Moodle.');
          }
          return;
        }
      }

      if (cancelled) return;

      setReady(true);
      const targetOrigin = document.referrer ? new URL(document.referrer).origin : '*';
      window.parent?.postMessage({ type: 'XCCM_EDITOR_READY' }, targetOrigin);
    };

    void run();
    return () => {
      cancelled = true;
    };
    // retryKey force un nouvel essai ; searchParams lus au moment du run
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'XCCM_LOAD_CONTENT') {
        console.log('[XCCM Embed] load content command', event.data);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (initError) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50 m-0 p-0">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{initError}</p>
          <button
            type="button"
            onClick={() => setRetryKey((k) => k + 1)}
            className="px-6 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] transition-all"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white m-0 p-0 overflow-hidden">
      {ready ? (
        <Suspense fallback={<EditorSkeletonView />}>
          <XCCM2Editor isEmbedded={true} guestMode={guestMode} />
        </Suspense>
      ) : (
        <EditorSkeletonView />
      )}
    </div>
  );
}
