"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Database, Layout, Search, Trash2, Edit2, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { user, isAdmin, isLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [globalStats, setGlobalStats] = useState<any>(null);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isLoading) {
            if (!isAdmin) {
                toast.error("Accès refusé");
                router.push('/edit-home');
                return;
            }
            fetchAdminStats();
        }
    }, [isLoading, isAdmin, router]);

    const fetchAdminStats = async () => {
        try {
            const token = authService.getAuthToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Erreur chargement stats');
            }

            const result = await response.json();
            if (result.success) {
                setUsers(result.data.users || []);
                setGlobalStats(result.data.global || {});
            }
        } catch (error) {
            console.error('Erreur admin stats:', error);
            toast.error("Erreur chargement statistiques");
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return;
        try {
            await authService.deleteUser(userId);
            setUsers(users.filter(u => u.user_id !== userId));
            toast.success("Utilisateur supprimé");
        } catch (error) {
            toast.error("Erreur suppression");
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await authService.updateUserRole(userId, newRole);
            setUsers(users.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
            toast.success("Rôle mis à jour");
        } catch (error) {
            toast.error("Erreur mise à jour rôle");
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.firstname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading || loadingUsers) {
        return <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
            <Loader2 className="animate-spin text-[#99334C]" size={40} />
        </div>;
    }

    return (
        <div className="min-h-screen bg-[#FDFCFB] p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
                            <Shield className="text-[#99334C]" size={36} /> Dashboard Admin
                        </h1>
                        <p className="text-gray-500">Gérez les utilisateurs et le contenu de la plateforme.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold">Utilisateurs</p>
                            <p className="text-2xl font-black text-gray-900">{globalStats?.totalUsers || users.length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-4 bg-green-50 text-green-600 rounded-xl">
                            <Layout size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold">Projets Totaux</p>
                            <p className="text-2xl font-black text-gray-900">
                                {globalStats?.totalProjects || users.reduce((acc, u) => acc + (u.projectsCount || 0), 0)}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                            <Database size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold">Documents Publiés</p>
                            <p className="text-2xl font-black text-gray-900">
                                {globalStats?.totalDocuments || users.reduce((acc, u) => acc + (u.marketplaceCount || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Users size={20} className="text-[#99334C]" /> Liste des Utilisateurs
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#99334C] text-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Utilisateur</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Rôle</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Projets</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Marketplace</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((u) => (
                                    <motion.tr
                                        key={u.user_id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#99334C]/10 flex items-center justify-center text-[#99334C] font-bold">
                                                    {u.firstname[0]}{u.lastname[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{u.firstname} {u.lastname}</p>
                                                    <p className="text-xs text-gray-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={u.role || 'user'}
                                                onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold border-none outline-none cursor-pointer ${(u.role === 'admin' || !u.role) // Legacy admin
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-gray-600">
                                            {u.projectsCount}
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-gray-600">
                                            {u.marketplaceCount}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(u.user_id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Supprimer l'utilisateur"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
