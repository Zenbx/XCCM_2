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

    // Linear Progression Logic
    const lockedIds = React.useMemo(() => {
        if (!structure || exercises.length === 0) return new Set<string>();

        const locked = new Set<string>();
        let isForwardLocked = false;

        // Flatten the structure in reading order: Part > Chapter > Paragraph > Notion
        for (const part of structure) {
            // Note: If anything before was locked, this part is locked
            if (isForwardLocked) locked.add(part.part_id);
            
            // Check blocking exercises for Part
            const partExs = exercises.filter(ex => ex.part_id === part.part_id);
            const hasUncompletedBlockingPart = partExs.some(ex => 
                (ex.settings as any)?.isBlocking && 
                !submissions.some(s => s.exercise_id === ex.id && s.score && s.score > 0)
            );

            for (const chapter of (part.chapters || [])) {
                if (isForwardLocked) locked.add(chapter.chapter_id);

                // Check blocking exercises for Chapter
                const chapExs = exercises.filter(ex => ex.chapter_id === chapter.chapter_id);
                const hasUncompletedBlockingChap = chapExs.some(ex => 
                    (ex.settings as any)?.isBlocking && 
                    !submissions.some(s => s.exercise_id === ex.id && s.score && s.score > 0)
                );

                for (const para of (chapter.paragraphs || [])) {
                    if (isForwardLocked) locked.add(para.para_id);

                    // Check blocking exercises for Paragraph
                    const paraExs = exercises.filter(ex => ex.para_id === para.para_id);
                    const hasUncompletedBlockingPara = paraExs.some(ex => 
                        (ex.settings as any)?.isBlocking && 
                        !submissions.some(s => s.exercise_id === ex.id && s.score && s.score > 0)
                    );

                    for (const notion of (para.notions || [])) {
                        // A notion is locked if anything BEFORE was locked
                        if (isForwardLocked) locked.add(notion.notion_id);

                        // BUT: If this notion has a blocking exercise, it LURKS at the end of the notion.
                        // So the NEXT notion should be locked.
                        const notionExs = exercises.filter(ex => ex.notion_id === notion.notion_id);
                        const hasUncompletedBlockingNotion = notionExs.some(ex => 
                            (ex.settings as any)?.isBlocking && 
                            !submissions.some(s => s.exercise_id === ex.id && s.score && s.score > 0)
                        );
                        
                        // If any blocking exercise at ANY level (Para, Chap, Part, Notion) is not done, 
                        // the NEXT notions/sections are locked.
                        if (hasUncompletedBlockingPart || hasUncompletedBlockingChap || hasUncompletedBlockingPara || hasUncompletedBlockingNotion) {
                            isForwardLocked = true;
                        }
                    }
                }
            }
        }
        return locked;
    }, [structure, exercises, submissions]);

    return {
        exercises,
        submissions,
        isLoading,
        submittingId,
        totalExercises,
        completedExercises,
        attemptedExercises,
        progressPercentage,
        lockedIds,
        submitAnswer,
        getExercisesForGranule,
        getLatestSubmission,
        refetch: fetchData,
    };
};
