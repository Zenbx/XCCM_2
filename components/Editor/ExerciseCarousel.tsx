"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, Lock } from 'lucide-react';
import { Exercise, Submission, SubmissionResult } from '@/services/exerciseService';
import ExerciseBlock from '@/app/book-reader/components/ExerciseBlock';

interface ExerciseCarouselProps {
  exercises: Exercise[];
  getLatestSubmission: (id: string) => Submission | undefined;
  getSubmissionCount: (id: string) => number;
  onSubmitAnswer: (exerciseId: string, answers: any) => Promise<SubmissionResult | null>;
  submittingId: string | null;
  lockedIds?: Set<string>;
}

const ExerciseCarousel: React.FC<ExerciseCarouselProps> = ({
  exercises,
  getLatestSubmission,
  getSubmissionCount,
  onSubmitAnswer,
  submittingId,
  lockedIds = new Set(),
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const totalExos = exercises.length;

  const goTo = (index: number, dir: 1 | -1) => {
    setDirection(dir);
    setActiveSlide(Math.max(0, Math.min(index, totalExos - 1)));
  };

  const isBlocking = (exo: Exercise): boolean => {
    return (exo.settings as any)?.blocking === true;
  };

  const isCompleted = (exo: Exercise): boolean => {
    const sub = getLatestSubmission(exo.id);
    return !!sub && (sub.score !== undefined && sub.score !== null ? sub.score > 0 : true);
  };

  // Can we navigate forward? Only blocked if the current exercise is blocking AND not completed
  const canGoForward = (): boolean => {
    const curr = exercises[activeSlide];
    if (!curr) return true;
    if (isBlocking(curr) && !isCompleted(curr)) return false;
    return activeSlide < totalExos - 1;
  };

  const currentExo = exercises[activeSlide];
  const isLocked = currentExo ? lockedIds.has(currentExo.id) : false;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header: progress and nav */}
      <div className="flex items-center justify-between mb-5">
        {/* Bullet indicators */}
        <div className="flex items-center gap-2">
          {exercises.map((exo, i) => (
            <button
              key={exo.id}
              onClick={() => goTo(i, i > activeSlide ? 1 : -1)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                isCompleted(exo)
                  ? 'bg-green-500'
                  : i === activeSlide
                    ? 'bg-[#99334C] w-5'
                    : 'bg-gray-300 dark:bg-gray-600'
              }`}
              title={`Exercice ${i + 1}`}
            />
          ))}
        </div>

        {/* Arrow navigation */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {activeSlide + 1} / {totalExos}
          </span>
          <button
            onClick={() => goTo(activeSlide - 1, -1)}
            disabled={activeSlide === 0}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => goTo(activeSlide + 1, 1)}
            disabled={!canGoForward()}
            title={!canGoForward() ? 'Répondez à cet exercice pour continuer' : undefined}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Blocking warning */}
      {isBlocking(currentExo) && !isCompleted(currentExo) && (
        <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400 font-medium">
          <Lock className="w-4 h-4 shrink-0" />
          Vous devez répondre correctement à cet exercice avant de continuer.
        </div>
      )}

      {/* Completed badge */}
      {isCompleted(currentExo) && (
        <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400 font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Exercice complété !
        </div>
      )}

      {/* Exercise slide */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentExo?.id ?? activeSlide}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {currentExo && (
              <div className={isLocked ? 'blur-sm opacity-50 pointer-events-none select-none' : ''}>
                <ExerciseBlock
                  exercise={currentExo}
                  submission={getLatestSubmission(currentExo.id)}
                  submissionCount={getSubmissionCount(currentExo.id)}
                  isSubmitting={submittingId === currentExo.id}
                  onSubmit={onSubmitAnswer}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExerciseCarousel;
