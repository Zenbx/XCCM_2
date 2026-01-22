"use client";

import React, { useState, useEffect } from 'react';
import {
    Settings,
    Globe,
    Shield,
    Key,
    Bell,
    Palette,
    Save,
    RefreshCcw,
    Zap,
    Lock,
    Cloud,
    CheckCircle2,
    HardDrive,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '@/services/authService';
import { adminService } from '@/services/adminService';
import toast from 'react-hot-toast';

export default function AdminSettings() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [platformName, setPlatformName] = useState("XCCM 2 - Enterprise");
    const [supportUrl, setSupportUrl] = useState("https://support.xccm2.com");
    const [metaDescription, setMetaDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Security settings
    const [twoFactorRequired, setTwoFactorRequired] = useState(true);
    const [detailedLogs, setDetailedLogs] = useState(true);
    const [sessionExpiration, setSessionExpiration] = useState(false);
    const [ipWhitelist, setIpWhitelist] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const settings = await adminService.getSettings();
            if (settings) {
                setPlatformName(settings.platformName || "XCCM 2 - Enterprise");
                setSupportUrl(settings.supportUrl || "");
                setMetaDescription(settings.metaDescription || "");
                setMaintenanceMode(settings.maintenanceMode || false);
                setTwoFactorRequired(settings.twoFactorRequired !== undefined ? settings.twoFactorRequired : true);
                setDetailedLogs(settings.detailedLogs !== undefined ? settings.detailedLogs : true);
                setSessionExpiration(settings.sessionExpiration || false);
                setIpWhitelist(settings.ipWhitelist || false);
            }
        } catch (error) {
            console.error('Erreur settings:', error);
            toast.error("Erreur chargement paramètres");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!platformName.trim()) {
            toast.error("Le nom de la plateforme ne peut pas être vide");
            return;
        }

        setSaving(true);
        try {
            await adminService.saveSettings({
                platformName,
                supportUrl,
                metaDescription,
                maintenanceMode,
                twoFactorRequired,
                detailedLogs,
                sessionExpiration,
                ipWhitelist,
            });
            toast.success("Paramètres enregistrés avec succès!");
        } catch (error) {
            console.error('Erreur save settings:', error);
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-[#99334C]" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Paramètres Système</h1>
                    <p className="text-gray-500 mt-1 font-semibold">Configurez les options globales de la plateforme XCCM2.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#99334C] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 shadow-xl shadow-[#99334C]/20 transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Sidebar Links (Mini) */}
                <div className="lg:col-span-1 space-y-4">
                    {[
                        { label: 'Général', icon: Globe, active: true },
                        { label: 'Sécurité', icon: Shield, active: false },
                        { label: 'Clés API', icon: Key, active: false },
                        { label: 'Notifications', icon: Bell, active: false },
                        { label: 'Apparence', icon: Palette, active: false },
                        { label: 'Stockage', icon: HardDrive, active: false },
                    ].map((item, idx) => (
                        <button
                            key={idx}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${item.active
                                ? 'bg-white text-[#99334C] shadow-md border border-gray-100'
                                : 'text-gray-500 hover:bg-white/50'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${item.active ? 'text-[#99334C]' : 'text-gray-400'}`} />
                            {item.label}
                            {item.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#99334C]"></div>}
                        </button>
                    ))}
                </div>

                {/* Settings Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* General Settings Card */}
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 md:p-10">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-[#99334C]" />
                            Configuration Générale
                        </h3>

                        <div className="space-y-10">
                            {/* Maintenance Mode Toggle */}
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[24px]">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${maintenanceMode ? 'bg-amber-100' : 'bg-green-100'}`}>
                                        <Zap className={`w-5 h-5 ${maintenanceMode ? 'text-amber-600' : 'text-green-600'}`} />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900">Mode Maintenance</h5>
                                        <p className="text-sm text-gray-500 font-semibold">Désactive l'accès à la plateforme pour les utilisateurs.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                                    className={`w-14 h-8 rounded-full relative transition-all duration-300 ${maintenanceMode ? 'bg-[#99334C]' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest pl-1">Nom de la Plateforme</label>
                                    <input
                                        type="text"
                                        value={platformName}
                                        onChange={(e) => setPlatformName(e.target.value)}
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#99334C]/20 font-bold text-gray-900"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest pl-1">URL Support</label>
                                    <input
                                        type="text"
                                        value={supportUrl}
                                        onChange={(e) => setSupportUrl(e.target.value)}
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#99334C]/20 font-bold text-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-black text-gray-400 uppercase tracking-widest pl-1">Description Meta (SEO)</label>
                                <textarea
                                    rows={4}
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#99334C]/20 font-bold text-gray-900 resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="bg-[#36454F] rounded-[32px] p-8 md:p-10 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#99334C]/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-[#99334C]/30 transition-all duration-700"></div>

                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2 relative z-10">
                            <Lock className="w-5 h-5 text-[#99334C]" />
                            Authentification & Sécurité
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            {[
                                { label: '2FA Obligatoire pour Admins', status: twoFactorRequired, setter: setTwoFactorRequired },
                                { label: 'Logs de connexion détaillés', status: detailedLogs, setter: setDetailedLogs },
                                { label: 'Expiration session (24h)', status: sessionExpiration, setter: setSessionExpiration },
                                { label: 'Whitelist IP', status: ipWhitelist, setter: setIpWhitelist },
                            ].map((sec, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
                                    onClick={() => sec.setter(!sec.status)}
                                >
                                    <span className="text-sm font-bold text-white/80">{sec.label}</span>
                                    <div className={`p-1 rounded-full ${sec.status ? 'text-green-400' : 'text-gray-500'}`}>
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-6 bg-[#99334C] rounded-2xl flex items-center justify-between group-hover:scale-[1.02] transition-transform shadow-2xl">
                            <div className="flex items-center gap-4">
                                <Cloud className="w-8 h-8 opacity-50" />
                                <div>
                                    <h5 className="font-bold">Backup Cloud Hebdomadaire</h5>
                                    <p className="text-xs opacity-70">Dernière sauvegarde: il y a 2h</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-white text-[#99334C] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">
                                Lancer Backup
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            onClick={fetchSettings}
                            className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                        >
                            Réinitialiser
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-8 py-4 bg-[#99334C] text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#99334C]/20 hover:scale-105 transition-all disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />}
                            {saving ? 'Déploiement...' : 'Déployer Changements'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
