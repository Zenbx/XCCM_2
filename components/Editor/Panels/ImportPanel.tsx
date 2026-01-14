"use client";

import React from 'react';
import { Cloud } from 'lucide-react';
import Granule from '../Granule';

// ============= COMPOSANT: ImportPanel =============



const ImportPanel = ({ granules, onDragStart }) => {
  return (
    <div>
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Bibliothèque de Contenus</h3>
          <p className="text-sm text-gray-500">Glissez des structures complètes pour les importer.</p>
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