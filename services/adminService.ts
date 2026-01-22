// services/adminService.ts
import { authService } from './authService';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

class AdminService {
    /**
     * Récupère les statistiques globales de l'admin
     */
    async getStats() {
        const token = authService.getAuthToken();
        if (!token) throw new Error('Non authentifié');

        const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

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
        const token = authService.getAuthToken();
        if (!token) throw new Error('Non authentifié');

        const response = await fetch(`${API_BASE_URL}/api/admin/projects`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

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
        const token = authService.getAuthToken();
        if (!token) throw new Error('Non authentifié');

        const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
            headers: { Authorization: `Bearer ${token}` },
        });

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
        const token = authService.getAuthToken();
        if (!token) throw new Error('Non authentifié');

        const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Erreur lors de la sauvegarde');
        }

        const data = await response.json();
        return data.data;
    }
}

export const adminService = new AdminService();
