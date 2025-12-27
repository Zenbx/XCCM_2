"use client";

import React from 'react';
import { Bot, Eye } from 'lucide-react';

// ============= COMPOSANT: EditorToolBar =============



const EditorToolbar = ({ textFormat, onFormatChange, onFontChange, onFontSizeChange }) => {
  return (
    <div className="bg-white border-b border-gray-200 p-2 flex items-center gap-1">
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
      </select>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button 
        className={`px-2 py-1 hover:bg-gray-100 rounded font-bold text-black ${textFormat.bold ? 'bg-gray-200' : ''}`}
        onClick={() => onFormatChange('bold')}
        title="Gras"
      >
        B
      </button>
      
      <button 
        className={`px-2 py-1 hover:bg-gray-100 rounded italic text-black ${textFormat.italic ? 'bg-gray-200' : ''}`}
        onClick={() => onFormatChange('italic')}
        title="Italique"
      >
        I
      </button>
      
      <button 
        className={`px-2 py-1 hover:bg-gray-100 rounded underline text-black ${textFormat.underline ? 'bg-gray-200' : ''}`}
        onClick={() => onFormatChange('underline')}
        title="Souligné"
      >
        U
      </button>
      
      <button 
        className={`px-2 py-1 hover:bg-gray-100 rounded text-black ${textFormat.strikethrough ? 'bg-gray-200' : ''}`}
        onClick={() => onFormatChange('strikethrough')}
        title="Barré"
        style={{ textDecoration: 'line-through' }}
      >
        S
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button 
        className={`px-2 py-1 hover:bg-gray-100 rounded text-black text-sm ${textFormat.subscript ? 'bg-gray-200' : ''}`}
        onClick={() => onFormatChange('subscript')}
        title="Indice"
      >
        X<sub>2</sub>
      </button>
      
      <button 
        className={`px-2 py-1 hover:bg-gray-100 rounded text-black text-sm ${textFormat.superscript ? 'bg-gray-200' : ''}`}
        onClick={() => onFormatChange('superscript')}
        title="Exposant"
      >
        X<sup>2</sup>
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
  );
};

export default EditorToolbar;