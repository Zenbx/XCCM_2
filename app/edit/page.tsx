"use client"


import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Cloud, MessageSquare, Info, Settings, Eye, Bot } from 'lucide-react';

const XCCM2Editor = () => {
  const [expandedSections, setExpandedSections] = useState({
    partie1: true,
    chapitre1: true,
    paragraphe1: true
  });
  const [rightPanel, setRightPanel] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [textFormat, setTextFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    subscript: false,
    superscript: false,
    font: 'Arial',
    fontSize: '11'
  });
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const triggerFileSelect = () => {
  fileInputRef.current?.click();
};

//state pour le fichier importé
  const [importedFileContent, setImportedFileContent] = useState<string>('');

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setEditorContent(content); // rempli l'éditeur
      }
    };
    reader.readAsText(file);
  }
};

// Fonction pour drag start depuis l'aperçu
const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
  e.dataTransfer.setData('text/plain', importedFileContent);
};

  const editorRef = useRef(null);
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const toggleRightPanel = (panelName) => {
    setRightPanel(rightPanel === panelName ? null : panelName);
  };

  const applyFormat = (format) => {
    setTextFormat(prev => ({
      ...prev,
      [format]: !prev[format]
    }));
  };

  const handleFontChange = (e) => {
    setTextFormat(prev => ({ ...prev, font: e.target.value }));
  };

  const handleFontSizeChange = (e) => {
    setTextFormat(prev => ({ ...prev, fontSize: e.target.value }));
  };

  const tableOfContents = [
    {
      id: 'partie1',
      title: 'Partie 1',
      children: [
        {
          id: 'chapitre1',
          title: 'Chapitre 1',
          children: [
            {
              id: 'paragraphe1',
              title: 'Paragraphe 1',
              children: [
                { id: 'notion1', title: 'Notion 1' }
              ]
            }
          ]
        }
      ]
    },
    { id: 'partie2', title: 'Partie 2', children: [] },
    { id: 'partie3', title: 'Partie 3', children: [] }
  ];

  const renderTreeItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections[item.id];
    
    const colors = {
      partie: '#99334C',
      chapitre: '#DC3545',
      paragraphe: '#FFC107',
      notion: '#FFD700'
    };
    
    const getColor = (id) => {
      if (id.includes('partie')) return colors.partie;
      if (id.includes('chapitre')) return colors.chapitre;
      if (id.includes('paragraphe')) return colors.paragraphe;
      return colors.notion;
    };

    return (
      <div key={item.id}>
        <div
          className="flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
          style={{ marginLeft: `${level * 12}px` }}
          onClick={() => hasChildren && toggleSection(item.id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={14} className="mr-1 flex-shrink-0" />
            ) : (
              <ChevronRight size={14} className="mr-1 flex-shrink-0" />
            )
          ) : (
            <div className="w-4 mr-1" />
          )}
          <div 
            className="w-3 h-3 rounded-sm mr-2 flex-shrink-0" 
            style={{ backgroundColor: getColor(item.id) }}
          />
          <span className="text-sm text-black">{item.title}</span>
        </div>
        {isExpanded && hasChildren && (
          <div>
            {item.children.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Table des matières - Gauche */}
      <div className="w-56 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-3 border-b border-gray-200" style={{ backgroundColor: '#6C7A89' }}>
          <h2 className="text-white font-semibold text-sm">Table des matières</h2>
        </div>
        <div className="p-2">
          {tableOfContents.map(item => renderTreeItem(item))}
        </div>
      </div>

      {/* Zone d'édition principale - Centre */}
      <div className="flex-1 flex flex-col">
        {/* Barre d'outils type Word */}
        <div className="bg-white border-b border-gray-200 p-2 flex items-center gap-1">
          <select 
            className="px-2 py-1 border border-gray-300 rounded text-sm bg-white text-black"
            value={textFormat.font}
            onChange={handleFontChange}
          >
            <option>Arial</option>
            <option>Times New Roman</option>
            <option>Calibri</option>
            <option>Verdana</option>
            <option>Georgia</option>
          </select>
          
          <select 
            className="px-2 py-1 border border-gray-300 rounded text-sm w-16 bg-white text-black"
            value={textFormat.fontSize}
            onChange={handleFontSizeChange}
          >
            <option>8</option>
            <option>9</option>
            <option>10</option>
            <option>11</option>
            <option>12</option>
            <option>14</option>
            <option>16</option>
            <option>18</option>
            <option>20</option>
            <option>24</option>
          </select>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <button 
            className={`px-2 py-1 hover:bg-gray-100 rounded font-bold text-black ${textFormat.bold ? 'bg-gray-200' : ''}`}
            onClick={() => applyFormat('bold')}
            title="Gras"
          >
            B
          </button>
          
          <button 
            className={`px-2 py-1 hover:bg-gray-100 rounded italic text-black ${textFormat.italic ? 'bg-gray-200' : ''}`}
            onClick={() => applyFormat('italic')}
            title="Italique"
          >
            I
          </button>
          
          <button 
            className={`px-2 py-1 hover:bg-gray-100 rounded underline text-black ${textFormat.underline ? 'bg-gray-200' : ''}`}
            onClick={() => applyFormat('underline')}
            title="Souligné"
          >
            U
          </button>
          
          <button 
            className={`px-2 py-1 hover:bg-gray-100 rounded text-black ${textFormat.strikethrough ? 'bg-gray-200' : ''}`}
            onClick={() => applyFormat('strikethrough')}
            title="Barré"
            style={{ textDecoration: 'line-through' }}
          >
            S
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <button 
            className={`px-2 py-1 hover:bg-gray-100 rounded text-black text-sm ${textFormat.subscript ? 'bg-gray-200' : ''}`}
            onClick={() => applyFormat('subscript')}
            title="Indice"
          >
            X<sub>2</sub>
          </button>
          
          <button 
            className={`px-2 py-1 hover:bg-gray-100 rounded text-black text-sm ${textFormat.superscript ? 'bg-gray-200' : ''}`}
            onClick={() => applyFormat('superscript')}
            title="Exposant"
          >
            X<sup>2</sup>
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <button 
            className="px-2 py-1 hover:bg-gray-100 rounded text-black text-sm"
            title="Minuscule"
          >
            <span style={{ fontSize: '10px' }}>a</span>A
          </button>
          
          <button 
            className="px-2 py-1 hover:bg-gray-100 rounded text-black font-bold"
            title="Majuscule"
          >
            A
          </button>

          <div className="flex-1"></div>

          <button 
            className="px-4 py-1.5 rounded text-white flex items-center gap-2 text-sm hover:opacity-90"
            style={{ backgroundColor: '#6C7A89' }}
          >
            <Bot size={16} />
            IA Assistant
          </button>

          <button 
            className="px-4 py-1.5 rounded text-white flex items-center gap-2 text-sm hover:opacity-90"
            style={{ backgroundColor: '#99334C' }}
          >
            <Eye size={16} />
            Aperçu
          </button>

          <button 
            className="px-4 py-1.5 rounded text-white text-sm font-semibold hover:opacity-90"
            style={{ backgroundColor: '#99334C' }}
          >
            Publier
          </button>
        </div>

        {/* Zone d'édition */}
        <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-white shadow-sm" style={{ minHeight: '800px' }}>
            <textarea
              ref={editorRef}
              className="w-full h-full min-h-[800px] p-6 focus:outline-none resize-none text-black"
              style={{ 
                border: `2px solid #99334C`,
                borderRadius: `16px`,
                fontFamily: textFormat.font,
                fontSize: `${textFormat.fontSize}pt`,
                fontWeight: textFormat.bold ? 'bold' : 'normal',
                fontStyle: textFormat.italic ? 'italic' : 'normal',
                textDecoration: `${textFormat.underline ? 'underline' : ''} ${textFormat.strikethrough ? 'line-through' : ''}`.trim()
              }}
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              placeholder="Commencez à écrire votre contenu..."
              onDragOver={(e) => e.preventDefault()} // permet le drop
              onDrop={(e) => {
                e.preventDefault();
                const droppedText = e.dataTransfer.getData('text/plain');
                setEditorContent(prev => prev + droppedText);
              }}
            />
            
          </div>
        </div>
      </div>

      {/* Barre latérale droite - Icônes */}
      <div className="relative">
        <div className="w-14 bg-white border-l border-gray-200 flex flex-col items-center py-4 gap-4">
          <button
            onClick={() => toggleRightPanel('import')}
            className={`p-3 rounded-lg transition-colors ${
              rightPanel === 'import' ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={rightPanel === 'import' ? { backgroundColor: '#99334C' } : {}}
            title="Importer des documents"
          >
            <Cloud size={20} />
          </button>
          <button
            onClick={() => toggleRightPanel('comments')}
            className={`p-3 rounded-lg transition-colors ${
              rightPanel === 'comments' ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={rightPanel === 'comments' ? { backgroundColor: '#99334C' } : {}}
            title="Commentaires"
          >
            <MessageSquare size={20} />
          </button>
          <button
            onClick={() => toggleRightPanel('info')}
            className={`p-3 rounded-lg transition-colors ${
              rightPanel === 'info' ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={rightPanel === 'info' ? { backgroundColor: '#99334C' } : {}}
            title="Informations"
          >
            <Info size={20} />
          </button>
          <button
            onClick={() => toggleRightPanel('settings')}
            className={`p-3 rounded-lg transition-colors ${
              rightPanel === 'settings' ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={rightPanel === 'settings' ? { backgroundColor: '#99334C' } : {}}
            title="Paramètres"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Panneau coulissant */}
        {rightPanel && (
          <div className="absolute top-0 right-14 w-80 h-full bg-white border-l border-gray-200 shadow-lg overflow-y-auto">
            <div className="p-4 border-b" style={{ backgroundColor: '#6C7A89' }}>
              <h3 className="text-white font-semibold">
                {rightPanel === 'import' && 'Importer des documents'}
                {rightPanel === 'comments' && 'Commentaires'}
                {rightPanel === 'info' && 'Informations'}
                {rightPanel === 'settings' && 'Paramètres'}
              </h3>
            </div>
            <div className="p-4">
              {rightPanel === 'import' && (
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                      onDrop={(e) => e.preventDefault()} // désactiver drop direct ici
                      onDragOver={(e) => e.preventDefault()}>

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
                      onClick={triggerFileSelect} // <-- déclenche l'input
                    >

                      Choisir un fichier
                    </button>
                    
                    <input
                      type="file"
                      accept=".txt,.md,.csv,.json,.jpg,.pdf,.jpeg,.odt,.docx" // tu peux ajouter d'autres formats
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                  {/* Aperçu du fichier importé */}
                  {importedFileContent && (
                    <div className="mt-4 p-3 border border-gray-300 rounded bg-gray-50 text-left text-xs text-black cursor-move"
                          draggable
                          onDragStart={handleDragStart}>
                      {importedFileContent.slice(0, 200)}{/* aperçu limité à 200 caractères */}
                      {importedFileContent.length > 200 && '...'}
                    </div>
                 )}
                  <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-black">
                      <strong>Info:</strong> Les documents importés seront automatiquement divisés en granules pédagogiques pour faciliter la structuration de votre cours.
                    </p>
                  </div>
                </div>
              )}
              {rightPanel === 'comments' && (
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
              )}
              {rightPanel === 'info' && (
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
                    <p className="text-sm mt-1 text-black">23 décembre 2025</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700">Dernière modification</label>
                    <p className="text-sm mt-1 text-black">23 décembre 2025, 14:30</p>
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
              )}
              {rightPanel === 'settings' && (
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default XCCM2Editor;