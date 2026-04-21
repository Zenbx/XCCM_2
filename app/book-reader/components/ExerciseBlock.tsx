"use client";

import React, { useState, useMemo } from 'react';
import {
    CircleDot, CheckSquare, Type, Brain, Code2, PuzzleIcon,
    ChevronDown, ChevronUp, Check, X, Loader2, Send,
    Award, RefreshCw, AlertCircle
} from 'lucide-react';
import { Exercise, Submission, SubmissionResult, ExerciseType } from '@/services/exerciseService';

// ─────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────
const TYPE_CONFIG: Record<ExerciseType, { label: string; icon: React.ReactNode; color: string; bgColor: string; borderColor: string }> = {
    QCU: { label: 'Choix Unique', icon: <CircleDot className="w-4 h-4" />, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    QCM: { label: 'Choix Multiple', icon: <CheckSquare className="w-4 h-4" />, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    QRO: { label: 'Réponse Courte', icon: <Type className="w-4 h-4" />, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    QROA: { label: 'Réponse Ouverte', icon: <Brain className="w-4 h-4" />, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
    CODE: { label: 'Code', icon: <Code2 className="w-4 h-4" />, color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
    FILL_BLANKS: { label: 'Texte à Trous', icon: <PuzzleIcon className="w-4 h-4" />, color: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
};

// ─────────────────────────────────────────
// EXERCISE BLOCK COMPONENT
// ─────────────────────────────────────────
interface ExerciseBlockProps {
    exercise: Exercise;
    submission?: Submission;
    isSubmitting: boolean;
    submissionCount?: number;
    onSubmit: (exerciseId: string, answers: any) => Promise<SubmissionResult | null>;
}

const ExerciseBlock: React.FC<ExerciseBlockProps> = ({
    exercise, submission, isSubmitting, submissionCount = 0, onSubmit
}) => {
    const [isExpanded, setIsExpanded] = useState(!submission);
    const [lastResult, setLastResult] = useState<SubmissionResult | null>(null);

    const config = TYPE_CONFIG[exercise.type];
    const params = exercise.parameters || {};
    const settings = (exercise.settings || {}) as any;
    
    const hasSubmitted = !!submission || !!lastResult;
    const isPerfect = (submission?.score !== null && submission?.score !== undefined && submission.score >= (settings.points || 10)) || 
                      (lastResult?.result?.isPerfect);

    const maxAttempts = settings.maxAttempts || 0;
    const isMaxAttemptsReached = maxAttempts > 0 && submissionCount >= maxAttempts;

    const handleSubmitAnswer = async (answers: any) => {
        if (isMaxAttemptsReached && !isPerfect) return;
        const result = await onSubmit(exercise.id, answers);
        if (result) {
            setLastResult(result);
        }
    };

    return (
        <div className={`my-6 rounded-2xl border-2 overflow-hidden transition-all ${
            isPerfect ? 'border-green-300 bg-green-50/50' :
            hasSubmitted ? 'border-amber-200 bg-amber-50/20' :
            `${config.borderColor} ${config.bgColor}/30`
        }`}>
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${config.bgColor} ${config.color}`}>
                        {config.icon}
                    </div>
                    <div className="text-left">
                        <h5 className="text-sm font-bold text-gray-900">{exercise.title}</h5>
                        <p className="text-xs text-gray-500">{config.label}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {maxAttempts > 0 && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isMaxAttemptsReached ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                            Tentatives : {submissionCount} / {maxAttempts}
                        </span>
                    )}
                    {isPerfect && (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            <Award className="w-3 h-3" /> Réussi
                        </span>
                    )}
                    {hasSubmitted && !isPerfect && (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                            <RefreshCw className="w-3 h-3" /> {isMaxAttemptsReached ? 'Terminé' : 'Tenté'}
                        </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-200/50">
                    {/* Exercise Image */}
                    {params.image_url && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                            <img 
                                src={params.image_url} 
                                alt={exercise.title} 
                                className="w-full max-h-80 object-contain" 
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* Last result feedback */}
                    {(lastResult || submission) && (
                        <div className={`mt-4 p-3 rounded-xl text-sm ${
                            (lastResult?.result?.isPerfect || isPerfect)
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                            <p className="font-medium">
                                {lastResult?.result?.feedback || submission?.feedback || ''}
                            </p>
                            {(lastResult?.result?.score !== null && lastResult?.result?.score !== undefined) && (
                                <p className="text-xs mt-1 opacity-70">
                                    Score : {lastResult.result.score}/{lastResult.result.maxPoints}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Exercise form */}
                    <div className="mt-4">
                        {exercise.type === 'QCU' && (
                            <QCUResolver params={params} isSubmitting={isSubmitting} onSubmit={handleSubmitAnswer} hasSubmitted={hasSubmitted} isPerfect={isPerfect} settings={settings} isMaxAttemptsReached={isMaxAttemptsReached} />
                        )}
                        {exercise.type === 'QCM' && (
                            <QCMResolver params={params} isSubmitting={isSubmitting} onSubmit={handleSubmitAnswer} hasSubmitted={hasSubmitted} isPerfect={isPerfect} settings={settings} isMaxAttemptsReached={isMaxAttemptsReached} />
                        )}
                        {exercise.type === 'QRO' && (
                            <QROResolver params={params} isSubmitting={isSubmitting} onSubmit={handleSubmitAnswer} hasSubmitted={hasSubmitted} isPerfect={isPerfect} settings={settings} isMaxAttemptsReached={isMaxAttemptsReached} />
                        )}
                        {exercise.type === 'QROA' && (
                            <QROAResolver params={params} isSubmitting={isSubmitting} onSubmit={handleSubmitAnswer} hasSubmitted={hasSubmitted} settings={settings} isMaxAttemptsReached={isMaxAttemptsReached} />
                        )}
                        {exercise.type === 'CODE' && (
                            <CodeResolver params={params} isSubmitting={isSubmitting} onSubmit={handleSubmitAnswer} hasSubmitted={hasSubmitted} settings={settings} isMaxAttemptsReached={isMaxAttemptsReached} />
                        )}
                        {exercise.type === 'FILL_BLANKS' && (
                            <FillBlanksResolver params={params} isSubmitting={isSubmitting} onSubmit={handleSubmitAnswer} hasSubmitted={hasSubmitted} isPerfect={isPerfect} settings={settings} isMaxAttemptsReached={isMaxAttemptsReached} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════
// QCU RESOLVER
// ═══════════════════════════════════════════
const QCUResolver = ({ params, isSubmitting, onSubmit, hasSubmitted, isPerfect, settings, isMaxAttemptsReached }: any) => {
    const [selected, setSelected] = useState<string | null>(null);

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-gray-800">{params.question}</p>
            <div className="space-y-2">
                {(params.options || []).map((opt: any) => (
                    <button
                        key={opt.id}
                        onClick={() => !isPerfect && setSelected(opt.id)}
                        disabled={isPerfect}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all text-sm ${
                            selected === opt.id
                                ? 'border-[#99334C] bg-[#99334C]/5 text-gray-900'
                                : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                        } ${isPerfect ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                selected === opt.id ? 'border-[#99334C] bg-[#99334C]' : 'border-gray-300'
                            }`}>
                                {selected === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            {opt.text}
                        </div>
                    </button>
                ))}
            </div>
            {!isPerfect && !isMaxAttemptsReached && (
                <button
                    onClick={() => selected && onSubmit({ selectedOptionId: selected })}
                    disabled={!selected || isSubmitting}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#99334C] text-white rounded-xl text-sm font-bold hover:bg-[#7a283d] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {hasSubmitted ? 'Réessayer' : 'Valider'}
                </button>
            )}
            {isMaxAttemptsReached && !isPerfect && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Nombre maximum de tentatives atteint.
                </p>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════
// QCM RESOLVER
// ═══════════════════════════════════════════
const QCMResolver = ({ params, isSubmitting, onSubmit, hasSubmitted, isPerfect, settings, isMaxAttemptsReached }: any) => {
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const toggle = (id: string) => {
        if (isPerfect) return;
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-gray-800">{params.question}</p>
            <p className="text-xs text-gray-400">Plusieurs réponses possibles</p>
            <div className="space-y-2">
                {(params.options || []).map((opt: any) => (
                    <button
                        key={opt.id}
                        onClick={() => toggle(opt.id)}
                        disabled={isPerfect}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all text-sm ${
                            selected.has(opt.id)
                                ? 'border-purple-500 bg-purple-50 text-gray-900'
                                : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                        } ${isPerfect ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                                selected.has(opt.id) ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                            }`}>
                                {selected.has(opt.id) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            {opt.text}
                        </div>
                    </button>
                ))}
            </div>
            {!isPerfect && !isMaxAttemptsReached && (
                <button
                    onClick={() => selected.size > 0 && onSubmit({ selectedOptionIds: Array.from(selected) })}
                    disabled={selected.size === 0 || isSubmitting}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {hasSubmitted ? 'Réessayer' : 'Valider'}
                </button>
            )}
            {isMaxAttemptsReached && !isPerfect && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Nombre maximum de tentatives atteint.
                </p>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════
// QRO RESOLVER
// ═══════════════════════════════════════════
const QROResolver = ({ params, isSubmitting, onSubmit, hasSubmitted, isPerfect, settings, isMaxAttemptsReached }: any) => {
    const [text, setText] = useState('');

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-gray-800">{params.question}</p>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isPerfect}
                placeholder="Votre réponse..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all disabled:opacity-60"
            />
            {!isPerfect && !isMaxAttemptsReached && (
                <button
                    onClick={() => text.trim() && onSubmit({ text })}
                    disabled={!text.trim() || isSubmitting}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {hasSubmitted ? 'Réessayer' : 'Valider'}
                </button>
            )}
            {isMaxAttemptsReached && !isPerfect && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Nombre maximum de tentatives atteint.
                </p>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════
// QROA RESOLVER
// ═══════════════════════════════════════════
const QROAResolver = ({ params, isSubmitting, onSubmit, hasSubmitted, settings, isMaxAttemptsReached }: any) => {
    const [text, setText] = useState('');

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-gray-800">{params.question}</p>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Développez votre réponse..."
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
            />
            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Brain className="w-3 h-3" /> Évaluation par IA
                </p>
                {!isMaxAttemptsReached && (
                    <button
                        onClick={() => text.trim() && onSubmit({ text })}
                        disabled={!text.trim() || isSubmitting}
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {hasSubmitted ? 'Soumettre à nouveau' : 'Soumettre'}
                    </button>
                )}
            </div>
            {isMaxAttemptsReached && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Nombre maximum de tentatives atteint.
                </p>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════
// CODE RESOLVER
// ═══════════════════════════════════════════
const CodeResolver = ({ params, isSubmitting, onSubmit, hasSubmitted, settings, isMaxAttemptsReached }: any) => {
    const [code, setCode] = useState(params.starterCode || '');

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-gray-800">{params.question}</p>
            <div className="text-xs text-gray-400 flex items-center gap-2">
                <Code2 className="w-3 h-3" />
                Langage : <span className="font-bold text-gray-600">{params.language || 'Python'}</span>
            </div>
            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-mono bg-gray-900 text-green-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all resize-y"
                spellCheck={false}
            />
            {!isMaxAttemptsReached && (
                <button
                    onClick={() => code.trim() && onSubmit({ code, language: params.language })}
                    disabled={!code.trim() || isSubmitting}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {hasSubmitted ? 'Soumettre à nouveau' : 'Exécuter & Soumettre'}
                </button>
            )}
            {isMaxAttemptsReached && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Nombre maximum de tentatives atteint.
                </p>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════
// FILL_BLANKS RESOLVER
// ═══════════════════════════════════════════
const FillBlanksResolver = ({ params, isSubmitting, onSubmit, hasSubmitted, isPerfect, settings, isMaxAttemptsReached }: any) => {
    const [blanksState, setBlanksState] = useState<Record<string, string>>({});

    // Parse text to split into parts with blank placeholders
    const parts = useMemo(() => {
        const text = params.text || '';
        const regex = /\{\{(\w+)\}\}/g;
        const result: Array<{ type: 'text' | 'blank'; content: string; blankId?: string }> = [];
        let lastIndex = 0;
        let match;
        let blankIndex = 0;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                result.push({ type: 'text', content: text.slice(lastIndex, match.index) });
            }
            const blanks = params.blanks || [];
            const blankId = blanks[blankIndex]?.id || `blank_${blankIndex}`;
            result.push({ type: 'blank', content: '', blankId });
            blankIndex++;
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
            result.push({ type: 'text', content: text.slice(lastIndex) });
        }
        return result;
    }, [params]);

    const allFilled = (params.blanks || []).every((b: any) => (blanksState[b.id] || '').trim());

    return (
        <div className="space-y-4">
            <p className="text-xs text-gray-400 flex items-center gap-1">
                <PuzzleIcon className="w-3 h-3" /> Complétez les trous
            </p>
            <div className="text-sm leading-8 text-gray-800 bg-white p-4 rounded-xl border border-gray-200">
                {parts.map((part, i) => {
                    if (part.type === 'text') {
                        return <span key={i}>{part.content}</span>;
                    }
                    return (
                        <input
                            key={i}
                            type="text"
                            value={blanksState[part.blankId!] || ''}
                            onChange={(e) => setBlanksState(prev => ({ ...prev, [part.blankId!]: e.target.value }))}
                            disabled={isPerfect}
                            className="inline-block w-28 mx-1 px-2 py-0.5 border-b-2 border-dashed border-[#99334C] bg-[#99334C]/5 rounded text-center text-sm font-medium text-[#99334C] focus:border-solid focus:bg-[#99334C]/10 outline-none transition-all disabled:opacity-60"
                            placeholder="..."
                        />
                    );
                })}
            </div>
            {!isPerfect && !isMaxAttemptsReached && (
                <button
                    onClick={() => allFilled && onSubmit({ blanks: blanksState })}
                    disabled={!allFilled || isSubmitting}
                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {hasSubmitted ? 'Réessayer' : 'Valider'}
                </button>
            )}
            {isMaxAttemptsReached && !isPerfect && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Nombre maximum de tentatives atteint.
                </p>
            )}
        </div>
    );
};

export default ExerciseBlock;
