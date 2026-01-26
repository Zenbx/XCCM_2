"use client";

import { AlignLeft, AlignCenter, AlignRight, Trash2, X, Command } from 'lucide-react';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SlashMenu } from './SlashMenu';
import { FloatingToolbar } from './FloatingToolbar';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import TiptapEditor from './TiptapEditor'; // ✅ Import de Tiptap
import { SocraticHighlight } from '@/extensions/SocraticExtension';

interface EditorAreaProps {
  docId: string;
  content: string;
  textFormat: {
    font: string;
    fontSize: string;
    color?: string;
  };
  onChange: (content: string, docId: string) => void;
  onEditorReady?: (editor: any) => void;
  onDrop: (content: any) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  placeholder?: string;
  isImporting?: boolean;
  readOnly?: boolean;
  // Nouvelles props pour les commandes structurelles
  onAddPart?: () => void;
  onAddChapter?: () => void;
  onAddParagraph?: () => void;
  onAddNotion?: () => void;
  onOpenChat?: () => void;
  onSave?: () => void;
  collaboration?: {
    provider: any;
    documentId: string;
    username: string;
    colors: string[];
    userColor: string;
    yDoc?: any;
  };
  socraticFeedback?: SocraticHighlight[];
  onSocraticHighlightClick?: (id: string, event: Event) => void;
}

const EditorArea: React.FC<EditorAreaProps> = ({
  docId,
  content,
  textFormat,
  onChange,
  onDrop,
  editorRef,
  placeholder = "Sélectionnez une notion pour commencer à éditer...",
  isImporting = false,
  readOnly = false,
  onAddPart,
  onAddChapter,
  onAddParagraph,
  onAddNotion,
  onOpenChat,
  onSave,
  onEditorReady,
  collaboration,
  socraticFeedback = [],
  onSocraticHighlightClick,
}) => {
  const isInitialLoad = useRef(true);
  const [internalPlaceholder, setInternalPlaceholder] = useState(placeholder);

  // États pour la gestion des images
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  // --- États Slash Menu (/) ---
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [slashFilter, setSlashFilter] = useState("");
  const slashTriggerIndex = useRef<number>(-1);

  // --- États Floating Toolbar ---
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [floatingToolbarPosition, setFloatingToolbarPosition] = useState({ top: 0, left: 0 });
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false
  });

  // Instance de l'éditeur Tiptap pour les commandes externes
  const [tiptapInstance, setTiptapInstance] = useState<any>(null);

  useEffect(() => {
    setInternalPlaceholder(placeholder);
  }, [placeholder]);

  // Tiptap gère sa propre synchronisation via onUpdate, 
  // on n'a plus besoin du useEffect qui injecte innerHTML

  // Tiptap gère désormais la sélection via handleSelectionUpdate

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
            tiptapInstance?.chain().focus().insertContent(img).run();
            handleTiptapUpdate(tiptapInstance?.getHTML() || '', docId);
          }
        };
        reader.readAsDataURL(blob);
        return; // On arrête après avoir traité une image
      }
    }
  };

  // Tiptap gère désormais la sélection et le focus

  // Mise à jour de la taille de l'image sélectionnée
  const updateImageSize = (size: string) => {
    if (selectedImage && tiptapInstance) {
      // On passe par Tiptap pour la mise à jour des attributs, ce qui déclenchera handleSelectionUpdate
      const currentStyle = selectedImage.getAttribute('style') || '';
      // On remplace ou ajoute width
      let newStyle = currentStyle.replace(/width:[^;]+;?/, '').trim();
      newStyle += ` width: ${size}; height: auto;`;

      tiptapInstance.chain().focus().updateAttributes('image', { style: newStyle }).run();
      handleTiptapUpdate(tiptapInstance.getHTML(), docId);
    }
  };

  // Mise à jour de l'alignement de l'image
  const updateImageAlign = (align: 'left' | 'center' | 'right') => {
    if (selectedImage && tiptapInstance) {
      const currentStyle = selectedImage.getAttribute('style') || '';
      let newStyle = currentStyle
        .replace(/display:[^;]+;?/, '')
        .replace(/margin:[^;]+;?/, '')
        .replace(/float:[^;]+;?/, '')
        .trim();

      if (align === 'center') {
        newStyle += ' display: block; margin: 0 auto; float: none;';
      } else if (align === 'left') {
        newStyle += ' display: block; float: left; margin: 0 1rem 1rem 0;';
      } else if (align === 'right') {
        newStyle += ' display: block; float: right; margin: 0 0 1rem 1rem;';
      }

      tiptapInstance.chain().focus().updateAttributes('image', { style: newStyle }).run();
      handleTiptapUpdate(tiptapInstance.getHTML(), docId);
    }
  };

  // Suppression de l'image
  const deleteSelectedImage = () => {
    if (selectedImage) {
      // Supprimer via Tiptap si possible
      if (tiptapInstance) {
        tiptapInstance.commands.deleteSelection();
      } else {
        selectedImage.remove();
      }
      setSelectedImage(null);
      handleTiptapUpdate(tiptapInstance?.getHTML() || '', docId);
    }
  };

  // Tiptap gère désormais les changements via handleTiptapUpdate

  const handleSlashSelect = (command: any) => {
    if (!tiptapInstance) return;

    // Supprimer le texte '/' et le filtre via Tiptap
    const { selection } = tiptapInstance.state;
    tiptapInstance.chain()
      .focus()
      .deleteRange({ from: slashTriggerIndex.current, to: selection.from })
      .run();

    // Attendre un tick pour s'assurer que le contenu est mis à jour
    setTimeout(() => {
      // Exécuter l'action
      if (command.id === 'image') {
        onInsertImage();
      } else if (command.id === 'part' && onAddPart) {
        onAddPart();
      } else if (command.id === 'chapter' && onAddChapter) {
        onAddChapter();
      } else if (command.id === 'paragraph' && onAddParagraph) {
        onAddParagraph();
      } else if (command.id === 'notion' && onAddNotion) {
        onAddNotion();
      } else if (command.id === 'chat' || command.id === 'ai') {
        onOpenChat?.();
      } else if (command.id === 'save' && onSave) {
        onSave();
      } else if (command.id === 'note') {
        (tiptapInstance as any).chain().focus().setNoteBlock().run();
      } else if (command.id === 'capture') {
        (tiptapInstance as any).chain().focus().setCaptureZoneBlock().run();
      } else if (command.id === 'math') {
        (tiptapInstance as any).chain().focus().setMathBlock().run();
      } else if (command.id === 'quiz') {
        (tiptapInstance as any).chain().focus().setQuizBlock().run();
      } else if (command.id === 'hint') {
        (tiptapInstance as any).chain().focus().setDiscoveryHint().run();
      } else if (command.id === 'code') {
        (tiptapInstance as any).chain().focus().setCoderunnerBlock().run();
      } else if (command.id === 'h1') {
        tiptapInstance.chain().focus().toggleHeading({ level: 1 }).run();
      } else if (command.id === 'h2') {
        tiptapInstance.chain().focus().toggleHeading({ level: 2 }).run();
      } else if (command.id === 'ul') {
        tiptapInstance.chain().focus().toggleBulletList().run();
      } else if (command.id === 'ol') {
        tiptapInstance.chain().focus().toggleOrderedList().run();
      } else {
        command.action?.();
      }

      setShowSlashMenu(false);
      tiptapInstance?.commands.focus();
    }, 10);

    setShowSlashMenu(false);
    tiptapInstance?.commands.focus();
    handleTiptapUpdate(tiptapInstance?.getHTML() || '', docId);
  };

  const onInsertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const img = `<img src="${event.target.result}" style="max-width: 100%; height: auto; display: block; margin: 20px auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />`;
            tiptapInstance?.chain().focus().insertContent(img).run();
            handleTiptapUpdate(tiptapInstance?.getHTML() || '', docId);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
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

        if (tiptapInstance) {
          tiptapInstance.commands.focus();
          tiptapInstance.commands.insertContent(contentToAdd);
          handleTiptapUpdate(tiptapInstance.getHTML(), docId);
          return;
        }

        onDrop(contentToAdd);

      } catch (err) {
        console.error("Erreur lors du drop:", err);
      }
    }
  };

  // Nouvelle gestion Tiptap
  const handleTiptapUpdate = (html: string, updateDocId: string) => {
    onChange(html, updateDocId);

    if (tiptapInstance) {
      const { selection } = tiptapInstance.state;
      const { $from } = selection;
      const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);

      // Détection du '/'
      if (textBefore.endsWith('/')) {
        const coords = tiptapInstance.view.coordsAtPos($from.pos);
        setSlashMenuPosition({ top: coords.top, left: coords.left });
        setShowSlashMenu(true);
        setSlashFilter("");
        slashTriggerIndex.current = $from.pos - 1;
      } else if (showSlashMenu) {
        // Mise à jour du filtre
        const filterText = textBefore.slice(textBefore.lastIndexOf('/') + 1);
        if (filterText.includes(" ")) {
          setShowSlashMenu(false);
        } else {
          setSlashFilter(filterText);
        }
      }
    }
  };

  const handleSelectionUpdate = (editor: any) => {
    setTiptapInstance(editor);
    onEditorReady?.(editor);

    const { selection } = editor.state;
    // Détection de sélection d'image (NodeSelection)
    if (selection.node && selection.node.type.name === 'image') {
      const { view } = editor;
      const coords = view.coordsAtPos(selection.from);

      // Essayer de récupérer le nœud DOM pour avoir la largeur exacte pour le centrage
      const domNode = view.nodeDOM(selection.from);
      const rect = domNode instanceof HTMLElement ? domNode.getBoundingClientRect() : null;

      setSelectedImage(domNode instanceof HTMLElement ? (domNode.querySelector('img') || domNode as any) : null);

      setToolbarPosition({
        top: coords.top - 60,
        left: rect ? rect.left + (rect.width / 2) - 150 : coords.left - 150
      });
    } else {
      setSelectedImage(null);
    }

    if (readOnly || showSlashMenu || selection.empty || (selection.node && selection.node.type.name === 'image')) {
      setShowFloatingToolbar(false);
      return;
    }

    // Calculer position via Tiptap coordsAtPos (plus stable que le DOM direct)
    const { view } = editor;
    const fromCoords = view.coordsAtPos(selection.from);
    const toCoords = view.coordsAtPos(selection.to);

    setFloatingToolbarPosition({
      top: fromCoords.top,
      left: (fromCoords.left + toCoords.left) / 2
    });
    setShowFloatingToolbar(true);

    // États des formats via Tiptap
    setActiveFormats({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      strikethrough: editor.isActive('strike')
    });
  };

  // Gestionnaire pour s'assurer qu'on peut cliquer et focuser facilement
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Si on clique sur le fond gris ou à côté du papier blanc
    // On focuse la fin du document, mais seulement si on ne clique pas sur un élément interactif
    const isInteractive = target.closest('button, a, input, [role="button"]');

    if (editorRef.current && !editorRef.current.contains(target) && !isInteractive) {
      // Un petit setTimeout aide souvent à assurer que le focus est bien pris après les évènements de clic par défaut
      setTimeout(() => {
        if (tiptapInstance) {
          tiptapInstance.commands.focus('end');
        }
      }, 0);
    }
  };

  return (
    <div
      className="flex-1 bg-gray-50 dark:bg-gray-950 p-8 overflow-y-auto cursor-text transition-colors duration-300"
      onClick={handleClick}
    >
      <div
        className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-sm transition-all min-h-[800px] dark:border dark:border-gray-800"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-full h-full p-10">
          <TiptapEditor
            key={docId} // ✅ FORCE LE RE-MONTAGE : Détruit l'ancien éditeur, crée un nouveau (ZÉRO FUITE)
            docId={docId}
            content={content}
            onChange={handleTiptapUpdate}
            placeholder={internalPlaceholder}
            readOnly={readOnly}
            textFormat={textFormat}
            collaboration={collaboration}
            onSelectionChange={handleSelectionUpdate}
            onReady={(editor) => {
              setTiptapInstance(editor);
              onEditorReady?.(editor);
            }}
            socraticFeedback={socraticFeedback}
            onSocraticHighlightClick={onSocraticHighlightClick}
            className="prose prose-lg max-w-none text-black dark:text-gray-100"
          />
        </div>

        {/* Floating Toolbar Selection */}
        <FloatingToolbar
          isVisible={showFloatingToolbar}
          position={floatingToolbarPosition}
          onFormat={(cmd) => {
            if (!tiptapInstance) return;

            const chain = tiptapInstance.chain().focus();

            switch (cmd) {
              case 'bold': chain.toggleBold().run(); break;
              case 'italic': chain.toggleItalic().run(); break;
              case 'underline': chain.toggleUnderline().run(); break;
              case 'strikethrough': chain.toggleStrike().run(); break;
              default:
                if (cmd.startsWith('foreColor:')) {
                  chain.setColor(cmd.split(':')[1]).run();
                } else if (cmd.startsWith('hiliteColor:')) {
                  chain.toggleHighlight({ color: cmd.split(':')[1] }).run();
                }
                break;
            }

            handleTiptapUpdate(tiptapInstance.getHTML(), docId);
          }}
          activeFormats={activeFormats}
        />

        {/* Slash Menu (/) */}
        <AnimatePresence>
          {showSlashMenu && (
            <SlashMenu
              position={slashMenuPosition}
              filter={slashFilter}
              onClose={() => setShowSlashMenu(false)}
              onSelect={handleSlashSelect}
            />
          )}
        </AnimatePresence>

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
    </div >
  );
};

export default EditorArea;