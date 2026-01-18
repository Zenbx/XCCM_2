"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, MessageSquare, Info, Settings, ShoppingBag, Lock, Brain } from 'lucide-react';
import Granule from './Granule';
import ImportPanel from './Panels/ImportPanel';
import CommentsPanel from './Panels/CommentsPanel';
import InfoPanel from './Panels/InfoPanel';
import SettingsPanel from './Panels/SettingsPanel';
import MarketplacePanel from './Panels/MarketplacePanel';
import VaultPanel from './Panels/VaultPanel';
import SocraticPanel from './Panels/SocraticPanel';

import RichTooltip from '../UI/RichTooltip';

// Animation variants pour le panneau coulissant
const panelVariants = {
  hidden: {
    x: 300,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    }
  },
  exit: {
    x: 300,
    opacity: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    }
  }
};

// Animation pour les icônes
const iconVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.1 },
  tap: { scale: 0.95 }
};

// ============= COMPOSANT: RightPanel =============

const RightPanel = ({
  activePanel,
  onToggle,
  granules,
  onDragStart,
  project,
  structure,
  currentContext,
  onUpdateProject,
  comments,
  onAddComment,
  onDeleteComment,
  isFetchingComments,
  onImportFile
}: any) => {
  const panels = [
    { id: 'import', icon: Cloud, title: 'Importer Fichier', description: 'Gérez vos ressources et importez des modules de connaissance.' },
    { id: 'marketplace', icon: ShoppingBag, title: 'Marketplace', description: 'Découvrez et achetez de nouveaux contenus pédagogiques.' },
    { id: 'vault', icon: Lock, title: 'Coffre-fort', description: 'Accédez à votre bibliothèque personnelle d\'éléments sauvegardés.' },
    { id: 'socratic', icon: Brain, title: 'Socrate AI', description: 'Recevez des conseils pédagogiques personnalisés sur votre contenu.' },
    { id: 'comments', icon: MessageSquare, title: 'Commentaires', description: 'Collaborez et discutez des modifications avec votre équipe.' },
    { id: 'info', icon: Info, title: 'Informations', description: 'Détails techniques et métadonnées du projet actuel.' },
    { id: 'settings', icon: Settings, title: 'Paramètres', description: 'Configurez les options d\'export et de publication du projet.' }
  ];

  return (
    <motion.div
      className="relative h-full flex flex-row-reverse"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Barre d'icônes - toujours visible et fixe */}
      <div className="w-14 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col items-center py-4 gap-4 z-20 shadow-sm transition-colors duration-300">
        {panels.map(({ id, icon: Icon, title, description }) => (
          <RichTooltip key={id} title={title} description={description} position="left">
            <motion.button
              onClick={() => onToggle(id)}
              className={`p-3 rounded-xl transition-colors duration-200 ${activePanel === id
                ? 'bg-[#99334C] text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              variants={iconVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              animate={activePanel === id ? { scale: 1.05 } : { scale: 1 }}
            >
              <Icon size={20} strokeWidth={activePanel === id ? 2.5 : 2} />
            </motion.button>
          </RichTooltip>
        ))}
      </div>

      {/* Panneau de contenu - s'ouvre à gauche des icônes en overlay avec animation */}
      <AnimatePresence mode="wait">
        {activePanel && (
          <motion.div
            key={activePanel}
            className="absolute right-14 top-0 h-full w-80 lg:w-96 xl:w-[28rem] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col shadow-2xl z-50 transition-colors duration-300"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            <motion.div
              className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-bold text-gray-900 dark:text-gray-100">
                {panels.find(p => p.id === activePanel)?.title}
              </h3>
              <motion.button
                onClick={() => onToggle(activePanel)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-xl font-light">×</span>
              </motion.button>
            </motion.div>
            <motion.div
              className="p-6 flex-1 overflow-y-auto custom-scrollbar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {activePanel === 'import' && <ImportPanel granules={granules} onDragStart={onDragStart} onImportFile={onImportFile} />}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RightPanel;