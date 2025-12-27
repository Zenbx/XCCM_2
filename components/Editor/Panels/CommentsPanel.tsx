"use client";

import React from 'react';

// ============= COMPOSANT: CommentsPanel =============



const CommentsPanel = () => {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">Aucun commentaire pour le moment</p>
      <textarea
        className="w-full p-3 border border-gray-300 rounded resize-none text-black focus:border-gray-400 focus:outline-none"
        rows="4"
        placeholder="Ajouter un commentaire..."
      />
      <button 
        className="mt-2 px-4 py-2 text-white rounded w-full hover:opacity-90"
        style={{ backgroundColor: '#99334C' }}
      >
        Ajouter un commentaire
      </button>
    </div>
  );
};

export default CommentsPanel;