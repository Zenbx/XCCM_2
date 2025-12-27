// services/projectService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Project {
  pr_id: string;
  pr_name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  pr_name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Service pour gérer les appels API liés aux projets
 */
class ProjectService {
  /**
   * Récupère le token d'authentification depuis le localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  /**
   * Récupère tous les projets de l'utilisateur connecté
   */
  async getAllProjects(): Promise<Project[]> {
    try {
      const token = this.getAuthToken();
      
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des projets');
      }

      const result: ApiResponse<{ projects: Project[]; count: number }> = await response.json();
      return result.data.projects;
    } catch (error) {
      console.error('Erreur getAllProjects:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau projet
   */
  async createProject(data: CreateProjectData): Promise<Project> {
    try {
      const token = this.getAuthToken();
      
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création du projet');
      }

      const result: ApiResponse<{ project: Project }> = await response.json();
      return result.data.project;
    } catch (error) {
      console.error('Erreur createProject:', error);
      throw error;
    }
  }

  /**
   * Supprime un projet
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      const token = this.getAuthToken();
      
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression du projet');
      }
    } catch (error) {
      console.error('Erreur deleteProject:', error);
      throw error;
    }
  }
}

export const projectService = new ProjectService();