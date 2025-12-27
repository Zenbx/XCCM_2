"use client";

import React from 'react';

// ============= COMPOSANT: InfoPanel =============




const InfoPanel = () => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-gray-700">Titre du cours</label>
        <p className="text-sm mt-1 text-black">Introduction à XCCM 2</p>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-700">Auteur</label>
        <p className="text-sm mt-1 text-black">Enseignant</p>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-700">Date de création</label>
        <p className="text-sm mt-1 text-black">24 décembre 2025</p>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-700">Dernière modification</label>
        <p className="text-sm mt-1 text-black">24 décembre 2025, 14:30</p>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-700">Statut</label>
        <span className="inline-block mt-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
          Brouillon
        </span>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-700">Nombre de parties</label>
        <p className="text-sm mt-1 text-black">3</p>
      </div>
    </div>
  );
};

export default InfoPanel;