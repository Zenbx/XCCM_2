// services/classroomService.ts
import { authService } from './authService';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

export interface Classroom {
    id: string;
    name: string;
    description?: string | null;
    join_code: string;
    teacher_id: string;
    created_at: string;
    teacher?: {
        firstname: string;
        lastname: string;
        email: string;
    };
    _count?: {
        enrollments?: number;
        projects?: number;
    };
}

export interface EnrolledClassroom extends Classroom {
    enrolled_at: string;
}

export interface ClassroomDetail extends Classroom {
    projects: Array<{
        project: {
            pr_id: string;
            pr_name: string;
            description?: string;
            category?: string;
            level?: string;
            author?: string;
        };
        doc_id?: string | null;
    }>;
    enrollments: Array<{
        student: {
            user_id: string;
            firstname: string;
            lastname: string;
            email: string;
        };
        enrolled_at: string;
    }>;
}

class ClassroomService {
    private getHeaders(): HeadersInit {
        const token = authService.getAuthToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }

    /**
     * Récupère les classes (enseignées + inscrites)
     */
    async getMyClassrooms(): Promise<{ teaching: Classroom[]; enrolled: EnrolledClassroom[] }> {
        const response = await fetch(`${API_BASE_URL}/api/classrooms`, {
            headers: this.getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erreur lors de la récupération des classes');
        return data.data;
    }

    /**
     * Crée une nouvelle classe
     */
    async createClassroom(name: string, description?: string): Promise<Classroom> {
        const response = await fetch(`${API_BASE_URL}/api/classrooms`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ name, description }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erreur lors de la création de la classe');
        return data.data.classroom;
    }

    /**
     * Récupère les détails complets d'une classe
     */
    async getClassroom(classId: string): Promise<ClassroomDetail> {
        const response = await fetch(`${API_BASE_URL}/api/classrooms/${classId}`, {
            headers: this.getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Classe introuvable');
        return data.data.classroom;
    }

    /**
     * Met à jour une classe
     */
    async updateClassroom(classId: string, updates: { name?: string; description?: string }): Promise<Classroom> {
        const response = await fetch(`${API_BASE_URL}/api/classrooms/${classId}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(updates),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erreur lors de la modification');
        return data.data.classroom;
    }

    /**
     * Supprime une classe
     */
    async deleteClassroom(classId: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/classrooms/${classId}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Erreur lors de la suppression');
        }
    }

    /**
     * Rejoindre une classe avec un code d'invitation
     */
    async joinClassroom(joinCode: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/api/enrollments`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ join_code: joinCode }),
        });
        const data = await response.json();
        if (!response.ok) {
            if (data.errors) {
                const firstError = Object.values(data.errors).flat()[0];
                throw new Error((firstError as string) || data.message || "Erreur de validation");
            }
            throw new Error(data.message || 'Erreur lors de l\'inscription');
        }
        return data.data.enrollment;
    }

    /**
     * Assigne un projet (cours) à une classe
     */
    async assignProject(classId: string, projectId: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/api/classrooms/${classId}/projects`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ project_id: projectId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erreur lors de l\'ajout du cours');
        return data.data.link;
    }

    /**
     * Retire un projet d'une classe
     */
    async unassignProject(classId: string, projectId: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/classrooms/${classId}/projects`, {
            method: 'DELETE',
            headers: this.getHeaders(),
            body: JSON.stringify({ project_id: projectId }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Erreur lors du retrait du cours");
        }
    }

    async syncProject(classId: string, projectId: string): Promise<{ doc_id: string; updated_at: string }> {
        const response = await fetch(`${API_BASE_URL}/api/classrooms/${classId}/projects/${projectId}/sync`, {
            method: 'POST',
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Erreur lors de la synchronisation");
        }

        const result = await response.json();
        return result.data;
    }
}

export const classroomService = new ClassroomService();
