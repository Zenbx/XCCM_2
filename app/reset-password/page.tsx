"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    if (!token) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={32} />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-2">Lien invalide</h1>
                <p className="text-gray-500 font-medium mb-8">Ce lien de réinitialisation est manquant ou incorrect.</p>
                <Link href="/forgot-password" className="text-[#99334C] font-black hover:underline text-sm">Demander un nouveau lien</Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        if (password.length < 6) {
            toast.error("Le mot de passe doit faire au moins 6 caractères");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const result = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                toast.success("Mot de passe mis à jour !");
                setTimeout(() => router.push('/login'), 3000);
            } else {
                toast.error(result.message || "Le lien a peut-être expiré");
            }
        } catch (error) {
            console.error("Reset password error:", error);
            toast.error("Impossible de contacter le serveur");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Succès !</h1>
                <p className="text-gray-500 font-medium mb-8">Votre mot de passe a été réinitialisé avec succès.</p>
                <p className="text-sm text-gray-400">Redirection vers la page de connexion...</p>
            </div>
        );
    }

    return (
        <>
            <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-[#99334C]/5 text-[#99334C] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lock size={32} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Nouveau mot de passe</h1>
                <p className="text-gray-500 font-medium">Choisissez un mot de passe robuste.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-black text-gray-700 mb-2 px-1 uppercase tracking-wider">Mot de passe</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#99334C]/20 outline-none transition-all font-semibold"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-black text-gray-700 mb-2 px-1 uppercase tracking-wider">Confirmer</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#99334C]/20 outline-none transition-all font-semibold"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-[#99334C] text-white rounded-2xl font-black text-lg shadow-lg shadow-[#99334C]/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Réinitialiser le mot de passe'}
                </button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-10 border border-gray-100">
                <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#99334C]" /></div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
