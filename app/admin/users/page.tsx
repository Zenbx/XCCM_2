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
            const usersList = Array.isArray(data) ? data : (data?.users || data || []);
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
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Users className="text-[#99334C]" size={32} /> Gestion des Utilisateurs
                    </h1>
                    <p className="text-gray-500 font-medium">{users.length} membres enregistrés sur la plateforme.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchUsers}
                        className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-600 transition-all shadow-sm"
                        title="Rafraîchir"
                    >
                        <RefreshCcw size={20} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher un membre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#99334C]/20 outline-none w-64 shadow-sm transition-all"
                        />
                    </div>
                </div>
            </header>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Utilisateur</th>
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Rôle</th>
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Activité</th>
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Rejoint le</th>
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.user_id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#99334C]/5 text-[#99334C] flex items-center justify-center font-bold uppercase transition-transform hover:scale-105">
                                                {user.firstname?.[0] || user.email[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{user.firstname} {user.lastname}</p>
                                                <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                    <Mail size={12} /> {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${user.role === 'admin'
                                            ? 'bg-purple-50 text-purple-600 border border-purple-100'
                                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-bold text-gray-700">{user.projectsCount} projets</p>
                                            <p className="text-xs text-gray-400 font-medium">{user.marketplaceCount} documents</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                            <Clock size={14} className="text-gray-400" />
                                            {new Date(user.created_at).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => toggleRole(user.user_id, user.role)}
                                                className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                                                title="Changer le rôle"
                                            >
                                                <UserCheck size={18} />
                                            </button>
                                            <button className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
