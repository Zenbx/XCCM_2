"use client";

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import ContextMenu from '../ContextMenu';

// ============= COMPOSANT: CommentsPanel =============

interface CommentsPanelProps {
  comments: any[];
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  isFetching?: boolean;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ comments, onAddComment, onDeleteComment, isFetching }) => {
  const [newComment, setNewComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    commentId?: string;
  }>({ isOpen: false, x: 0, y: 0 });

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onAddComment(newComment.trim());
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, commentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      commentId,
    });
  };

  const handleDelete = async () => {
    if (!contextMenu.commentId || !onDeleteComment) return;
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire?')) return;
    
    try {
      await onDeleteComment(contextMenu.commentId);
      setContextMenu({ ...contextMenu, isOpen: false });
    } catch (error) {
      console.error("Erreur suppression commentaire:", error);
      alert("Erreur lors de la suppression");
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {isFetching && comments.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Chargement des commentaires...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-600">Aucun commentaire pour le moment</p>
        ) : (
          comments.map((comment) => (
            <div 
              key={comment.comment_id} 
              className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-colors group"
              onContextMenu={(e) => handleContextMenu(e, comment.comment_id)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#99334C]">
                  {comment.author.firstname} {comment.author.lastname}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                  {onDeleteComment && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, comment.comment_id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-gray-100 pt-6 space-y-3">
        <textarea
          className="w-full p-4 border border-gray-200 rounded-xl resize-none text-gray-900 text-sm focus:ring-2 focus:ring-[#99334C] focus:border-transparent outline-none transition-all placeholder-gray-400"
          rows={4}
          placeholder="Ajouter un commentaire..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          disabled={!newComment.trim() || isSubmitting}
          className="px-6 py-3 text-white rounded-xl w-full font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-md active:scale-95 flex justify-center items-center gap-2"
          style={{ backgroundColor: '#99334C' }}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Envoi...
            </>
          ) : (
            'Ajouter un commentaire'
          )}
        </button>
      </div>

      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        onDelete={handleDelete}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
      />
    </div>
  );
};

export default CommentsPanel;