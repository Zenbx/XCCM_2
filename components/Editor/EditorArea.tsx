"use client";

import React, { useRef, useEffect, useState } from 'react';

interface EditorAreaProps {
  content: string;
  textFormat: {
    font: string;
    fontSize: string;
  };
  onChange: (content: string) => void;
  onDrop: (content: any) => void; // Modifié pour passer soit du contenu (string) soit un granule (objet)
  editorRef: React.RefObject<HTMLDivElement | null>;
  placeholder?: string;
}

const EditorArea: React.FC<EditorAreaProps> = ({
  content,
  textFormat,
  onChange,
  onDrop,
  editorRef,
  placeholder = "Sélectionnez une notion pour commencer à éditer..."
}) => {
  const isInitialLoad = useRef(true);
  const [internalPlaceholder, setInternalPlaceholder] = useState(placeholder);

  // Mettre à jour le placeholder si la prop change
  useEffect(() => {
    setInternalPlaceholder(placeholder);
  }, [placeholder]);

  // Initialiser le contenu
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== content) {
        // On ne met à jour que si le contenu est différent pour éviter de perdre la position du curseur
        // lors des petites mises à jour, sauf si c'est un changement de contexte (géré par le parent)
        editorRef.current.innerHTML = content;
      }
    }
  }, [content, editorRef]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('ring-2', 'ring-[#99334C]', 'bg-gray-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('ring-2', 'ring-[#99334C]', 'bg-gray-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('ring-2', 'ring-[#99334C]', 'bg-gray-50');

    const granuleData = e.dataTransfer.getData('granule');
    if (granuleData) {
      try {
        const granule = JSON.parse(granuleData);

        // Si c'est un granule de structure (Partie, Chapitre...), on délègue au parent pour l'import
        if (['part', 'chapter', 'paragraph', 'notion'].includes(granule.type)) {
          onDrop(granule);
          return;
        }

        const contentToAdd = granule.content || granule.granule_content || '';

        // Insertion intelligente à la position de la souris
        if (document.caretRangeFromPoint) {
          const range = document.caretRangeFromPoint(e.clientX, e.clientY);
          if (range && editorRef.current?.contains(range.startContainer)) {
            const textNode = document.createTextNode(contentToAdd);
            range.insertNode(textNode);
            // Nettoyage : placer le curseur après
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);

            // Déclencher la mise à jour
            handleInput();
            return;
          }
        }

        // Fallback: Si on ne peut pas déterminer la position, on appelle le handler parent
        // qui gérera l'ajout (souvent à la fin ou à la position du curseur actuel)
        onDrop(contentToAdd);

      } catch (err) {
        console.error("Erreur lors du drop:", err);
      }
    }
  };

  // Gestionnaire pour s'assurer qu'on peut cliquer et focuser facilement
  const handleClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && editorRef.current) {
      // Si on clique dans la zone grise mais pas dans l'éditeur, on focus l'éditeur
      editorRef.current.focus();
    }
  }

  return (
    <div
      className="flex-1 bg-gray-50 p-8 overflow-y-auto cursor-text"
      onClick={handleClick}
    >
      <div
        className="max-w-4xl mx-auto bg-white shadow-sm transition-all min-h-[800px]"
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="w-full h-full min-h-[800px] p-10 focus:outline-none text-black prose prose-lg max-w-none"
          style={{
            fontFamily: textFormat.font,
            // fontSize géré via execCommand pour des raisons de sélection, 
            // mais on peut mettre un défaut ici
            lineHeight: '1.6'
          }}
          onInput={handleInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          data-placeholder={internalPlaceholder}
        />
      </div>

      <style jsx global>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
          display: block; /* Important pour l'affichage */
        }
        /* Style pour la sélection */
        ::selection {
            background-color: #99334C33; /* Rouge transparent */
            color: inherit;
        }
      `}</style>
    </div>
  );
};

export default EditorArea;