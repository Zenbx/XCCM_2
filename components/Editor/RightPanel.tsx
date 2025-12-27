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




const RightPanel = ({ activePanel, onToggle, granules, onDragStart }) => {
  const panels = [
    { id: 'import', icon: Cloud, title: 'Importer des documents' },
    { id: 'comments', icon: MessageSquare, title: 'Commentaires' },
    { id: 'info', icon: Info, title: 'Informations' },
    { id: 'settings', icon: Settings, title: 'Paramètres' }
  ];

  return (
    <div className="relative">
      <div className="w-14 bg-white border-l border-gray-200 flex flex-col items-center py-4 gap-4">
        {panels.map(({ id, icon: Icon, title }) => (
          <button
            key={id}
            onClick={() => onToggle(id)}
            className={`p-3 rounded-lg transition-colors ${
              activePanel === id ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={activePanel === id ? { backgroundColor: '#99334C' } : {}}
            title={title}
          >
            <Icon size={20} />
          </button>
        ))}
      </div>

      {activePanel && (
        <div className="absolute top-0 right-14 w-80 h-full bg-white border-l border-gray-200 shadow-lg overflow-y-auto z-10">
          <div className="p-4 border-b" style={{ backgroundColor: '#6C7A89' }}>
            <h3 className="text-white font-semibold">
              {panels.find(p => p.id === activePanel)?.title}
            </h3>
          </div>
          <div className="p-4">
            {activePanel === 'import' && <ImportPanel granules={granules} onDragStart={onDragStart} />}
            {activePanel === 'comments' && <CommentsPanel />}
            {activePanel === 'info' && <InfoPanel />}
            {activePanel === 'settings' && <SettingsPanel />}
          </div>
        </div>
      )}
    </div>
  );
};

export default RightPanel;