"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
    GraduationCap, Plus, Users, BookOpen, Copy, Check,
    Search, ChevronRight, Loader2, AlertCircle, School,
    KeyRound, ArrowRight, Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { classroomService, Classroom, EnrolledClassroom } from '@/services/classroomService';
import { TactileButton } from '@/components/UI/TactileButton';
import GlassPanel from '@/components/UI/GlassPanel';
import { Skeleton } from '@/components/UI/Skeleton';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────
// CREATE CLASSROOM MODAL
// ─────────────────────────────────────────────────────────
const CreateClassroomModal = ({
    isOpen,
    onClose,
    onCreated
}: { isOpen: boolean; onClose: () => void; onCreated: (c: Classroom) => void }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || name.trim().length < 3) {
            toast.error("Le nom doit contenir au moins 3 caractères");
            return;
        }
        setIsSubmitting(true);
        try {
            const classroom = await classroomService.createClassroom(name, description || undefined);
            toast.success("Classe créée avec succès !");
            onCreated(classroom);
            setName('');
            setDescription('');
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la création");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-[#99334C]/10 rounded-xl flex items-center justify-center">
                            <School className="w-6 h-6 text-[#99334C]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Créer une classe</h2>
                            <p className="text-sm text-gray-500">Un code d&apos;invitation sera généré automatiquement</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Nom de la classe *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Informatique L2 - 2026"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all text-sm"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Description (optionnel)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Décrivez brièvement cette classe..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all text-sm resize-none"
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <TactileButton
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Annuler
                            </TactileButton>
                            <TactileButton
                                type="submit"
                                variant="primary"
                                isLoading={isSubmitting}
                                leftIcon={<Plus className="w-4 h-4" />}
                                className="flex-1"
                            >
                                Créer la classe
                            </TactileButton>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ─────────────────────────────────────────────────────────
// JOIN CLASSROOM MODAL
// ─────────────────────────────────────────────────────────
const JoinClassroomModal = ({
    isOpen,
    onClose,
    onJoined
}: { isOpen: boolean; onClose: () => void; onJoined: () => void }) => {
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;
        setIsSubmitting(true);
        try {
            await classroomService.joinClassroom(code.trim().toUpperCase());
            toast.success("Vous avez rejoint la classe !");
            onJoined();
            setCode('');
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Code invalide ou erreur");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                            <KeyRound className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rejoindre une classe</h2>
                            <p className="text-sm text-gray-500">Entrez le code d&apos;invitation donné par votre professeur</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Code d&apos;invitation
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="Ex: AB12CD"
                                maxLength={10}
                                className="w-full px-4 py-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-[#99334C] focus:ring-0 transition-all text-center text-2xl font-mono font-bold tracking-[0.3em] uppercase"
                                autoFocus
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <TactileButton
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Annuler
                            </TactileButton>
                            <TactileButton
                                type="submit"
                                variant="primary"
                                isLoading={isSubmitting}
                                leftIcon={<ArrowRight className="w-4 h-4" />}
                                className="flex-1"
                            >
                                Rejoindre
                            </TactileButton>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ─────────────────────────────────────────────────────────
// CLASSROOM CARD (TEACHER VIEW)
// ─────────────────────────────────────────────────────────
const TeacherClassCard = ({ classroom }: { classroom: Classroom }) => {
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    const handleCopyCode = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(classroom.join_code);
        setCopied(true);
        toast.success("Code copié !");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => router.push(`/classrooms/${classroom.id}`)}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
        >
            {/* Top accent bar */}
            <div className="h-2 bg-gradient-to-r from-[#99334C] to-[#c9556e]" />

            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#99334C]/10 rounded-xl flex items-center justify-center group-hover:bg-[#99334C] group-hover:text-white transition-colors">
                            <GraduationCap className="w-6 h-6 text-[#99334C] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-[#99334C] transition-colors text-lg">
                                {classroom.name}
                            </h3>
                            <span className="text-xs text-[#99334C] font-semibold bg-[#99334C]/10 px-2 py-0.5 rounded-full">
                                Professeur
                            </span>
                        </div>
                    </div>
                </div>

                {classroom.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                        {classroom.description}
                    </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {classroom._count?.enrollments || 0} élèves
                        </span>
                        <span className="flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" />
                            {classroom._count?.projects || 0} cours
                        </span>
                    </div>

                    {/* Join code badge */}
                    <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono font-bold text-gray-600 dark:text-gray-300 hover:bg-[#99334C]/10 hover:text-[#99334C] transition-all"
                        title="Copier le code"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {classroom.join_code}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────
// CLASSROOM CARD (STUDENT VIEW)
// ─────────────────────────────────────────────────────────
const StudentClassCard = ({ classroom }: { classroom: EnrolledClassroom }) => {
    const router = useRouter();

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => router.push(`/classrooms/${classroom.id}`)}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
        >
            {/* Top accent bar (blue for student) */}
            <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-400" />

            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                            <BookOpen className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors text-lg">
                                {classroom.name}
                            </h3>
                            <span className="text-xs text-blue-600 font-semibold bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                                Étudiant
                            </span>
                        </div>
                    </div>
                </div>

                {classroom.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                        {classroom.description}
                    </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    {classroom.teacher && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                {classroom.teacher.firstname?.[0]}{classroom.teacher.lastname?.[0]}
                            </div>
                            <span>{classroom.teacher.firstname} {classroom.teacher.lastname}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">
                            {classroom._count?.projects || 0} cours
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────
const ClassroomsPage = () => {
    const [teaching, setTeaching] = useState<Classroom[]>([]);
    const [enrolled, setEnrolled] = useState<EnrolledClassroom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchClassrooms = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await classroomService.getMyClassrooms();
            setTeaching(data.teaching);
            setEnrolled(data.enrolled);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClassrooms();
    }, [fetchClassrooms]);

    const handleClassCreated = (c: Classroom) => {
        setTeaching(prev => [c, ...prev]);
    };

    const filteredTeaching = teaching.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredEnrolled = enrolled.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            {/* ═══════ HERO ═══════ */}
            <section className="relative bg-gradient-to-br from-[#99334C] to-[#7a283d] text-white overflow-hidden py-20">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }} />
                </div>
                <div className="relative max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            Mes Classes
                        </h1>
                        <div className="flex justify-center mb-6">
                            <div className="h-1 w-32 bg-white/50 rounded-full relative">
                                <div className="absolute inset-0 bg-white rounded-full animate-pulse" />
                            </div>
                        </div>
                        <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                            Gérez vos classes, invitez des étudiants et suivez leur progression
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex flex-wrap items-center justify-center gap-4"
                    >
                        <TactileButton
                            variant="secondary"
                            size="lg"
                            leftIcon={<Plus className="w-5 h-5" />}
                            onClick={() => setShowCreateModal(true)}
                            className="!bg-white !text-[#99334C] hover:!bg-white/90 font-bold shadow-lg"
                        >
                            Créer une classe
                        </TactileButton>
                        <TactileButton
                            variant="ghost"
                            size="lg"
                            leftIcon={<KeyRound className="w-5 h-5" />}
                            onClick={() => setShowJoinModal(true)}
                            className="!text-white !border-white/30 border hover:!bg-white/10 font-bold"
                        >
                            Rejoindre avec un code
                        </TactileButton>
                    </motion.div>

                    {/* Stats pills */}
                    <div className="flex items-center justify-center gap-4 text-sm mt-8 text-white/80">
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                            <GraduationCap className="w-5 h-5" />
                            <span>{teaching.length} classes enseignées</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                            <BookOpen className="w-5 h-5" />
                            <span>{enrolled.length} classes suivies</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ SEARCH BAR ═══════ */}
            <section className="py-6 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une classe..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* ═══════ CONTENT ═══════ */}
            <section className="py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700" />
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Skeleton variant="circular" width={48} height={48} />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton variant="text" width="60%" height={20} />
                                                <Skeleton variant="text" width="30%" height={14} />
                                            </div>
                                        </div>
                                        <Skeleton variant="text" width="100%" height={14} />
                                        <Skeleton variant="text" width="80%" height={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-64 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
                            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                            <h3 className="text-xl font-bold text-red-800 dark:text-red-300">Erreur de chargement</h3>
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    ) : (teaching.length === 0 && enrolled.length === 0) ? (
                        /* Empty state */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20"
                        >
                            <div className="w-24 h-24 bg-[#99334C]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-12 h-12 text-[#99334C]" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                Bienvenue dans l&apos;espace Classes !
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                                Créez votre première classe en tant que professeur, ou rejoignez une classe existante avec un code d&apos;invitation.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <TactileButton
                                    variant="primary"
                                    size="lg"
                                    leftIcon={<Plus className="w-5 h-5" />}
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    Créer ma première classe
                                </TactileButton>
                                <TactileButton
                                    variant="secondary"
                                    size="lg"
                                    leftIcon={<KeyRound className="w-5 h-5" />}
                                    onClick={() => setShowJoinModal(true)}
                                >
                                    J&apos;ai un code
                                </TactileButton>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-12">
                            {/* ── Teaching Section ── */}
                            {filteredTeaching.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <GraduationCap className="w-7 h-7 text-[#99334C]" />
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Classes que j&apos;enseigne
                                        </h2>
                                        <span className="px-3 py-1 bg-[#99334C]/10 text-[#99334C] text-sm font-bold rounded-full">
                                            {filteredTeaching.length}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredTeaching.map((c) => (
                                            <TeacherClassCard key={c.id} classroom={c} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Enrolled Section ── */}
                            {filteredEnrolled.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <BookOpen className="w-7 h-7 text-blue-600" />
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Classes que je suis
                                        </h2>
                                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-sm font-bold rounded-full">
                                            {filteredEnrolled.length}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredEnrolled.map((c) => (
                                            <StudentClassCard key={c.id} classroom={c} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* MODALS */}
            <CreateClassroomModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={handleClassCreated}
            />
            <JoinClassroomModal
                isOpen={showJoinModal}
                onClose={() => setShowJoinModal(false)}
                onJoined={fetchClassrooms}
            />
        </div>
    );
};

export default ClassroomsPage;
