"use client";

import React from 'react';
import { Cloud } from 'lucide-react';
import Granule, { GranuleData } from '../Granule';

// ============= COMPOSANT: ImportPanel =============

interface ImportPanelProps {
  granules: GranuleData[];
  onDragStart: (e: React.DragEvent, granule: GranuleData) => void;
  onImportFile?: (json: unknown) => void;
}

const ImportPanel: React.FC<ImportPanelProps> = ({ granules, onDragStart, onImportFile }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        // Recursive flattener
        const flattened: GranuleData[] = [];

        const processItem = (item: any) => {
          // Mapping to GranuleData format
          const granule: GranuleData = {
            id: Math.random().toString(36).substr(2, 9),
            content: item.content || item.part_title || item.chapter_title || item.para_name || item.notion_name || "Sans titre",
            type: item.type,
            icon: item.type === 'part' ? 'Folder' : item.type === 'chapter' ? 'Book' : item.type === 'notion' ? 'File' : 'FileText',
            introduction: item.part_intro || item.introduction,
            previewContent: item.notion_content || item.previewContent,
            author: "Importé",
            // Preserve children for the Granule component's own recursion
            children: item.children ? item.children.map((child: any) => processChild(child)) : undefined
          };

          // If the item itself is a valid granule type, add it to top level list if we want flat list
          // OR we just assume the root JSON is a list of top-level items.
          // The Granule component handles children recursively, so we just need to format the tree.
          return granule;
        };

        const processChild = (item: any): GranuleData => {
          return {
            id: Math.random().toString(36).substr(2, 9),
            content: item.content || item.chapter_title || item.para_name || item.notion_name || "Sans titre",
            type: item.type,
            icon: item.type === 'chapter' ? 'Book' : item.type === 'paragraph' ? 'FileText' : 'File',
            previewContent: item.notion_content,
            children: item.children ? item.children.map((c: any) => processChild(c)) : undefined
          };
        }

        // Handle root as array or single object
        const rootItems = Array.isArray(json) ? json : [json];
        const formattedItems = rootItems.map(item => processItem(item));

        if (onImportFile) {
          // We pass the RAW json structure for the logic, but for display we might need to update local state too?
          // Actually ImportPanel props has 'granules'. We can't update props. 
          // So we should probably call onImportFile with the NEW list so the parent updates the state.
          onImportFile(formattedItems);
        }
      } catch (err) {
        console.error("Erreur lecture JSON:", err);
        alert("Fichier invalide. Structure non reconnue.");
      }
    };
    reader.readAsText(file);

    // Reset input
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