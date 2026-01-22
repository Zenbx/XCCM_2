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
        <div className="space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Settings className="text-[#99334C]" size={24} /> Paramètres Système
                    </h1>
                    <p className="text-gray-500 font-medium text-xs">Configurez les options globales de la plateforme XCCM2.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#99334C] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-[#802a40] shadow-md shadow-[#99334C]/10 transition-all disabled:opacity-50 text-sm"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar Links (Mini) */}
                <div className="lg:col-span-1 space-y-2">
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
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-bold transition-all text-xs ${item.active
                                ? 'bg-white text-[#99334C] shadow-sm border border-gray-100'
                                : 'text-gray-500 hover:bg-white/50'
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${item.active ? 'text-[#99334C]' : 'text-gray-400'}`} />
                            {item.label}
                            {item.active && <div className="ml-auto w-1 h-1 rounded-full bg-[#99334C]"></div>}
                        </button>
                    ))}
                </div>

                {/* Settings Content Area */}
                <div className="lg:col-span-3 space-y-6 text-sm">
                    {/* General Settings Card */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-gray-900 border-b border-gray-50 pb-4">
                            <Settings className="w-4 h-4 text-[#99334C]" />
                            Configuration Générale
                        </h3>

                        <div className="space-y-6">
                            {/* Maintenance Mode Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${maintenanceMode ? 'bg-amber-100' : 'bg-green-100'}`}>
                                        <Zap className={`w-4 h-4 ${maintenanceMode ? 'text-amber-600' : 'text-green-600'}`} />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-xs">Mode Maintenance</h5>
                                        <p className="text-[10px] text-gray-500 font-medium">Désactive l'accès à la plateforme pour les utilisateurs.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                                    className={`w-10 h-5 rounded-full relative transition-all duration-300 ${maintenanceMode ? 'bg-[#99334C]' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${maintenanceMode ? 'left-5' : 'left-0.5'}`}></div>
                                </button>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nom de la Plateforme</label>
                                    <input
                                        type="text"
                                        value={platformName}
                                        onChange={(e) => setPlatformName(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-[#99334C]/10 font-bold text-gray-900 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">URL Support</label>
                                    <input
                                        type="text"
                                        value={supportUrl}
                                        onChange={(e) => setSupportUrl(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-[#99334C]/10 font-bold text-gray-900 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Description Meta (SEO)</label>
                                <textarea
                                    rows={3}
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-[#99334C]/10 font-bold text-gray-900 text-xs resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="bg-[#36454F] rounded-xl p-6 text-white relative overflow-hidden group border border-gray-800 shadow-sm">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#99334C]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-[#99334C]/20 transition-all duration-700"></div>

                        <h3 className="text-sm font-bold mb-6 flex items-center gap-2 relative z-10 border-b border-white/5 pb-4">
                            <Lock className="w-4 h-4 text-[#99334C]" />
                            Authentification & Sécurité
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                            {[
                                { label: '2FA Obligatoire pour Admins', status: twoFactorRequired, setter: setTwoFactorRequired },
                                { label: 'Logs de connexion détaillés', status: detailedLogs, setter: setDetailedLogs },
                                { label: 'Expiration session (24h)', status: sessionExpiration, setter: setSessionExpiration },
                                { label: 'Whitelist IP', status: ipWhitelist, setter: setIpWhitelist },
                            ].map((sec, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-all"
                                    onClick={() => sec.setter(!sec.status)}
                                >
                                    <span className="text-[11px] font-bold text-white/80">{sec.label}</span>
                                    <div className={`p-1 rounded-full ${sec.status ? 'text-green-400' : 'text-gray-500'}`}>
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-[#99334C] rounded-lg flex items-center justify-between transition-transform shadow-lg border border-white/10">
                            <div className="flex items-center gap-3">
                                <Cloud className="w-6 h-6 opacity-50" />
                                <div>
                                    <h5 className="font-bold text-xs uppercase">Backup Cloud Hebdomadaire</h5>
                                    <p className="text-[10px] opacity-70">Dernière sauvegarde: il y a 2h</p>
                                </div>
                            </div>
                            <button className="px-3 py-1.5 bg-white text-[#99334C] rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                                Backup Now
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={fetchSettings}
                            className="px-6 py-2.5 bg-gray-100 text-gray-500 rounded-lg font-bold hover:bg-gray-200 transition-all text-xs"
                        >
                            Réinitialiser
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2.5 bg-[#99334C] text-white rounded-lg font-bold flex items-center gap-2 shadow-md shadow-[#99334C]/10 hover:bg-[#802a40] transition-all disabled:opacity-50 text-xs"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                            {saving ? 'Déploiement...' : 'Déployer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
