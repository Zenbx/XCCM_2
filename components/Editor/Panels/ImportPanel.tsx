"use client";

import React from 'react';
import { Cloud } from 'lucide-react';
import Granule from '../Granule';

// ============= COMPOSANT: ImportPanel =============



const ImportPanel = ({ granules, onDragStart, onImportFile }: any) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (onImportFile) {
          onImportFile(json);
        }
      } catch (err) {
        console.error("Erreur lecture JSON:", err);
        alert("Fichier invalide. Veuillez sélectionner un fichier JSON de structure XCCM.");
      }
    };
    reader.readAsText(file);

    // Reset input for next same file selection
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Importer Fichier</h3>
          <p className="text-sm text-gray-500 mb-4">Choisissez un fichier ou glissez des structures.</p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-dashed border-gray-200 rounded-xl text-gray-600 hover:border-[#99334C] hover:text-[#99334C] hover:bg-[#99334C]/5 transition-all group font-medium"
          >
            <Cloud className="w-5 h-5 group-hover:animate-bounce" />
            <span>Importer un fichier (.json)</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {granules.map((granule) => (
            <Granule key={granule.id} granule={granule} onDragStart={onDragStart} />
          ))}
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
        <p className="text-xs text-black">
          <strong>Astuce:</strong> Glissez-déposez les granules vers la zone d'édition pour les insérer dans votre cours.
        </p>
      </div>
    </div>
  );
};

export default ImportPanel;