"use client";

import React from 'react';
import { Cloud, MessageSquare, Info, Settings } from 'lucide-react';
import Granule from '../Granule';
import { i } from 'framer-motion/client';
import ImportPanel from '../Editor/Panels/ImportPanel';
import CommentsPanel from '../Editor/Panels/CommentsPanel';
import InfoPanel from '../Editor/Panels/InfoPanel';
import SettingsPanel from '../Editor/Panels/SettingsPanel';

// ============= COMPOSANT: RightPanel =============




const RightPanel = ({ activePanel, onToggle, granules, onDragStart, project, structure }) => {
  const panels = [
    { id: 'import', icon: Cloud, title: 'Importer des documents' },
    { id: 'comments', icon: MessageSquare, title: 'Commentaires' },
    { id: 'info', icon: Info, title: 'Informations' },
    { id: 'settings', icon: Settings, title: 'Paramètres' }
  ];

  return (
    <div className="relative h-full flex flex-row-reverse">
      {/* Barre d'icônes - toujours visible et fixe */}
      <div className="w-14 bg-white border-l border-gray-200 flex flex-col items-center py-4 gap-4 z-20 shadow-sm">
        {panels.map(({ id, icon: Icon, title }) => (
          <button
            key={id}
            onClick={() => onToggle(id)}
            className={`p-3 rounded-xl transition-all duration-200 ${activePanel === id
                ? 'bg-[#99334C] text-white shadow-md transform scale-105'
                : 'text-gray-500 hover:bg-gray-100'
              }`}
            title={title}
          >
            <Icon size={20} strokeWidth={activePanel === id ? 2.5 : 2} />
          </button>
        ))}
      </div>

      {/* Panneau de contenu - s'ouvre à gauche des icônes */}
      {activePanel && (
        <div className="w-80 lg:w-96 xl:w-[28rem] h-full bg-white border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900">
              {panels.find(p => p.id === activePanel)?.title}
            </h3>
            <button onClick={() => onToggle(activePanel)} className="text-gray-400 hover:text-gray-600">
              {/* Close icon could go here */}
            </button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {activePanel === 'import' && <ImportPanel granules={granules} onDragStart={onDragStart} />}
            {activePanel === 'comments' && <CommentsPanel />}
            {activePanel === 'info' && <InfoPanel project={project} structure={structure} />}
            {activePanel === 'settings' && <SettingsPanel project={project} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default RightPanel;