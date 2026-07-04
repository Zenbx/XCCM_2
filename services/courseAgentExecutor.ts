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
  /** Journal cumulatif affiché dans le chat */
  steps?: string[];
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

const TYPE_LABELS: Record<string, string> = {
  QCU: 'QCU',
  QCM: 'QCM',
  QRO: 'QRO',
  QROA: 'QRO ouverte',
  CODE: 'Code',
  FILL_BLANKS: 'Texte à trous',
};

/** Résout notionPath (titres) → IDs Mongo pour rattacher l'exercice. */
async function resolveNotionIds(
  projectName: string,
  path: { partTitle: string; chapterTitle: string; paraName: string; notionName: string }
): Promise<{
  part_id: string;
  chapter_id: string;
  para_id: string;
  notion_id: string;
} | null> {
  try {
    const structure = await structureService.getProjectStructureOptimized(projectName);
    const norm = (s: string) => s.toLowerCase().trim();

    const part = structure.find((p) => norm(p.part_title) === norm(path.partTitle));
    if (!part) return null;

    const chapter = part.chapters?.find((c) => norm(c.chapter_title) === norm(path.chapterTitle));
    if (!chapter) return null;

    const para = chapter.paragraphs?.find((p) => norm(p.para_name) === norm(path.paraName));
    if (!para) return null;

    const notion = para.notions?.find((n) => norm(n.notion_name) === norm(path.notionName));
    if (!notion) return null;

    return {
      part_id: part.part_id,
      chapter_id: chapter.chapter_id,
      para_id: para.para_id,
      notion_id: notion.notion_id,
    };
  } catch (err) {
    console.warn('[agent] resolveNotionIds failed:', err);
    return null;
  }
}

/** Normalise le payload create_structure (titres AI → format bulk API) */
export function normalizeStructurePayload(data: Record<string, unknown> | undefined | null) {
  const raw = data && typeof data === 'object' ? data : {};
  const parts = (raw.parts as Array<Record<string, unknown>>) || [];
  return parts.map((part) => ({
    title: String(part.title || part.part_title || '').trim(),
    intro: String(part.intro || part.part_intro || part.introduction || ''),
    chapters: ((part.chapters as Array<Record<string, unknown>>) || []).map((ch) => ({
      title: String(ch.title || ch.chapter_title || '').trim(),
      intro: String(ch.intro || ch.chapter_intro || ch.introduction || ''),
      paragraphs: ((ch.paragraphs as Array<Record<string, unknown>>) || []).map((para) => ({
        title: String(para.title || para.para_name || '').trim(),
        intro: String(para.intro || para.para_intro || para.introduction || ''),
        notions: ((para.notions as Array<Record<string, unknown>>) || []).map((n) => ({
          title: String(n.title || n.notion_name || '').trim(),
          content: String(
            n.content || n.notion_content || n.body || n.html || n.text || ''
          ) || '<p>Contenu à compléter.</p>',
        })),
      })),
    })),
  })).filter((p) => p.title.length >= 3);
}

function emitStructureProgress(
  parts: ReturnType<typeof normalizeStructurePayload>,
  onProgress: ExecuteCallbacks['onProgress'],
  phase: 'preview' | 'creating',
  extraSteps: string[] = []
) {
  const steps: string[] = [...extraSteps];

  if (phase === 'preview') {
    steps.push(`**${parts.length} partie(s)** à injecter dans le projet`);
  }

  for (const part of parts) {
    if (phase === 'creating') {
      steps.push(`⏳ Partie « ${part.title} »…`);
    } else {
      const hasIntro = part.intro && part.intro.replace(/<[^>]+>/g, '').trim().length >= 10;
      steps.push(`📁 **${part.title}**${hasIntro ? ' — intro ✓' : ''}`);
    }

    for (const ch of part.chapters || []) {
      const chIntro = ch.intro && ch.intro.replace(/<[^>]+>/g, '').trim().length >= 10;
      steps.push(`   📂 ${ch.title}${chIntro ? ' — intro ✓' : ''}`);

      for (const para of ch.paragraphs || []) {
        steps.push(`      📄 ${para.title}`);
        for (const notion of para.notions || []) {
          const words = notion.content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
          steps.push(`         • ${notion.title} (${words} mots)`);
        }
      }
    }
  }

  onProgress?.({
    phase: 'structure',
    message: phase === 'creating' ? `Injection de ${parts.length} partie(s)…` : 'Structure prête à injecter',
    steps,
  });
}

export interface StructureCreationStats {
  parts: number;
  chapters: number;
  paragraphs: number;
  notions: number;
  skipped?: number;
}

export async function executeAIAction(
  action: AIAction,
  projectName: string,
  project: { pr_id?: string } | undefined,
  callbacks: ExecuteCallbacks = {}
): Promise<{ summary: string; stats?: StructureCreationStats }> {
  const { onProgress, onContentChanged, signal } = callbacks;
  assertNotAborted(signal);

  switch (action.type) {
    case 'create_structure': {
      const parts = normalizeStructurePayload(action.data as Record<string, unknown>);

      if (parts.length === 0) {
        throw new Error(
          'Structure vide reçue de l\'IA. Réessayez ou précisez le sujet du cours.'
        );
      }

      emitStructureProgress(parts, onProgress, 'preview', ['✅ Structure validée — détail :']);

      try {
        emitStructureProgress(parts, onProgress, 'creating', ['⏳ Injection dans le projet…']);
        const stats = await structureService.bulkCreateStructure(projectName, parts);
        const total = stats.parts + stats.chapters + stats.paragraphs + stats.notions;
        if (total === 0 && stats.skipped > 0) {
          return { summary: `Structure déjà existante (${stats.skipped} élément(s) ignorés)` };
        }
        onProgress?.({
          phase: 'done',
          message: 'Structure injectée',
          steps: [
            '✅ Injection terminée',
            `📁 ${stats.parts} partie(s)`,
            `📂 ${stats.chapters} chapitre(s)`,
            `📄 ${stats.paragraphs} paragraphe(s)`,
            `📝 ${stats.notions} notion(s)`,
          ],
        });
        return {
          summary: `Structure créée : ${stats.parts} partie(s), ${stats.chapters} chapitre(s), ${stats.paragraphs} paragraphe(s), ${stats.notions} notion(s)`,
          stats: {
            parts: stats.parts,
            chapters: stats.chapters,
            paragraphs: stats.paragraphs,
            notions: stats.notions,
            skipped: stats.skipped,
          },
        };
      } catch (bulkError) {
        console.warn('[Agent] Bulk import failed, fallback séquentiel:', bulkError);
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
        if (createdCount === 0) {
          throw new Error(
            bulkError instanceof Error
              ? bulkError.message
              : 'Impossible de créer la structure du cours'
          );
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
      const ex = { ...action.data } as Record<string, unknown>;
      const title = String(ex.title || 'Exercice');
      const type = String(ex.type || 'QCM');
      onProgress?.({
        phase: 'exercise',
        message: `Génération d'exercices — ${type} « ${title} »…`,
      });

      if (project?.pr_id) ex.project_id = project.pr_id;

      // Rattacher à la notion (sinon invisible dans ExercisePanel au niveau notion)
      const path = (ex.notionPath || ex.notion_path) as {
        partTitle?: string;
        chapterTitle?: string;
        paraName?: string;
        notionName?: string;
      } | undefined;

      if (path?.partTitle && path?.chapterTitle && path?.paraName && path?.notionName) {
        const ids = await resolveNotionIds(projectName, path);
        if (ids) {
          ex.part_id = ids.part_id;
          ex.chapter_id = ids.chapter_id;
          ex.para_id = ids.para_id;
          ex.notion_id = ids.notion_id;
        }
      }

      // Nettoyer les champs non acceptés par l'API
      delete ex.notionPath;
      delete ex.notion_path;

      await exerciseService.createExercise(ex as Parameters<typeof exerciseService.createExercise>[0]);
      return { summary: `Exercice ${type} créé : ${title}` };
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
): Promise<{ succeeded: number; failed: number; summaries: string[]; stats?: StructureCreationStats }> {
  let succeeded = 0;
  let failed = 0;
  const summaries: string[] = [];
  let stats: StructureCreationStats | undefined;
  const liveSteps: string[] = [];

  const exerciseActions = actions.filter((a) => a.type === 'create_exercise');
  const structureActions = actions.filter((a) => a.type === 'create_structure');
  let exerciseIndex = 0;

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const phase =
      action.type === 'create_exercise'
        ? 'exercise'
        : action.type === 'write_content'
          ? 'content'
          : 'structure';

    if (action.type === 'create_exercise') {
      exerciseIndex++;
      const exType = String((action.data as { type?: string })?.type || 'QCM');
      const exTitle = String((action.data as { title?: string })?.title || 'Exercice');
      const label = TYPE_LABELS[exType] || exType;
      const line = `⏳ Génération d'exercices (${exerciseIndex}/${exerciseActions.length}) — ${label} « ${exTitle} »…`;
      liveSteps.push(line);
      callbacks.onProgress?.({
        phase: 'exercise',
        message: line,
        current: exerciseIndex,
        total: exerciseActions.length,
        steps: [...liveSteps],
      });
    } else if (action.type === 'create_structure') {
      const line = `⏳ Injection de la structure (${structureActions.length ? 'cours' : 'contenu'})…`;
      liveSteps.push(line);
      callbacks.onProgress?.({
        phase: 'structure',
        message: line,
        current: i + 1,
        total: actions.length,
        steps: [...liveSteps],
      });
    } else {
      callbacks.onProgress?.({
        phase,
        message: `Action ${i + 1}/${actions.length}…`,
        current: i + 1,
        total: actions.length,
        steps: [...liveSteps],
      });
    }

    try {
      const result = await executeAIAction(action, projectName, project, {
        ...callbacks,
        onProgress: (p) => {
          // Remplacer la dernière ligne « en cours » par le détail, sans perdre le journal
          callbacks.onProgress?.({
            ...p,
            steps: p.steps?.length ? p.steps : [...liveSteps],
          });
        },
      });
      summaries.push(result.summary);

      if (action.type === 'create_exercise') {
        liveSteps[liveSteps.length - 1] = `✅ ${result.summary}`;
        callbacks.onProgress?.({
          phase: 'exercise',
          message: result.summary,
          current: exerciseIndex,
          total: exerciseActions.length,
          steps: [...liveSteps],
        });
      } else if (action.type === 'create_structure') {
        liveSteps[liveSteps.length - 1] = `✅ ${result.summary}`;
        callbacks.onProgress?.({
          phase: 'structure',
          message: result.summary,
          steps: [...liveSteps],
        });
      }

      if (result.stats) stats = result.stats;
      succeeded++;
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      failed++;
      const errMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      summaries.push(errMsg);
      if (action.type === 'create_exercise' || action.type === 'create_structure') {
        liveSteps[liveSteps.length - 1] = `❌ ${errMsg}`;
        callbacks.onProgress?.({
          phase,
          message: errMsg,
          steps: [...liveSteps],
        });
      }
    }
  }

  const exerciseCount = exerciseActions.length;
  const doneMsg = exerciseCount
    ? `Terminé : ${succeeded} action(s) réussie(s)${exerciseCount ? `, dont ${exerciseCount} exercice(s)` : ''}`
    : `Terminé : ${succeeded} action(s) réussie(s)`;

  liveSteps.push(`✅ **${doneMsg}**`);
  callbacks.onProgress?.({
    phase: 'done',
    message: doneMsg,
    steps: [...liveSteps],
  });
  return { succeeded, failed, summaries, stats };
}
