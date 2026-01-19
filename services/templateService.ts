import { getAuthHeaders } from '@/lib/apiHelper';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

export const templateService = {
    /**
     * Convertit un projet en template
     */
    async convertProjectToTemplate(projectName: string, data: {
        template_name: string;
        description?: string;
        category?: string;
        is_public?: boolean;
    }) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/convert-to-template`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(data)
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur lors de la création du template (${response.status})`);
            }

            return await response.json();
        } catch (error: any) {
            console.error('Error in convertProjectToTemplate:', error);
            throw error;
        }
    },

    /**
     * Récupère la liste des templates
     */
    async getTemplates() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/templates`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des templates');
            }

            const result = await response.json();
            return result.data?.templates || [];
        } catch (error) {
            console.error('Error in getTemplates:', error);
            return [];
        }
    }
};
