// services/structureService.ts
import { getAuthToken, getAuthHeaders } from '@/lib/apiHelper';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

class StructureService {
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
    data: { notion_content: string }
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

  // Charger la structure complète d'un projet
  async getProjectStructure(projectName: string): Promise<Part[]> {
    const parts = await this.getParts(projectName);

    // Charger les chapitres de chaque partie
    for (const part of parts) {
      part.chapters = await this.getChapters(projectName, part.part_title);

      // Charger les paragraphes de chaque chapitre
      for (const chapter of part.chapters) {
        chapter.paragraphs = await this.getParagraphs(projectName, part.part_title, chapter.chapter_title);

        // Charger les notions de chaque paragraphe
        for (const paragraph of chapter.paragraphs) {
          paragraph.notions = await this.getNotions(projectName, part.part_title, chapter.chapter_title, paragraph.para_name);
        }
      }
    }

    return parts;
  }
}

export const structureService = new StructureService();