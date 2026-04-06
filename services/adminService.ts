// services/adminService.ts
import { authenticatedFetch } from '@/lib/apiHelper';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

class AdminService {
    /**
     * Récupère les statistiques globales de l'admin
     */
    async getStats() {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/stats`);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Erreur lors de la récupération des statistiques');
        }

        const data = await response.json();
        return data.data;
    }

    /**
     * Récupère tous les projets de la plateforme
     */
    async getAllProjects() {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/projects`);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Erreur lors de la récupération des projets');
        }

        const data = await response.json();
        return data.data;
    }

    /**
     * Récupère les paramètres système
     */
    async getSettings() {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/settings`);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Erreur lors de la récupération des paramètres');
        }

        const data = await response.json();
        return data.data;
    }

    /**
     * Enregistre les paramètres système
     */
    async saveSettings(settings: any) {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/settings`, {
            method: 'PUT',
            body: JSON.stringify(settings),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Erreur lors de la sauvegarde');
        }

        const data = await response.json();
        return data.data;
    }

    /**
     * Récupère tous les templates (Admin)
     */
    async getAllTemplates() {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/templates`);
        if (!response.ok) throw new Error('Erreur templates');
        const data = await response.json();
        return data.data.templates || [];
    }

    /**
     * Récupère tous les items de la marketplace (Admin)
     */
    async getMarketplaceItems() {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/marketplace`);
        if (!response.ok) throw new Error('Erreur marketplace');
        const data = await response.json();
        return data.data || [];
    }

    /**
     * Récupère tous les utilisateurs (Admin)
     */
    async getAllUsers() {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/users`);
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Erreur lors de la récupération des utilisateurs');
        }
        const data = await response.json();
        return data.data;
    }

    /**
     * Supprime un utilisateur (Admin)
     */
    async deleteUser(userId: string) {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/users/${userId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Erreur lors de la suppression');
        }
    }

    /**
     * Met à jour le rôle d'un utilisateur (Admin)
     */
    async updateUserRole(userId: string, role: string) {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
        });
        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour du rôle');
        }
    }
}

export const adminService = new AdminService();
