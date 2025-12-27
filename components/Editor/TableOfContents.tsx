"use client";

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

// ============= COMPOSANT: TableOfContents =============



const TableOfContents = ({ items, expandedSections, onToggle }) => {
  const renderTreeItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections[item.id];
    
    const colors = {
      partie: '#99334C',
      chapitre: '#DC3545',
      paragraphe: '#FFC107',
      notion: '#FFD700'
    };
    
    const getColor = (id) => {
      if (id.includes('partie')) return colors.partie;
      if (id.includes('chapitre')) return colors.chapitre;
      if (id.includes('paragraphe')) return colors.paragraphe;
      return colors.notion;
    };

    return (
      <div key={item.id}>
        <div
          className="flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
          style={{ marginLeft: `${level * 12}px` }}
          onClick={() => hasChildren && onToggle(item.id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={14} className="mr-1 flex-shrink-0" />
            ) : (
              <ChevronRight size={14} className="mr-1 flex-shrink-0" />
            )
          ) : (
            <div className="w-4 mr-1" />
          )}
          <div 
            className="w-3 h-3 rounded-sm mr-2 flex-shrink-0" 
            style={{ backgroundColor: getColor(item.id) }}
          />
          <span className="text-sm text-black">{item.title}</span>
        </div>
        {isExpanded && hasChildren && (
          <div>
            {item.children.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-56 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-3 border-b border-gray-200" style={{ backgroundColor: '#6C7A89' }}>
        <h2 className="text-white font-semibold text-sm">Table des matières</h2>
      </div>
      <div className="p-2">
        {items.map(item => renderTreeItem(item))}
      </div>
    </div>
  );
};

export default TableOfContents;