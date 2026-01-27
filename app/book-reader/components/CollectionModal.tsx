import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Archive, Box, ChevronRight, ArrowLeft, Loader2, FolderPlus,
    Lock, BookOpen, Clock, FileText
} from 'lucide-react';
import { Project } from '@/services/projectService';

interface CollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    granule: any;
    step: 'type' | 'project' | 'navigate';
    setStep: (step: 'type' | 'project' | 'navigate') => void;
    projects: Project[];
    onSelectProject: (p: Project) => void;
    selectedProject: Project | null;
    projectStructure: any[] | null;
    isLoadingProjects: boolean;
    isLoadingStructure: boolean;
    navigationPath: any[];
    setNavigationPath: (path: any[]) => void;
    onNavigateIn: (item: any, type: string) => void;
    onNavigateBack: () => void;
    onConfirmVault: () => void;
    onConfirmProject: (parentId: string, parentTitle: string) => void;
    isInserting: boolean;
    includeChildren: boolean;
    setIncludeChildren: (val: boolean) => void;
}

const CollectionModal: React.FC<CollectionModalProps> = ({
    isOpen, onClose, granule, step, setStep, projects, onSelectProject,
    selectedProject, projectStructure, isLoadingProjects, isLoadingStructure,
    navigationPath, setNavigationPath, onNavigateIn, onNavigateBack, onConfirmVault,
    onConfirmProject, isInserting, includeChildren, setIncludeChildren
}) => {
    if (!isOpen || !granule) return null;

    const currentLevelItems = () => {
        if (!projectStructure) return [];
        if (navigationPath.length === 0) return projectStructure; // Parts
        const last = navigationPath[navigationPath.length - 1];
        if (last.type === 'part') return last.chapters || [];
        if (last.type === 'chapter') return last.paragraphs || [];
        return [];
    };

    const getParentTitle = () => {
        if (navigationPath.length === 0) return '';
        const last = navigationPath[navigationPath.length - 1];
        if (last.type === 'part') return last.part_title;
        if (last.type === 'chapter') return last.chapter_title;
        if (last.type === 'paragraph') return last.para_name;
        return '';
    };

    const getParentId = () => {
        if (navigationPath.length === 0) return '';
        const last = navigationPath[navigationPath.length - 1];
        if (last.type === 'part') return last.part_id;
        if (last.type === 'chapter') return last.chapter_id;
        if (last.type === 'paragraph') return last.para_id;
        return '';
    };

    const canInsertHere = () => {
        if (granule.type === 'part') return navigationPath.length === 0;
        if (granule.type === 'chapter') return navigationPath.length === 1 && navigationPath[0].type === 'part';
        if (granule.type === 'paragraph') return navigationPath.length === 2 && navigationPath[1].type === 'chapter';
        if (granule.type === 'notion') return navigationPath.length === 3 && navigationPath[2].type === 'paragraph';
        return false;
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#99334C]/10 rounded-xl flex items-center justify-center">
                                <Archive className="w-5 h-5 text-[#99334C]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Récupérer le granule</h3>
                                <p className="text-xs text-gray-500 line-clamp-1">\"{granule.title}\"</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {step === 'type' && (
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={onConfirmVault}
                                    className="flex items-center gap-4 p-4 rounded-2xl border-2 border-transparent bg-gray-50 hover:bg-white hover:border-[#99334C]/30 hover:shadow-lg transition-all text-left"
                                >
                                    <div className="w-12 h-12 bg-[#99334C]/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Lock className="w-6 h-6 text-[#99334C]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Vers mon coffre-fort</h4>
                                        <p className="text-sm text-gray-500">Sauvegardez ce granule pour l'utiliser plus tard dans n'importe quel projet.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setStep('project')}
                                    className="flex items-center gap-4 p-4 rounded-2xl border-2 border-transparent bg-gray-50 hover:bg-white hover:border-[#99334C]/30 hover:shadow-lg transition-all text-left"
                                >
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                        <FolderPlus className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Vers un projet existant</h4>
                                        <p className="text-sm text-gray-500">Insérez directement ce granule dans l'un de vos cours en cours de rédaction.</p>
                                    </div>
                                </button>
                            </div>
                        )}

                        {step === 'project' && (
                            <div>
                                <button onClick={() => setStep('type')} className="flex items-center gap-2 text-sm text-[#99334C] font-bold mb-4 hover:underline">
                                    <ArrowLeft className="w-4 h-4" /> Retour
                                </button>
                                <h4 className="font-bold text-gray-700 mb-4 px-1">Sélectionnez un projet</h4>
                                {isLoadingProjects ? (
                                    <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-[#99334C]" /></div>
                                ) : (
                                    <div className="space-y-2">
                                        {projects.map(p => (
                                            <button
                                                key={p.pr_id}
                                                onClick={() => onSelectProject(p)}
                                                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-white border border-transparent hover:border-[#99334C]/20 rounded-xl transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Box className="w-5 h-5 text-gray-400 group-hover:text-[#99334C]" />
                                                    <span className="font-medium text-gray-900">{p.pr_name}</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#99334C]" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 'navigate' && selectedProject && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <button onClick={() => setStep('project')} className="flex items-center gap-2 text-sm text-[#99334C] font-bold hover:underline">
                                        <ArrowLeft className="w-4 h-4" /> Retour aux projets
                                    </button>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedProject.pr_name}</span>
                                </div>

                                {/* Breadcrumbs */}
                                <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2 text-xs">
                                    <button onClick={() => setNavigationPath([])} className={`shrink-0 hover:text-[#99334C] ${navigationPath.length === 0 ? 'text-[#99334C] font-bold' : 'text-gray-500'}`}>Structure</button>
                                    {navigationPath.map((item, idx) => (
                                        <React.Fragment key={idx}>
                                            <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />
                                            <button
                                                onClick={() => setNavigationPath(navigationPath.slice(0, idx + 1))}
                                                className={`shrink-0 hover:text-[#99334C] line-clamp-1 max-w-[100px] ${idx === navigationPath.length - 1 ? 'text-[#99334C] font-bold' : 'text-gray-500'}`}
                                            >
                                                {item.part_title || item.chapter_title || item.para_name}
                                            </button>
                                        </React.Fragment>
                                    ))}
                                </div>

                                {isLoadingStructure ? (
                                    <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-[#99334C]" /></div>
                                ) : (
                                    <div className="space-y-1">
                                        {currentLevelItems().map((item: any) => {
                                            const id = item.part_id || item.chapter_id || item.para_id;
                                            const title = item.part_title || item.chapter_title || item.para_name;
                                            const type = item.part_id ? 'part' : (item.chapter_id ? 'chapter' : 'paragraph');

                                            return (
                                                <button
                                                    key={id}
                                                    onClick={() => type !== 'paragraph' && onNavigateIn(item, type)}
                                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${type === 'paragraph' ? 'cursor-default' : 'hover:bg-gray-50'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {type === 'part' && <Box className="w-4 h-4 text-[#99334C]" />}
                                                        {type === 'chapter' && <BookOpen className="w-4 h-4 text-[#99334C]" />}
                                                        {type === 'paragraph' && <FileText className="w-4 h-4 text-gray-400" />}
                                                        <span className="text-sm font-medium text-gray-700">{title}</span>
                                                    </div>
                                                    {type !== 'paragraph' && <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#99334C]" />}
                                                </button>
                                            );
                                        })}

                                        {currentLevelItems().length === 0 && (
                                            <div className="text-center py-8 text-gray-400 text-sm">Aucun élément à ce niveau</div>
                                        )}
                                    </div>
                                )}

                                {/* Recursive Toggle */}
                                {(granule.type === 'part' || granule.type === 'chapter' || granule.type === 'paragraph') && (
                                    <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 italic">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div className="relative inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={includeChildren}
                                                    onChange={e => setIncludeChildren(e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#99334C]"></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">Inclure les sous-éléments (chapitres, notions...)</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer - Insertion button */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                        {step === 'navigate' ? (
                            <button
                                disabled={!canInsertHere() || isInserting}
                                onClick={() => onConfirmProject(getParentId(), getParentTitle())}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-[#99334C] text-white rounded-2xl font-bold hover:bg-[#7a283d] transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                {isInserting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FolderPlus className="w-5 h-5" />}
                                {canInsertHere()
                                    ? (granule.type === 'part' ?\"Insérer ici (Racine)\" : `Insérer dans \"${getParentTitle()}\"`)
                                : `Navigation requise (${granule.type})`
                                }
                            </button>
                        ) : (
                            <p className="text-center text-xs text-gray-400">Ce contenu sera copié dans votre espace personnel</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CollectionModal;
