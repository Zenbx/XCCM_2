"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { classroomStreamService, Announcement, AnnouncementComment } from '@/services/classroomStreamService';
import toast from 'react-hot-toast';

interface StreamTabProps {
  classId: string;
  announcements: Announcement[];
  isTeacher: boolean;
  currentUserId: string;
  onAnnouncementPosted: (a: Announcement) => void;
  onCommentAdded: (announcementId: string, comment: AnnouncementComment) => void;
  onCommentDeleted: (announcementId: string, commentId: string) => void;
}

const StreamTab: React.FC<StreamTabProps> = ({
  classId, announcements, isTeacher, currentUserId,
  onAnnouncementPosted, onCommentAdded, onCommentDeleted,
}) => {
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [sendingComment, setSendingComment] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const handlePost = async () => {
    if (!newPost.trim()) return;
    try {
      setIsPosting(true);
      const announcement = await classroomStreamService.postAnnouncement(classId, newPost);
      onAnnouncementPosted(announcement);
      setNewPost('');
      toast.success('Annonce publiée !');
    } catch (err: any) {
      toast.error(err.message || 'Erreur publication');
    } finally {
      setIsPosting(false);
    }
  };

  const handleSendComment = async (announcementId: string) => {
    const content = commentInputs[announcementId] || '';
    if (!content.trim()) return;
    try {
      setSendingComment(announcementId);
      const comment = await classroomStreamService.postComment(classId, announcementId, content);
      onCommentAdded(announcementId, comment);
      setCommentInputs(prev => ({ ...prev, [announcementId]: '' }));
    } catch (err: any) {
      toast.error(err.message || 'Erreur commentaire');
    } finally {
      setSendingComment(null);
    }
  };

  const handleDeleteComment = async (announcementId: string, commentId: string) => {
    try {
      await classroomStreamService.deleteComment(classId, announcementId, commentId);
      onCommentDeleted(announcementId, commentId);
      toast.success('Commentaire supprimé');
    } catch (err: any) {
      toast.error(err.message || 'Erreur suppression');
    }
  };

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(d));

  const getInitials = (a: { firstname: string; lastname: string }) =>
    `${a.firstname[0]}${a.lastname[0]}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Compose Box — teacher only */}
      {isTeacher && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Publier une annonce</p>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Partagez quelque chose avec votre classe..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none outline-none focus:ring-2 focus:ring-[#99334C]/30 transition"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handlePost}
              disabled={!newPost.trim() || isPosting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#99334C] text-white rounded-xl text-sm font-bold hover:bg-[#7a283d] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publier
            </button>
          </div>
        </div>
      )}

      {/* Feed */}
      {announcements.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">Aucune annonce pour le moment</p>
          {isTeacher && <p className="text-sm text-gray-400 mt-1">Publiez votre première annonce ci-dessus.</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
            >
              {/* Announcement header */}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#99334C]/10 rounded-full flex items-center justify-center text-sm font-bold text-[#99334C]">
                    {getInitials(ann.author)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {ann.author.firstname} {ann.author.lastname}
                      {isTeacher && ann.author.user_id === currentUserId && (
                        <span className="ml-2 text-[10px] px-2 py-0.5 bg-[#99334C]/10 text-[#99334C] rounded-full font-semibold uppercase tracking-wide">Vous</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(ann.created_at)}</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{ann.content}</p>
              </div>

              {/* Comments toggle */}
              {ann.comments.length > 0 && (
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [ann.id]: !prev[ann.id] }))}
                  className="w-full flex items-center justify-between px-5 py-2.5 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 hover:text-[#99334C] transition-colors border-t border-gray-100 dark:border-gray-800"
                >
                  <span>{ann.comments.length} commentaire{ann.comments.length > 1 ? 's' : ''}</span>
                  {expanded[ann.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* Comments list */}
              <AnimatePresence>
                {expanded[ann.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 py-3 space-y-3 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800">
                      {ann.comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2.5 group">
                          <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                            {getInitials(comment.author)}
                          </div>
                          <div className="flex-1 min-w-0 bg-white dark:bg-gray-900 rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {comment.author.firstname} {comment.author.lastname}
                              </p>
                              {(isTeacher || comment.author.user_id === currentUserId) && (
                                <button
                                  onClick={() => handleDeleteComment(ann.id, comment.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Comment input */}
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <input
                  type="text"
                  value={commentInputs[ann.id] || ''}
                  onChange={(e) => setCommentInputs(prev => ({ ...prev, [ann.id]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendComment(ann.id); }}
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#99334C]/30 text-gray-700 dark:text-gray-300 placeholder-gray-400"
                />
                <button
                  onClick={() => handleSendComment(ann.id)}
                  disabled={!commentInputs[ann.id]?.trim() || sendingComment === ann.id}
                  className="p-2 bg-[#99334C] text-white rounded-xl hover:bg-[#7a283d] transition-all disabled:opacity-40"
                >
                  {sendingComment === ann.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StreamTab;
