"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCCM2Editor } from '@/app/edit/XCCM2Editor';
import EditorSkeletonView from '@/app/edit/components/EditorSkeletonView';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function EmbeddedEditorPage() {
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const { setTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const [guestMode, setGuestMode] = useState(false);

  // Moodle / iframe : toujours le thème clair (ignore préférence système / utilisateur)
  useEffect(() => {
    setTheme('light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.documentElement.style.colorScheme = 'light';
  }, [setTheme]);

  useEffect(() => {
    const token = searchParams.get('token');

    const init = async () => {
      if (token) {
        authService.setAuthToken(token);
        try {
          await refreshUser();
        } catch {
          // Bad token — fall through to guest mode
          setGuestMode(true);
        }
      } else {
        // No token provided: render editor in guest/demo mode without auth
        setGuestMode(true);
      }
      setReady(true);
      const targetOrigin = document.referrer ? new URL(document.referrer).origin : '*';
      window.parent?.postMessage({ type: 'XCCM_EDITOR_READY' }, targetOrigin);
    };

    init();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'XCCM_LOAD_CONTENT') {
        console.log('[XCCM Embed] load content command', event.data);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [searchParams, refreshUser]);

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
