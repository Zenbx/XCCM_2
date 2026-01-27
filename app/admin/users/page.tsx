"use client";

import React, { useEffect, useState } from 'react';
import {
    Users,
    Search,
    RefreshCcw,
    Loader2,
    Shield,
    Trash2,
    UserPlus,
    Clock,
    Mail,
    UserCheck
} from 'lucide-react';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function UserManagement() {
    const { isAdmin, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!isAdmin) {
                toast.error("Accès refusé");
                router.push('/edit-home');
                return;
            }
            fetchUsers();
        }
    }, [authLoading, isAdmin, router]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await authService.getAllUsers();
            // Handle both { users: [...] } and direct [...] responses
            const usersList = Array.isArray(data) ? data : ((data as any)?.users || data || []);
            setUsers(usersList);
        } catch (error) {
            console.error('Erreur fetch users:', error);
            toast.error("Erreur lors de la récupération des utilisateurs");
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            await authService.updateUserRole(userId, newRole);
            toast.success("Rôle mis à jour");
            fetchUsers();
        } catch (error) {
            toast.error("Échec de la mise à jour");
        }
    };

    const filteredUsers = users.filter(user =>
        user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="animate-spin text-[#99334C]" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Users className="text-[#99334C]" size={26} />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Comptes Utilisateurs</span>
                    </h1>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#99334C] rounded-full animate-pulse" />
                        Système de Management d'Accès • {users.length} membres
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#99334C] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Email, Nom ou ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#99334C]/5 outline-none w-72 text-sm shadow-sm transition-all text-gray-600 font-medium hover:border-gray-200"
                        />
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 text-gray-400 hover:text-[#99334C] transition-all shadow-sm hover:shadow-md active:scale-95"
                        title="Rafraîchir la base"
                    >
                        <RefreshCcw size={18} />
                    </button>
                </div>
            </header>

            {/* Table Section - Neo-Glassmorphism subtle feel */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-50/20 border-b border-gray-50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Membre</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Habilitation</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Métriques Alpha</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Adhésion</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Contrôle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-gray-600">
                            {filteredUsers.map((user) => (
                                <tr key={user.user_id} className="hover:bg-gray-50/50 transition-all duration-300 group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 flex items-center justify-center font-black text-gray-400 text-xs shadow-inner group-hover:from-[#99334C]/5 group-hover:text-[#99334C] group-hover:border-[#99334C]/10 transition-all duration-500">
                                                {user.firstname?.[0] || user.email[0]}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <p className="font-black text-gray-900 text-sm tracking-tight leading-tight group-hover:text-[#99334C] transition-colors">
                                                    {user.firstname} {user.lastname}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold truncate lowercase mt-0.5 tracking-tight">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-black text-[9px] uppercase tracking-[0.1em] shadow-sm ${user.role === 'admin'
                                            ? 'bg-purple-50 text-purple-600 border-purple-100 shadow-purple-100/50'
                                            : 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/50'
                                            }`}>
                                            <Shield size={10} className={user.role === 'admin' ? 'animate-pulse' : ''} />
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-xs font-black text-gray-600 tracking-tight">
                                                <span className="text-[#99334C]">{user.projectsCount || 0}</span> Espace travail
                                            </p>
                                            <div className="flex gap-1.5 items-center">
                                                <div className="h-1 w-8 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{ width: `${Math.min((user.marketplaceCount || 0) * 10, 100)}%` }} />
                                                </div>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{user.marketplaceCount || 0} Publiés</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-xs font-bold text-gray-500 flex items-center gap-2.5">
                                            <Clock size={14} className="text-gray-300 group-hover:text-[#99334C]/40 transition-colors" />
                                            <span className="group-hover:text-gray-900 transition-colors">
                                                {new Date(user.created_at).toLocaleDateString('fr-FR', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </p>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button
                                                onClick={() => toggleRole(user.user_id, user.role)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border ${user.role === 'admin'
                                                    ? 'bg-white text-gray-500 hover:text-blue-600 border-gray-100 hover:border-blue-100 hover:shadow-blue-600/5'
                                                    : 'bg-white text-gray-500 hover:text-purple-600 border-gray-100 hover:border-purple-100 hover:shadow-purple-600/5'
                                                    }`}
                                                title={user.role === 'admin' ? "Rétrograder en Utilisateur" : "Promouvoir en Admin"}
                                            >
                                                <UserCheck size={13} />
                                                <span>{user.role === 'admin' ? "Rétrograder" : "Promouvoir"}</span>
                                            </button>
                                            <button
                                                className="p-2.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all hover:scale-110 active:scale-90"
                                                onClick={() => toast("Sécurité : Suppression bientôt activée.")}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="px-8 py-32 flex flex-col items-center justify-center text-center gap-4">
                        <Users size={64} className="text-gray-100" />
                        <div>
                            <p className="text-sm font-black text-gray-400">Aucune correspondance</p>
                            <p className="text-[11px] text-gray-300 font-bold uppercase tracking-widest mt-1">Vérifiez les critères de recherche</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
