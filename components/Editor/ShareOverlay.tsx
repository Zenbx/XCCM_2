"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Loader2, AlertCircle, Save, X, Eye, Share2, Link2, Copy, Check, Users, Mail, ChevronDown, Trash2, Crown } from 'lucide-react';

// Composant ShareOverlay
const ShareOverlay = ({ isOpen, onClose, projectName }: { isOpen: boolean; onClose: () => void; projectName: string }) => {
    const [shareLink, setShareLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [permission, setPermission] = useState<'view' | 'edit'>('view');
    const [collaborators, setCollaborators] = useState([
        { id: 1, name: 'Marie Dubois', email: 'marie@xccm2.com', role: 'owner', avatar: null },
        { id: 2, name: 'Jean Martin', email: 'jean@xccm2.com', role: 'edit', avatar: null },
        { id: 3, name: 'Sophie Laurent', email: 'sophie@xccm2.com', role: 'view', avatar: null }
    ]);
    const [linkAccess, setLinkAccess] = useState<'restricted' | 'view' | 'edit'>('restricted');

    useEffect(() => {
        if (isOpen && projectName) {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        setShareLink(`${baseUrl}/collaborate/${encodeURIComponent(projectName)}`);
        }
    }, [isOpen, projectName]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleInvite = () => {
        if (!inviteEmail.trim()) return;
        
        const newCollaborator = {
        id: Date.now(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: permission,
        avatar: null
        };
        
        setCollaborators([...collaborators, newCollaborator]);
        setInviteEmail('');
    };

    const handleRemoveCollaborator = (id: number) => {
        setCollaborators(collaborators.filter(c => c.id !== id));
    };

    const handleChangeRole = (id: number, newRole: 'view' | 'edit') => {
        setCollaborators(collaborators.map(c => 
        c.id === id ? { ...c, role: newRole } : c
        ));
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
            {/* Section Inviter */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                Inviter des collaborateurs
                </label>
                <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
                    placeholder="email@exemple.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                    />
                </div>
                
                <div className="relative">
                    <select
                    value={permission}
                    onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
                    className="appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] bg-white cursor-pointer"
                    >
                    <option value="view">Lecture</option>
                    <option value="edit">Édition</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <button
                    onClick={handleInvite}
                    disabled={!inviteEmail.trim()}
                    className="px-6 py-3 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    Inviter
                </button>
                </div>
            </div>

            {/* Liste des collaborateurs */}
            <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Collaborateurs ({collaborators.length})
                </h4>
                <div className="space-y-2">
                {collaborators.map((collab) => (
                    <div
                    key={collab.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-[#99334C]/30 hover:bg-gray-50 transition-all group"
                    >
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#99334C]/20 to-[#99334C]/40 rounded-full flex items-center justify-center">
                        <span className="text-[#99334C] font-bold text-sm">
                            {collab.name.charAt(0).toUpperCase()}
                        </span>
                        </div>
                        <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 truncate">{collab.name}</p>
                            {collab.role === 'owner' && (
                            <Crown className="w-4 h-4 text-amber-500" />
                            )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{collab.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {collab.role === 'owner' ? (
                        <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
                            Propriétaire
                        </span>
                        ) : (
                        <>
                            <div className="relative">
                            <select
                                value={collab.role}
                                onChange={(e) => handleChangeRole(collab.id, e.target.value as 'view' | 'edit')}
                                className="appearance-none px-3 py-1.5 pr-8 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 text-sm font-medium cursor-pointer hover:border-[#99334C]/30 focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] bg-white"
                            >
                                <option value="view">Lecture</option>
                                <option value="edit">Édition</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            </div>
                            <button
                            onClick={() => handleRemoveCollaborator(collab.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                            <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                        )}
                    </div>
                    </div>
                ))}
                </div>
            </div>

            {/* Lien de partage */}
            <div>
                <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Lien de partage
                </label>
                <div className="relative">
                    <select
                    value={linkAccess}
                    onChange={(e) => setLinkAccess(e.target.value as any)}
                    className="appearance-none px-3 py-1.5 pr-8 border border-gray-200 rounded-lg text-sm font-medium cursor-pointer text-gray-700 placeholder-gray-400 hover:border-[#99334C]/30 focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] bg-white"
                    >
                    <option value="restricted">Restreint</option>
                    <option value="view">Lecture publique</option>
                    <option value="edit">Édition publique</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
                </div>

                {linkAccess !== 'restricted' ? (
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                    <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 bg-gray-50 text-gray-700 text-sm font-mono"
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
                ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-600">
                    Seules les personnes invitées peuvent accéder à ce projet
                    </p>
                </div>
                )}
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
                    Les collaborateurs avec accès en <strong>Édition</strong> peuvent modifier le contenu du projet.
                    Ceux avec accès en <strong>Lecture</strong> peuvent uniquement consulter.
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