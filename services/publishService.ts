// services/publishService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface PublishResponse {
  doc_id: string;
  doc_name: string;
  url_content: string;
  pages: number;
  doc_size: number;
  published_at: string;
  format: 'pdf' | 'docx';
}

class PublishService {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; auth_token=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  async publishProject(projectName: string, format: 'pdf' | 'docx' = 'pdf'): Promise<PublishResponse> {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Non authentifié');

      const response = await fetch(
        `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ format })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur publication');
      }

      const result = await response.json();
      return result.data.document;
    } catch (error) {
      console.error('publishProject error:', error);
      throw error;
    }
  }
}

export const publishService = new PublishService();
