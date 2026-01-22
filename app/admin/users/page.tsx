"use client";

import React, { useEffect, useState } from 'react';
import {
    Users,
    Search,
    Filter,
    MoreHorizontal,
    Mail,
    Shield,
    UserPlus,
    ArrowUpDown,
    CheckCircle2,
    XCircle,
    Clock,
    Edit2,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await authService.getAllUsers();
            setUsers(data || []);
        } catch (error) {
            console.error('Erreur fetch users:', error);
            toast.error("Erreur lors de la récupération des utilisateurs");
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#99334C] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Utilisateurs</h1>
                    <p className="text-gray-500 mt-1 font-semibold">Gérez les membres de la plateforme et leurs accès.</p>
                </div>
                <button className="bg-[#99334C] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 shadow-lg shadow-[#99334C]/20 transition-all">
                    <UserPlus className="w-5 h-5" />
                    Nouvel Utilisateur
                </button>
            </div>

            {/* Stats Summary Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Total Membres', val: users.length.toString(), icon: Users, color: 'text-gray-900' },
                    { label: 'Admins', val: users.filter(u => u.role === 'admin').length.toString(), icon: Shield, color: 'text-[#99334C]' },
                    { label: 'Utilisateurs', val: users.filter(u => u.role !== 'admin').length.toString(), icon: Users, color: 'text-blue-600' },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                            <s.icon className={`w-6 h-6 ${s.color}`} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">{s.label}</p>
                            <h4 className="text-2xl font-black text-gray-900">{s.val}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                {/* Filter Bar */}
                <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#99334C]/20 outline-none transition-all placeholder-gray-400 font-semibold"
                        />
                    </div>
                </div>

                {/* User Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Utilisateur</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Rôle</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.user_id} className="hover:bg-gray-50/80 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-xl bg-[#99334C]/10 text-[#99334C] flex items-center justify-center font-bold shadow-inner">
                                                {user.firstname?.[0] || user.email[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 font-bold group-hover:text-[#99334C] transition-all">
                                                    {user.firstname} {user.lastname}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${user.role === 'admin' ? 'bg-[#99334C] text-white shadow-md shadow-[#99334C]/20' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            <Shield className="w-3 h-3" />
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-2.5 hover:bg-white rounded-xl text-gray-400 hover:text-blue-600 shadow-sm transition-all" title="Modifier">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2.5 hover:bg-white rounded-xl text-gray-400 hover:text-gray-900 shadow-sm transition-all">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="p-8 border-t border-gray-50 flex items-center justify-between text-sm font-bold">
                    <p className="text-gray-400">Affichage de {filteredUsers.length} utilisateurs</p>
                </div>
            </div>
        </div>
    );
}
