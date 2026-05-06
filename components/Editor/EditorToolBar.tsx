"use client";

import React from 'react';
import {
  Bot,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  List,
  ListOrdered,
  Image as ImageIcon,
  Minimize2,
  Maximize2,
  IndentIncrease,
  IndentDecrease,
  Undo,
  Redo,
  GitFork
} from 'lucide-react';
import RichTooltip from '@/components/UI/RichTooltip';
import { DiscoveryTooltip } from '@/components/Onboarding/DiscoveryTooltip';

interface EditorToolbarProps {
  onFormatChange: (format: string) => void;
  onFontChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onFontSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onChatToggle: () => void;
  onInsertImage?: () => void;
  textFormat: {
    font: string;
    fontSize: string;
    color?: string;
  };
  disabled?: boolean;
  isZenMode?: boolean;
  onToggleZen?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onToggleMindMap?: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFormatChange,
  onFontChange,
  onFontSizeChange,
  onChatToggle,
  onInsertImage,
  textFormat,
  disabled = false,
  isZenMode = false,
  onToggleZen,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onToggleMindMap,
}) => {
  return (
    <div id="editor-toolbar" className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-1.5 flex items-center gap-1 transition-all duration-300 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 whitespace-nowrap hide-scrollbar ${disabled ? 'opacity-40 pointer-events-none select-none' : ''
      }`}>

      <RichTooltip title="Police" description="Changer la famille de police du texte sélectionné.">
        <select
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-[#99334C]"
          value={textFormat.font}
          onChange={onFontChange}
        >
          <option>Arial</option>
          <option>Times New Roman</option>
          <option>Calibri</option>
          <option>Verdana</option>
          <option>Georgia</option>
          <option>Courier New</option>
          <option>Comic Sans MS</option>
        </select>
      </RichTooltip>

      <RichTooltip title="Taille" description="Ajuster la taille de la police pour mettre en relief votre contenu.">
        <select
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm w-16 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-[#99334C]"
          value={textFormat.fontSize}
          onChange={onFontSizeChange}
        >
          {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36].map(size => (
            <option key={size}>{size}</option>
          ))}
        </select>
      </RichTooltip>

      <div className="w-[1.5px] h-6 bg-gray-300 mx-1 flex-shrink-0" />

      <RichTooltip title="Gras" description="Mettre le texte en évidence." shortcut="Ctrl+B">
        <button aria-label="Gras" className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors" onClick={() => onFormatChange('bold')}><Bold size={18} aria-hidden="true" /></button>
      </RichTooltip>

      <RichTooltip title="Italique" description="Incliner le texte pour les citations ou l'emphase." shortcut="Ctrl+I">
        <button aria-label="Italique" className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors" onClick={() => onFormatChange('italic')}><Italic size={18} aria-hidden="true" /></button>
      </RichTooltip>

      <RichTooltip title="Souligné" description="Ajouter une ligne sous le texte." shortcut="Ctrl+U">
        <button aria-label="Souligné" className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors" onClick={() => onFormatChange('underline')}><Underline size={18} aria-hidden="true" /></button>
      </RichTooltip>

      <RichTooltip title="Barré" description="Barrer le texte pour indiquer une suppression.">
        <button aria-label="Barré" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-700 dark:text-gray-300 transition-colors" onClick={() => onFormatChange('strikethrough')}><Strikethrough size={18} aria-hidden="true" /></button>
      </RichTooltip>

      <div className="w-[1.5px] h-6 bg-gray-300 mx-1 flex-shrink-0" />

      <RichTooltip title="Gauche" description="Aligner le texte sur la marge gauche." shortcut="Ctrl+Maj+L">
        <button aria-label="Aligner à gauche" className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors" onClick={() => onFormatChange('justifyLeft')}><AlignLeft size={18} aria-hidden="true" /></button>
      </RichTooltip>

      <RichTooltip title="Centrer" description="Centrer le texte au milieu de la page." shortcut="Ctrl+Maj+E">
        <button aria-label="Centrer" className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors" onClick={() => onFormatChange('justifyCenter')}><AlignCenter size={18} aria-hidden="true" /></button>
      </RichTooltip>

      <RichTooltip title="Droite" description="Aligner le texte sur la marge droite." shortcut="Ctrl+Maj+R">
        <button aria-label="Aligner à droite" className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors" onClick={() => onFormatChange('justifyRight')}><AlignRight size={18} aria-hidden="true" /></button>
      </RichTooltip>

      <RichTooltip title="Justifier" description="Aligner le texte sur les deux marges." shortcut="Ctrl+Maj+J">
        <button aria-label="Justifier" className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors" onClick={() => onFormatChange('justifyFull')}><AlignJustify size={18} aria-hidden="true" /></button>
      </RichTooltip>

      <div className="w-[1.5px] h-6 bg-gray-300 mx-1 flex-shrink-0" />

      <RichTooltip title="Augmenter le retrait" description="Décaler le paragraphe vers la droite." shortcut="Tab">
        <button aria-label="Augmenter le retrait" className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors" onClick={() => onFormatChange('indent')}><IndentIncrease size={18} aria-hidden="true" /></button>
      </RichTooltip>

      <RichTooltip title="Diminuer le retrait" description="Décaler le paragraphe vers la gauche." shortcut="Maj+Tab">
        <button aria-label="Diminuer le retrait" className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors" onClick={() => onFormatChange('outdent')}><IndentDecrease size={18} aria-hidden="true" /></button>
      </RichTooltip>

      <div className="w-[1.5px] h-6 bg-gray-300 dark:bg-gray-700 mx-1 flex-shrink-0" />

      <RichTooltip title="Couleur" description="Changer la couleur du texte sélectionné.">
        <div className="flex items-center gap-1.5 p-1 hover:bg-gray-100 rounded transition-colors group relative cursor-pointer">
          <Palette size={18} className="text-gray-700" aria-hidden="true" />
          <input
            type="color"
            className="w-5 h-5 rounded-full border-none cursor-pointer bg-transparent absolute inset-0 opacity-0"
            onChange={(e) => onFormatChange(`color:${e.target.value}`)}
            title="Choisir une couleur"
          />
          <div
            className="w-3 h-3 rounded-full border border-gray-200 shadow-sm"
            style={{ backgroundColor: textFormat.color || '#000000' }}
          />
        </div>
      </RichTooltip>

      <div className="w-[1.5px] h-6 bg-gray-300 mx-1 flex-shrink-0" />

      <RichTooltip title="Puces" description="Créer une liste non ordonnée." shortcut="Ctrl+Maj+8">
        <button aria-label="Liste à puces" className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors" onClick={() => onFormatChange('insertUnorderedList')}><List size={18} aria-hidden="true" /></button>
      </RichTooltip>

      <RichTooltip title="Numéros" description="Créer une liste numérotée séquentielle." shortcut="Ctrl+Maj+7">
        <button aria-label="Liste numérotée" className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors" onClick={() => onFormatChange('insertOrderedList')}><ListOrdered size={18} aria-hidden="true" /></button>
      </RichTooltip>

      <div className="flex-1"></div>

      <div className="w-[1.5px] h-6 bg-gray-300 mx-1 flex-shrink-0" />

      <RichTooltip title="Annuler" description="Annuler la dernière action." shortcut="Ctrl+Z">
        <button
          aria-label="Annuler"
          className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors disabled:opacity-30"
          onClick={() => {
            onUndo?.();
            onFormatChange('undo');
          }}
          disabled={!canUndo}
        >
          <Undo size={18} aria-hidden="true" />
        </button>
      </RichTooltip>

      <RichTooltip title="Rétablir" description="Rétablir l'action annulée." shortcut="Ctrl+Y">
        <button
          aria-label="Rétablir"
          className="p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors disabled:opacity-30"
          onClick={() => {
            onRedo?.();
            onFormatChange('redo');
          }}
          disabled={!canRedo}
        >
          <Redo size={18} aria-hidden="true" />
        </button>
      </RichTooltip>

      <div className="w-[1.5px] h-6 bg-gray-300 mx-1 flex-shrink-0" />

      <DiscoveryTooltip featureId="zen-mode" title="Mode Zen" description="Masquez toute l'interface pour écrire sans distraction. Appuyez sur Échap pour revenir." placement="bottom">
        <RichTooltip title={isZenMode ? "Quitter Zen" : "Mode Zen"} description="Masquer l'interface pour une concentration totale sur l'écriture." shortcut="Alt+Z">
          <button
            onClick={onToggleZen}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm border font-bold transition-all shadow-sm ${isZenMode
              ? 'bg-[#99334C] text-white border-[#99334C] hover:bg-[#7a283d]'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
          >
            {isZenMode ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
            {isZenMode ? "Quitter Zen" : "Zen Mode"}
          </button>
        </RichTooltip>
      </DiscoveryTooltip>

      <div className="w-[1.5px] h-6 bg-gray-300 mx-1 flex-shrink-0" />

      <DiscoveryTooltip featureId="mind-map" title="Vue Mind Map" description="Visualisez votre cours entier sous forme de graphe interactif. Glissez-déposez pour réorganiser." placement="bottom" accentColor="#1e40af">
        <RichTooltip title="Vue Mind Map" description="Visualiser tout le projet sous forme de graphe de noeuds. Double-cliquer pour éditer.">
          <button
            onClick={onToggleMindMap}
            className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm border font-bold transition-all shadow-sm bg-white text-[#1e40af] border-[#1e40af]/30 hover:bg-[#1e40af]/5"
          >
            <GitFork size={16} aria-hidden="true" />
            Mind Map
          </button>
        </RichTooltip>
      </DiscoveryTooltip>

      {!isZenMode && (
        <>
          <div className="w-[1.5px] h-6 bg-gray-300 mx-2 flex-shrink-0" />

          <RichTooltip title="Image" description="Insérer une image depuis votre appareil ou une URL.">
            <button
              aria-label="Insérer une image"
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={onInsertImage}
            >
              <ImageIcon size={18} aria-hidden="true" />
            </button>
          </RichTooltip>

        </>
      )}
    </div>
  );
};

export default EditorToolbar;