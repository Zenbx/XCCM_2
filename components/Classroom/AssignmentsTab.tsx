"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, FileText, Upload, Clock, CheckCircle, Loader2,
  ChevronDown, ChevronUp, Star, X, File as FileIcon, Send, Download, Paperclip
} from 'lucide-react';
import { classroomStreamService, Assignment, AssignmentSubmission } from '@/services/classroomStreamService';
import { TactileButton } from '@/components/UI/TactileButton';
import toast from 'react-hot-toast';

interface AssignmentsTabProps {
  classId: string;
  assignments: Assignment[];
  isTeacher: boolean;
  onAssignmentCreated: (a: Assignment) => void;
}

const AssignmentsTab: React.FC<AssignmentsTabProps> = ({
  classId, assignments, isTeacher, onAssignmentCreated,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', due_date: '', type: 'TEXT' as 'TEXT' | 'FILE' });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [fileSelections, setFileSelections] = useState<Record<string, File>>({});
  const [grading, setGrading] = useState<Record<string, { score: string; feedback: string }>>({});
  const [savedGrades, setSavedGrades] = useState<Record<string, boolean>>({});

  const handleCreate = async () => {
    if (!form.title.trim()) return toast.error('Le titre est requis');
    try {
      setIsCreating(true);
      let attachment_url: string | undefined;
      let attachment_name: string | undefined;

      if (attachmentFile) {
        toast.loading('Upload du fichier joint...', { id: 'attach-upload' });
        const { url } = await classroomStreamService.uploadFile(attachmentFile);
        toast.dismiss('attach-upload');
        attachment_url = url;
        attachment_name = attachmentFile.name;
      }

      const assignment = await classroomStreamService.createAssignment(classId, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        due_date: form.due_date || undefined,
        type: form.type,
        attachment_url,
        attachment_name,
      });
      onAssignmentCreated(assignment);
      setForm({ title: '', description: '', due_date: '', type: 'TEXT' });
      setAttachmentFile(null);
      setShowCreateForm(false);
      toast.success('Devoir créé !');
    } catch (err: any) {
      toast.error(err.message || 'Erreur création');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmit = async (assignmentId: string, type: 'TEXT' | 'FILE') => {
    try {
      setSubmitting(assignmentId);
      let content = '';

      if (type === 'TEXT') {
        content = textAnswers[assignmentId] || '';
        if (!content.trim()) return toast.error('Réponse vide');
      } else {
        const file = fileSelections[assignmentId];
        if (!file) return toast.error('Sélectionnez un fichier');
        toast.loading('Upload en cours...', { id: 'upload' });
        const { url } = await classroomStreamService.uploadFile(file);
        toast.dismiss('upload');
        content = url;
      }

      await classroomStreamService.submitAssignment(classId, assignmentId, content);
      toast.success('Devoir rendu avec succès !');
    } catch (err: any) {
      toast.error(err.message || 'Erreur soumission');
    } finally {
      setSubmitting(null);
    }
  };

  const handleGrade = async (assignmentId: string, submissionId: string) => {
    const g = grading[submissionId];
    if (!g?.score) return toast.error('Score requis');
    try {
      await classroomStreamService.gradeSubmission(
        classId, assignmentId, submissionId,
        parseFloat(g.score), g.feedback
      );
      setSavedGrades(prev => ({ ...prev, [submissionId]: true }));
      toast.success('Note enregistrée');
    } catch (err: any) {
      toast.error(err.message || 'Erreur notation');
    }
  };

  const formatDue = (d?: string) =>
    d ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(d)) : null;

  const isPastDue = (d?: string) => d ? new Date(d) < new Date() : false;

  return (
    <div className="space-y-4">
      {/* Create button */}
      {isTeacher && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="w-9 h-9 bg-[#99334C]/10 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#99334C]" />
            </div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Créer un nouveau devoir</span>
          </button>

          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-gray-100 dark:border-gray-800"
              >
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Titre *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="Ex: TP Algorithmes de tri"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#99334C]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                    <textarea
                      rows={2}
                      value={form.description}
                      onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Instructions pour les élèves..."
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-[#99334C]/30"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date limite</label>
                      <input
                        type="datetime-local"
                        value={form.due_date}
                        onChange={(e) => setForm(p => ({ ...p, due_date: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#99334C]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Type de rendu</label>
                      <select
                        value={form.type}
                        onChange={(e) => setForm(p => ({ ...p, type: e.target.value as 'TEXT' | 'FILE' }))}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none"
                      >
                        <option value="TEXT">Texte libre</option>
                        <option value="FILE">Fichier (PDF)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Fichier joint (optionnel)</label>
                    <label className="flex items-center gap-3 cursor-pointer bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 hover:border-[#99334C] transition-colors">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                      />
                      <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
                      {attachmentFile ? (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{attachmentFile.name}</span>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setAttachmentFile(null); }}
                            className="ml-auto shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Joindre un fichier à ce devoir...</span>
                      )}
                    </label>
                  </div>
                  <div className="flex justify-end gap-3">
                    <TactileButton variant="secondary" onClick={() => { setShowCreateForm(false); setAttachmentFile(null); }}>Annuler</TactileButton>
                    <TactileButton variant="primary" onClick={handleCreate} isLoading={isCreating}>Créer le devoir</TactileButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Assignments list */}
      {assignments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">Aucun devoir pour le moment</p>
          {isTeacher && <p className="text-sm text-gray-400 mt-1">Créez un premier devoir ci-dessus.</p>}
        </div>
      ) : (
        assignments.map((assignment) => {
          const isExpanded = expandedId === assignment.id;
          const mySubmission = assignment.submissions?.[0];
          const due = formatDue(assignment.due_date);
          const late = isPastDue(assignment.due_date);

          return (
            <div key={assignment.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              {/* Assignment header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : assignment.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${mySubmission ? 'bg-green-50 dark:bg-green-900/20' : late ? 'bg-red-50 dark:bg-red-900/20' : 'bg-[#99334C]/10'}`}>
                    {mySubmission
                      ? <CheckCircle className="w-5 h-5 text-green-600" />
                      : assignment.type === 'FILE'
                        ? <Upload className="w-5 h-5 text-[#99334C]" />
                        : <FileText className="w-5 h-5 text-[#99334C]" />
                    }
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{assignment.title}</h3>
                    {assignment.description && (
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{assignment.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      {due && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${late && !mySubmission ? 'text-red-500' : 'text-gray-400'}`}>
                          <Clock className="w-3 h-3" />
                          {late && !mySubmission ? 'En retard · ' : ''}{due}
                        </span>
                      )}
                      {isTeacher && (
                        <span className="text-xs text-gray-400">{(assignment._count?.submissions || 0)} rendu(s)</span>
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-gray-100 dark:border-gray-800"
                  >
                    <div className="p-5">
                      {/* Student view */}
                      {!isTeacher && (
                        <>
                          {assignment.attachment_url && (
                            <a
                              href={assignment.attachment_url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="flex items-center gap-2.5 px-4 py-3 mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                            >
                              <Download className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Fichier joint par le professeur</p>
                                {assignment.attachment_name && (
                                  <p className="text-xs text-blue-500 truncate">{assignment.attachment_name}</p>
                                )}
                              </div>
                              <span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">Télécharger</span>
                            </a>
                          )}
                          {mySubmission ? (
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <p className="text-sm font-bold text-green-700 dark:text-green-400">Devoir rendu</p>
                              </div>
                              <p className="text-xs text-green-600 dark:text-green-400 break-all">{mySubmission.content}</p>
                              {mySubmission.score !== undefined && mySubmission.score !== null && (
                                <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-lg border">
                                  <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1"><Star className="w-4 h-4 text-amber-400" /> Note: {mySubmission.score}/20</p>
                                  {mySubmission.feedback && <p className="text-xs text-gray-500 mt-1">{mySubmission.feedback}</p>}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {assignment.type === 'TEXT' ? (
                                <textarea
                                  rows={4}
                                  value={textAnswers[assignment.id] || ''}
                                  onChange={(e) => setTextAnswers(p => ({ ...p, [assignment.id]: e.target.value }))}
                                  placeholder="Rédigez votre réponse ici..."
                                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-[#99334C]/30"
                                />
                              ) : (
                                <div>
                                  <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl px-4 py-8 hover:border-[#99334C] transition-colors">
                                    <input
                                      type="file"
                                      accept=".pdf,image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setFileSelections(p => ({ ...p, [assignment.id]: file }));
                                      }}
                                    />
                                    <div className="text-center w-full">
                                      {fileSelections[assignment.id] ? (
                                        <div className="flex items-center justify-center gap-2">
                                          <FileIcon className="w-5 h-5 text-[#99334C]" />
                                          <span className="text-sm text-gray-700 dark:text-gray-300">{fileSelections[assignment.id].name}</span>
                                        </div>
                                      ) : (
                                        <>
                                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                          <p className="text-sm text-gray-500">Cliquez pour sélectionner un fichier PDF</p>
                                        </>
                                      )}
                                    </div>
                                  </label>
                                </div>
                              )}
                              <div className="flex justify-end">
                                <TactileButton
                                  variant="primary"
                                  onClick={() => handleSubmit(assignment.id, assignment.type)}
                                  isLoading={submitting === assignment.id}
                                  leftIcon={<Send className="w-4 h-4" />}
                                >
                                  Rendre le devoir
                                </TactileButton>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Teacher view: list of submissions */}
                      {isTeacher && (
                        <div className="space-y-3">
                          {assignment.attachment_url && (
                            <a
                              href={assignment.attachment_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-gray-600 dark:text-gray-400"
                            >
                              <Paperclip className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{assignment.attachment_name || 'Fichier joint'}</span>
                            </a>
                          )}
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{(assignment._count?.submissions || 0)} rendu(s)</p>
                          {(!assignment.submissions || assignment.submissions.length === 0) ? (
                            <p className="text-sm text-gray-400 italic">Aucun rendu pour l'instant.</p>
                          ) : (
                            assignment.submissions.map((sub: any) => (
                              <div key={sub.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-7 h-7 bg-[#99334C]/10 rounded-full flex items-center justify-center text-xs font-bold text-[#99334C]">
                                    {sub.student?.firstname?.[0]}{sub.student?.lastname?.[0]}
                                  </div>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">{sub.student?.firstname} {sub.student?.lastname}</p>
                                </div>
                                <p className="text-xs text-gray-500 break-all mb-3">
                                  {sub.content.startsWith('http') ? (
                                    <a href={sub.content} target="_blank" rel="noreferrer" className="text-blue-500 underline">Voir le fichier</a>
                                  ) : sub.content}
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    placeholder="Note /20"
                                    defaultValue={sub.score ?? ''}
                                    onChange={(e) => setGrading(p => ({ ...p, [sub.id]: { ...p[sub.id], score: e.target.value } }))}
                                    className="col-span-1 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#99334C]/30"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Commentaire"
                                    defaultValue={sub.feedback ?? ''}
                                    onChange={(e) => setGrading(p => ({ ...p, [sub.id]: { ...p[sub.id], feedback: e.target.value } }))}
                                    className="col-span-2 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#99334C]/30"
                                  />
                                </div>
                                <div className="flex justify-end mt-2">
                                  <button
                                    onClick={() => handleGrade(assignment.id, sub.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#99334C] text-white rounded-lg text-xs font-bold hover:bg-[#7a283d] transition-all"
                                  >
                                    {savedGrades[sub.id] ? <CheckCircle className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                                    {savedGrades[sub.id] ? 'Noté' : 'Enregistrer'}
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AssignmentsTab;
