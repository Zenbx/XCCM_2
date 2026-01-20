// services/structureService.ts
import { getAuthToken, getAuthHeaders } from '@/lib/apiHelper';
import pLimit from 'p-limit';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

export interface Part {
  part_id: string;
  part_title: string;
  part_intro?: string | null;
  part_number: number;
  parent_pr: string;
  chapters?: Chapter[];
}

export interface Chapter {
  chapter_id: string;
  chapter_title: string;
  chapter_number: number;
  parent_part: string;
  paragraphs?: Paragraph[];
}

export interface Paragraph {
  para_id: string;
  para_name: string;
  para_number: number;
  parent_chapter: string;
  notions?: Notion[];
}

export interface Notion {
  notion_id: string;
  notion_name: string;
  notion_content: string;
  notion_number?: number;
  parent_para: string;
}

/**
 * ⚡ OPTIMISÉ: Récupère la structure complète du projet en 1 seul appel
 * Remplace les multiples appels à getParts() + fillPartDetails()
 */

class StructureService {
  /**
   * ⚡ OPTIMISÉ: Récupère la structure complète du projet en 1 seul appel
   * Remplace les multiples appels à getParts() + fillPartDetails()
   */
  async getProjectStructureOptimized(projectName: string): Promise<Part[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/structure`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération de la structure');
    }

    const data = await response.json();
    return data.data.structure;
  }

  // ============= PARTS =============
  async createPart(projectName: string, data: { part_title: string; part_intro?: string; part_number: number }): Promise<Part> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token invalide ou expiré.');
      }
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création de la partie');
    }

    const result = await response.json();
    return result.data.part;
  }

  async getParts(projectName: string): Promise<Part[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token invalide ou expiré.');
      }
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des parties');
    }

    const result = await response.json();
    return result.data.parts;
  }

  async updatePart(
    projectName: string,
    partTitle: string, // Ancien titre pour l'URL
    data: { part_title?: string; part_intro?: string; part_number?: number }
  ): Promise<Part> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}`,
      {
        method: 'PATCH', // ou PUT selon l'API
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error('Token invalide ou expiré.');
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour de la partie');
    }

    const result = await response.json();
    return result.data.part;
  }

  // ============= CHAPTERS =============
  async createChapter(projectName: string, partTitle: string, data: { chapter_title: string; chapter_number: number }): Promise<Chapter> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token invalide ou expiré.');
      }
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création du chapitre');
    }

    const result = await response.json();
    return result.data.chapter;
  }

  async getChapters(projectName: string, partTitle: string): Promise<Chapter[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token invalide ou expiré.');
      }
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des chapitres');
    }

    const result = await response.json();
    return result.data.chapters;
  }

  async updateChapter(
    projectName: string,
    partTitle: string,
    chapterTitle: string,
    data: { chapter_title?: string; chapter_number?: number }
  ): Promise<Chapter> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error('Token invalide ou expiré.');
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour du chapitre');
    }

    const result = await response.json();
    return result.data.chapter;
  }

  // ============= PARAGRAPHS =============
  async createParagraph(
    projectName: string,
    partTitle: string,
    chapterTitle: string,
    data: { para_name: string; para_number: number }
  ): Promise<Paragraph> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}/paragraphs`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token invalide ou expiré.');
      }
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création du paragraphe');
    }

    const result = await response.json();
    return result.data.paragraph;
  }

  async getParagraphs(projectName: string, partTitle: string, chapterTitle: string): Promise<Paragraph[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}/paragraphs`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token invalide ou expiré.');
      }
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des paragraphes');
    }

    const result = await response.json();
    return result.data.paragraphs;
  }

  async updateParagraph(
    projectName: string,
    partTitle: string,
    chapterTitle: string,
    paraName: string,
    data: { para_name?: string; para_number?: number }
  ): Promise<Paragraph> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}/paragraphs/${encodeURIComponent(paraName)}`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error('Token invalide ou expiré.');
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour du paragraphe');
    }

    const result = await response.json();
    return result.data.paragraph;
  }

  // ============= NOTIONS =============
  async createNotion(
    projectName: string,
    partTitle: string,
    chapterTitle: string,
    paraName: string,
    data: { notion_name: string; notion_content: string; notion_number: number }
  ): Promise<Notion> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}/paragraphs/${encodeURIComponent(paraName)}/notions`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token invalide ou expiré.');
      }
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création de la notion');
    }

    const result = await response.json();
    return result.data.notion;
  }

  async getNotions(
    projectName: string,
    partTitle: string,
    chapterTitle: string,
    paraName: string
  ): Promise<Notion[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}/paragraphs/${encodeURIComponent(paraName)}/notions`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token invalide ou expiré.');
      }
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des notions');
    }

    const result = await response.json();
    return result.data.notions;
  }

  async updateNotion(
    projectName: string,
    partTitle: string,
    chapterTitle: string,
    paraName: string,
    notionName: string,
    data: { notion_name?: string, notion_content?: string, notion_number?: number }
  ): Promise<Notion> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}/paragraphs/${encodeURIComponent(paraName)}/notions/${encodeURIComponent(notionName)}`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token invalide ou expiré.');
      }
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour de la notion');
    }

    const result = await response.json();
    return result.data.notion;
  }

  // Charger la structure complète d'un projet avec contrôle de concurrence
  async getProjectStructure(projectName: string): Promise<Part[]> {
    const parts = await this.getParts(projectName);
    const limit = pLimit(5); // Limiter à 5 requêtes simultanées

    // Charger les détails de chaque partie avec concurrence limitée
    await Promise.all(parts.map(part => limit(() => this.fillPartDetails(projectName, part))));

    return parts;
  }

  // Remplir les détails d'une partie (Chapitres -> Paragraphes -> Notions)
  async fillPartDetails(projectName: string, part: Part): Promise<Part> {
    part.chapters = await this.getChapters(projectName, part.part_title);

    if (part.chapters && part.chapters.length > 0) {
      // Pour les chapitres d'une même partie, on peut aussi paralléliser un peu, 
      // mais attention à ne pas exploser le compteur global si on appelle ça depuis getProjectStructure.
      // Ici on le fait en série pour cette partie pour être safe, ou alors Promise.all simple car le limit est au dessus.
      await Promise.all(part.chapters.map(async (chapter) => {
        chapter.paragraphs = await this.getParagraphs(projectName, part.part_title, chapter.chapter_title);

        await Promise.all(chapter.paragraphs.map(async (paragraph) => {
          paragraph.notions = await this.getNotions(projectName, part.part_title, chapter.chapter_title, paragraph.para_name);
        }));
      }));
    }
    return part;
  }

  // ============= DELETE METHODS =============

  async deletePart(projectName: string, partTitle: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token invalide ou expiré.');
      }
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la suppression de la partie');
    }
  }

  async deleteChapter(projectName: string, partTitle: string, chapterTitle: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token invalide ou expiré.');
      }
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la suppression du chapitre');
    }
  }

  async deleteParagraph(
    projectName: string,
    partTitle: string,
    chapterTitle: string,
    paraName: string
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}/paragraphs/${encodeURIComponent(paraName)}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token invalide ou expiré.');
      }
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la suppression du paragraphe');
    }
  }

  async deleteNotion(
    projectName: string,
    partTitle: string,
    chapterTitle: string,
    paraName: string,
    notionName: string
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}/paragraphs/${encodeURIComponent(paraName)}/notions/${encodeURIComponent(notionName)}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token invalide ou expiré.');
      }
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la suppression de la notion');
    }
  }

  // ============= MOVE GRANULE (change parent) =============
  async moveGranule(
    projectName: string,
    type: 'chapter' | 'paragraph' | 'notion',
    itemId: string,
    newParentId: string,
    newNumber?: number
  ): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/move`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ type, itemId, newParentId, newNumber }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token invalide ou expiré.');
      }
      const error = await response.json();
      const detailedError = new Error(error.message || 'Erreur lors du déplacement') as any;
      detailedError.details = error.details || error.error; // Suivant le format de api-response
      throw detailedError;
    }

    const result = await response.json();
    return result.data;
  }
}

export const structureService = new StructureService();