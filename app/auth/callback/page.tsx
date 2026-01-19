"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { setCookie } from '@/lib/cookies';
import toast from 'react-hot-toast';

const USER_STORAGE_KEY = 'xccm2_user';
const TOKEN_STORAGE_KEY = 'xccm2_auth_token';

const AuthCallbackPage = () => {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

                // Appeler la route bridge du backend pour récupérer le JWT
                const response = await fetch(`${apiBase}/api/auth/session-token`, {
                    method: 'GET',
                    // Inclure les cookies car NextAuth utilise des cookies de session sur le domaine de l'API
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error("Impossible de récupérer la session SSO");
                }

                const result = await response.json();

                if (result.success && result.data.token) {
                    // Stocker le token dans cookie ET localStorage pour persistance
                    setCookie('auth_token', result.data.token);
                    localStorage.setItem(TOKEN_STORAGE_KEY, result.data.token);
                    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.data.user));

                    toast.success('Connexion réussie !');
                    router.push('/edit-home');
                } else {
                    throw new Error("Token manquant dans la réponse");
                }
            } catch (err: any) {
                console.error("Erreur callback SSO:", err);
                setError(err.message || "Une erreur est survenue lors de la connexion SSO");
                toast.error("Échec de la connexion SSO");

                // Rediriger vers le login après un court délai
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        };

        fetchToken();
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 text-center">
                {!error ? (
                    <>
                        <Loader2 className="w-12 h-12 text-[#99334C] animate-spin mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Finalisation de la connexion</h1>
                        <p className="text-gray-600">Veuillez patienter pendant que nous préparons votre espace...</p>
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

export default AuthCallbackPage;
