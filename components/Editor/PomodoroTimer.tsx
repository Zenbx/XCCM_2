"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw, X, Coffee, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Phase = 'work' | 'shortBreak' | 'longBreak';

const PHASES: Record<Phase, { label: string; duration: number; color: string; bg: string; icon: React.ReactNode }> = {
    work:       { label: 'Travail',        duration: 25 * 60, color: '#99334C', bg: 'bg-[#99334C]', icon: <Brain size={12} /> },
    shortBreak: { label: 'Pause courte',   duration:  5 * 60, color: '#10b981', bg: 'bg-emerald-500', icon: <Coffee size={12} /> },
    longBreak:  { label: 'Pause longue',   duration: 15 * 60, color: '#3b82f6', bg: 'bg-blue-500',    icon: <Coffee size={12} /> },
};

interface PomodoroTimerProps {
    onClose: () => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onClose }) => {
    const [phase, setPhase] = useState<Phase>('work');
    const [remaining, setRemaining] = useState(PHASES.work.duration);
    const [running, setRunning] = useState(false);
    const [sessions, setSessions] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const cfg = PHASES[phase];

    const stop = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setRunning(false);
    }, []);

    const tick = useCallback(() => {
        setRemaining(prev => {
            if (prev <= 1) {
                stop();
                // Beep via AudioContext
                try {
                    const ctx = new AudioContext();
                    const osc = ctx.createOscillator();
                    osc.connect(ctx.destination);
                    osc.frequency.value = 880;
                    osc.start();
                    osc.stop(ctx.currentTime + 0.3);
                } catch {}
                // Auto-advance phase
                setPhase(current => {
                    if (current === 'work') {
                        setSessions(s => {
                            const next = s + 1;
                            return next;
                        });
                        return sessions > 0 && (sessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
                    }
                    return 'work';
                });
                return 0;
            }
            return prev - 1;
        });
    }, [stop, sessions]);

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(tick, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [running, tick]);

    // Reset when phase changes
    useEffect(() => {
        stop();
        setRemaining(PHASES[phase].duration);
    }, [phase, stop]);

    const toggle = () => setRunning(r => !r);

    const reset = () => {
        stop();
        setRemaining(cfg.duration);
    };

    const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
    const ss = String(remaining % 60).padStart(2, '0');
    const progress = 1 - remaining / cfg.duration;
    const circumference = 2 * Math.PI * 28;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-14 right-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-56 select-none"
        >
            {/* Close */}
            <button onClick={onClose} className="absolute top-2 right-2 p-1 text-gray-300 hover:text-gray-500 rounded transition-colors">
                <X size={14} />
            </button>

            {/* Phase selector */}
            <div className="flex gap-1 mb-3">
                {(Object.keys(PHASES) as Phase[]).map(p => (
                    <button
                        key={p}
                        onClick={() => setPhase(p)}
                        className={`flex-1 text-[9px] font-bold uppercase px-1 py-1 rounded transition-colors ${phase === p ? `${PHASES[p].bg} text-white` : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                        {p === 'work' ? 'Travail' : p === 'shortBreak' ? 'Courte' : 'Longue'}
                    </button>
                ))}
            </div>

            {/* Timer ring */}
            <div className="flex flex-col items-center gap-2 my-2">
                <div className="relative w-20 h-20">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="5" />
                        <circle
                            cx="32" cy="32" r="28"
                            fill="none"
                            stroke={cfg.color}
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference * (1 - progress)}
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-gray-800 tabular-nums leading-none">{mm}:{ss}</span>
                        <span className="text-[9px] text-gray-400 font-medium mt-0.5">{cfg.label}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={reset}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        title="Réinitialiser"
                    >
                        <RotateCcw size={14} />
                    </button>
                    <button
                        onClick={toggle}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white transition-colors"
                        style={{ backgroundColor: cfg.color }}
                    >
                        {running ? <Pause size={13} /> : <Play size={13} />}
                        {running ? 'Pause' : 'Démarrer'}
                    </button>
                </div>
            </div>

            {/* Sessions counter */}
            <div className="flex items-center justify-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < sessions % 4 ? 'bg-[#99334C]' : 'bg-gray-200'}`} />
                ))}
                <span className="text-[10px] text-gray-400 ml-1">{sessions} session{sessions !== 1 ? 's' : ''}</span>
            </div>
        </motion.div>
    );
};
