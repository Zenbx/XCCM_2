// services/exportService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

class ExportService {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; auth_token=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  async exportProject(projectName: string, format: 'pdf' | 'docx' = 'pdf'): Promise<Blob> {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Non authentifié');

      const response = await fetch(
        `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/export?format=${format}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur export');
      }

      return await response.blob();
    } catch (error) {
      console.error('exportProject error:', error);
      throw error;
    }
  }

  async downloadFile(blob: Blob, fileName: string): Promise<void> {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async exportAndDownload(projectName: string, format: 'pdf' | 'docx' = 'pdf'): Promise<void> {
    try {
      const blob = await this.exportProject(projectName, format);
      const fileName = `${projectName.replace(/[^a-z0-9]/gi, "_")}.${format}`;
      await this.downloadFile(blob, fileName);
    } catch (error) {
      console.error('exportAndDownload error:', error);
      throw error;
    }
  }
}

export const exportService = new ExportService();
