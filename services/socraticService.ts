import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface SocraticAuditResult {
    clarityScore: number;
    bloomLevel: string;
    engagementScore: number;
    suggestions: string[];
    recommendedBlocks: string[];
}

export const socraticService = {
    auditContent: async (content: string): Promise<SocraticAuditResult> => {
        const token = authService.getAuthToken();
        if (!token) throw new Error('Non authentifié');

        const res = await fetch(`${API_URL}/api/ai/audit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erreur lors de l\'audit pédagogique');
        }

        const data = await res.json();
        return data.data;
    }
};
