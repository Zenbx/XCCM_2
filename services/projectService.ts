// services/projectService.ts

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

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
  public_url?: string; // URL du projet publié
  styles?: any;
  user_role?: 'OWNER' | 'EDITOR' | 'VIEWER';
  invitation_status?: 'Pending' | 'Accepted' | 'Declined' | null;
  invitation_token?: string | null;
}

// ... (autres interfaces)
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
  overwrite?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}


class ProjectService {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; auth_token=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  async getPublishedProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents`, { // Changement ici
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération des documents publiés');
      }

      const result: ApiResponse<{ documents: Project[] }> = await response.json(); // Changement ici
      return result.data.documents; // Changement ici
    } catch (error) {
      console.error('Erreur getPublishedProjects:', error);
      throw error;
    }
  }

  async getPublishedProjectContent(projectName: string): Promise<any> {
    try {
      // D'abord, on récupère les métadonnées du projet pour trouver l'URL publique
      const projectMeta = await this.getProjectByName(projectName); // Attention, cette route peut être protégée
      const publicUrl = projectMeta.public_url;

      if (!publicUrl) {
        throw new Error("Ce projet n'a pas d'URL publique.");
      }

      // Ensuite, on fetch le contenu JSON depuis l'URL de Supabase
      const response = await fetch(publicUrl);
      if (!response.ok) {
        throw new Error("Impossible de télécharger le contenu du projet depuis le stockage.");
      }

      return await response.json();

    } catch (error) {
      console.error('Erreur getPublishedProjectContent:', error);
      throw error;
    }
  }


  // ... (méthodes existantes: getAllProjects, getProjectByName, etc.)
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

  /**
   * Récupère la structure complète d'un projet pour l'export.
   */
  async exportProject(projectName: string): Promise<any> {
    const token = this.getAuthToken();
    if (!token) throw new Error('Non authentifié');

    const response = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/export`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'exportation du projet");
    }
    return response.json();
  }

  /**
   * Publie un projet en envoyant son contenu JSON à l'API.
   */
  async publishProject(projectName: string, projectFile: File): Promise<{ publicURL: string }> {
    const token = this.getAuthToken();
    if (!token) throw new Error('Non authentifié');

    const formData = new FormData();
    formData.append('file', projectFile);

    const response = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/publish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur lors de la publication du projet");
    }

    const result = await response.json();
    return result.data; // L'API doit renvoyer { success: true, data: { publicURL: '...' } }
  }
  async toggleLike(projectName: string): Promise<{ likes: number; isLiked: boolean }> {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Non authentifié');

      const response = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du like');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Erreur toggleLike:', error);
      throw error;
    }
  }
}

export const projectService = new ProjectService();
