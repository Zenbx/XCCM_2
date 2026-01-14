"use client"

import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Cloud, MessageSquare, Info, Settings, Eye, Bot, GripVertical, Folder, FolderOpen, Book, FileText, File } from 'lucide-react';

// ============= COMPOSANT: Granule (Draggable) =============
const Granule = ({ granule, onDragStart }) => {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Folder': return Folder;
      case 'Book': return Book;
      case 'FileText': return FileText;
      case 'File': return File;
      default: return FileText;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'part': return '#99334C';
      case 'chapter': return '#DC3545';
      case 'paragraph': return '#D97706';
      case 'notion': return '#28A745';
      default: return '#6b7280';
    }
  };

  const IconComponent = getIcon(granule.icon);
  const color = getColor(granule.type);

  return (
    <div className="flex flex-col">
      <div
        draggable
        onDragStart={(e) => onDragStart(e, granule)}
        className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-move hover:shadow-md transition-all group"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <GripVertical size={16} className="text-gray-300 group-hover:text-gray-500" />

        <div className={`p-2 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${color}20` }}>
          <IconComponent size={18} style={{ color: color }} />
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900">{granule.content}</h4>
          <p className="text-xs text-gray-500 capitalize">{granule.type}</p>
        </div>
      </div>

      {granule.children && granule.children.length > 0 && (
        <div className="pl-6 mt-2 space-y-2 border-l-2 border-gray-100 ml-4">
          {granule.children.map((child) => (
            <Granule key={child.id} granule={child} onDragStart={onDragStart} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Granule;