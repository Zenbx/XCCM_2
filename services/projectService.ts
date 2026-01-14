// services/projectService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface Project {
  pr_id: string;
  pr_name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  description?: string;
  category?: string;
  level?: string;
  tags?: string;
  author?: string;
  language?: string;
  is_published?: boolean;
  styles?: any;
}

export interface ProjectWithOwner extends Project {
  owner: {
    user_id: string;
    email: string;
    firstname: string;
    lastname: string;
  };
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
   * Récupère le token d'authentification depuis les cookies
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; auth_token=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
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
   * Récupère un projet spécifique par son nom
   */
  async getProjectByName(projectName: string): Promise<ProjectWithOwner> {
    try {
      const token = this.getAuthToken();

      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération du projet');
      }

      const result: ApiResponse<{ project: ProjectWithOwner }> = await response.json();
      return result.data.project;
    } catch (error) {
      console.error('Erreur getProjectByName:', error);
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
   * Met à jour un projet (nom, métadonnées, styles)
   * @param currentName - Le nom ACTUEL du projet (utilisé pour l'URL)
   * @param data - Objet contenant les champs à modifier
   */
  async updateProject(currentName: string, data: Partial<Project>): Promise<Project> {
    try {
      const token = this.getAuthToken();

      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(currentName)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du projet');
      }

      const result: ApiResponse<{ project: Project }> = await response.json();
      return result.data.project;
    } catch (error) {
      console.error('Erreur updateProject:', error);
      throw error;
    }
  }

  /**
   * Supprime un projet par son nom
   * @param projectName - Le nom du projet à supprimer
   */
  async deleteProject(projectName: string): Promise<void> {
    try {
      const token = this.getAuthToken();

      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}`, {
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