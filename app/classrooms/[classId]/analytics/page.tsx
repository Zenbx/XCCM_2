"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ArrowLeft, Users, BookOpen, Target, Trophy, TrendingUp,
    TrendingDown, AlertCircle, BarChart3, ChevronDown, ChevronUp,
    Award, Clock, Lightbulb, Zap, Brain, Loader2, RefreshCw,
    CircleDot, CheckSquare, Type, Code2, PuzzleIcon, Eye
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TactileButton } from '@/components/UI/TactileButton';
import { Skeleton } from '@/components/UI/Skeleton';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

// ─────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────
interface StudentAnalytics {
    student: { user_id: string; firstname: string; lastname: string; email: string };
    enrolled_at: string;
    exercisesAttempted: number;
    exercisesCompleted: number;
    totalExercises: number;
    avgScore: number;
    progress: number;
    totalSubmissions: number;
    lastActivity: string | null;
}

interface ExerciseAnalytics {
    id: string;
    title: string;
    type: string;
    successRate: number;
    avgScore: number;
    maxPoints: number;
    studentsAttempted: number;
    totalStudents: number;
    avgAttempts: number;
    totalSubmissions: number;
}

interface Insight {
    type: 'warning' | 'success' | 'info' | 'suggestion';
    icon: string;
    title: string;
    description: string;
}

interface AnalyticsData {
    overview: {
        totalStudents: number;
        totalExercises: number;
        totalSubmissions: number;
        avgScore: number;
        completionRate: number;
        scoreDistribution: { excellent: number; good: number; struggling: number; failing: number };
    };
    students: StudentAnalytics[];
    exercises: ExerciseAnalytics[];
    insights: Insight[];
}

// ─────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────
const EXERCISE_TYPE_ICONS: Record<string, React.ReactNode> = {
    QCU: <CircleDot className="w-3.5 h-3.5" />,
    QCM: <CheckSquare className="w-3.5 h-3.5" />,
    QRO: <Type className="w-3.5 h-3.5" />,
    QROA: <Brain className="w-3.5 h-3.5" />,
    CODE: <Code2 className="w-3.5 h-3.5" />,
    FILL_BLANKS: <PuzzleIcon className="w-3.5 h-3.5" />,
};

const ProgressRing = ({ percentage, size = 48, strokeWidth = 5, color = '#99334C' }: {
    percentage: number; size?: number; strokeWidth?: number; color?: string;
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-gray-100 dark:text-gray-800" />
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
                strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                className="transition-all duration-1000 ease-out" />
            <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" transform={`rotate(90 ${size / 2} ${size / 2})`}
                className="text-xs font-bold fill-gray-900 dark:fill-white">
                {percentage}%
            </text>
        </svg>
    );
};

const MiniBar = ({ value, max, color = 'bg-[#99334C]' }: { value: number; max: number; color?: string }) => {
    const width = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${width}%` }} />
        </div>
    );
};

const ScoreDistributionChart = ({ data }: { data: { excellent: number; good: number; struggling: number; failing: number } }) => {
    const total = data.excellent + data.good + data.struggling + data.failing;
    if (total === 0) return <p className="text-sm text-gray-400 text-center py-4">Aucune donnée</p>;

    const segments = [
        { label: 'Excellent (≥8)', value: data.excellent, color: 'bg-green-500', textColor: 'text-green-600' },
        { label: 'Bien (5-8)', value: data.good, color: 'bg-blue-500', textColor: 'text-blue-600' },
        { label: 'Difficulté (2-5)', value: data.struggling, color: 'bg-amber-500', textColor: 'text-amber-600' },
        { label: 'Échec (<2)', value: data.failing, color: 'bg-red-500', textColor: 'text-red-600' },
    ];

    return (
        <div className="space-y-3">
            {/* Stacked bar */}
            <div className="h-6 rounded-full overflow-hidden flex bg-gray-100 dark:bg-gray-800">
                {segments.map(seg => {
                    const pct = total > 0 ? (seg.value / total) * 100 : 0;
                    if (pct === 0) return null;
                    return (
                        <div key={seg.label} className={`${seg.color} transition-all duration-700`} style={{ width: `${pct}%` }}
                            title={`${seg.label}: ${seg.value} (${Math.round(pct)}%)`} />
                    );
                })}
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2">
                {segments.map(seg => (
                    <div key={seg.label} className="flex items-center gap-2 text-xs">
                        <div className={`w-2.5 h-2.5 rounded-full ${seg.color}`} />
                        <span className="text-gray-500">{seg.label}</span>
                        <span className={`font-bold ${seg.textColor}`}>{seg.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────
const AnalyticsDashboard = () => {
    const router = useRouter();
    const params = useParams();
    const classId = params.classId as string;

    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'exercises'>('overview');
    const [sortStudents, setSortStudents] = useState<'progress' | 'score' | 'name' | 'activity'>('progress');
    const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = authService.getAuthToken();
            const res = await fetch(`${API_BASE_URL}/api/classrooms/${classId}/analytics`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                }
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Erreur');
            setData(json.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [classId]);

    useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

    // ═══════ SORTED STUDENTS ═══════
    const sortedStudents = useMemo(() => {
        if (!data) return [];
        const students = [...data.students];
        switch (sortStudents) {
            case 'progress': return students.sort((a, b) => b.progress - a.progress);
            case 'score': return students.sort((a, b) => b.avgScore - a.avgScore);
            case 'name': return students.sort((a, b) => a.student.lastname.localeCompare(b.student.lastname));
            case 'activity': return students.sort((a, b) => {
                if (!a.lastActivity) return 1;
                if (!b.lastActivity) return -1;
                return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
            });
            default: return students;
        }
    }, [data, sortStudents]);

    const getScoreColor = (score: number): string => {
        if (score >= 8) return 'text-green-600';
        if (score >= 5) return 'text-blue-600';
        if (score >= 2) return 'text-amber-600';
        return 'text-red-600';
    };

    const getProgressColor = (pct: number): string => {
        if (pct >= 80) return '#22c55e';
        if (pct >= 50) return '#3b82f6';
        if (pct > 0) return '#f59e0b';
        return '#d1d5db';
    };

    const getSuccessRateColor = (rate: number): string => {
        if (rate >= 70) return 'bg-green-500';
        if (rate >= 40) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const getInsightStyle = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800';
            case 'warning': return 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800';
            case 'suggestion': return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800';
            default: return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
        }
    };

    // ═══════ LOADING ═══════
    if (isLoading) return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#99334C] mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Analyse en cours...</p>
            </div>
        </div>
    );

    if (error || !data) return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
            <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Erreur</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <TactileButton variant="primary" onClick={() => router.push(`/classrooms/${classId}`)}>Retour</TactileButton>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            {/* ═══════ HEADER ═══════ */}
            <section className="relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white overflow-hidden py-12">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-6">
                    <button onClick={() => router.push(`/classrooms/${classId}`)}
                        className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" /> Retour à la classe
                    </button>

                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                                <BarChart3 className="w-8 h-8 text-[#99334C]" /> Dashboard Analytics
                            </h1>
                            <p className="text-white/60 mt-1">Suivi détaillé de la progression des étudiants</p>
                        </div>
                        <TactileButton variant="ghost" className="!text-white !border-white/20 border hover:!bg-white/10"
                            leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchAnalytics}>
                            Actualiser
                        </TactileButton>
                    </div>
                </div>
            </section>

            {/* ═══════ KPI CARDS ═══════ */}
            <section className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        { label: 'Étudiants', value: data.overview.totalStudents, icon: <Users className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' },
                        { label: 'Exercices', value: data.overview.totalExercises, icon: <Target className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' },
                        { label: 'Soumissions', value: data.overview.totalSubmissions, icon: <Zap className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' },
                        { label: 'Score moyen', value: `${data.overview.avgScore}/10`, icon: <Award className="w-5 h-5" />, color: 'bg-green-50 text-green-600 dark:bg-green-900/20' },
                        { label: 'Complétion', value: `${data.overview.completionRate}%`, icon: <Trophy className="w-5 h-5" />, color: 'bg-[#99334C]/10 text-[#99334C]' },
                    ].map((kpi, i) => (
                        <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-lg">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>{kpi.icon}</div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                            <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══════ INSIGHTS PANEL ═══════ */}
            {data.insights.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 mt-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Analyses & Suggestions</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {data.insights.map((insight, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + i * 0.08 }}
                                className={`rounded-xl p-4 border ${getInsightStyle(insight.type)}`}>
                                <div className="flex items-start gap-3">
                                    <span className="text-xl flex-shrink-0">{insight.icon}</span>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{insight.title}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{insight.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* ═══════ TAB NAVIGATION ═══════ */}
            <section className="max-w-7xl mx-auto px-6 mt-8">
                <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-800 w-fit">
                    {[
                        { id: 'overview' as const, label: 'Vue d\'ensemble', icon: <BarChart3 className="w-4 h-4" /> },
                        { id: 'students' as const, label: 'Étudiants', icon: <Users className="w-4 h-4" /> },
                        { id: 'exercises' as const, label: 'Exercices', icon: <Target className="w-4 h-4" /> },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                                ? 'bg-[#99334C] text-white shadow-lg'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-white'
                                }`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* ═══════ TAB CONTENT ═══════ */}
            <section className="max-w-7xl mx-auto px-6 mt-6 pb-16">
                <AnimatePresence mode="wait">
                    {/* ═══ OVERVIEW TAB ═══ */}
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Score Distribution */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-[#99334C]" /> Distribution des scores
                                </h3>
                                <ScoreDistributionChart data={data.overview.scoreDistribution} />
                            </div>

                            {/* Completion ring */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-[#99334C]" /> Complétion globale
                                </h3>
                                <div className="flex items-center justify-center gap-8 py-4">
                                    <ProgressRing percentage={data.overview.completionRate} size={100} strokeWidth={8}
                                        color={getProgressColor(data.overview.completionRate)} />
                                    <div className="space-y-2">
                                        <div className="text-sm"><span className="font-bold text-gray-900 dark:text-white">{data.overview.totalSubmissions}</span><span className="text-gray-500"> soumissions</span></div>
                                        <div className="text-sm"><span className="font-bold text-gray-900 dark:text-white">{data.overview.avgScore}/10</span><span className="text-gray-500"> score moyen</span></div>
                                        <div className="text-sm"><span className="font-bold text-gray-900 dark:text-white">{data.overview.totalExercises}</span><span className="text-gray-500"> exercices</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Top exercises by difficulty */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 lg:col-span-2">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <TrendingDown className="w-4 h-4 text-amber-500" /> Classement des exercices par difficulté
                                </h3>
                                <div className="space-y-3">
                                    {data.exercises.slice(0, 8).map((ex, i) => (
                                        <div key={ex.id} className="flex items-center gap-4">
                                            <span className="text-xs font-mono text-gray-400 w-5">{i + 1}</span>
                                            <div className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                                {EXERCISE_TYPE_ICONS[ex.type] || <Target className="w-3.5 h-3.5" />}
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white flex-1 truncate">{ex.title}</p>
                                            <div className="w-32"><MiniBar value={ex.successRate} max={100} color={getSuccessRateColor(ex.successRate)} /></div>
                                            <span className="text-sm font-bold w-10 text-right" style={{ color: getProgressColor(ex.successRate) }}>{ex.successRate}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ STUDENTS TAB ═══ */}
                    {activeTab === 'students' && (
                        <motion.div key="students" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Sort controls */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs font-medium text-gray-500">Trier par :</span>
                                {[
                                    { id: 'progress' as const, label: 'Progression' },
                                    { id: 'score' as const, label: 'Score' },
                                    { id: 'name' as const, label: 'Nom' },
                                    { id: 'activity' as const, label: 'Activité' },
                                ].map(s => (
                                    <button key={s.id} onClick={() => setSortStudents(s.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sortStudents === s.id
                                            ? 'bg-[#99334C] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                        {s.label}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                {sortedStudents.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                        <p>Aucun étudiant inscrit</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {sortedStudents.map((s, i) => (
                                            <motion.div key={s.student.user_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                                <button onClick={() => setExpandedStudent(expandedStudent === s.student.user_id ? null : s.student.user_id)}
                                                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left">
                                                    {/* Avatar */}
                                                    <div className="w-10 h-10 bg-gradient-to-br from-[#99334C]/20 to-[#99334C]/40 rounded-full flex items-center justify-center text-sm font-bold text-[#99334C] flex-shrink-0">
                                                        {s.student.firstname?.[0]}{s.student.lastname?.[0]}
                                                    </div>

                                                    {/* Name */}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                                            {s.student.firstname} {s.student.lastname}
                                                        </p>
                                                        <p className="text-xs text-gray-400 truncate">{s.student.email}</p>
                                                    </div>

                                                    {/* Progress ring */}
                                                    <div className="hidden sm:block flex-shrink-0">
                                                        <ProgressRing percentage={s.progress} size={40} strokeWidth={4} color={getProgressColor(s.progress)} />
                                                    </div>

                                                    {/* Score */}
                                                    <div className="hidden md:flex flex-col items-center flex-shrink-0 w-16">
                                                        <span className={`text-lg font-bold ${getScoreColor(s.avgScore)}`}>{s.avgScore}</span>
                                                        <span className="text-[10px] text-gray-400">/10 moy.</span>
                                                    </div>

                                                    {/* Exercises count */}
                                                    <div className="hidden lg:flex flex-col items-center flex-shrink-0 w-20">
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{s.exercisesCompleted}/{s.totalExercises}</span>
                                                        <span className="text-[10px] text-gray-400">complétés</span>
                                                    </div>

                                                    {/* Last activity */}
                                                    <div className="hidden xl:block flex-shrink-0 w-24 text-right">
                                                        {s.lastActivity ? (
                                                            <span className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(s.lastActivity).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-red-400">Inactif</span>
                                                        )}
                                                    </div>

                                                    {expandedStudent === s.student.user_id
                                                        ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                        : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                                                </button>

                                                {/* Expanded details */}
                                                <AnimatePresence>
                                                    {expandedStudent === s.student.user_id && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-xl">
                                                                    <p className="text-xs text-gray-500">Progression</p>
                                                                    <p className="text-xl font-bold" style={{ color: getProgressColor(s.progress) }}>{s.progress}%</p>
                                                                </div>
                                                                <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-xl">
                                                                    <p className="text-xs text-gray-500">Score moyen</p>
                                                                    <p className={`text-xl font-bold ${getScoreColor(s.avgScore)}`}>{s.avgScore}/10</p>
                                                                </div>
                                                                <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-xl">
                                                                    <p className="text-xs text-gray-500">Tentatives</p>
                                                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{s.totalSubmissions}</p>
                                                                </div>
                                                                <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-xl">
                                                                    <p className="text-xs text-gray-500">Exercices tentés</p>
                                                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{s.exercisesAttempted}/{s.totalExercises}</p>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3">
                                                                <MiniBar value={s.progress} max={100} color={s.progress >= 80 ? 'bg-green-500' : s.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'} />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ EXERCISES TAB ═══ */}
                    {activeTab === 'exercises' && (
                        <motion.div key="exercises" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {data.exercises.length === 0 ? (
                                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">Aucun exercice</h3>
                                    <p className="text-gray-500 text-sm">Créez des exercices dans l&apos;éditeur pour voir les statistiques ici.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {data.exercises.map((ex, i) => (
                                        <motion.div key={ex.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 hover:shadow-md transition-all">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                                        {EXERCISE_TYPE_ICONS[ex.type] || <Target className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{ex.title}</p>
                                                        <p className="text-[10px] text-gray-400 uppercase font-semibold">{ex.type}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Success rate bar */}
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-xs text-gray-500">Taux de réussite</span>
                                                    <span className="text-sm font-bold" style={{ color: getProgressColor(ex.successRate) }}>{ex.successRate}%</span>
                                                </div>
                                                <MiniBar value={ex.successRate} max={100} color={getSuccessRateColor(ex.successRate)} />
                                            </div>

                                            {/* Stats grid */}
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <p className="text-xs text-gray-400">Score moy.</p>
                                                    <p className={`text-sm font-bold ${getScoreColor(ex.avgScore)}`}>{ex.avgScore}</p>
                                                </div>
                                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <p className="text-xs text-gray-400">Tentatives</p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{ex.studentsAttempted}/{ex.totalStudents}</p>
                                                </div>
                                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <p className="text-xs text-gray-400">Moy. essais</p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{ex.avgAttempts}×</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
};

export default AnalyticsDashboard;
