"use client"

import React from 'react';
import { GripVertical, Folder, Book, FileText, File, LucideIcon, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RichTooltip from '../UI/RichTooltip';

export interface GranuleData {
  id: string;
  content: string; // Title / Label
  type: 'part' | 'chapter' | 'paragraph' | 'notion';
  icon?: string;
  author?: string;
  introduction?: string;   // For parts
  previewContent?: string; // For notions/chapters
  savedAt?: string;
  children?: GranuleData[];
}

interface GranuleProps {
  granule: GranuleData;
  onDragStart: (e: React.DragEvent, granule: GranuleData) => void;
}

// ============= COMPOSANT: Granule (Draggable & Expandable) =============
const Granule: React.FC<GranuleProps> = ({ granule, onDragStart }) => {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const getIcon = (iconName?: string): LucideIcon => {
    switch (iconName) {
      case 'Folder': return Folder;
      case 'Book': return Book;
      case 'FileText': return FileText;
      case 'File': return File;
      default: return FileText;
    }
  };

  const getColor = (type: string): string => {
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
  const hasPreview = (granule.type === 'part' && !!granule.introduction) || (granule.type === 'notion' && !!granule.previewContent);

  return (
    <div className="flex flex-col group/card bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#99334C]/30 hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col p-1">
        <div
          draggable
          onDragStart={(e) => onDragStart(e, granule)}
          className="flex items-center gap-3 p-3 cursor-grab active:cursor-grabbing group/item"
        >
          <GripVertical size={16} className="text-gray-200 group-hover/item:text-gray-400 transition-colors" />

          <div
            className="p-2.5 rounded-xl bg-opacity-10 transition-transform group-hover/item:scale-110"
            style={{ backgroundColor: `${color}15` }}
          >
            <IconComponent size={20} style={{ color: color }} strokeWidth={2.5} />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900 truncate">{granule.content}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                style={{ backgroundColor: `${color}10`, color: color }}
              >
                {granule.type}
              </span>
              {granule.author && (
                <span className="text-[10px] text-gray-400 font-medium">Par {granule.author}</span>
              )}
            </div>
          </div>

          {hasPreview && (
            <button
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className={`p-2 rounded-lg transition-colors ${isPreviewOpen
                ? 'bg-[#99334C] text-white'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
            >
              {isPreviewOpen ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>

        <AnimatePresence>
          {isPreviewOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-10 pb-4 pt-1">
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-600 leading-relaxed italic">
                    {granule.introduction || granule.previewContent}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {granule.children && granule.children.length > 0 && (
        <div className="px-3 pb-3 space-y-2 bg-gray-50/50">
          {granule.children.map((child: GranuleData) => (
            <div key={child.id} className="first:mt-2">
              <Granule granule={child} onDragStart={onDragStart} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Granule;