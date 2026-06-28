// services/structureService.ts
import { authenticatedFetch } from '@/lib/apiHelper';
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
  chapter_intro?: string | null;
  chapter_number: number;
  parent_part: string;
  paragraphs?: Paragraph[];
}

export interface Paragraph {
  para_id: string;
  para_name: string;
  para_intro?: string | null;
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
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/structure`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération de la structure');
    }

    const data = await response.json();
    const raw = data.data?.structure ?? data.data ?? [];
    return Array.isArray(raw) ? raw : [];
  }

  // ============= PARTS =============
  async createPart(projectName: string, data: { part_title: string; part_intro?: string; part_number: number }): Promise<Part> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création de la partie');
    }

    const result = await response.json();
    return result.data.part;
  }

  async getParts(projectName: string): Promise<Part[]> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts`,
      {
        method: 'GET'
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des parties');
    }

    const result = await response.json();
    const parts = result.data?.parts ?? result.data ?? [];
    return Array.isArray(parts) ? parts : [];
  }

  async updatePart(
    projectName: string,
    partTitle: string, // Ancien titre pour l'URL
    data: { part_title?: string; part_intro?: string; part_number?: number }
  ): Promise<Part> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}`,
      {
        method: 'PATCH', // ou PUT selon l'API
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
  async createChapter(projectName: string, partTitle: string, data: { chapter_title: string; chapter_number: number; chapter_intro?: string }): Promise<Chapter> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création du chapitre');
    }

    const result = await response.json();
    return result.data.chapter;
  }

  async getChapters(projectName: string, partTitle: string): Promise<Chapter[]> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters`,
      {
        method: 'GET'
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des chapitres');
    }

    const result = await response.json();
    const chapters = result.data?.chapters ?? result.data ?? [];
    return Array.isArray(chapters) ? chapters : [];
  }

  async updateChapter(
    projectName: string,
    partTitle: string,
    chapterTitle: string,
    data: { chapter_title?: string; chapter_number?: number; chapter_intro?: string }
  ): Promise<Chapter> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}`,
      {
        method: 'PATCH',
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
    data: { para_name: string; para_number: number; para_intro?: string }
  ): Promise<Paragraph> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}/paragraphs`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création du paragraphe');
    }

    const result = await response.json();
    return result.data.paragraph;
  }

  async getParagraphs(projectName: string, partTitle: string, chapterTitle: string): Promise<Paragraph[]> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}/paragraphs`,
      {
        method: 'GET'
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des paragraphes');
    }

    const result = await response.json();
    const paragraphs = result.data?.paragraphs ?? result.data ?? [];
    return Array.isArray(paragraphs) ? paragraphs : [];
  }

  async updateParagraph(
    projectName: string,
    partTitle: string,
    chapterTitle: string,
    paraName: string,
    data: { para_name?: string; para_number?: number; para_intro?: string }
  ): Promise<Paragraph> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}/paragraphs/${encodeURIComponent(paraName)}`,
      {
        method: 'PATCH',
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
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}/paragraphs/${encodeURIComponent(paraName)}/notions`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
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
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}/paragraphs/${encodeURIComponent(paraName)}/notions`,
      {
        method: 'GET'
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des notions');
    }

    const result = await response.json();
    const notions = result.data?.notions ?? result.data ?? [];
    return Array.isArray(notions) ? notions : [];
  }

  async updateNotion(
    projectName: string,
    partTitle: string,
    chapterTitle: string,
    paraName: string,
    notionName: string,
    data: { notion_name?: string, notion_content?: string, notion_number?: number }
  ): Promise<Notion> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}/paragraphs/${encodeURIComponent(paraName)}/notions/${encodeURIComponent(notionName)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
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
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}`,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la suppression de la partie');
    }
  }

  async deleteChapter(projectName: string, partTitle: string, chapterTitle: string): Promise<void> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}`,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
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
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}/paragraphs/${encodeURIComponent(paraName)}`,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
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
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/parts/${encodeURIComponent(partTitle)}/chapters/${encodeURIComponent(chapterTitle)}/paragraphs/${encodeURIComponent(paraName)}/notions/${encodeURIComponent(notionName)}`,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
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
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/move`,
      {
        method: 'PATCH',
        body: JSON.stringify({ type, itemId, newParentId, newNumber }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      const detailedError = new Error(error.message || 'Erreur lors du déplacement') as any;
      detailedError.details = error.details || error.error; // Suivant le format de api-response
      throw detailedError;
    }

    const result = await response.json();
    return result.data;
  }

  // ============= REORDER BULK =============
  async reorderGranules(
    projectName: string,
    type: 'part' | 'chapter' | 'paragraph' | 'notion',
    items: { id: string; number: number }[]
  ): Promise<void> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/reorder`,
      {
        method: 'POST',
        body: JSON.stringify({ type, items }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error('Token invalide ou expiré.');
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors du réordonnancement');
    }
  }

  // ============= UUID-BASED OPERATIONS (ROBUST) =============
  
  /**
   * ✅ PATCH par UUID — Immunisé aux renommages
   * Utilise /api/projects/[pr_name]/granules/[id]
   */
  async updateGranuleById(
    projectName: string,
    id: string,
    data: Record<string, any>
  ): Promise<any> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/granules/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error('Token invalide ou expiré.');
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Import bulk de structure (Agent IA) — 1 appel pour tout l'arbre
   */
  async bulkCreateStructure(
    projectName: string,
    parts: Array<{
      title: string;
      intro?: string;
      chapters?: Array<{
        title: string;
        intro?: string;
        paragraphs?: Array<{
          title: string;
          intro?: string;
          notions?: Array<{ title: string; content: string }>;
        }>;
      }>;
    }>
  ): Promise<{ parts: number; chapters: number; paragraphs: number; notions: number; skipped: number }> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/structure/bulk`,
      {
        method: 'POST',
        body: JSON.stringify({ parts }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erreur lors de l\'import bulk de la structure');
    }

    const result = await response.json();
    return result.data?.stats ?? result.data ?? { parts: 0, chapters: 0, paragraphs: 0, notions: 0, skipped: 0 };
  }

  /**
   * DELETE par UUID — immunisé aux renommages
   * Utilise /api/projects/[pr_name]/granules/[id]
   */
  async deleteGranuleById(
    projectName: string,
    id: string
  ): Promise<void> {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/api/projects/${encodeURIComponent(projectName)}/granules/${encodeURIComponent(id)}`,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error('Token invalide ou expiré.');
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la suppression');
    }
  }
}

export const structureService = new StructureService();