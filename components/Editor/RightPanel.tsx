"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  ShoppingBag,
  Lock,
  MessageSquare,
  Settings,
  Info,
  Brain,
  Bot,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import RichTooltip from '@/components/UI/RichTooltip';

// Sous-composants pour chaque panneau
import ImportPanel from './Panels/ImportPanel';
import MarketplacePanel from './Panels/MarketplacePanel';
import VaultPanel from './Panels/VaultPanel';
import CommentsPanel from './Panels/CommentsPanel';
import InfoPanel from './Panels/InfoPanel';
import SettingsPanel from './Panels/SettingsPanel';
import TutorialPanel from './Panels/TutorialPanel';
import SocraticPanel from './Panels/SocraticPanel';

const RightPanel = ({
  activePanel,
  onToggle,
  project,
  structure,
  currentContext,
  onUpdateProject,
  comments,
  onAddComment,
  onDeleteComment,
  isFetchingComments,
  onImportFile,
  granules,
  onDragStart = () => { }
}: any) => {
  const panels = [
    { id: 'import', icon: Cloud, title: 'Importer Fichier', description: 'Gérez vos ressources et importez des modules de connaissance.' },
    { id: 'marketplace', icon: ShoppingBag, title: 'Marketplace', description: 'Découvrez et achetez de nouveaux contenus pédagogiques.' },
    { id: 'vault', icon: Lock, title: 'Coffre-fort', description: 'Accédez à votre bibliothèque personnelle d\'éléments sauvegardés.' },
    { id: 'assistant', icon: Bot, title: 'Assistant IA', description: 'Utilisez l\'IA pour générer ou corriger votre contenu.' },
    { id: 'socratic', icon: Brain, title: 'Socrate AI', description: 'Recevez des conseils pédagogiques personnalisés sur votre contenu.' },
    { id: 'comments', icon: MessageSquare, title: 'Commentaires', description: 'Collaborez et discutez des modifications avec votre équipe.' },
    { id: 'info', icon: Info, title: 'Informations', description: 'Détails techniques et métadonnées du projet actuel.' },
    { id: 'settings', icon: Settings, title: 'Paramètres', description: 'Configurez les options d\'export et de publication du projet.' },
    { id: 'tutorial', icon: BookOpen, title: 'Tutoriel', description: 'Apprenez à utiliser les commandes slash et les raccourcis de l\'éditeur.' }
  ];

  return (
    <motion.div
      className="relative h-full flex flex-row-reverse"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Barre d'icônes - toujours visible et fixe */}
      <div className="w-14 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col items-center py-4 gap-4 z-40 shadow-sm transition-colors duration-300">
        {panels.map((panel) => {
          const Icon = panel.icon;
          const isActive = activePanel === panel.id;

          return (
            <RichTooltip
              key={panel.id}
              title={panel.title}
              description={panel.description}
            >
              <button
                onClick={() => onToggle(panel.id)}
                className={`p-2 rounded-xl transition-all duration-200 group relative ${isActive
                  ? 'bg-[#99334C] text-white shadow-lg scale-110'
                  : 'text-gray-500 hover:text-[#99334C] hover:bg-[#99334C]/5'
                  }`}
              >
                <Icon size={24} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'} />
                {panel.id === 'comments' && comments?.length > 0 && !isActive && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#99334C] rounded-full border-2 border-white" />
                )}
              </button>
            </RichTooltip>
          );
        })}
      </div>

      {/* Contenu du panneau - glisse depuis la droite */}
      <AnimatePresence mode="wait">
        {activePanel && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-14 top-0 bottom-0 w-[400px] border-l border-gray-100 bg-white dark:bg-gray-950 flex flex-col h-full shadow-2xl z-50 overflow-hidden"
          >
            {/* Header du panneau */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {(() => {
                  const p = panels.find(p => p.id === activePanel);
                  const Icon = p?.icon || Info;
                  return (
                    <>
                      <div className="p-2 bg-[#99334C]/10 rounded-lg">
                        <Icon size={18} className="text-[#99334C]" />
                      </div>
                      <h3 className="font-bold text-gray-900">{p?.title}</h3>
                    </>
                  );
                })()}
              </div>
              <button
                onClick={() => onToggle(activePanel)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Contenu dynamique */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              {activePanel === 'import' && <ImportPanel granules={granules || []} onDragStart={onDragStart} onImportFile={onImportFile} />}
              {activePanel === 'marketplace' && <MarketplacePanel onDragStart={onDragStart} />}
              {activePanel === 'vault' && <VaultPanel onDragStart={onDragStart} />}
              {activePanel === 'comments' && (
                <CommentsPanel
                  comments={comments}
                  onAddComment={onAddComment}
                  onDeleteComment={onDeleteComment}
                  isFetching={isFetchingComments}
                />
              )}
              {activePanel === 'info' && <InfoPanel project={project} structure={structure} />}
              {activePanel === 'settings' && <SettingsPanel project={project} onUpdateProject={onUpdateProject} />}
              {activePanel === 'tutorial' && <TutorialPanel />}
              {activePanel === 'socratic' && (
                <SocraticPanel content={currentContext?.notionContent || ''} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RightPanel;