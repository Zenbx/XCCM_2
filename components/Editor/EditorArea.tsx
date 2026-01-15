"use client";

import { AlignLeft, AlignCenter, AlignRight, Trash2, X } from 'lucide-react';
import React, { useRef, useEffect, useState } from 'react';

interface EditorAreaProps {
  content: string;
  textFormat: {
    font: string;
    fontSize: string;
  };
  onChange: (content: string) => void;
  onDrop: (content: any) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  placeholder?: string;
  isImporting?: boolean;
  readOnly?: boolean;
}

const EditorArea: React.FC<EditorAreaProps> = ({
  content,
  textFormat,
  onChange,
  onDrop,
  editorRef,
  placeholder = "Sélectionnez une notion pour commencer à éditer...",
  isImporting = false,
  readOnly = false
}) => {
  const isInitialLoad = useRef(true);
  const [internalPlaceholder, setInternalPlaceholder] = useState(placeholder);

  // États pour la gestion des images
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setInternalPlaceholder(placeholder);
  }, [placeholder]);

  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [content, editorRef]);

  // Gestionnaire de copier-coller pour les images
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        if (!blob) continue;

        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const img = `<img src="${event.target.result}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />`;
            document.execCommand('insertHTML', false, img);
            handleInput(); // Notifier le changement
          }
        };
        reader.readAsDataURL(blob);
        return; // On arrête après avoir traité une image
      }
    }
  };

  // Gestion du clic pour sélectionner/désélectionner une image
  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Si on clique sur une image
    if (target.tagName === 'IMG') {
      e.stopPropagation(); // Empêcher la perte de focus immédiate
      const img = target as HTMLImageElement;
      setSelectedImage(img);

      // Calculer la position de la toolbar
      const rect = img.getBoundingClientRect();
      // Centrer au-dessus de l'image
      setToolbarPosition({
        top: Math.max(10, rect.top - 60), // 60px au-dessus, min 10px du haut
        left: Math.max(10, rect.left + (rect.width / 2) - 150) // Centré horizontalement (-150px largeur approx / 2)
      });

      // Ajouter une outline visuelle à l'image
      // On enlève d'abord l'outline des autres
      const allImages = editorRef.current?.getElementsByTagName('img');
      if (allImages) {
        for (let i = 0; i < allImages.length; i++) {
          allImages[i].style.outline = 'none';
        }
      }
      img.style.outline = '3px solid #99334C';

    } else {
      // Si on clique ailleurs, on désélectionne
      if (selectedImage) {
        selectedImage.style.outline = 'none';
        setSelectedImage(null);
      }

      // Focus l'éditeur si on clique dans la zone vide
      if (target === e.currentTarget && editorRef.current) {
        editorRef.current.focus();
      }
    }
  };

  // Mise à jour de la taille de l'image sélectionnée
  const updateImageSize = (size: string) => {
    if (selectedImage) {
      selectedImage.style.width = size;
      selectedImage.style.height = 'auto'; // Garder le ratio
      handleInput();

      // Recalculer la position de la toolbar
      setTimeout(() => {
        const rect = selectedImage.getBoundingClientRect();
        setToolbarPosition({
          top: Math.max(10, rect.top - 60),
          left: Math.max(10, rect.left + (rect.width / 2) - 150)
        });
      }, 50);
    }
  };

  // Mise à jour de l'alignement de l'image
  const updateImageAlign = (align: 'left' | 'center' | 'right') => {
    if (selectedImage) {
      if (align === 'center') {
        selectedImage.style.display = 'block';
        selectedImage.style.margin = '0 auto';
        selectedImage.style.float = 'none';
      } else if (align === 'left') {
        selectedImage.style.display = 'block';
        selectedImage.style.float = 'left';
        selectedImage.style.margin = '0 1rem 1rem 0';
      } else if (align === 'right') {
        selectedImage.style.display = 'block';
        selectedImage.style.float = 'right';
        selectedImage.style.margin = '0 0 1rem 1rem';
      }
      handleInput();

      // Recalculer position
      setTimeout(() => {
        const rect = selectedImage.getBoundingClientRect();
        setToolbarPosition({
          top: Math.max(10, rect.top - 60),
          left: Math.max(10, rect.left + (rect.width / 2) - 150)
        });
      }, 50);
    }
  };

  // Suppression de l'image
  const deleteSelectedImage = () => {
    if (selectedImage) {
      selectedImage.remove();
      setSelectedImage(null);
      handleInput();
    }
  };

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

        if (['part', 'chapter', 'paragraph', 'notion'].includes(granule.type)) {
          onDrop(granule);
          return;
        }

        const contentToAdd = granule.content || granule.granule_content || '';

        if (document.caretRangeFromPoint) {
          const range = document.caretRangeFromPoint(e.clientX, e.clientY);
          if (range && editorRef.current?.contains(range.startContainer)) {
            const textNode = document.createTextNode(contentToAdd);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);

            handleInput();
            return;
          }
        }

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
          contentEditable={!readOnly}
          suppressContentEditableWarning
          className={`w-full h-full min-h-[800px] p-10 focus:outline-none text-black prose prose-lg max-w-none ${readOnly ? 'bg-gray-50/50 cursor-not-allowed opacity-80 transition-all duration-300' : 'bg-white transition-all duration-300'}`}
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
          onPaste={handlePaste}
          onClick={handleEditorClick}
          data-placeholder={internalPlaceholder}
        />

        {/* Toolbar Image */}
        {selectedImage && (
          <div
            className="fixed bg-white shadow-xl border border-gray-200 rounded-lg p-2 flex gap-2 items-center z-50 animate-in fade-in zoom-in-95 duration-200"
            style={{
              top: toolbarPosition.top,
              left: toolbarPosition.left,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
              <button onClick={() => updateImageSize('25%')} className="p-1.5 hover:bg-gray-100 rounded text-xs font-medium text-gray-700" title="Petit">25%</button>
              <button onClick={() => updateImageSize('50%')} className="p-1.5 hover:bg-gray-100 rounded text-xs font-medium text-gray-700" title="Moyen">50%</button>
              <button onClick={() => updateImageSize('75%')} className="p-1.5 hover:bg-gray-100 rounded text-xs font-medium text-gray-700" title="Grand">75%</button>
              <button onClick={() => updateImageSize('100%')} className="p-1.5 hover:bg-gray-100 rounded text-xs font-medium text-gray-700" title="Plein">100%</button>
            </div>

            <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
              <button onClick={() => updateImageAlign('left')} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded" title="Aligner à gauche"><AlignLeft size={16} /></button>
              <button onClick={() => updateImageAlign('center')} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded" title="Centrer"><AlignCenter size={16} /></button>
              <button onClick={() => updateImageAlign('right')} className="p-1.5 text-gray-700 hover:bg-gray-100 rounded" title="Aligner à droite"><AlignRight size={16} /></button>
            </div>

            <button onClick={deleteSelectedImage} className="p-1.5 hover:bg-red-50 text-red-600 rounded" title="Supprimer">
              <Trash2 size={16} />
            </button>
            <button onClick={() => setSelectedImage(null)} className="p-1.5 hover:bg-gray-100 text-gray-400 rounded">
              <X size={16} />
            </button>
          </div>
        )}
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
        /* Fix pour l'affichage des listes dans le contenteditable */
        [contenteditable] ul {
            list-style-type: disc !important;
            padding-left: 1.5rem !important;
            margin-bottom: 1rem !important;
        }
        [contenteditable] ol {
            list-style-type: decimal !important;
            padding-left: 1.5rem !important;
            margin-bottom: 1rem !important;
        }
        [contenteditable] li {
            display: list-item !important;
            margin-bottom: 0.25rem !important;
        }
      `}</style>
    </div>
  );
};

export default EditorArea;