"use client";

import React from 'react';
import {
  Bot,
  Eye,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Image as ImageIcon
} from 'lucide-react';

interface EditorToolbarProps {
  onFormatChange: (format: string) => void;
  onFontChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onFontSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onChatToggle: () => void;
  onInsertImage: () => void;
  textFormat: {
    font: string;
    fontSize: string;
  };
  disabled?: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFormatChange,
  onFontChange,
  onFontSizeChange,
  onChatToggle,
  onInsertImage,
  textFormat,
  disabled = false,
}) => {
  return (
    <div className={`bg-white border-b border-gray-200 p-2 flex items-center gap-1 ${
      disabled ? 'opacity-40 pointer-events-none select-none' : ''
    }`}>

        {disabled && (
        <div className="absolute inset-0 bg-gray-100/30 backdrop-blur-[1px] flex items-center justify-center z-10">
          <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
            📝 Sélectionnez une Partie ou une Notion pour éditer
          </span>
        </div>
      )}
      {/* Police */}
      <select
        className="px-2 py-1 border border-gray-300 rounded text-sm bg-white text-black"
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

      {/* Taille */}
      <select
        className="px-2 py-1 border border-gray-300 rounded text-sm w-16 bg-white text-black"
        value={textFormat.fontSize}
        onChange={onFontSizeChange}
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
        <option>28</option>
        <option>32</option>
        <option>36</option>
      </select>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Formatage de texte */}
      <button
        className="px-2 py-1 hover:bg-gray-100 rounded text-black"
        onClick={() => onFormatChange('bold')}
        title="Gras (Ctrl+B)"
      >
        <Bold size={18} />
      </button>

      <button
        className="px-2 py-1 hover:bg-gray-100 rounded text-black"
        onClick={() => onFormatChange('italic')}
        title="Italique (Ctrl+I)"
      >
        <Italic size={18} />
      </button>

      <button
        className="px-2 py-1 hover:bg-gray-100 rounded text-black"
        onClick={() => onFormatChange('underline')}
        title="Souligné (Ctrl+U)"
      >
        <Underline size={18} />
      </button>

      <button
        className="px-2 py-1 hover:bg-gray-100 rounded text-black"
        onClick={() => onFormatChange('strikethrough')}
        title="Barré"
      >
        <Strikethrough size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Alignement */}
      <button
        className="px-2 py-1 hover:bg-gray-100 rounded text-black"
        onClick={() => onFormatChange('justifyLeft')}
        title="Aligner à gauche"
      >
        <AlignLeft size={18} />
      </button>

      <button
        className="px-2 py-1 hover:bg-gray-100 rounded text-black"
        onClick={() => onFormatChange('justifyCenter')}
        title="Centrer"
      >
        <AlignCenter size={18} />
      </button>

      <button
        className="px-2 py-1 hover:bg-gray-100 rounded text-black"
        onClick={() => onFormatChange('justifyRight')}
        title="Aligner à droite"
      >
        <AlignRight size={18} />
      </button>

      <button
        className="px-2 py-1 hover:bg-gray-100 rounded text-black"
        onClick={() => onFormatChange('justifyFull')}
        title="Justifier"
      >
        <AlignJustify size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Listes */}
      <button
        className="px-2 py-1 hover:bg-gray-100 rounded text-black"
        onClick={() => onFormatChange('insertUnorderedList')}
        title="Liste à puces"
      >
        <List size={18} />
      </button>

      <button
        className="px-2 py-1 hover:bg-gray-100 rounded text-black"
        onClick={() => onFormatChange('insertOrderedList')}
        title="Liste numérotée"
      >
        <ListOrdered size={18} />
      </button>

      <div className="flex-1"></div>

      {/* Actions */}
      <button
        className="px-3 py-1.5 rounded text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm border border-gray-200 mr-2"
        onClick={onInsertImage}
        title="Insérer une image"
      >
        <ImageIcon size={16} />
        Image
      </button>

      <button
        className="px-4 py-1.5 rounded text-white flex items-center gap-2 text-sm hover:opacity-90 shadow-sm transition-all hover:shadow-md"
        style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }} // Couleur style Gemini vert/bleu ou gardons le thème
        onClick={onChatToggle}
      >
        <Bot size={16} />
        IA Assistant
      </button>
    </div>
  );
};

export default EditorToolbar;