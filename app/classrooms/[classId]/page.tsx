"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, BookOpen, Copy, Check, ArrowLeft,
    Trash2, Loader2,
    AlertCircle, School, X, Plus, BarChart3,
    Megaphone, FileText, RefreshCw, Eye
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { classroomService, ClassroomDetail } from '@/services/classroomService';
import { classroomStreamService, Announcement, AnnouncementComment, Assignment } from '@/services/classroomStreamService';
import { TactileButton } from '@/components/UI/TactileButton';
import { Skeleton } from '@/components/UI/Skeleton';
import StreamTab from '@/components/Classroom/StreamTab';
import AssignmentsTab from '@/components/Classroom/AssignmentsTab';
import AddCourseModal from '@/components/Classroom/AddCourseModal';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

// ─── Tabs ────────────────────────────────────────────────────────────────────

type Tab = 'stream' | 'courses' | 'assignments' | 'students' | 'analytics';

const TABS: { key: Tab; label: string; icon: React.ReactNode; teacherOnly?: boolean }[] = [
    { key: 'stream',      label: 'Flux',      icon: <Megaphone className="w-4 h-4" /> },
    { key: 'courses',     label: 'Cours',     icon: <BookOpen className="w-4 h-4" /> },
    { key: 'assignments', label: 'Devoirs',   icon: <FileText className="w-4 h-4" /> },
    { key: 'students',    label: 'Élèves',    icon: <Users className="w-4 h-4" />, teacherOnly: true },
    { key: 'analytics',  label: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, teacherOnly: true },
];

// ─── Page ────────────────────────────────────────────────────────────────────

const ClassroomDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const classId = params.classId as string;
    const { user } = useAuth();

    // Core data
    const [classroom, setClassroom]   = useState<ClassroomDetail | null>(null);
    const [isLoading, setIsLoading]   = useState(true);
    const [error, setError]           = useState<string | null>(null);

    // Tab
    const [activeTab, setActiveTab]   = useState<Tab>('stream');

    // Stream / Assignments data
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [assignments, setAssignments]     = useState<Assignment[]>([]);
    const [isTeacher, setIsTeacher]         = useState(false);

    // UI flags
    const [copied, setCopied]               = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm]         = useState(false);
    const [showCourseDeleteConfirm, setShowCourseDeleteConfirm] = useState(false);
    const [courseToDelete, setCourseToDelete]               = useState<{ pr_id: string; pr_name: string } | null>(null);
    const [isDeleting, setIsDeleting]       = useState(false);
    const [isRemovingCourse, setIsRemovingCourse] = useState(false);
    const [showAddCourseModal, setShowAddCourseModal] = useState(false);
    const [isSyncing, setIsSyncing]         = useState<string | null>(null);

    // ─── Fetch ──────────────────────────────────────────────────────────────

    const fetchClassroom = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await classroomService.getClassroom(classId);
            setClassroom(data);
            const teacher = data.teacher_id === user?.user_id;
            setIsTeacher(teacher);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [classId, user?.user_id]);

    const fetchStream = useCallback(async () => {
        try {
            const [anns, assData] = await Promise.all([
                classroomStreamService.getAnnouncements(classId),
                classroomStreamService.getAssignments(classId),
            ]);
            setAnnouncements(anns);
            setAssignments(assData.assignments);
        } catch {
            // Silently skip — classroom may not be loaded yet
        }
    }, [classId]);

    useEffect(() => {
        if (classId) fetchClassroom();
    }, [classId, fetchClassroom]);

    useEffect(() => {
        if (classId && !isLoading) fetchStream();
    }, [classId, isLoading, fetchStream]);

    // ─── Actions ────────────────────────────────────────────────────────────

    const handleCopyCode = () => {
        if (!classroom) return;
        navigator.clipboard.writeText(classroom.join_code);
        setCopied(true);
        toast.success("Code d'invitation copié !");
        setTimeout(() => setCopied(false), 2000);
    };


    const handleDelete = async () => {
        if (!classroom) return;
        setIsDeleting(true);
        try {
            await classroomService.deleteClassroom(classroom.id);
            toast.success("Classe supprimée");
            router.push('/classrooms');
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la suppression");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleRemoveCourse = async () => {
        if (!classroom || !courseToDelete) return;
        setIsRemovingCourse(true);
        try {
            await classroomService.unassignProject(classroom.id, courseToDelete.pr_id);
            toast.success("Cours retiré de la classe");
            setClassroom({
                ...classroom,
                projects: classroom.projects.filter(p => p.project.pr_id !== courseToDelete.pr_id)
            });
        } catch (err: any) {
            toast.error(err.message || "Erreur lors du retrait du cours");
        } finally {
            setIsRemovingCourse(false);
            setShowCourseDeleteConfirm(false);
            setCourseToDelete(null);
        }
    };

    const handleSync = async (projectId: string) => {
        if (!classroom) return;
        setIsSyncing(projectId);
        try {
            await classroomService.syncProject(classroom.id, projectId);
            toast.success("Cours synchronisé !");
            fetchClassroom();
        } catch (err: any) {
            toast.error(err.message || "Erreur synchronisation");
        } finally {
            setIsSyncing(null);
        }
    };

    // ─── Stream callbacks ────────────────────────────────────────────────────

    const handleAnnouncementPosted = (a: Announcement) => {
        setAnnouncements(prev => [a, ...prev]);
    };

    const handleCommentAdded = (announcementId: string, comment: AnnouncementComment) => {
        setAnnouncements(prev => prev.map(a =>
            a.id === announcementId ? { ...a, comments: [...a.comments, comment] } : a
        ));
    };

    const handleCommentDeleted = (announcementId: string, commentId: string) => {
        setAnnouncements(prev => prev.map(a =>
            a.id === announcementId ? { ...a, comments: a.comments.filter(c => c.id !== commentId) } : a
        ));
    };

    const handleAssignmentCreated = (a: Assignment) => {
        setAssignments(prev => [a, ...prev]);
    };

    // ─── Loading / Error states ──────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
                <div className="max-w-7xl mx-auto px-6 py-24">
                    <div className="space-y-6">
                        <Skeleton variant="text" width="40%" height={36} />
                        <Skeleton variant="text" width="60%" height={18} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                                    <Skeleton variant="text" width="50%" height={18} />
                                    <Skeleton variant="text" width="80%" height={40} className="mt-3" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !classroom) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Classe non trouvée</h2>
                    <p className="text-gray-500 mb-6">{error || "Cette classe n'existe pas ou vous n'y avez pas accès."}</p>
                    <TactileButton variant="primary" onClick={() => router.push('/classrooms')}>
                        Retour aux classes
                    </TactileButton>
                </div>
            </div>
        );
    }

    // Visible tabs
    const visibleTabs = TABS.filter(t => !t.teacherOnly || isTeacher);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

            {/* ═══════ HEADER ═══════ */}
            <section className="relative bg-gradient-to-br from-[#99334C] to-[#7a283d] text-white overflow-hidden py-14">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }} />
                </div>
                <div className="relative max-w-7xl mx-auto px-6">
                    <button
                        onClick={() => router.push('/classrooms')}
                        className="flex items-center gap-2 text-white/70 hover:text-white mb-5 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour aux classes
                    </button>

                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl md:text-5xl font-bold">{classroom.name}</h1>
                                {isTeacher && (
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold backdrop-blur-sm">
                                        Professeur
                                    </span>
                                )}
                            </div>
                            {classroom.description && (
                                <p className="text-lg text-white/80 max-w-2xl">{classroom.description}</p>
                            )}
                            {classroom.teacher && (
                                <div className="flex items-center gap-2 mt-3 text-white/70">
                                    <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                                        {classroom.teacher.firstname?.[0]}{classroom.teacher.lastname?.[0]}
                                    </div>
                                    <span className="text-sm">{classroom.teacher.firstname} {classroom.teacher.lastname}</span>
                                </div>
                            )}
                        </div>

                        {isTeacher && (
                            <div className="flex items-center gap-3">
                                <TactileButton
                                    variant="ghost"
                                    className="!text-white !border-white/30 border hover:!bg-white/10"
                                    leftIcon={<Trash2 className="w-4 h-4" />}
                                    onClick={() => setShowDeleteConfirm(true)}
                                >
                                    Supprimer
                                </TactileButton>
                            </div>
                        )}
                    </div>

                    {/* Stat pills */}
                    <div className="flex flex-wrap gap-4 mt-6">
                        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-semibold">{(classroom._count?.enrollments || 0)} élève{(classroom._count?.enrollments || 0) !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-sm font-semibold">{classroom.projects?.length || 0} cours</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm font-semibold">{assignments.length} devoir{assignments.length !== 1 ? 's' : ''}</span>
                        </div>
                        {isTeacher && (
                            <div
                                onClick={handleCopyCode}
                                className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 cursor-pointer hover:bg-white/25 transition-colors"
                                title="Copier le code"
                            >
                                <School className="w-4 h-4" />
                                <span className="text-sm font-mono font-bold tracking-widest">{classroom.join_code}</span>
                                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-70" />}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══════ TABS ═══════ */}
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center gap-1 py-4 overflow-x-auto">
                    {visibleTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                                activeTab === tab.key
                                    ? 'bg-[#99334C] text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.key === 'assignments' && assignments.filter(a => {
                                const mySubmission = a.submissions[0];
                                return !mySubmission && a.due_date && new Date(a.due_date) > new Date();
                            }).length > 0 && (
                                <span className="w-2 h-2 bg-amber-400 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* ═══════ TAB CONTENT ═══════ */}
                <div className="pb-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                        >
                            {/* ── STREAM TAB ── */}
                            {activeTab === 'stream' && (
                                <StreamTab
                                    classId={classId}
                                    announcements={announcements}
                                    isTeacher={isTeacher}
                                    currentUserId={user?.user_id || ''}
                                    onAnnouncementPosted={handleAnnouncementPosted}
                                    onCommentAdded={handleCommentAdded}
                                    onCommentDeleted={handleCommentDeleted}
                                />
                            )}

                            {/* ── COURSES TAB ── */}
                            {activeTab === 'courses' && (
                                <div className="space-y-4">
                                    {/* Add course button */}
                                    {isTeacher && (
                                        <div className="flex justify-end">
                                            <TactileButton
                                                variant="primary"
                                                leftIcon={<Plus className="w-4 h-4" />}
                                                onClick={() => setShowAddCourseModal(true)}
                                            >
                                                Ajouter un cours
                                            </TactileButton>
                                        </div>
                                    )}

                                    {classroom.projects?.length === 0 ? (
                                        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="font-semibold text-gray-500">Aucun cours associé</p>
                                            {isTeacher && (
                                                <p className="text-sm text-gray-400 mt-1">
                                                    Cliquez sur "Ajouter un cours" pour en associer un.
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                            {classroom.projects.map((cp) => (
                                                <motion.div
                                                    key={cp.project.pr_id}
                                                    whileHover={{ y: -4 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all p-6 cursor-pointer group relative"
                                                    onClick={() => {
                                                        if (isTeacher) {
                                                            router.push(`/edit/${encodeURIComponent(cp.project.pr_name)}`);
                                                        } else if (cp.doc_id) {
                                                            router.push(`/classrooms/${classId}/reader/${cp.doc_id}`);
                                                        } else {
                                                            toast.error("Le professeur n'a pas encore publié ce cours.");
                                                        }
                                                    }}
                                                >
                                                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
                                                        <BookOpen className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                                                    </div>

                                                    {/* Teacher actions */}
                                                    {isTeacher && (
                                                        <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (cp.doc_id) {
                                                                        router.push(`/classrooms/${classId}/reader/${cp.doc_id}`);
                                                                    } else {
                                                                        toast.error("Synchronisez d'abord le cours pour pouvoir le prévisualiser.");
                                                                    }
                                                                }}
                                                                className="p-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all"
                                                                title="Aperçu étudiant"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleSync(cp.project.pr_id); }}
                                                                className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                                                title="Synchroniser"
                                                            >
                                                                {isSyncing === cp.project.pr_id
                                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                    : <RefreshCw className="w-3.5 h-3.5" />
                                                                }
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setCourseToDelete({ pr_id: cp.project.pr_id, pr_name: cp.project.pr_name });
                                                                    setShowCourseDeleteConfirm(true);
                                                                }}
                                                                className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                                                                title="Retirer"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    )}

                                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#99334C] transition-colors">
                                                        {cp.project.pr_name}
                                                    </h3>
                                                    {cp.project.description && (
                                                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{cp.project.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        {cp.project.category && <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">{cp.project.category}</span>}
                                                        {cp.project.level && <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">{cp.project.level}</span>}
                                                    </div>

                                                    {isTeacher && (
                                                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                                            <span className={`text-[10px] font-semibold ${cp.doc_id ? 'text-green-500' : 'text-amber-500'}`}>
                                                                {cp.doc_id ? '✓ Synchronisé' : 'Non synchronisé'}
                                                            </span>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleSync(cp.project.pr_id); }}
                                                                disabled={isSyncing === cp.project.pr_id}
                                                                className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white text-xs font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                                            >
                                                                {isSyncing === cp.project.pr_id
                                                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                                                    : <RefreshCw className="w-3 h-3" />
                                                                }
                                                                Synchroniser
                                                            </button>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── ASSIGNMENTS TAB ── */}
                            {activeTab === 'assignments' && (
                                <AssignmentsTab
                                    classId={classId}
                                    assignments={assignments}
                                    isTeacher={isTeacher}
                                    onAssignmentCreated={handleAssignmentCreated}
                                />
                            )}

                            {/* ── STUDENTS TAB (teacher only) ── */}
                            {activeTab === 'students' && isTeacher && (
                                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                    {classroom.enrollments?.length === 0 ? (
                                        <div className="text-center py-16">
                                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="font-semibold text-gray-500">Aucun élève inscrit</p>
                                            <p className="text-sm text-gray-400 mt-1">Partagez le code <strong>{classroom.join_code}</strong> à vos élèves.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {classroom.enrollments?.map((enrollment, index) => (
                                                <motion.div
                                                    key={enrollment.student.user_id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.04 }}
                                                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-[#99334C]/20 to-[#99334C]/40 rounded-full flex items-center justify-center text-sm font-bold text-[#99334C]">
                                                            {enrollment.student.firstname?.[0]}{enrollment.student.lastname?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                                {enrollment.student.firstname} {enrollment.student.lastname}
                                                            </p>
                                                            <p className="text-sm text-gray-500">{enrollment.student.email}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        Inscrit le {new Date(enrollment.enrolled_at).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── ANALYTICS TAB ── */}
                            {activeTab === 'analytics' && isTeacher && (
                                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <BarChart3 className="w-12 h-12 text-gray-300 mb-3" />
                                    <p className="font-semibold text-gray-500">Analytics en cours de développement</p>
                                    <TactileButton
                                        variant="secondary"
                                        className="mt-4"
                                        onClick={() => router.push(`/classrooms/${classId}/analytics`)}
                                    >
                                        Voir les analytics avancés
                                    </TactileButton>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* ═══════ MODALS ═══════ */}

            {/* Delete classroom modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Supprimer la classe ?</h2>
                            </div>
                            <p className="text-gray-500 mb-6">
                                Cette action est irréversible. Tous les élèves seront désinscrits et les liens de cours supprimés.
                            </p>
                            <div className="flex gap-3">
                                <TactileButton variant="secondary" onClick={() => setShowDeleteConfirm(false)} className="flex-1">Annuler</TactileButton>
                                <TactileButton variant="danger" onClick={handleDelete} isLoading={isDeleting} leftIcon={<Trash2 className="w-4 h-4" />} className="flex-1">Supprimer</TactileButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Remove course modal */}
            <AnimatePresence>
                {showCourseDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setShowCourseDeleteConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-amber-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Retirer le cours ?</h2>
                            </div>
                            <p className="text-gray-500 mb-6">
                                Les élèves ne pourront plus accéder au cours <strong className="text-gray-900 dark:text-white">&quot;{courseToDelete?.pr_name}&quot;</strong> via cette classe.
                            </p>
                            <div className="flex gap-3">
                                <TactileButton variant="secondary" onClick={() => setShowCourseDeleteConfirm(false)} className="flex-1">Annuler</TactileButton>
                                <TactileButton variant="danger" onClick={handleRemoveCourse} isLoading={isRemovingCourse} leftIcon={<X className="w-4 h-4" />} className="flex-1">Retirer</TactileButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add course modal */}
            <AddCourseModal
                isOpen={showAddCourseModal}
                onClose={() => setShowAddCourseModal(false)}
                classId={classId}
                alreadyAssignedIds={classroom.projects.map(cp => cp.project.pr_id)}
                onCourseAdded={fetchClassroom}
            />
        </div>
    );
};

export default ClassroomDetailPage;
