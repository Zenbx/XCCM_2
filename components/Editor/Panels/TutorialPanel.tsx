"use client";

import React from 'react';
import { BookOpen, Zap, Slash, Code, Type, List, Layout, FileText, PlusCircle, ImageIcon, Bot, Maximize, Info, Sigma, HelpCircle, Eye } from 'lucide-react';

const TutorialPanel: React.FC = () => {
    const commandsByCategory = {
        'Formatage': [
            { command: '/h1', title: 'Titre 1', description: 'Grand titre de section', icon: Type },
            { command: '/h2', title: 'Titre 2', description: 'Sous-titre moyen', icon: Type },
            { command: '/ul', title: 'Liste à puces', description: 'Liste non-ordonnée simple', icon: List },
            { command: '/ol', title: 'Liste numérotée', description: 'Liste ordonnée séquentielle', icon: List },
        ],
        'Structure': [
            { command: '/part', title: 'Nouvelle Partie', description: 'Ajouter une Part structurelle', icon: Layout },
            { command: '/chapter', title: 'Nouveau Chapitre', description: 'Ajouter un Chapitre au plan', icon: BookOpen },
            { command: '/paragraph', title: 'Nouveau Paragraphe', description: 'Ajouter une section de texte', icon: PlusCircle },
            { command: '/notion', title: 'Nouvelle Notion', description: 'Ajouter un grain de contenu', icon: FileText },
        ],
        'Pédagogie': [
            { command: '/math', title: 'Mathématiques', description: 'Formule LaTeX (KaTeX)', icon: Sigma },
            { command: '/quiz', title: 'Quiz Rapide', description: 'Question à choix multiples', icon: HelpCircle },
            { command: '/hint', title: 'Indice / Découverte', description: 'Bloc pliable pour révéler des infos', icon: Eye },
            { command: '/code', title: 'Code Interactif', description: 'Bloc de code avec exécution', icon: Code },
        ],
        'Design': [
            { command: '/capture', title: 'Zone de Capture', description: 'Encadré pour capture d\'écran', icon: Maximize },
            { command: '/note', title: 'Bloc Note', description: 'Encadré bleu pour remarques', icon: Info },
        ],
        'Média & Avancé': [
            { command: '/image', title: 'Image', description: 'Insérer une image depuis votre PC', icon: ImageIcon },
            { command: '/ai', title: 'Assistant IA', description: 'Demander à l\'IA de rédiger', icon: Bot },
        ]
    };

    const shortcuts = [
        { keys: 'Ctrl + B', action: 'Texte en gras' },
        { keys: 'Ctrl + I', action: 'Texte en italique' },
        { keys: 'Ctrl + U', action: 'Texte souligné' },
        { keys: 'Ctrl + K', action: 'Insérer un lien' },
        { keys: 'Ctrl + Shift + X', action: 'Barrer le texte' },
        { keys: 'Ctrl + S', action: 'Sauvegarder' },
        { keys: 'Ctrl + P', action: 'Prévisualiser' },
    ];

    return (
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-[#99334C]/10 rounded-lg">
                        <BookOpen className="w-5 h-5 text-[#99334C]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Guide de l'Éditeur</h3>
                </div>
                <p className="text-sm text-gray-500">Maîtrisez toutes les fonctionnalités de l'éditeur XCCM2</p>
            </div>

            {/* Commandes Slash */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Slash className="w-4 h-4 text-[#99334C]" />
                    <h4 className="font-semibold text-gray-800">Commandes Slash</h4>
                </div>

                {Object.entries(commandsByCategory).map(([category, commands]) => (
                    <div key={category} className="mb-4">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                            {category}
                        </div>
                        <div className="space-y-2">
                            {commands.map((cmd) => {
                                const Icon = cmd.icon;
                                return (
                                    <div key={cmd.command} className="p-2 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg hover:border-[#99334C]/30 transition-colors">
                                        <div className="flex items-start gap-2">
                                            <div className="p-1 bg-[#99334C]/10 rounded shrink-0">
                                                <Icon className="w-3 h-3 text-[#99334C]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <code className="px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded font-mono">
                                                        {cmd.command}
                                                    </code>
                                                    <span className="font-medium text-xs text-gray-900">{cmd.title}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-600">{cmd.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Raccourcis Clavier */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-[#99334C]" />
                    <h4 className="font-semibold text-gray-800">Raccourcis Clavier</h4>
                </div>
                <div className="space-y-2">
                    {shortcuts.map((shortcut, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <span className="text-sm text-gray-600">{shortcut.action}</span>
                            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-700">
                                {shortcut.keys}
                            </kbd>
                        </div>
                    ))}
                </div>
            </div>

            {/* Astuce finale */}
            <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                <p className="text-xs text-purple-800 leading-relaxed">
                    <strong>💡 Astuce Pro :</strong> Tapez <code className="px-1 py-0.5 bg-white rounded">/</code> n'importe où dans l'éditeur pour ouvrir le menu des commandes. Utilisez les flèches ↑↓ pour naviguer et Entrée pour sélectionner.
                </p>
            </div>
        </div>
    );
};

export default TutorialPanel;
