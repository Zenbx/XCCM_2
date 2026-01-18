"use client";

import React, { useEffect, useRef } from 'react';
import { Edit3, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from '../UI/GlassPanel';

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

  const handleAction = (action: (() => void) | undefined) => {
    if (action) {
      action();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <GlassPanel
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed z-50 min-w-[180px] rounded-xl overflow-hidden py-1"
          style={{
            left: `${x}px`,
            top: `${y}px`,
          }}
          intensity="high"
          blur="lg"
        >
          {onRename && (
            <button
              onClick={() => handleAction(onRename)}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-[#99334C]/10 hover:text-[#99334C] flex items-center gap-3 transition-colors group"
            >
              <Edit3 size={16} className="text-gray-400 group-hover:text-[#99334C]" />
              <span>Renommer</span>
            </button>
          )}

          {onAddChild && (
            <button
              onClick={() => handleAction(onAddChild)}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-[#99334C]/10 hover:text-[#99334C] flex items-center gap-3 transition-colors group"
            >
              <Plus size={16} className="text-gray-400 group-hover:text-[#99334C]" />
              <span>Ajouter un enfant</span>
            </button>
          )}

          {onDelete && (
            <div className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-700/50">
              <button
                onClick={() => handleAction(onDelete)}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors group"
              >
                <Trash2 size={16} className="text-red-400" />
                <span>Supprimer</span>
              </button>
            </div>
          )}
        </GlassPanel>
      )}
    </AnimatePresence>
  );
};

export default ContextMenu;
