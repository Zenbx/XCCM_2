// services/commentService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

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
    private getAuthToken(): string | null {
        if (typeof window === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; auth_token=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
    }

    async getComments(projectName: string): Promise<Comment[]> {
        try {
            const token = this.getAuthToken();
            if (!token) throw new Error('Non authentifié');

            const response = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/comments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Erreur recup commentaires');

            const result = await response.json();
            return result.data.comments;
        } catch (error) {
            console.error('getComments error:', error);
            throw error;
        }
    }

    async addComment(projectName: string, content: string): Promise<Comment> {
        try {
            const token = this.getAuthToken();
            if (!token) throw new Error('Non authentifié');

            const response = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) throw new Error('Erreur ajout commentaire');

            const result = await response.json();
            return result.data.comment;
        } catch (error) {
            console.error('addComment error:', error);
            throw error;
        }
    }
}

export const commentService = new CommentService();
