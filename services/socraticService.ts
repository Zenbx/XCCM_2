import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface SuggestedGranule {
    type: 'part' | 'chapter' | 'paragraph' | 'notion';
    title: string;
    description: string;
    rationale: string;
}

export interface SocraticAuditResult {
    clarityScore: number;
    bloomLevel: string;
    engagementScore: number;
    suggestions: string[];
    recommendedBlocks: string[];
    improvedContent?: string;
    suggestedGranules?: SuggestedGranule[];
}

export interface AuditContext {
    projectName?: string;
    partTitle?: string;
    chapterTitle?: string;
    paraName?: string;
    notionName?: string;
}

export const socraticService = {
    auditContent: async (content: string, context?: AuditContext): Promise<SocraticAuditResult> => {
        const token = authService.getAuthToken();
        if (!token) throw new Error('Non authentifié');

        const res = await fetch(`${API_URL}/api/ai/audit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content, context })
        });

        if (!res.ok) {
            let errorData;
            try {
                errorData = await res.json();
            } catch {
                const textBody = await res.text();
                throw new Error(`Erreur HTTP ${res.status}: ${textBody.substring(0, 50)}...`);
            }
            throw new Error(errorData.message || `Erreur lors de l'audit pédagogique (${res.status})`);
        }

        const data = await res.json();
        return data.data;
    }
};
