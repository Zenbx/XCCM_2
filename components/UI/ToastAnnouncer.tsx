'use client';

import { useEffect, useRef } from 'react';
import { useToasterStore } from 'react-hot-toast';

export function ToastAnnouncer() {
    const { toasts } = useToasterStore();
    const politeRef = useRef<HTMLDivElement>(null);
    const assertiveRef = useRef<HTMLDivElement>(null);
    const seenIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        toasts.forEach(toast => {
            if (seenIds.current.has(toast.id)) return;
            seenIds.current.add(toast.id);

            const message = typeof toast.message === 'string' ? toast.message : null;
            if (!message) return;

            const target = toast.type === 'error' ? assertiveRef : politeRef;
            if (!target.current) return;

            target.current.textContent = '';
            // Brief gap forces screen readers to re-announce even identical text
            setTimeout(() => {
                if (target.current) target.current.textContent = message;
            }, 50);
        });
    }, [toasts]);

    return (
        <>
            <div ref={politeRef} role="status" aria-live="polite" aria-atomic="true" className="sr-only" />
            <div ref={assertiveRef} role="alert" aria-live="assertive" aria-atomic="true" className="sr-only" />
        </>
    );
}
