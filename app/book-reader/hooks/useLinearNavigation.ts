import { useMemo, useState, useCallback } from 'react';
import type { Part, Chapter, Paragraph, Notion } from '@/services/documentService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PlaylistItemContext = {
  partTitle: string;
  chapterTitle?: string;
  paraTitle?: string;
};

export type PlaylistItem =
  | { type: 'notion'; data: Notion; context: PlaylistItemContext }
  | { type: 'exercises'; notionId: string; notionName: string; context: PlaylistItemContext };

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Flattens the hierarchical course structure into a linear "playlist"
 * ready for step-by-step navigation (Coursera-style).
 *
 * Each notion becomes a separate step.
 * If a notion has exercises attached, an "exercises" step follows it immediately.
 */
export function useLinearNavigation(
  structure: Part[],
  exercisesByNotion: Record<string, any[]>
) {
  const playlist = useMemo<PlaylistItem[]>(() => {
    const items: PlaylistItem[] = [];

    for (const part of structure) {
      for (const chapter of part.chapters) {
        for (const para of chapter.paragraphs) {
          for (const notion of para.notions) {
            const context: PlaylistItemContext = {
              partTitle: part.part_title,
              chapterTitle: chapter.chapter_title,
              paraTitle: para.para_name,
            };

            // Step 1: read the notion content
            items.push({ type: 'notion', data: notion, context });

            // Step 2 (optional): exercise block for this notion
            const exos = exercisesByNotion[notion.notion_id];
            if (exos && exos.length > 0) {
              items.push({
                type: 'exercises',
                notionId: notion.notion_id,
                notionName: notion.notion_name,
                context,
              });
            }
          }
        }
      }
    }

    return items;
  }, [structure, exercisesByNotion]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextStep = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, playlist.length - 1));
  }, [playlist.length]);

  const prevStep = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, playlist.length - 1)));
  }, [playlist.length]);

  const goToId = useCallback((id: string, type: 'notion' | 'exercises' = 'notion') => {
    const idx = playlist.findIndex(item => {
      if (type === 'notion' && item.type === 'notion') return item.data.notion_id === id;
      if (type === 'exercises' && item.type === 'exercises') return item.notionId === id;
      return false;
    });
    if (idx >= 0) setCurrentIndex(idx);
  }, [playlist]);

  const currentItem = playlist[currentIndex] ?? null;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === playlist.length - 1;
  const progress = playlist.length > 0 ? ((currentIndex + 1) / playlist.length) * 100 : 0;

  return {
    playlist,
    currentIndex,
    currentItem,
    isFirst,
    isLast,
    progress,
    nextStep,
    prevStep,
    goTo,
  };
}
