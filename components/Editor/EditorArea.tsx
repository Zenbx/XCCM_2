"use client";

import React from 'react';

// ============= COMPOSANT: EditorArea =============



const EditorArea = ({ content, textFormat, onChange, onDrop, editorRef }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('ring-2', 'ring-[#99334C]');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('ring-2', 'ring-[#99334C]');
  };

  const handleDrop = (e) => {
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
          value={content}
          onChange={onChange}
          placeholder="Commencez à écrire votre contenu... ou glissez-déposez un granule ici"
        />
      </div>
    </div>
  );
};

export default EditorArea;