"use client";

import React from 'react';

// ============= COMPOSANT: CommentsPanel =============



interface CommentsPanelProps {
  comments: any[];
  onAddComment: (content: string) => Promise<void>;
  isFetching?: boolean;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ comments, onAddComment, isFetching }) => {
  const [newComment, setNewComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {isFetching && comments.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Chargement des commentaires...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-600">Aucun commentaire pour le moment</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.comment_id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#99334C]">
                  {comment.author.firstname} {comment.author.lastname}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
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
    </div>
  );
};

export default CommentsPanel;