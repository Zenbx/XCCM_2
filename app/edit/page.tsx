'use client';

import React, { useState, useRef } from 'react';
import TableOfContents from '../../components/Editor/TableOfContents';
import EditorToolbar from '../../components/Editor/EditorToolBar';
import EditorArea from '../../components/Editor/EditorArea';
import RightPanel from '../../components/Editor/RightPanel';

// ============= COMPOSANT: XCCM2Editor =============



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
  
  // Granules de test
  const [granules] = useState([
    {
      id: 'g1',
      title: 'Introduction aux bases',
      content: 'Ce granule présente les concepts fondamentaux nécessaires pour comprendre le sujet. Il couvre les définitions essentielles et les principes de base.',
      type: 'Théorie'
    },
    {
      id: 'g2',
      title: 'Exemple pratique #1',
      content: 'Voici un exemple concret d\'application. Cet exercice vous permettra de mettre en pratique les notions théoriques abordées précédemment.',
      type: 'Exemple'
    },
    {
      id: 'g3',
      title: 'Points clés à retenir',
      content: '• Concept 1: Description importante\n• Concept 2: Autre élément essentiel\n• Concept 3: Point fondamental à comprendre',
      type: 'Résumé'
    },
    {
      id: 'g4',
      title: 'Exercice d\'application',
      content: 'Exercice: Appliquez les concepts vus dans ce chapitre pour résoudre le problème suivant. Prenez le temps de réfléchir à la solution.',
      type: 'Exercice'
    },
    {
      id: 'g5',
      title: 'Définition technique',
      content: 'Définition: Un système auteur est un logiciel permettant de créer des contenus pédagogiques structurés sans nécessiter de compétences en programmation.',
      type: 'Définition'
    }
  ]);

  const editorRef = useRef(null);

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

  const handleDragStart = (e, granule) => {
    e.dataTransfer.setData('granule', JSON.stringify(granule));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (e) => {
    const granuleData = e.dataTransfer.getData('granule');
    if (granuleData) {
      const granule = JSON.parse(granuleData);
      const newContent = editorContent 
        ? `${editorContent}\n\n=== ${granule.title} ===\n${granule.content}\n`
        : `=== ${granule.title} ===\n${granule.content}\n`;
      setEditorContent(newContent);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <TableOfContents 
        items={tableOfContents}
        expandedSections={expandedSections}
        onToggle={toggleSection}
      />

      <div className="flex-1 flex flex-col">
        <EditorToolbar 
          textFormat={textFormat}
          onFormatChange={applyFormat}
          onFontChange={handleFontChange}
          onFontSizeChange={handleFontSizeChange}
        />

        <EditorArea 
          content={editorContent}
          textFormat={textFormat}
          onChange={(e) => setEditorContent(e.target.value)}
          onDrop={handleDrop}
          editorRef={editorRef}
        />
      </div>

      <RightPanel 
        activePanel={rightPanel}
        onToggle={toggleRightPanel}
        granules={granules}
        onDragStart={handleDragStart}
      />
    </div>
  );
};

export default XCCM2Editor;