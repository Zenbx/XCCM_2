"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCCM2Editor } from '@/app/edit/page';
import EditorSkeletonView from '@/app/edit/components/EditorSkeletonView';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

export default function EmbeddedEditorPage() {
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  // Don't mount the editor until the token is injected AND AuthContext has
  // re-fetched the user. Without this gate, XCCM2Editor sees authUser=null
  // because AuthContext initialised before the URL token was available.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');

    const init = async () => {
      if (token) {
        // 1. Write to cookie + localStorage so getAuthToken() finds it
        authService.setAuthToken(token);
        // 2. Force AuthContext to re-fetch /api/auth/me with the new token.
        //    Only mount the editor once we know the user is authenticated.
        try {
          await refreshUser();
        } catch {
          // refreshUser failed (bad token) — still set ready so the editor
          // can show its own unauthenticated state rather than hanging.
        }
      }
      setReady(true);
      window.parent?.postMessage({ type: 'XCCM_EDITOR_READY' }, '*');
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
          <XCCM2Editor isEmbedded={true} />
        </Suspense>
      ) : (
        <EditorSkeletonView />
      )}
    </div>
  );
}
