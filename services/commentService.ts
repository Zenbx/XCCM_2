// services/commentService.ts

import { authenticatedFetch, getAuthToken } from '@/lib/apiHelper';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

export interface Comment {
    comment_id: string;
    content: string;
    created_at: string;
    author_id: string;
    author: {
        user_id: string;
        firstname: string;
        lastname: string;
        email: string;
    };
}

class CommentService {
    async getComments(projectName: string): Promise<Comment[]> {
        if (!getAuthToken()) throw new Error('Non authentifié');

        const response = await authenticatedFetch(
            `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/comments`
        );

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Erreur récupération commentaires (${response.status})${text ? ': ' + text : ''}`);
        }

        const result = await response.json();
        return result.data?.comments ?? [];
    }

    async addComment(projectName: string, content: string): Promise<Comment> {
        if (!getAuthToken()) throw new Error('Non authentifié');

        const response = await authenticatedFetch(
            `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/comments`,
            {
                method: 'POST',
                body: JSON.stringify({ content }),
            }
        );

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Erreur ajout commentaire (${response.status})${text ? ': ' + text : ''}`);
        }

        const result = await response.json();
        return result.data.comment;
    }

    async deleteComment(projectName: string, commentId: string): Promise<void> {
        if (!getAuthToken()) throw new Error('Non authentifié');

        const response = await authenticatedFetch(
            `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/comments/${commentId}`,
            { method: 'DELETE' }
        );

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Erreur suppression commentaire (${response.status})${text ? ': ' + text : ''}`);
        }
    }
}

export const commentService = new CommentService();
