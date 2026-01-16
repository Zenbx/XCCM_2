"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, X, Link2, Copy, Check, Users, Mail, Share2, Trash2, RefreshCw } from 'lucide-react';
import { invitationService } from '@/services/invitationService';

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

    const handleRevoke = async (token: string, id: string) => {
        if (!window.confirm('Êtes-vous sûr de vouloir révoquer cette invitation ?')) return;

        try {
            setRevokingId(id);
            setError('');
            await invitationService.revokeInvitation(token);
            setSuccess('Invitation révoquée avec succès');
            fetchInvitations();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Erreur révocation:', err);
            setError(err.message || 'Erreur lors de la révocation');
        } finally {
            setRevokingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-in slide-in-from-bottom">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#99334C] to-[#7a283d] rounded-xl flex items-center justify-center">
                            <Share2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Partager le projet</h3>
                            <p className="text-sm text-gray-600">{projectName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Messages d'erreur/succès */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-900">Erreur</p>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-900">Succès</p>
                                <p className="text-sm text-green-700">{success}</p>
                            </div>
                        </div>
                    )}

                    {/* Section Inviter */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Inviter un collaborateur
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                            L'invité recevra un email avec un lien d'invitation. Il pourra contribuer une fois l'invitation acceptée.
                        </p>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <button
                                onClick={handleInvite}
                                disabled={!inviteEmail.trim() || isSending}
                                className="px-6 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Envoi...
                                    </>
                                ) : (
                                    'Inviter'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Lien de partage */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Link2 className="w-4 h-4" />
                                Lien de partage
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={shareLink}
                                    readOnly
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-gray-700 bg-gray-50 text-sm font-mono select-all"
                                />
                                <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                            <button
                                onClick={handleCopyLink}
                                className="px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 font-medium"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-5 h-5 text-green-600" />
                                        Copié !
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-5 h-5" />
                                        Copier
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Liste des invités */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Liste des collaborateurs
                            </label>
                            {isLoadingInvitations && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                        </div>

                        <div className="space-y-3">
                            {invitations.length === 0 ? (
                                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-sm text-gray-500">Aucun collaborateur invité</p>
                                </div>
                            ) : (
                                invitations.map((inv) => (
                                    <div key={inv.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 transition-all hover:bg-white hover:shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600">
                                                {inv.guest_email.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{inv.guest_email}</p>
                                                <p className="text-xs text-gray-500 capitalize">{inv.role?.toLowerCase() || 'Editor'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${inv.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                                                inv.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {inv.status === 'Accepted' ? 'Accepté' :
                                                    inv.status === 'Pending' ? 'En attente' :
                                                        inv.status}
                                            </span>

                                            {inv.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleRevoke(inv.invitation_token, inv.id)}
                                                    disabled={revokingId === inv.id}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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

                    {/* Info supplémentaire */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900 mb-1">À propos du partage</p>
                                <p className="text-sm text-blue-700">
                                    Le collaborateur invité recevra un email avec un lien d'invitation.
                                    Il pourra <strong>accepter</strong> ou <strong>décliner</strong> l'invitation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-white transition-all font-medium"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareOverlay;