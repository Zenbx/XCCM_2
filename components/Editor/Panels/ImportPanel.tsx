"use client";

import React from 'react';
import { Cloud } from 'lucide-react';
import Granule from '../Granule';

// ============= COMPOSANT: ImportPanel =============



const ImportPanel = ({ granules, onDragStart }) => {
  return (
    <div>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors mb-4">
        <Cloud size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-sm text-black font-medium mb-2">
          Glissez-déposez vos documents ici
        </p>
        <p className="text-xs text-gray-600 mb-4">
          ou cliquez pour parcourir
        </p>
        <button 
          className="px-4 py-2 text-white rounded hover:opacity-90"
          style={{ backgroundColor: '#99334C' }}
        >
          Choisir un fichier
        </button>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-black mb-3">Granules disponibles</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
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