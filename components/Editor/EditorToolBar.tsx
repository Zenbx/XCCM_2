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
  Image as ImageIcon,
  Minimize2,
  Maximize2
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
  isZenMode?: boolean;
  onToggleZen?: () => void;
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
}) => {
  return (
    <div className={`bg-white border-b border-gray-200 p-2 flex items-center gap-1 sticky top-0 z-30 ${disabled ? 'opacity-40 pointer-events-none select-none' : ''
      }`}>
      {/* ... existing font/size selects ... */}
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

      <button className="px-2 py-1 hover:bg-gray-100 rounded text-black" onClick={() => onFormatChange('bold')} title="Gras (Ctrl+B)"><Bold size={18} /></button>
      <button className="px-2 py-1 hover:bg-gray-100 rounded text-black" onClick={() => onFormatChange('italic')} title="Italique (Ctrl+I)"><Italic size={18} /></button>
      <button className="px-2 py-1 hover:bg-gray-100 rounded text-black" onClick={() => onFormatChange('underline')} title="Souligné (Ctrl+U)"><Underline size={18} /></button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button className="px-2 py-1 hover:bg-gray-100 rounded text-black" onClick={() => onFormatChange('justifyLeft')} title="Aligner à gauche"><AlignLeft size={18} /></button>
      <button className="px-2 py-1 hover:bg-gray-100 rounded text-black" onClick={() => onFormatChange('justifyCenter')} title="Centrer"><AlignCenter size={18} /></button>
      <button className="px-2 py-1 hover:bg-gray-100 rounded text-black" onClick={() => onFormatChange('justifyRight')} title="Aligner à droite"><AlignRight size={18} /></button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button className="px-2 py-1 hover:bg-gray-100 rounded text-black" onClick={() => onFormatChange('insertUnorderedList')} title="Liste à puces"><List size={18} /></button>
      <button className="px-2 py-1 hover:bg-gray-100 rounded text-black" onClick={() => onFormatChange('insertOrderedList')} title="Liste numérotée"><ListOrdered size={18} /></button>

      <div className="flex-1"></div>

      <button
        onClick={onToggleZen}
        className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm border font-bold transition-all ${isZenMode
            ? 'bg-[#99334C] text-white border-[#99334C]'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        title={isZenMode ? "Quitter le Mode Zen" : "Passer en Mode Zen"}
      >
        {isZenMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        {isZenMode ? "Quitter Zen" : "Zen Mode"}
      </button>

      {!isZenMode && (
        <>
          <button
            className="px-3 py-1.5 rounded text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm border border-gray-200 ml-2"
            onClick={onInsertImage}
          >
            <ImageIcon size={16} /> Image
          </button>

          <button
            className="px-4 py-1.5 rounded text-white flex items-center gap-2 text-sm hover:opacity-90 shadow-sm transition-all hover:shadow-md ml-2"
            style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
            onClick={onChatToggle}
          >
            <Bot size={16} /> Assistant
          </button>
        </>
      )}
    </div>
  );
};

export default EditorToolbar;