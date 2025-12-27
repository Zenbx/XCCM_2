"use client";

import React from 'react';

// ============= COMPOSANT: SettingsPanel =============




const SettingsPanel = () => {
  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" defaultChecked className="w-4 h-4" />
          <span className="text-sm text-black">Activer les commentaires</span>
        </label>
      </div>
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" defaultChecked className="w-4 h-4" />
          <span className="text-sm text-black">Numérotation automatique</span>
        </label>
      </div>
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4" />
          <span className="text-sm text-black">Mode collaboratif</span>
        </label>
      </div>
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4" />
          <span className="text-sm text-black">Sauvegarde automatique</span>
        </label>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2 text-black">Langue du cours</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white focus:border-gray-400 focus:outline-none">
          <option>Français</option>
          <option>Anglais</option>
          <option>Espagnol</option>
          <option>Allemand</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2 text-black">Visibilité</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded text-black bg-white focus:border-gray-400 focus:outline-none">
          <option>Privé</option>
          <option>Public</option>
          <option>Partagé</option>
        </select>
      </div>
    </div>
  );
};

export default SettingsPanel;