"use client";

import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCCM2Editor } from '@/app/edit/page';
import EditorSkeletonView from '@/app/edit/components/EditorSkeletonView';
import { authService } from '@/services/authService';

export default function EmbeddedEditorPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Inject token if Moodle passes it via URL parameters
    const token = searchParams.get('token');
    if (token) {
      authService.setAuthToken(token);
    }

    // Notify parent frame that the editor is ready
    window.parent?.postMessage({ type: 'XCCM_EDITOR_READY' }, '*');
    
    // Listen for incoming messages from parent
    const handleMessage = (event: MessageEvent) => {
      // Security: Add origin checking in production
      if (event.data?.type === 'XCCM_LOAD_CONTENT') {
        console.log("XCCM Embedded received load content command", event.data);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [searchParams]);

  return (
    <div className="w-full h-screen bg-white m-0 p-0 overflow-hidden">
      <Suspense fallback={<EditorSkeletonView />}>
        <XCCM2Editor isEmbedded={true} />
      </Suspense>
    </div>
  );
}
