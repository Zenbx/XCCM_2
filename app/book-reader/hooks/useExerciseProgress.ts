"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    exerciseService,
    Exercise,
    Submission,
    SubmissionResult,
} from '@/services/exerciseService';

interface UseExerciseProgressProps {
    projectId?: string;
    structure?: any[];
}

export const useExerciseProgress = ({ projectId, structure }: UseExerciseProgressProps) => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [submittingId, setSubmittingId] = useState<string | null>(null);

    // Fetch all exercises + student submissions for this project
    const fetchData = useCallback(async () => {
        if (!projectId) return;
        setIsLoading(true);
        try {
            const [exs, subs] = await Promise.all([
                exerciseService.getProjectExercises(projectId),
                exerciseService.getMySubmissions({ project_id: projectId }),
            ]);
            setExercises(exs);
            setSubmissions(subs);
        } catch (err) {
            console.error('Error loading exercises/submissions:', err);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Submit an answer to an exercise
    const submitAnswer = async (exerciseId: string, answers: any): Promise<SubmissionResult | null> => {
        setSubmittingId(exerciseId);
        try {
            const result = await exerciseService.submitAnswer(exerciseId, answers);
            // Add the submission to local state
            setSubmissions(prev => [result.submission, ...prev]);
            return result;
        } catch (err: any) {
            console.error('Submit error:', err);
            throw err;
        } finally {
            setSubmittingId(null);
        }
    };

    // Get exercises assigned to a specific granule
    const getExercisesForGranule = useCallback((granuleId: string, granuleType: string): Exercise[] => {
        return exercises.filter(ex => {
            switch (granuleType) {
                case 'part': return ex.part_id === granuleId;
                case 'chapter': return ex.chapter_id === granuleId;
                case 'paragraph': return ex.para_id === granuleId;
                case 'notion': return ex.notion_id === granuleId;
                case 'project': return ex.project_id === granuleId;
                default: return false;
            }
        });
    }, [exercises]);

    // Get latest submission for an exercise
    const getLatestSubmission = useCallback((exerciseId: string): Submission | undefined => {
        return submissions.find(s => s.exercise_id === exerciseId);
    }, [submissions]);

    // Progress calculation
    const totalExercises = exercises.length;
    const completedExercises = exercises.filter(ex => 
        submissions.some(s => s.exercise_id === ex.id && s.score !== null && s.score > 0)
    ).length;
    const attemptedExercises = exercises.filter(ex => 
        submissions.some(s => s.exercise_id === ex.id)
    ).length;
    const progressPercentage = totalExercises > 0 
        ? Math.round((completedExercises / totalExercises) * 100) 
        : 0;

    return {
        exercises,
        submissions,
        isLoading,
        submittingId,
        totalExercises,
        completedExercises,
        attemptedExercises,
        progressPercentage,
        submitAnswer,
        getExercisesForGranule,
        getLatestSubmission,
        refetch: fetchData,
    };
};
