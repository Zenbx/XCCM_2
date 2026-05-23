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
  const [ready, setReady] = useState(false);
  const [guestMode, setGuestMode] = useState(false);

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
