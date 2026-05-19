"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { setCookie } from '@/lib/cookies';
import toast from 'react-hot-toast';

const USER_STORAGE_KEY = 'xccm2_user';
const TOKEN_STORAGE_KEY = 'xccm2_auth_token';

const AuthCallbackContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshUser } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const isRegister = searchParams.get('mode') === 'register';

    const hasFetched = React.useRef(false);

    useEffect(() => {
        const fetchToken = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;

            try {
                // 1. Token from Bridge (URL param) — main Google/Microsoft OAuth path
                const bridgeToken = searchParams.get('token');

                if (bridgeToken) {
                    // Persist the token — this is all that's needed for auth to work
                    setCookie('auth_token', bridgeToken);
                    localStorage.setItem(TOKEN_STORAGE_KEY, bridgeToken);

                    // Fire context refresh in the background — do NOT await it.
                    // If /api/auth/me is slow or fails here, AuthContext will retry
                    // on the destination page using the token we just saved.
                    refreshUser().catch(() => {});

                    toast.success(isRegister ? 'Inscription réussie ! Bienvenue !' : 'Connexion réussie !');
                    router.push('/edit-home');
                    return;
                }

                // 2. Fallback: session-token endpoint (legacy flow)
                const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();
                const response = await fetch(`${apiBase}/api/auth/session-token`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error("Impossible de récupérer la session SSO");
                }

                const result = await response.json();

                if (result.success && result.data?.token) {
                    setCookie('auth_token', result.data.token);
                    localStorage.setItem(TOKEN_STORAGE_KEY, result.data.token);
                    if (result.data.user) {
                        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.data.user));
                    }

                    // Same pattern: non-blocking refresh, redirect immediately
                    refreshUser().catch(() => {});

                    toast.success(isRegister ? 'Inscription réussie ! Bienvenue !' : 'Connexion réussie !');
                    router.push('/edit-home');
                } else {
                    throw new Error(result.message || "Token manquant dans la réponse du serveur");
                }
            } catch (err: any) {
                // Only real errors reach here now (missing token, network failure
                // before token is saved, or session-token endpoint failure).
                console.error("[Callback] SSO error:", err);
                setError(err.message || "Une erreur est survenue lors de la connexion SSO. Vérifiez que votre compte est bien créé.");
                toast.error("Échec de la connexion SSO");
                setTimeout(() => { router.push('/login'); }, 3000);
            }
        };

        fetchToken();
    }, [router, searchParams, refreshUser, isRegister]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 text-center">
                {!error ? (
                    <>
                        <Loader2 className="w-12 h-12 text-[#99334C] animate-spin mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {isRegister ? "Création de votre compte" : "Connexion en cours"}
                        </h1>
                        <p className="text-gray-600">
                            {isRegister ? "Veuillez patienter pendant que nous créons votre profil..." : "Veuillez patienter pendant que nous préparons votre espace..."}
                        </p>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-red-600 text-2xl">!</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de connexion</h1>
                        <p className="text-red-500 mb-6">{error}</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="px-6 py-2 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] transition-all"
                        >
                            Retour à la page de connexion
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const AuthCallbackPage = () => {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#99334C] animate-spin" /></div>}>
            <AuthCallbackContent />
        </Suspense>
    );
};

export default AuthCallbackPage;
