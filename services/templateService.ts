/**
 * Service pour gérer les templates de projets
 */

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

export interface Template {
    template_id: string;
    template_name: string;
    description?: string;
    category?: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    structure: TemplateStructure;
    creator_id: string;
    usage_count: number;
}

export interface TemplateStructure {
    parts: TemplatePart[];
}

export interface TemplatePart {
    part_title: string;
    part_number: number;
    part_intro?: string;
    chapters: TemplateChapter[];
}

export interface TemplateChapter {
    chapter_title: string;
    chapter_number: number;
    paragraphs: TemplateParagraph[];
}

export interface TemplateParagraph {
    para_name: string;
    para_number: number;
    notions: TemplateNotion[];
}

export interface TemplateNotion {
    notion_name: string;
    notion_number: number;
    notion_content: string;
}

export interface CreateTemplateData {
    template_name: string;
    description?: string;
    category?: string;
    is_public?: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

class TemplateService {
    private getAuthToken(): string | null {
        if (typeof window === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; auth_token=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
    }

    /**
     * Récupérer tous les templates publics
     */
    async getAllTemplates(): Promise<Template[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/templates`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la récupération des templates');
            }

            const result: ApiResponse<{ templates: Template[] }> = await response.json();
            return result.data.templates;
        } catch (error) {
            console.error('Erreur getAllTemplates:', error);
            throw error;
        }
    }

    /**
     * Récupérer un template par son ID
     */
    async getTemplateById(templateId: string): Promise<Template> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la récupération du template');
            }

            const result: ApiResponse<{ template: Template }> = await response.json();
            return result.data.template;
        } catch (error) {
            console.error('Erreur getTemplateById:', error);
            throw error;
        }
    }

    /**
     * Créer un nouveau template à partir d'un projet existant
     */
    async createTemplateFromProject(
        projectName: string,
        templateData: CreateTemplateData
    ): Promise<Template> {
        try {
            const token = this.getAuthToken();
            if (!token) {
                throw new Error('Non authentifié');
            }

            const response = await fetch(
                `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/convert-to-template`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(templateData),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la création du template');
            }

            const result: ApiResponse<{ template: Template }> = await response.json();
            return result.data.template;
        } catch (error) {
            console.error('Erreur createTemplateFromProject:', error);
            throw error;
        }
    }

    /**
     * Créer un projet à partir d'un template
     */
    async createProjectFromTemplate(
        templateId: string,
        projectName: string
    ): Promise<any> {
        try {
            const token = this.getAuthToken();
            if (!token) {
                throw new Error('Non authentifié');
            }

            const response = await fetch(
                `${API_BASE_URL}/api/templates/${templateId}/create-project`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ pr_name: projectName }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la création du projet');
            }

            const result: ApiResponse<{ project: any }> = await response.json();
            return result.data.project;
        } catch (error) {
            console.error('Erreur createProjectFromTemplate:', error);
            throw error;
        }
    }

    /**
     * Supprimer un template (créateur seulement)
     */
    async deleteTemplate(templateId: string): Promise<void> {
        try {
            const token = this.getAuthToken();
            if (!token) {
                throw new Error('Non authentifié');
            }

            const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la suppression du template');
            }
        } catch (error) {
            console.error('Erreur deleteTemplate:', error);
            throw error;
        }
    }

    /**
     * Mettre à jour un template
     */
    async updateTemplate(
        templateId: string,
        data: Partial<CreateTemplateData>
    ): Promise<Template> {
        try {
            const token = this.getAuthToken();
            if (!token) {
                throw new Error('Non authentifié');
            }

            const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la mise à jour du template');
            }

            const result: ApiResponse<{ template: Template }> = await response.json();
            return result.data.template;
        } catch (error) {
            console.error('Erreur updateTemplate:', error);
            throw error;
        }
    }
}

export const templateService = new TemplateService();
