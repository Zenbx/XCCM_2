"use client";

import React, { useRef, useEffect } from 'react';

interface EditorAreaProps {
  content: string;
  textFormat: {
    font: string;
    fontSize: string;
  };
  onChange: (content: string) => void;
  onDrop: (e: React.DragEvent) => void;
  editorRef?: React.RefObject<HTMLDivElement>;
}

const EditorArea: React.FC<EditorAreaProps> = ({ 
  content, 
  textFormat, 
  onChange, 
  onDrop,
  editorRef: externalRef 
}) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const editorRef = externalRef || internalRef;
  const isInitialLoad = useRef(true);

  // Initialiser le contenu uniquement au chargement d'une nouvelle notion
  useEffect(() => {
    if (editorRef.current && isInitialLoad.current) {
      editorRef.current.innerHTML = content;
      isInitialLoad.current = false;
    }
  }, [content]);

  // Réinitialiser le flag quand le contenu change (nouvelle notion sélectionnée)
  useEffect(() => {
    isInitialLoad.current = true;
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('ring-2', 'ring-[#99334C]');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('ring-2', 'ring-[#99334C]');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-[#99334C]');
    onDrop(e);
  };

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
      <div 
        className="max-w-4xl mx-auto bg-white shadow-sm transition-all" 
        style={{ minHeight: '800px' }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="w-full h-full min-h-[800px] p-6 focus:outline-none text-black"
          style={{ 
            border: `2px solid #99334C`,
            borderRadius: `16px`,
            lineHeight: '1.6'
          }}
          onInput={handleInput}
          data-placeholder="Sélectionnez du texte et utilisez la barre d'outils pour le formater..."
        />
      </div>
      
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
          position: absolute;
        }
      `}</style>
    </div>
  );
};

export default EditorArea;