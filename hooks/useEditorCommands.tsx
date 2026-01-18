"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Save,
    Eye,
    Share2,
    Download,
    Home,
    BookOpen,
    HelpCircle,
    User,
    Moon,
    Sun,
    Maximize,
    Languages
} from 'lucide-react';
import { useCommandPalette } from './useCommandPalette';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

interface UseEditorCommandsProps {
    onSave?: () => void;
    onPreview?: () => void;
    onShare?: () => void;
    onExport?: () => void;
    onToggleZen?: () => void;
}

export function useEditorCommands({
    onSave,
    onPreview,
    onShare,
    onExport,
    onToggleZen,
}: UseEditorCommandsProps = {}) {
    const registerCommand = useCommandPalette((state) => state.registerCommand);
    const unregisterCommand = useCommandPalette((state) => state.unregisterCommand);
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { language, setLanguage } = useLanguage();

    // Use refs for callbacks to prevent the effect from re-running on every render
    const callbacks = useRef({
        onSave,
        onPreview,
        onShare,
        onExport,
        onToggleZen,
    });

    // Update the ref's current value whenever the props change
    useEffect(() => {
        callbacks.current = {
            onSave,
            onPreview,
            onShare,
            onExport,
            onToggleZen,
        };
    }, [onSave, onPreview, onShare, onExport, onToggleZen]);

    useEffect(() => {
        const commands = [
            // Editor Actions
            {
                id: 'editor.save',
                label: 'Sauvegarder',
                category: 'editor' as const,
                icon: <Save size={16} />,
                keywords: ['save', 'sauvegarder', 'enregistrer'],
                action: () => callbacks.current.onSave?.(),
                shortcut: 'Ctrl+S',
            },
            {
                id: 'editor.preview',
                label: 'Prévisualiser',
                category: 'editor' as const,
                icon: <Eye size={16} />,
                keywords: ['preview', 'prévisualiser', 'aperçu'],
                action: () => callbacks.current.onPreview?.(),
            },
            {
                id: 'editor.share',
                label: 'Partager',
                category: 'editor' as const,
                icon: <Share2 size={16} />,
                keywords: ['share', 'partager', 'inviter'],
                action: () => callbacks.current.onShare?.(),
            },
            {
                id: 'editor.export',
                label: 'Exporter PDF',
                category: 'editor' as const,
                icon: <Download size={16} />,
                keywords: ['export', 'exporter', 'pdf', 'télécharger'],
                action: () => callbacks.current.onExport?.(),
            },
            {
                id: 'editor.zen',
                label: 'Mode Zen',
                category: 'editor' as const,
                icon: <Maximize size={16} />,
                keywords: ['zen', 'focus', 'plein écran'],
                action: () => callbacks.current.onToggleZen?.(),
                shortcut: 'Alt+Z',
            },

            // Navigation
            {
                id: 'nav.home',
                label: 'Aller à l\'accueil',
                category: 'navigation' as const,
                icon: <Home size={16} />,
                keywords: ['home', 'accueil', 'dashboard'],
                action: () => router.push('/'),
            },
            {
                id: 'nav.library',
                label: 'Bibliothèque',
                category: 'navigation' as const,
                icon: <BookOpen size={16} />,
                keywords: ['library', 'bibliothèque', 'projets'],
                action: () => router.push('/library'),
            },
            {
                id: 'nav.help',
                label: 'Centre d\'aide',
                category: 'navigation' as const,
                icon: <HelpCircle size={16} />,
                keywords: ['help', 'aide', 'documentation'],
                action: () => router.push('/help'),
            },
            {
                id: 'nav.profile',
                label: 'Mon profil',
                category: 'navigation' as const,
                icon: <User size={16} />,
                keywords: ['profile', 'profil', 'compte'],
                action: () => router.push('/profile'),
            },

            // Settings
            {
                id: 'settings.theme.toggle',
                label: theme === 'dark' ? 'Mode clair' : 'Mode sombre',
                category: 'settings' as const,
                icon: theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />,
                keywords: ['theme', 'thème', 'dark', 'light', 'sombre', 'clair'],
                action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
            },
            {
                id: 'settings.language.toggle',
                label: language === 'fr' ? 'Switch to English' : 'Passer en Français',
                category: 'settings' as const,
                icon: <Languages size={16} />,
                keywords: ['language', 'langue', 'français', 'english'],
                action: () => setLanguage(language === 'fr' ? 'en' : 'fr'),
            },
        ];

        // Register all commands
        commands.forEach((cmd) => registerCommand(cmd));

        // Cleanup on unmount
        return () => {
            commands.forEach((cmd) => unregisterCommand(cmd.id));
        };
    }, [
        registerCommand,
        unregisterCommand,
        router,
        theme,
        setTheme,
        language,
        setLanguage,
        // Callbacks are now handled via ref, so they don't need to be here
    ]);
}
