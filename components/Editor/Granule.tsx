"use client"

import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Cloud, MessageSquare, Info, Settings, Eye, Bot, GripVertical } from 'lucide-react';

// ============= COMPOSANT: Granule (Draggable) =============
const Granule = ({ granule, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, granule)}
      className="flex items-center gap-2 p-3 bg-white border border-gray-300 rounded-lg cursor-move hover:border-[#99334C] hover:shadow-md transition-all"
    >
      <GripVertical size={16} className="text-gray-400" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-black">{granule.title}</h4>
        <p className="text-xs text-gray-600 line-clamp-2">{granule.content.substring(0, 80)}...</p>
      </div>
      <div className="text-xs text-gray-500">{granule.type}</div>
    </div>
  );
};

export default Granule;