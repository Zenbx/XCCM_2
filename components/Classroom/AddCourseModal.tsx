"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Search, BookOpen, Loader2, Check } from 'lucide-react';
import { projectService, Project } from '@/services/projectService';
import { classroomService } from '@/services/classroomService';
import { TactileButton } from '@/components/UI/TactileButton';
import toast from 'react-hot-toast';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onCourseAdded: () => void;
  alreadyAssignedIds: string[];
}

const AddCourseModal: React.FC<AddCourseModalProps> = ({
  isOpen, onClose, classId, onCourseAdded, alreadyAssignedIds
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectService.getAllProjects();
      // Only show projects owned by the teacher
      setProjects(data.filter(p => p.owner_id !== undefined));
    } catch (err: any) {
      toast.error(err.message || 'Erreur chargement des projets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (project: Project) => {
    try {
      setIsAdding(project.pr_id);
      await classroomService.assignProject(classId, project.pr_id);
      toast.success(`"${project.pr_name}" ajouté à la classe`);
      onCourseAdded();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'assignation');
    } finally {
      setIsAdding(null);
    }
  };

  const filtered = projects.filter(p =>
    p.pr_name.toLowerCase().includes(search.toLowerCase()) &&
    !alreadyAssignedIds.includes(p.pr_id)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ajouter un cours</h2>
                <p className="text-sm text-gray-500 mt-1">Sélectionnez un de vos projets à associer à cette classe</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un projet..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-[#99334C]/30"
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto p-4 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-[#99334C]" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10">
                  <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">
                    {search ? 'Aucun résultat pour cette recherche' : 'Tous vos projets sont déjà assignés'}
                  </p>
                </div>
              ) : (
                filtered.map((project) => (
                  <div
                    key={project.pr_id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-[#99334C]/5 dark:hover:bg-[#99334C]/10 border border-transparent hover:border-[#99334C]/20 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{project.pr_name}</p>
                        {project.category && (
                          <p className="text-xs text-gray-400">{project.category}</p>
                        )}
                      </div>
                    </div>
                    <TactileButton
                      variant="primary"
                      onClick={() => handleAssign(project)}
                      isLoading={isAdding === project.pr_id}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      className="shrink-0 !text-xs !px-3 !py-1.5"
                    >
                      Ajouter
                    </TactileButton>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <TactileButton variant="secondary" onClick={onClose}>Fermer</TactileButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddCourseModal;
