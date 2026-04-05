// services/exerciseService.ts
import { authService } from './authService';
import { authenticatedFetch } from '@/lib/apiHelper';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

export type ExerciseType = 'QCU' | 'QCM' | 'QRO' | 'QROA' | 'CODE' | 'FILL_BLANKS';

export interface QCMOption {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback?: string;
}

export interface QCMParameters {
    question: string;
    options: QCMOption[];
    shuffle?: boolean;
}

export interface QROParameters {
    question: string;
    expectedAnswer: string;
    caseSensitive?: boolean;
}

export interface QROAParameters {
    question: string;
    evaluationPrompt: string;
    maxScore: number;
}

export interface CodeParameters {
    language: string;
    starterCode: string;
    testCases: Array<{ input: string; expectedOutput: string }>;
}

export interface FillBlanksParameters {
    text: string; // "Le {{blank:1}} est un langage de {{blank:2}}"
    blanks: Array<{ id: string; answer: string; alternatives?: string[] }>;
}

export interface ExerciseSettings {
    isBlocking?: boolean;
    maxAttempts?: number;
    points?: number;
    timeLimit?: number; // en secondes
}

export interface Exercise {
    id: string;
    type: ExerciseType;
    title: string;
    description?: string | null;
    parameters: any;
    settings?: ExerciseSettings | null;
    project_id?: string | null;
    part_id?: string | null;
    chapter_id?: string | null;
    para_id?: string | null;
    notion_id?: string | null;
    creator_id: string;
    created_at: string;
    _count?: {
        submissions?: number;
    };
}

export interface Submission {
    id: string;
    exercise_id: string;
    student_id: string;
    answers: any;
    score: number | null;
    feedback: string | null;
    submitted_at: string;
    exercise?: {
        id: string;
        type: ExerciseType;
        title: string;
    };
}

export interface SubmissionResult {
    submission: Submission;
    result: {
        score: number | null;
        maxPoints: number;
        feedback: string | null;
        isAutoGraded: boolean;
        isPerfect: boolean;
    };
}

class ExerciseService {
    // Les headers sont maintenant gérés par authenticatedFetch

    /**
     * Récupère les exercices avec filtres optionnels par granule (mode enseignant)
     */
    async getExercises(filters?: {
        project_id?: string;
        part_id?: string;
        chapter_id?: string;
        para_id?: string;
        notion_id?: string;
    }): Promise<Exercise[]> {
        const params = new URLSearchParams();
        if (filters?.project_id) params.set('project_id', filters.project_id);
        if (filters?.part_id) params.set('part_id', filters.part_id);
        if (filters?.chapter_id) params.set('chapter_id', filters.chapter_id);
        if (filters?.para_id) params.set('para_id', filters.para_id);
        if (filters?.notion_id) params.set('notion_id', filters.notion_id);

        const queryString = params.toString();
        const url = `${API_BASE_URL}/api/exercises${queryString ? `?${queryString}` : ''}`;

        const response = await authenticatedFetch(url);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erreur lors de la récupération des exercices');
        return data.data.exercises;
    }

    /**
     * Récupère tous les exercices d'un projet (mode étudiant, sans réponses)
     */
    async getProjectExercises(projectId: string): Promise<Exercise[]> {
        const url = `${API_BASE_URL}/api/exercises?project_id=${projectId}&mode=student`;
        const response = await authenticatedFetch(url);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data.data.exercises;
    }

    /**
     * Crée un nouvel exercice
     */
    async createExercise(exerciseData: {
        // ...
    }): Promise<Exercise> {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/exercises`, {
            method: 'POST',
            body: JSON.stringify(exerciseData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erreur lors de la création');
        return data.data.exercise;
    }

    /**
     * Modifie un exercice existant
     */
    async updateExercise(id: string, updates: {
        title?: string;
        parameters?: any;
        settings?: any;
    }): Promise<Exercise> {
        const url = `${API_BASE_URL}/api/exercises/${id}`;
        const response = await authenticatedFetch(url, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erreur lors de la modification');
        return data.data.exercise;
    }

    /**
     * Supprime un exercice
     */
    async deleteExercise(exerciseId: string): Promise<void> {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/exercises/${exerciseId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || 'Erreur lors de la suppression');
        }
    }

    /**
     * Soumettre une réponse à un exercice
     */
    async submitAnswer(exerciseId: string, answers: any): Promise<SubmissionResult> {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/submissions`, {
            method: 'POST',
            body: JSON.stringify({ exercise_id: exerciseId, answers }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erreur lors de la soumission');
        return data.data;
    }

    /**
     * Récupère les soumissions de l'étudiant connecté
     */
    async getMySubmissions(filters?: {
        exercise_id?: string;
        project_id?: string;
    }): Promise<Submission[]> {
        const params = new URLSearchParams();
        if (filters?.exercise_id) params.set('exercise_id', filters.exercise_id);
        if (filters?.project_id) params.set('project_id', filters.project_id);

        const queryString = params.toString();
        const url = `${API_BASE_URL}/api/submissions${queryString ? `?${queryString}` : ''}`;

        const response = await authenticatedFetch(url);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erreur');
        return data.data.submissions;
    }

    /**
     * Met à jour l'ordre des exercices
     */
    async reorderExercises(exerciseIds: string[]): Promise<void> {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/exercises`, {
            method: 'PATCH',
            body: JSON.stringify({ exerciseIds }),
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || 'Erreur lors du réordonnancement');
        }
    }
}

export const exerciseService = new ExerciseService();

