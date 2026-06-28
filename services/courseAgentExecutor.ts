/**
 * Exécuteur d'actions IA pour l'Agent XCCM (eXtended Content Composition Module)
 */
import { structureService } from '@/services/structureService';
import { exerciseService } from '@/services/exerciseService';

export type AIActionType = 'create_structure' | 'write_content' | 'create_exercise' | 'suggest_improvements';

export interface AIAction {
  type: AIActionType;
  data: Record<string, unknown>;
  status?: 'pending' | 'executing' | 'done' | 'error';
  error?: string;
}

export interface AgentProgress {
  phase: 'planning' | 'structure' | 'content' | 'exercise' | 'done' | 'error';
  message: string;
  current?: number;
  total?: number;
}

export interface ExecuteCallbacks {
  onProgress?: (progress: AgentProgress) => void;
  onContentChanged?: (content: string) => void;
  signal?: AbortSignal;
}

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException('Agent interrompu', 'AbortError');
  }
}

/** Normalise le payload create_structure (titres AI → format bulk API) */
function normalizeStructurePayload(data: Record<string, unknown>) {
  const parts = (data.parts as Array<Record<string, unknown>>) || [];
  return parts.map((part) => ({
    title: String(part.title || part.part_title || ''),
    intro: String(part.intro || part.part_intro || ''),
    chapters: ((part.chapters as Array<Record<string, unknown>>) || []).map((ch) => ({
      title: String(ch.title || ch.chapter_title || ''),
      intro: String(ch.intro || ch.chapter_intro || ''),
      paragraphs: ((ch.paragraphs as Array<Record<string, unknown>>) || []).map((para) => ({
        title: String(para.title || para.para_name || ''),
        intro: String(para.intro || para.para_intro || ''),
        notions: ((para.notions as Array<Record<string, unknown>>) || []).map((n) => ({
          title: String(n.title || n.notion_name || ''),
          content: String(n.content || n.notion_content || '<p>Contenu à compléter.</p>'),
        })),
      })),
    })),
  }));
}

export async function executeAIAction(
  action: AIAction,
  projectName: string,
  project: { pr_id?: string } | undefined,
  callbacks: ExecuteCallbacks = {}
): Promise<{ summary: string }> {
  const { onProgress, onContentChanged, signal } = callbacks;
  assertNotAborted(signal);

  switch (action.type) {
    case 'create_structure': {
      onProgress?.({ phase: 'structure', message: 'Création de la structure du cours…' });
      const parts = normalizeStructurePayload(action.data);

      try {
        const stats = await structureService.bulkCreateStructure(projectName, parts);
        return {
          summary: `Structure créée : ${stats.parts} partie(s), ${stats.chapters} chapitre(s), ${stats.paragraphs} paragraphe(s), ${stats.notions} notion(s)`,
        };
      } catch {
        // Fallback séquentiel si bulk indisponible
        let createdCount = 0;
        for (let pi = 0; pi < parts.length; pi++) {
          assertNotAborted(signal);
          const part = parts[pi];
          onProgress?.({
            phase: 'structure',
            message: `Partie : ${part.title}`,
            current: pi + 1,
            total: parts.length,
          });

          let createdPart;
          try {
            const existingParts = await structureService.getParts(projectName);
            createdPart = await structureService.createPart(projectName, {
              part_title: part.title,
              part_number: existingParts.length + 1,
              part_intro: part.intro || '',
            });
            createdCount++;
          } catch {
            continue;
          }

          for (let ci = 0; ci < (part.chapters?.length || 0); ci++) {
            assertNotAborted(signal);
            const ch = part.chapters![ci];
            let createdChapter;
            try {
              const existingCh = await structureService.getChapters(projectName, createdPart!.part_title);
              createdChapter = await structureService.createChapter(projectName, createdPart!.part_title, {
                chapter_title: ch.title,
                chapter_number: existingCh.length + 1,
                chapter_intro: ch.intro || '',
              });
            } catch {
              continue;
            }

            for (let pai = 0; pai < (ch.paragraphs?.length || 0); pai++) {
              assertNotAborted(signal);
              const para = ch.paragraphs![pai];
              let createdParagraph;
              try {
                const existingPara = await structureService.getParagraphs(
                  projectName, createdPart!.part_title, createdChapter!.chapter_title
                );
                createdParagraph = await structureService.createParagraph(
                  projectName, createdPart!.part_title, createdChapter!.chapter_title, {
                    para_name: para.title,
                    para_number: existingPara.length + 1,
                    para_intro: para.intro || '',
                  }
                );
              } catch {
                continue;
              }

              for (let ni = 0; ni < (para.notions?.length || 0); ni++) {
                assertNotAborted(signal);
                const notion = para.notions![ni];
                try {
                  const existingNotions = await structureService.getNotions(
                    projectName, createdPart!.part_title, createdChapter!.chapter_title, createdParagraph!.para_name
                  );
                  await structureService.createNotion(
                    projectName, createdPart!.part_title, createdChapter!.chapter_title, createdParagraph!.para_name, {
                      notion_name: notion.title,
                      notion_content: notion.content,
                      notion_number: existingNotions.length + 1,
                    }
                  );
                } catch { /* skip duplicate */ }
              }
            }
          }
        }
        return { summary: `Structure créée (fallback) : ${createdCount} partie(s)` };
      }
    }

    case 'write_content': {
      onProgress?.({ phase: 'content', message: 'Injection du contenu…' });
      const { content, target } = action.data as { content: string; target: string; notionPath?: Record<string, string> };

      if (target === 'current' && onContentChanged) {
        onContentChanged(content);
        return { summary: 'Contenu injecté dans l\'éditeur' };
      }

      if (target === 'notion' && action.data.notionPath) {
        const p = action.data.notionPath as Record<string, string>;
        await structureService.updateNotion(
          projectName, p.partTitle, p.chapterTitle, p.paraName, p.notionName,
          { notion_content: content }
        );
        return { summary: `Contenu écrit dans : ${p.notionName}` };
      }

      return { summary: 'Contenu traité' };
    }

    case 'create_exercise': {
      onProgress?.({ phase: 'exercise', message: 'Création de l\'exercice…' });
      const ex = { ...action.data } as Record<string, unknown>;
      if (project?.pr_id) ex.project_id = project.pr_id;
      await exerciseService.createExercise(ex as Parameters<typeof exerciseService.createExercise>[0]);
      return { summary: `Exercice créé : ${ex.title}` };
    }

    default:
      return { summary: 'Action ignorée' };
  }
}

export async function executeAllActions(
  actions: AIAction[],
  projectName: string,
  project: { pr_id?: string } | undefined,
  callbacks: ExecuteCallbacks = {}
): Promise<{ succeeded: number; failed: number; summaries: string[] }> {
  let succeeded = 0;
  let failed = 0;
  const summaries: string[] = [];

  for (let i = 0; i < actions.length; i++) {
    callbacks.onProgress?.({
      phase: actions[i].type === 'create_exercise' ? 'exercise' : actions[i].type === 'write_content' ? 'content' : 'structure',
      message: `Action ${i + 1}/${actions.length}…`,
      current: i + 1,
      total: actions.length,
    });

    try {
      const { summary } = await executeAIAction(actions[i], projectName, project, callbacks);
      summaries.push(summary);
      succeeded++;
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      failed++;
      summaries.push(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  }

  callbacks.onProgress?.({ phase: 'done', message: `Terminé : ${succeeded} action(s) réussie(s)` });
  return { succeeded, failed, summaries };
}
