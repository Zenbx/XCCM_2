// services/documentService.ts

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

export interface Document {
  doc_id: string;
  doc_name: string;
  url_content: string;
  pages: number;
  doc_size: number;
  published_at: string;
  consult: number;
  downloaded: number;
  pr_source?: string;
  author?: string;
  category?: string;
  level?: string;
  description?: string;
}

// Types pour le document avec structure complete
export interface DocumentWithStructure {
  document: Document;
  project: {
    pr_id: string;
    pr_name: string;
    description?: string;
    category?: string;
    level?: string;
    author?: string;
    language?: string;
    tags?: string[];
    styles?: Record<string, unknown>;
  };
  structure: Part[];
}

export interface Part {
  part_id: string;
  part_title: string;
  part_number: number;
  part_intro?: string;
  chapters: Chapter[];
}

export interface Chapter {
  chapter_id: string;
  chapter_title: string;
  chapter_number: number;
  paragraphs: Paragraph[];
}

export interface Paragraph {
  para_id: string;
  para_name: string;
  para_number: number;
  notions: Notion[];
}

export interface Notion {
  notion_id: string;
  notion_name: string;
  notion_number: number;
  notion_content: string;
}

class DocumentService {
  async getPublishedDocuments(): Promise<Document[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/documents`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erreur recuperation documents');
      }

      const result = await response.json();
      return result.data.documents || [];
    } catch (error) {
      console.error('getPublishedDocuments error:', error);
      throw error;
    }
  }

  async getDocumentById(docId: string): Promise<DocumentWithStructure> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/documents/${docId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error('Document non trouve');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('getDocumentById error:', error);
      throw error;
    }
  }

  async downloadDocument(docId: string): Promise<{ url: string; doc_name: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/documents/${docId}/download`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors du telechargement');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('downloadDocument error:', error);
      throw error;
    }
  }
}

export const documentService = new DocumentService();
