"use client";

import React from 'react';
import { Cloud, MessageSquare, Info, Settings, ShoppingBag, Lock } from 'lucide-react';
import Granule from './Granule';
import ImportPanel from './Panels/ImportPanel';
import CommentsPanel from './Panels/CommentsPanel';
import InfoPanel from './Panels/InfoPanel';
import SettingsPanel from './Panels/SettingsPanel';
import MarketplacePanel from './Panels/MarketplacePanel';
import VaultPanel from './Panels/VaultPanel';

import RichTooltip from '../UI/RichTooltip';

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
    { id: 'comments', icon: MessageSquare, title: 'Commentaires', description: 'Collaborez et discutez des modifications avec votre équipe.' },
    { id: 'info', icon: Info, title: 'Informations', description: 'Détails techniques et métadonnées du projet actuel.' },
    { id: 'settings', icon: Settings, title: 'Paramètres', description: 'Configurez les options d\'export et de publication du projet.' }
  ];

  return (
    <div className="relative h-full flex flex-row-reverse">
      {/* Barre d'icônes - toujours visible et fixe */}
      <div className="w-14 bg-white border-l border-gray-200 flex flex-col items-center py-4 gap-4 z-20 shadow-sm">
        {panels.map(({ id, icon: Icon, title, description }) => (
          <RichTooltip key={id} title={title} description={description} position="left">
            <button
              onClick={() => onToggle(id)}
              className={`p-3 rounded-xl transition-all duration-200 ${activePanel === id
                ? 'bg-[#99334C] text-white shadow-md transform scale-105'
                : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              <Icon size={20} strokeWidth={activePanel === id ? 2.5 : 2} />
            </button>
          </RichTooltip>
        ))}
      </div>

      {/* Panneau de contenu - s'ouvre à gauche des icônes en overlay */}
      {activePanel && (
        <div className="absolute right-14 top-0 h-full w-80 lg:w-96 xl:w-[28rem] bg-white border-l border-gray-200 flex flex-col shadow-2xl z-50 animate-in slide-in-from-right duration-300">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900">
              {panels.find(p => p.id === activePanel)?.title}
            </h3>
            <button onClick={() => onToggle(activePanel)} className="text-gray-400 hover:text-gray-600">
              <span className="text-xl font-light">×</span>
            </button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default RightPanel;