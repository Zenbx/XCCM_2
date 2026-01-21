"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, X, Link2, Copy, Check, Users, Mail, Share2, Trash2 } from 'lucide-react';
import { invitationService } from '@/services/invitationService';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from '../UI/GlassPanel';

interface ShareOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    projectName: string | null;
}

const ShareOverlay: React.FC<ShareOverlayProps> = ({ isOpen, onClose, projectName }) => {
    const [shareLink, setShareLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [invitations, setInvitations] = useState<any[]>([]);
    const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
    const [revokingId, setRevokingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && projectName) {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            setShareLink(`${baseUrl}/edit?projectName=${encodeURIComponent(projectName)}`);
            fetchInvitations();
        }
    }, [isOpen, projectName]);

    const fetchInvitations = async () => {
        if (!projectName) return;
        try {
            setIsLoadingInvitations(true);
            const data = await invitationService.getProjectInvitations(projectName);
            setInvitations(data);
        } catch (err) {
            console.error('Erreur fetch invitations:', err);
        } finally {
            setIsLoadingInvitations(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleInvite = async () => {
        if (!inviteEmail.trim() || !projectName) return;

        try {
            setIsSending(true);
            setError('');
            setSuccess('');

            await invitationService.sendInvitation(projectName, {
                guestEmail: inviteEmail,
            });

            setSuccess(`Invitation envoyée à ${inviteEmail}`);
            setInviteEmail('');
            fetchInvitations(); // Rafraîchir la liste

            // Fermer le message après 3 secondes
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Erreur envoi invitation:', err);
            setError(err.message || 'Erreur lors de l\'envoi de l\'invitation');
        } finally {
            setIsSending(false);
        }
    };

    const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

    const handleRevokeClick = (id: string) => {
        setConfirmRevokeId(id);
    };

    const confirmRevoke = async () => {
        if (!confirmRevokeId) return;
        const invitation = invitations.find(i => i.id === confirmRevokeId);
        if (!invitation) return;

        try {
            setRevokingId(confirmRevokeId);
            setError('');
            await invitationService.revokeInvitation(invitation.invitation_token);
            setSuccess('Invitation révoquée avec succès');
            // Force delay to ensure backend consistency if needed, but usually await is enough
            await fetchInvitations();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Erreur révocation:', err);
            setError(err.message || 'Erreur lors de la révocation');
        } finally {
            setRevokingId(null);
            setConfirmRevokeId(null);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <GlassPanel
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative max-w-2xl w-full shadow-2xl overflow-hidden rounded-3xl flex flex-col"
                        intensity="high"
                        blur="lg"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#99334C] to-[#C0392B] rounded-2xl flex items-center justify-center shadow-lg shadow-[#99334C]/20">
                                    <Share2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Partager le projet</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{projectName}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Messages d'erreur/succès */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-2xl p-4 flex items-start gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-red-900 dark:text-red-400">Erreur</p>
                                        <p className="text-sm text-red-700 dark:text-red-300/80">{error}</p>
                                    </div>
                                    <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}

                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-green-50/50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 rounded-2xl p-4 flex items-start gap-3"
                                >
                                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-green-900 dark:text-green-400">Succès</p>
                                        <p className="text-sm text-green-700 dark:text-green-300/80">{success}</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Section Inviter */}
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Inviter un collaborateur
                                </label>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !isSending) {
                                                    handleInvite();
                                                }
                                            }}
                                            placeholder="email@exemple.com"
                                            disabled={isSending}
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-[#99334C] focus:border-transparent outline-none transition-all disabled:opacity-50 font-medium"
                                        />
                                    </div>

                                    <button
                                        onClick={handleInvite}
                                        disabled={!inviteEmail.trim() || isSending}
                                        className="px-8 py-3.5 bg-[#99334C] text-white rounded-2xl hover:bg-[#7a283d] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-[#99334C]/20 flex items-center gap-2"
                                    >
                                        {isSending ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            'Inviter'
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Lien de partage */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Link2 className="w-4 h-4" />
                                    Lien de partage rapide
                                </label>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={shareLink}
                                            readOnly
                                            className="w-full px-4 py-3.5 pr-12 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-500 dark:text-gray-400 text-sm font-mono select-all"
                                        />
                                        <Link2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400/50" />
                                    </div>
                                    <button
                                        onClick={handleCopyLink}
                                        className="px-6 py-3.5 bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl hover:bg-white dark:hover:bg-gray-700 transition-all flex items-center gap-2 font-bold shadow-sm"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-5 h-5 text-green-600" />
                                                <span>Copié</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-5 h-5" />
                                                <span>Copier</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Liste des invités */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Collaborateurs actifs
                                    </label>
                                    {isLoadingInvitations && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                                </div>

                                <div className="grid gap-3">
                                    {invitations.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50/50 dark:bg-gray-900/20 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                                            <Users className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Aucun collaborateur invité</p>
                                        </div>
                                    ) : (
                                        invitations.map((inv) => (
                                            <div key={inv.id} className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 rounded-2xl transition-all hover:border-[#99334C]/30 group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-[#99334C]/10 dark:bg-[#99334C]/20 rounded-xl flex items-center justify-center text-sm font-black text-[#99334C] dark:text-[#ff4d7d]">
                                                        {inv.guest_email.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{inv.guest_email}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{inv.role?.toLowerCase() || 'Editor'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${inv.status === 'Accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        inv.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                                                        }`}>
                                                        {inv.status === 'Accepted' ? 'Actif' :
                                                            inv.status === 'Pending' ? 'En attente' :
                                                                inv.status}
                                                    </span>

                                                    {inv.status === 'Pending' && (
                                                        <button
                                                            onClick={() => handleRevokeClick(inv.id)}
                                                            disabled={revokingId === inv.id}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                            title="Révoquer l'invitation"
                                                        >
                                                            {revokingId === inv.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30 backdrop-blur-md">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl hover:bg-white dark:hover:bg-gray-700 transition-all font-bold shadow-sm"
                            >
                                Fermer
                            </button>
                        </div>
                        {/* Custom Confirmation Modal */}
                        {confirmRevokeId && (
                            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-3xl">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 border border-gray-100 dark:border-gray-700"
                                >
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Révoquer l'invitation ?</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                        L'utilisateur ne pourra plus accéder au projet. Vous pourrez le réinviter plus tard.
                                    </p>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => setConfirmRevokeId(null)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={confirmRevoke}
                                            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl text-sm font-bold shadow-lg shadow-red-600/20 transition-all"
                                        >
                                            Révoquer
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </GlassPanel>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ShareOverlay;