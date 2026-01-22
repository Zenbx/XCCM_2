"use client";

import React, { useState } from 'react';
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [simulatedToken, setSimulatedToken] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (response.ok) {
                setIsSent(true);
                // On récupère le token simulé pour faciliter la démo/test
                if (result.data?.resetToken) {
                    setSimulatedToken(result.data.resetToken);
                }
                toast.success("Demande envoyée !");
            } else {
                toast.error(result.message || "Une erreur est survenue");
            }
        } catch (error) {
            console.error("Forgot password error:", error);
            toast.error("Impossible de contacter le serveur");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-10 border border-gray-100">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#99334C] transition-colors mb-8"
                >
                    <ArrowLeft size={16} /> Retour à la connexion
                </Link>

                {!isSent ? (
                    <>
                        <div className="mb-10 text-center">
                            <div className="w-16 h-16 bg-[#99334C]/5 text-[#99334C] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Mail size={32} />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">Mot de passe oublié ?</h1>
                            <p className="text-gray-500 font-medium">Entrez votre email pour recevoir les instructions de récupération.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-gray-700 mb-2 px-1 uppercase tracking-wider">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="votre@email.com"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#99334C]/20 outline-none transition-all placeholder-gray-400 font-semibold"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-[#99334C] text-white rounded-2xl font-black text-lg shadow-lg shadow-[#99334C]/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Envoyer les instructions'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={32} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-4">Email Envoyé !</h1>
                        <p className="text-gray-500 font-medium mb-8">
                            Si un compte existe pour <strong>{email}</strong>, vous recevrez bientôt un lien de réinitialisation.
                        </p>

                        {simulatedToken && (
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8 text-left">
                                <p className="text-xs font-black text-amber-700 uppercase mb-2 tracking-widest">Mode Démo : Token simulé</p>
                                <code className="block bg-white p-3 rounded-lg border border-amber-200 text-[#99334C] font-mono break-all text-sm mb-4">
                                    {simulatedToken}
                                </code>
                                <Link
                                    href={`/reset-password?token=${simulatedToken}`}
                                    className="block w-full text-center py-3 bg-[#99334C] text-white rounded-xl font-bold text-sm shadow-md"
                                >
                                    Aller à la page de réinitialisation
                                </Link>
                            </div>
                        )}

                        <Link
                            href="/login"
                            className="text-[#99334C] font-black hover:underline"
                        >
                            Retourner au login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
