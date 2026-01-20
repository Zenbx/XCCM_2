"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';

// ============= COMPOSANT: InfoPanel =============




interface InfoPanelProps {
  project: {
    pr_name: string;
    owner_id: string;
    owner?: { // Ajout des infos utilisateur si disponibles
      firstname?: string;
      lastname?: string;
    };
    created_at?: string;
    updated_at?: string;
  } | null;
  structure: any[];
}

const InfoPanel: React.FC<InfoPanelProps> = ({ project, structure }) => {
  const { user } = useAuth();

  if (!project) return <div className="text-gray-500 text-sm">Aucun projet chargé</div>;

  const partCount = structure.length;
  const chapterCount = structure.reduce((acc, part) => acc + (part.chapters?.length || 0), 0);
  const paragraphCount = structure.reduce((acc, part) =>
    acc + (part.chapters?.reduce((cAcc: number, chap: any) => cAcc + (chap.paragraphs?.length || 0), 0) || 0)
    , 0);

  // Utilise les données de l'utilisateur connecté si c'est son projet
  const isOwner = user?.user_id === project.owner_id;
  const ownerName = isOwner && user
    ? `${user.firstname} ${user.lastname}`
    : (project.owner?.firstname && project.owner?.lastname
      ? `${project.owner.firstname} ${project.owner.lastname}`
      : project.owner_id);

  const ownerInitial = isOwner && user
    ? user.firstname?.[0]?.toUpperCase()
    : (project.owner?.firstname?.[0]?.toUpperCase() || project.owner_id.charAt(0).toUpperCase());

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Titre du cours</label>
        <p className="text-base mt-1 text-gray-900 font-medium">{project.pr_name}</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Auteur</label>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-6 h-6 rounded-full bg-[#99334C] text-white flex items-center justify-center text-xs">
            {ownerInitial}
          </div>
          <p className="text-sm text-gray-900">{ownerName}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Statistiques</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-2 rounded-lg text-center">
            <span className="block text-2xl font-bold text-[#99334C]">{partCount}</span>
            <span className="text-xs text-gray-500">Parties</span>
          </div>
          <div className="bg-gray-50 p-2 rounded-lg text-center">
            <span className="block text-2xl font-bold text-[#99334C]">{chapterCount}</span>
            <span className="text-xs text-gray-500">Chapitres</span>
          </div>
          <div className="bg-gray-50 p-2 rounded-lg text-center">
            <span className="block text-2xl font-bold text-[#99334C]">{paragraphCount}</span>
            <span className="text-xs text-gray-500">Paragraphes</span>
          </div>
          <div className="bg-gray-50 p-2 rounded-lg text-center">
            {/* Mock stat */}
            <span className="block text-2xl font-bold text-[#99334C]">~</span>
            <span className="text-xs text-gray-500">Mots</span>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</label>
        <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          En édition
        </span>
      </div>
    </div>
  );
};

export default InfoPanel;