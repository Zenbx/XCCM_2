"use client";

import React, { useEffect, useRef } from 'react';
import { Edit3, Trash2, Plus } from 'lucide-react';

interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onRename?: () => void;
  onDelete?: () => void;
  onAddChild?: () => void;
  onClose: () => void;
  itemType?: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  x,
  y,
  onRename,
  onDelete,
  onAddChild,
  onClose,
  itemType = 'item'
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (action: (() => void) | undefined) => {
    if (action) {
      action();
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-max"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {onRename && (
        <button
          onClick={() => handleAction(onRename)}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 border-b border-gray-100"
        >
          <Edit3 size={16} className="text-gray-400" />
          Renommer
        </button>
      )}

      {onAddChild && (
        <button
          onClick={() => handleAction(onAddChild)}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 border-b border-gray-100"
        >
          <Plus size={16} className="text-gray-400" />
          Ajouter un enfant
        </button>
      )}

      {onDelete && (
        <button
          onClick={() => handleAction(onDelete)}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
        >
          <Trash2 size={16} className="text-red-400" />
          Supprimer
        </button>
      )}
    </div>
  );
};

export default ContextMenu;
