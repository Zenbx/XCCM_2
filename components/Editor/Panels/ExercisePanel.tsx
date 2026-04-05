"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Trash2, Check, X, Loader2, Edit3,
    CircleDot, CheckSquare, Type, Brain, Code2, PuzzleIcon,
    AlertCircle, Sparkles, Target, ExternalLink, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exerciseService, Exercise, ExerciseType, QCMOption } from '@/services/exerciseService';
import { TactileButton } from '@/components/UI/TactileButton';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────
// EXERCISE TYPE CONFIG
// ─────────────────────────────────────────
const EXERCISE_TYPES: { type: ExerciseType; label: string; description: string; icon: React.ReactNode; color: string }[] = [
    { type: 'QCU', label: 'Choix Unique', description: 'Une seule bonne réponse', icon: <CircleDot className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { type: 'QCM', label: 'Choix Multiple', description: 'Plusieurs bonnes réponses', icon: <CheckSquare className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600 border-purple-200' },
    { type: 'QRO', label: 'Réponse Courte', description: 'Mot ou phrase exacte', icon: <Type className="w-5 h-5" />, color: 'bg-green-50 text-green-600 border-green-200' },
    { type: 'QROA', label: 'Réponse Ouverte IA', description: 'Évaluée par Socrate AI', icon: <Brain className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600 border-amber-200' },
    { type: 'CODE', label: 'Code Runner', description: 'Exécution et tests', icon: <Code2 className="w-5 h-5" />, color: 'bg-slate-50 text-slate-600 border-slate-200' },
    { type: 'FILL_BLANKS', label: 'Texte à Trous', description: 'Compléter les blancs', icon: <PuzzleIcon className="w-5 h-5" />, color: 'bg-rose-50 text-rose-600 border-rose-200' },
];

// ─────────────────────────────────────────
// GRANULE LEVEL HELPERS
// ─────────────────────────────────────────
type GranuleLevel = 'project' | 'part' | 'chapter' | 'paragraph' | 'notion';

const LEVEL_CONFIG: Record<GranuleLevel, { label: string; color: string }> = {
    project: { label: 'Projet', color: 'bg-gray-100 text-gray-600' },
    part: { label: 'Partie', color: 'bg-blue-50 text-blue-600' },
    chapter: { label: 'Chapitre', color: 'bg-purple-50 text-purple-600' },
    paragraph: { label: 'Paragraphe', color: 'bg-green-50 text-green-600' },
    notion: { label: 'Notion', color: 'bg-amber-50 text-amber-600' },
};

const getGranuleLevelFromExercise = (ex: Exercise): { level: GranuleLevel; name: string } => {
    if (ex.notion_id) return { level: 'notion', name: (ex as any)._notion_name || 'Notion' };
    if (ex.para_id) return { level: 'paragraph', name: (ex as any)._para_name || 'Paragraphe' };
    if (ex.chapter_id) return { level: 'chapter', name: (ex as any)._chapter_name || 'Chapitre' };
    if (ex.part_id) return { level: 'part', name: (ex as any)._part_name || 'Partie' };
    return { level: 'project', name: (ex as any)._project_name || 'Projet' };
};

// ─────────────────────────────────────────
// QCU / QCM FORM BUILDER
// ─────────────────────────────────────────
const QCMFormBuilder = ({
    isMultiple, question, setQuestion, options, setOptions
}: {
    isMultiple: boolean; question: string; setQuestion: (q: string) => void; options: QCMOption[]; setOptions: (opts: QCMOption[]) => void;
}) => {
    const addOption = () => setOptions([...options, { id: `opt_${Date.now()}`, text: '', isCorrect: false }]);
    const removeOption = (id: string) => setOptions(options.filter(o => o.id !== id));
    const toggleCorrect = (id: string) => {
        if (isMultiple) setOptions(options.map(o => o.id === id ? { ...o, isCorrect: !o.isCorrect } : o));
        else setOptions(options.map(o => ({ ...o, isCorrect: o.id === id })));
    };
    const updateText = (id: string, text: string) => setOptions(options.map(o => o.id === id ? { ...o, text } : o));

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Question</label>
                <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Posez votre question ici..." rows={2}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                    Options {isMultiple ? '(cochez les bonnes réponses)' : '(cochez la bonne réponse)'}
                </label>
                <div className="space-y-2">
                    {options.map((opt, idx) => (
                        <motion.div key={opt.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 group">
                            <button type="button" onClick={() => toggleCorrect(opt.id)}
                                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${opt.isCorrect ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400 dark:border-gray-600'}`}>
                                {opt.isCorrect && <Check className="w-4 h-4" />}
                            </button>
                            <input type="text" value={opt.text} onChange={(e) => updateText(opt.id, e.target.value)}
                                placeholder={`Option ${idx + 1}`}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                            {options.length > 2 && (
                                <button onClick={() => removeOption(opt.id)} className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
                <button onClick={addOption} className="mt-2 text-sm text-[#99334C] hover:text-[#7a283d] font-medium flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Ajouter une option
                </button>
            </div>
        </div>
    );
};

// Simple form component for QRO
const QROFormBuilder = ({ question, setQuestion, expectedAnswer, setExpectedAnswer }: {
    question: string; setQuestion: (q: string) => void; expectedAnswer: string; setExpectedAnswer: (a: string) => void;
}) => (
    <div className="space-y-4">
        <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Question</label>
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Posez votre question..." rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
        </div>
        <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Réponse attendue</label>
            <input type="text" value={expectedAnswer} onChange={(e) => setExpectedAnswer(e.target.value)} placeholder="La réponse correcte exacte"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
        </div>
    </div>
);

// QROA Form
const QROAFormBuilder = ({ question, setQuestion, evaluationPrompt, setEvaluationPrompt }: {
    question: string; setQuestion: (q: string) => void; evaluationPrompt: string; setEvaluationPrompt: (p: string) => void;
}) => (
    <div className="space-y-4">
        <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Question ouverte</label>
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ex: Expliquez le fonctionnement du TCP/IP..." rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
        </div>
        <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
            <span className="flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" /> Consignes pour l&apos;IA</span></label>
            <textarea value={evaluationPrompt} onChange={(e) => setEvaluationPrompt(e.target.value)} placeholder="Critères d'évaluation pour Socrate AI..." rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
        </div>
    </div>
);

// CODE Form
const CodeFormBuilder = ({ question, setQuestion, starterCode, setStarterCode, language, setLanguage }: {
    question: string; setQuestion: (q: string) => void; starterCode: string; setStarterCode: (c: string) => void; language: string; setLanguage: (l: string) => void;
}) => (
    <div className="space-y-4">
        <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Énoncé</label>
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Décrivez le problème de code..." rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
        </div>
        <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Langage</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <option value="python">Python</option><option value="javascript">JavaScript</option>
                <option value="java">Java</option><option value="c">C</option><option value="cpp">C++</option>
            </select>
        </div>
        <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Code de départ</label>
            <textarea value={starterCode} onChange={(e) => setStarterCode(e.target.value)} placeholder="# Squelette de code..." rows={5}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all resize-none bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
        </div>
    </div>
);

// FILL_BLANKS Form
const FillBlanksFormBuilder = ({ text, setText }: { text: string; setText: (t: string) => void }) => (
    <div className="space-y-4">
        <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Texte à trous</label>
            <p className="text-xs text-gray-400 mb-2">Utilisez <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{'{{mot}}'}</code> pour marquer les trous</p>
            <textarea value={text} onChange={(e) => setText(e.target.value)}
                placeholder={'Le {{soleil}} se lève à l\'{{est}} et se couche à l\'{{ouest}}.'} rows={4}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
        </div>
    </div>
);

// ─────────────────────────────────────────
// GRANULE LEVEL SELECTOR (for attaching exercise at specific level)
// ─────────────────────────────────────────
const GranuleLevelSelector = ({
    currentContext,
    structure,
    selectedLevel,
    setSelectedLevel
}: {
    currentContext: any;
    structure: any[];
    selectedLevel: GranuleLevel;
    setSelectedLevel: (l: GranuleLevel) => void;
}) => {
    // Build available levels from current context
    const availableLevels: { level: GranuleLevel; name: string }[] = [];

    if (currentContext?.projectName) {
        availableLevels.push({ level: 'project', name: currentContext.projectName });
    }
    if (currentContext?.partTitle) {
        availableLevels.push({ level: 'part', name: currentContext.partTitle });
    }
    if (currentContext?.chapterTitle) {
        availableLevels.push({ level: 'chapter', name: currentContext.chapterTitle });
    }
    if (currentContext?.paraName) {
        availableLevels.push({ level: 'paragraph', name: currentContext.paraName });
    }
    if (currentContext?.notion?.notion_name || currentContext?.notionName) {
        availableLevels.push({ level: 'notion', name: currentContext?.notion?.notion_name || currentContext?.notionName });
    }

    if (availableLevels.length <= 1) return null;

    return (
        <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Attacher au niveau</label>
            <div className="flex flex-wrap gap-1.5">
                {availableLevels.map((al) => (
                    <button
                        key={al.level}
                        onClick={() => setSelectedLevel(al.level)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${selectedLevel === al.level
                            ? 'bg-[#99334C] text-white border-[#99334C]'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#99334C]/30 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                            }`}
                        title={al.name}
                    >
                        {LEVEL_CONFIG[al.level].label}
                    </button>
                ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
                → <span className="font-medium">{availableLevels.find(al => al.level === selectedLevel)?.name}</span>
            </p>
        </div>
    );
};

// ─────────────────────────────────────────
// MAIN EXERCISE PANEL
// ─────────────────────────────────────────
interface ExercisePanelProps {
    currentContext?: any;
    structure?: any[];
    onNavigateToGranule?: (context: {
        type: string;
        partTitle?: string;
        chapterTitle?: string;
        paraName?: string;
        notionName?: string;
    }) => void;
    project?: any;
}

const ExercisePanel = ({ currentContext, structure, project, onNavigateToGranule }: ExercisePanelProps) => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCreator, setShowCreator] = useState(false);
    const [selectedType, setSelectedType] = useState<ExerciseType | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<GranuleLevel>('project');

    // Form state
    const [title, setTitle] = useState('');
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<QCMOption[]>([
        { id: 'opt_1', text: '', isCorrect: false },
        { id: 'opt_2', text: '', isCorrect: false },
    ]);
    const [expectedAnswer, setExpectedAnswer] = useState('');
    const [evaluationPrompt, setEvaluationPrompt] = useState('');
    const [starterCode, setStarterCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [fillText, setFillText] = useState('');
    const [isBlocking, setIsBlocking] = useState(false);
    const [maxAttempts, setMaxAttempts] = useState(3);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    
    // Edit mode state
    const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

    // Set deepest level as default
    useEffect(() => {
        if (currentContext?.notion?.notion_name || currentContext?.notionName) setSelectedLevel('notion');
        else if (currentContext?.paraName) setSelectedLevel('paragraph');
        else if (currentContext?.chapterTitle) setSelectedLevel('chapter');
        else if (currentContext?.partTitle) setSelectedLevel('part');
        else setSelectedLevel('project');
    }, [currentContext]);

    // ═══════ RESOLVE GRANULE IDS FROM STRUCTURE ═══════
    const resolveGranuleIds = useCallback((level: GranuleLevel) => {
        const target: any = {};
        if (!structure || !currentContext?.projectName) return target;

        // Find the project
        // Note: structure is an array of parts, not projects. We need project ID from elsewhere.
        // The project_id might be available via currentContext or projectData
        // For now, we resolve from the TOC structure

        if (project?.pr_id) {
            target.project_id = project.pr_id;
        }

        if (level === 'project') {
            return target;
        }

        const part = structure.find((p: any) => p.part_title === currentContext.partTitle);
        if (!part) return target;

        if (level === 'part') {
            target.part_id = part.part_id;
            return target;
        }

        const chapter = part.chapters?.find((c: any) => c.chapter_title === currentContext.chapterTitle);
        if (!chapter) return target;

        if (level === 'chapter') {
            target.chapter_id = chapter.chapter_id;
            return target;
        }

        const para = chapter.paragraphs?.find((p: any) => p.para_name === currentContext.paraName);
        if (!para) return target;

        if (level === 'paragraph') {
            target.para_id = para.para_id;
            return target;
        }

        const notionName = currentContext?.notion?.notion_name || currentContext?.notionName;
        const notion = para.notions?.find((n: any) => n.notion_name === notionName);
        if (notion) {
            target.notion_id = notion.notion_id;
        }

        return target;
    }, [structure, currentContext]);

    // ═══════ BUILD GRANULE CONTEXT FROM EXERCISE (for navigation) ═══════
    const buildGranuleContextFromExercise = useCallback((exercise: Exercise): {
        type: string;
        partTitle?: string;
        chapterTitle?: string;
        paraName?: string;
        notionName?: string;
    } | null => {
        if (!structure) return null;

        // Search through structure to find the granule this exercise belongs to
        for (const part of structure) {
            if (exercise.part_id === part.part_id) return { type: 'part', partTitle: part.part_title };

            for (const chapter of (part.chapters || [])) {
                if (exercise.chapter_id === chapter.chapter_id) {
                    return { type: 'chapter', partTitle: part.part_title, chapterTitle: chapter.chapter_title };
                }

                for (const para of (chapter.paragraphs || [])) {
                    if (exercise.para_id === para.para_id) {
                        return { type: 'paragraph', partTitle: part.part_title, chapterTitle: chapter.chapter_title, paraName: para.para_name };
                    }

                    for (const notion of (para.notions || [])) {
                        if (exercise.notion_id === notion.notion_id) {
                            return {
                                type: 'notion',
                                partTitle: part.part_title, chapterTitle: chapter.chapter_title,
                                paraName: para.para_name, notionName: notion.notion_name
                            };
                        }
                    }
                }
            }
        }
        return null;
    }, [structure]);

    // ═══════ BUILD EXERCISE BREADCRUMB ═══════
    const buildBreadcrumb = useCallback((exercise: Exercise): string => {
        if (!structure) return '';
        for (const part of structure) {
            if (exercise.part_id === part.part_id) return part.part_title;
            for (const chap of (part.chapters || [])) {
                if (exercise.chapter_id === chap.chapter_id) return `${part.part_title} › ${chap.chapter_title}`;
                for (const para of (chap.paragraphs || [])) {
                    if (exercise.para_id === para.para_id) return `${part.part_title} › ${chap.chapter_title} › ${para.para_name}`;
                    for (const n of (para.notions || [])) {
                        if (exercise.notion_id === n.notion_id) return `...${chap.chapter_title} › ${para.para_name} › ${n.notion_name}`;
                    }
                }
            }
        }
        return 'Projet';
    }, [structure]);

    const granuleName = currentContext?.notion?.notion_name || currentContext?.notionName || currentContext?.paraName || currentContext?.chapterTitle || currentContext?.partTitle || currentContext?.projectName || 'Projet';

    // ═══════ LOAD EXERCISES ═══════
    const fetchExercises = useCallback(async () => {
        try {
            setIsLoading(true);
            const target = resolveGranuleIds(selectedLevel);
            const data = await exerciseService.getExercises(Object.keys(target).length > 0 ? target : undefined);
            setExercises(data);
        } catch (err: any) {
            console.error('Fetch exercises error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [resolveGranuleIds, selectedLevel]);

    useEffect(() => { fetchExercises(); }, [fetchExercises]);

    const resetForm = () => {
        setEditingExerciseId(null);
        setSelectedType(null); setTitle(''); setQuestion('');
        setOptions([{ id: 'opt_1', text: '', isCorrect: false }, { id: 'opt_2', text: '', isCorrect: false }]);
        setExpectedAnswer(''); setEvaluationPrompt(''); setStarterCode(''); setLanguage('python');
        setFillText(''); setIsBlocking(false); setMaxAttempts(3); setShowCreator(false);
    };

    const buildParameters = (): any => {
        switch (selectedType) {
            case 'QCU': case 'QCM': return { question, options, shuffle: false };
            case 'QRO': return { question, expectedAnswer, caseSensitive: false };
            case 'QROA': return { question, evaluationPrompt, maxScore: 10 };
            case 'CODE': return { question, language, starterCode, testCases: [] };
            case 'FILL_BLANKS':
                const blankRegex = /\{\{(\w+)\}\}/g;
                const blanks: Array<{ id: string; answer: string }> = [];
                let match;
                while ((match = blankRegex.exec(fillText)) !== null) {
                    blanks.push({ id: `blank_${blanks.length + 1}`, answer: match[1] });
                }
                return { text: fillText, blanks };
            default: return {};
        }
    };

    const validateForm = (): boolean => {
        if (!title.trim()) { toast.error("Donnez un titre"); return false; }
        if (!selectedType) { toast.error("Choisissez un type"); return false; }
        if (!question.trim() && selectedType !== 'FILL_BLANKS') { toast.error("Question requise"); return false; }
        if ((selectedType === 'QCU' || selectedType === 'QCM') && options.filter(o => o.text.trim()).length < 2) { toast.error("Au moins 2 options"); return false; }
        if ((selectedType === 'QCU' || selectedType === 'QCM') && !options.some(o => o.isCorrect)) { toast.error("Cochez une bonne réponse"); return false; }
        if (selectedType === 'QRO' && !expectedAnswer.trim()) { toast.error("Réponse attendue requise"); return false; }
        if (selectedType === 'FILL_BLANKS' && !fillText.includes('{{')) { toast.error("Utilisez {{mot}} pour les trous"); return false; }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            const params = buildParameters();
            if (editingExerciseId) {
                // Update mode
                const updatedEx = await exerciseService.updateExercise(editingExerciseId, {
                    title,
                    parameters: params,
                    settings: { isBlocking, maxAttempts, points: 10 }
                });
                setExercises(prev => prev.map(e => e.id === editingExerciseId ? updatedEx : e));
                toast.success("Exercice modifié !");
            } else {
                // Create mode
                const target = resolveGranuleIds(selectedLevel);
                const exercise = await exerciseService.createExercise({
                    type: selectedType!,
                    title,
                    parameters: params,
                    settings: { isBlocking, maxAttempts, points: 10 },
                    ...target
                });
                toast.success("Exercice créé !");
                setExercises(prev => [exercise, ...prev]);
            }
            resetForm();
        } catch (err: any) {
            toast.error(err.message || "Erreur");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditExercise = (exercise: Exercise) => {
        setEditingExerciseId(exercise.id);
        setSelectedType(exercise.type);
        setTitle(exercise.title);
        
        // Restore params
        const params = exercise.parameters || {};
        if (params.question) setQuestion(params.question);
        if (params.options) setOptions(params.options);
        if (params.expectedAnswer) setExpectedAnswer(params.expectedAnswer);
        if (params.evaluationPrompt) setEvaluationPrompt(params.evaluationPrompt);
        if (params.starterCode) setStarterCode(params.starterCode);
        if (params.language) setLanguage(params.language);
        if (params.text) setFillText(params.text);
        
        // Restore settings
        const settings = exercise.settings || {};
        setIsBlocking(!!settings.isBlocking);
        setMaxAttempts(settings.maxAttempts || 3);
        
        setShowCreator(true);
    };

    const handleDelete = async (exerciseId: string) => {
        try {
            await exerciseService.deleteExercise(exerciseId);
            setExercises(prev => prev.filter(e => e.id !== exerciseId));
            toast.success("Exercice supprimé");
        } catch (err: any) {
            toast.error(err.message || "Erreur");
        }
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        const newExercises = [...exercises];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (targetIndex < 0 || targetIndex >= newExercises.length) return;

        // Swap
        [newExercises[index], newExercises[targetIndex]] = [newExercises[targetIndex], newExercises[index]];
        
        // Optimistic update
        setExercises(newExercises);
        setIsReordering(true);

        try {
            await exerciseService.reorderExercises(newExercises.map(ex => ex.id));
            toast.success("Ordre mis à jour");
        } catch (err: any) {
            toast.error("Erreur réordonnancement");
            // Rollback if needed (could refetch)
            fetchExercises();
        } finally {
            setIsReordering(false);
        }
    };

    const handleNavigate = (exercise: Exercise) => {
        const ctx = buildGranuleContextFromExercise(exercise);
        if (ctx && onNavigateToGranule) {
            onNavigateToGranule(ctx);
            toast.success(`Navigation vers ${ctx.partTitle || 'le granule'}`, { icon: '📍' });
        }
    };

    const getTypeConfig = (type: ExerciseType) => EXERCISE_TYPES.find(t => t.type === type);

    return (
        <div className="space-y-4">
            {/* Current context indicator */}
            <div className="bg-[#99334C]/5 rounded-xl p-3 border border-[#99334C]/10">
                <div className="flex items-center gap-2 text-xs text-[#99334C] font-semibold">
                    <Target className="w-3.5 h-3.5" />
                    Granule actuel
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 truncate">{granuleName}</p>
                {currentContext?.type && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${LEVEL_CONFIG[currentContext.type as GranuleLevel]?.color || 'bg-gray-100 text-gray-600'}`}>
                        {LEVEL_CONFIG[currentContext.type as GranuleLevel]?.label || currentContext.type}
                    </span>
                )}
            </div>

            {/* ═══════ CREATOR ═══════ */}
            {!showCreator ? (
                <TactileButton variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowCreator(true)} className="w-full">
                    Nouvel exercice
                </TactileButton>
            ) : (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#99334C]" /> {editingExerciseId ? 'Modifier l\'exercice' : 'Créer un exercice'}
                        </h4>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="p-4 space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Titre</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Quiz de fin de chapitre"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white" autoFocus />
                        </div>

                        {/* Granule Level Selector (Hidden in edit mode since level can't easily be changed) */}
                        {!editingExerciseId && (
                            <GranuleLevelSelector currentContext={currentContext} structure={structure || []} selectedLevel={selectedLevel} setSelectedLevel={setSelectedLevel} />
                        )}

                        {/* Type Selector (Disabled or visually distinct in edit mode) */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Type d&apos;exercice</label>
                            <div className="grid grid-cols-2 gap-2">
                                {EXERCISE_TYPES.map((et) => (
                                    <button key={et.type} onClick={() => !editingExerciseId && setSelectedType(et.type)}
                                        className={`p-2.5 rounded-xl border-2 text-left transition-all ${selectedType === et.type
                                            ? 'border-[#99334C] bg-[#99334C]/5 ring-1 ring-[#99334C]/20'
                                            : editingExerciseId ? 'border-gray-100 opacity-50 cursor-not-allowed' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                                        <div className={`inline-flex p-1.5 rounded-lg mb-1 ${et.color}`}>{et.icon}</div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">{et.label}</p>
                                        <p className="text-[10px] text-gray-400">{et.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic form */}
                        <AnimatePresence mode="wait">
                            {selectedType && (
                                <motion.div key={selectedType} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    {(selectedType === 'QCU' || selectedType === 'QCM') && <QCMFormBuilder isMultiple={selectedType === 'QCM'} question={question} setQuestion={setQuestion} options={options} setOptions={setOptions} />}
                                    {selectedType === 'QRO' && <QROFormBuilder question={question} setQuestion={setQuestion} expectedAnswer={expectedAnswer} setExpectedAnswer={setExpectedAnswer} />}
                                    {selectedType === 'QROA' && <QROAFormBuilder question={question} setQuestion={setQuestion} evaluationPrompt={evaluationPrompt} setEvaluationPrompt={setEvaluationPrompt} />}
                                    {selectedType === 'CODE' && <CodeFormBuilder question={question} setQuestion={setQuestion} starterCode={starterCode} setStarterCode={setStarterCode} language={language} setLanguage={setLanguage} />}
                                    {selectedType === 'FILL_BLANKS' && <FillBlanksFormBuilder text={fillText} setText={setFillText} />}

                                    {/* Settings */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase">Paramètres</label>
                                        <label className="flex items-center gap-3 cursor-pointer group/toggle">
                                            <div 
                                                onClick={() => setIsBlocking(!isBlocking)}
                                                className={`w-10 h-6 rounded-full transition-all relative ${isBlocking ? 'bg-[#99334C]' : 'bg-gray-200 dark:bg-gray-700'}`}
                                            >
                                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isBlocking ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                                            </div>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Bloquant pour la suite</span>
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <label className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Tentatives max :</label>
                                            <input type="number" value={maxAttempts} onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)} min={1} max={99}
                                                className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {selectedType && (
                            <div className="flex gap-2 pt-2">
                                <TactileButton variant="secondary" size="sm" onClick={resetForm} className="flex-1">Annuler</TactileButton>
                                <TactileButton variant="primary" size="sm" isLoading={isSubmitting} leftIcon={<Check className="w-4 h-4" />} onClick={handleSubmit} className="flex-1">
                                    {editingExerciseId ? 'Sauvegarder' : 'Créer'}
                                </TactileButton>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* ═══════ EXERCISES LIST ═══════ */}
            <div className="space-y-2">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                ) : exercises.length === 0 && !showCreator ? (
                    <div className="text-center py-8">
                        <Target className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Aucun exercice</p>
                        <p className="text-xs text-gray-400 mt-1">Créez votre premier exercice ci-dessus</p>
                    </div>
                ) : (
                    exercises.map((exercise) => {
                        const typeConfig = getTypeConfig(exercise.type);
                        const breadcrumb = buildBreadcrumb(exercise);
                        const canNavigate = !!onNavigateToGranule && !!buildGranuleContextFromExercise(exercise);

                        return (
                            <motion.div key={exercise.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-3 group hover:shadow-md transition-all">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2.5 min-w-0">
                                        <div className={`inline-flex p-1.5 rounded-lg flex-shrink-0 ${typeConfig?.color || 'bg-gray-100 text-gray-600'}`}>
                                            {typeConfig?.icon || <CircleDot className="w-4 h-4" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{exercise.title}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-gray-400">{typeConfig?.label}</p>
                                                {selectedLevel === 'project' && canNavigate && breadcrumb && (
                                                    <>
                                                        <span className="text-gray-300">•</span>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleNavigate(exercise); }}
                                                            className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#99334C] transition-colors truncate max-w-[150px]"
                                                            title={`Aller à: ${breadcrumb}`}
                                                        >
                                                            <MapPin className="w-3 h-3 flex-shrink-0" />
                                                            <span className="truncate">{breadcrumb}</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {/* Reordering */}
                                        <div className="flex flex-col gap-0.5 mr-1">
                                            <button 
                                                onClick={() => handleMove(exercises.indexOf(exercise), 'up')}
                                                disabled={exercises.indexOf(exercise) === 0 || isReordering}
                                                className="p-1 text-gray-300 hover:text-[#99334C] disabled:opacity-30 transition-colors"
                                            >
                                                <ChevronUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => handleMove(exercises.indexOf(exercise), 'down')}
                                                disabled={exercises.indexOf(exercise) === exercises.length - 1 || isReordering}
                                                className="p-1 text-gray-300 hover:text-[#99334C] disabled:opacity-30 transition-colors"
                                            >
                                                <ChevronDown className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {/* 🔗 Éditer */}
                                        <button onClick={() => handleEditExercise(exercise)}
                                            className="p-1.5 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" title="Modifier">
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleDelete(exercise.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" title="Supprimer">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ExercisePanel;
