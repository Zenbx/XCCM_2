"use client";

import React from 'react';

// ============= COMPOSANT: SettingsPanel =============





interface SettingsPanelProps {
  project: { pr_name: string } | null;
  onUpdateProject?: (newName: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ project, onUpdateProject }) => {
  const [name, setName] = React.useState(project?.pr_name || '');

  React.useEffect(() => {
    if (project) setName(project.pr_name);
  }, [project]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">Nom du projet</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (onUpdateProject && name !== project?.pr_name) {
              onUpdateProject(name);
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#99334C] focus:border-transparent outline-none transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">Le changement sera sauvegardé automatiquement.</p>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-900">Préférences de l'éditeur</h4>
        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <input type="checkbox" defaultChecked className="w-4 h-4 text-[#99334C] rounded focus:ring-[#99334C]" />
          <span className="text-sm text-gray-700">Activer les commentaires</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <input type="checkbox" defaultChecked className="w-4 h-4 text-[#99334C] rounded focus:ring-[#99334C]" />
          <span className="text-sm text-gray-700">Numérotation automatique</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <input type="checkbox" className="w-4 h-4 text-[#99334C] rounded focus:ring-[#99334C]" />
          <span className="text-sm text-gray-700">Mode collaboratif</span>
        </label>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <label className="block text-sm font-semibold mb-2 text-gray-700">Langue du cours</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#99334C] focus:outline-none">
          <option>Français</option>
          <option>Anglais</option>
          <option>Espagnol</option>
          <option>Allemand</option>
        </select>
      </div>
    </div>
  );
};

export default SettingsPanel;