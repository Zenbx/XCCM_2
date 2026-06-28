import type { AIAction } from '@/services/courseAgentExecutor';

export type StructurePart = {
  title: string;
  intro?: string;
  chapters?: Array<{
    title: string;
    intro?: string;
    paragraphs?: Array<{
      title: string;
      intro?: string;
      notions?: Array<{ title: string; content?: string }>;
    }>;
  }>;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function wordCount(html: string): number {
  const text = stripHtml(html);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

/** Extrait les parties depuis une action create_structure */
export function extractStructureParts(data: Record<string, unknown> | undefined | null): StructurePart[] {
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
          ),
        })),
      })),
    })),
  })).filter((p) => p.title.length >= 3);
}

/** Lignes détaillées à partir de la structure générée (preview avant injection) */
export function buildStructurePreviewSteps(parts: StructurePart[]): string[] {
  const lines: string[] = [];
  if (!parts.length) return lines;

  lines.push(`**Structure générée** — ${parts.length} partie(s)`);

  for (const part of parts) {
    const partIntro = part.intro && stripHtml(part.intro).length >= 10;
    lines.push(`📁 **${part.title}**${partIntro ? ' _(intro ✓)_' : ' _(intro manquante)_'}`);

    for (const ch of part.chapters || []) {
      const chIntro = ch.intro && stripHtml(ch.intro).length >= 10;
      lines.push(`   📂 ${ch.title}${chIntro ? ' _(intro ✓)_' : ''}`);

      for (const para of ch.paragraphs || []) {
        const paraIntro = para.intro && stripHtml(para.intro).length >= 10;
        lines.push(`      📄 ${para.title}${paraIntro ? ' _(intro ✓)_' : ''}`);

        for (const notion of para.notions || []) {
          const words = wordCount(notion.content || '');
          const ok = words >= 30;
          lines.push(`         • ${notion.title}${ok ? ` _(${words} mots)_` : ' _(contenu manquant)_'}`);
        }
      }
    }
  }

  return lines;
}

/** Résumé final après création réussie */
export function formatCourseCreatedSummary(
  actions: AIAction[],
  stats?: { parts?: number; chapters?: number; paragraphs?: number; notions?: number }
): string {
  const structureAction = actions.find((a) => a.type === 'create_structure');
  if (!structureAction) return '✅ **Cours créé.**';

  const parts = extractStructureParts(structureAction.data as Record<string, unknown>);
  if (!parts.length) return '✅ **Cours créé.**';

  let totalNotions = 0;
  let totalWords = 0;
  let missingIntros = 0;
  let missingContent = 0;

  const lines: string[] = [
    '✅ **Le cours a été créé avec succès.**',
    '',
  ];

  const partCount = stats?.parts ?? parts.length;
  let chapterCount = stats?.chapters ?? 0;
  let paragraphCount = stats?.paragraphs ?? 0;
  let notionCount = stats?.notions ?? 0;

  if (!stats) {
    for (const part of parts) {
      chapterCount += part.chapters?.length || 0;
      for (const ch of part.chapters || []) {
        for (const para of ch.paragraphs || []) {
          paragraphCount++;
          notionCount += para.notions?.length || 0;
        }
      }
    }
  }

  lines.push(
    `**Résumé** — ${partCount} partie(s), ${chapterCount} chapitre(s), `
    + `${paragraphCount} paragraphe(s), ${notionCount} notion(s)`,
    '',
    '### 📚 Structure détaillée',
    ''
  );

  for (const part of parts) {
    const partWords = wordCount(part.intro || '');
    if (!partWords) missingIntros++;
    lines.push(`**📁 ${part.title}**${partWords ? ` _(${partWords} mots d'intro)_` : ' _(intro vide)_'}`);

    for (const ch of part.chapters || []) {
      const chWords = wordCount(ch.intro || '');
      if (!chWords) missingIntros++;
      lines.push(`- **📂 ${ch.title}**${chWords ? ` _(${chWords} mots d'intro)_` : ' _(intro vide)_'}`);

      for (const para of ch.paragraphs || []) {
        const paraWords = wordCount(para.intro || '');
        if (!paraWords) missingIntros++;
        lines.push(`  - **📄 ${para.title}**${paraWords ? ` _(${paraWords} mots d'intro)_` : ' _(intro vide)_'}`);

        for (const notion of para.notions || []) {
          totalNotions++;
          const words = wordCount(notion.content || '');
          if (words < 10) missingContent++;
          totalWords += words;
          lines.push(`    - 📝 **${notion.title}** — **${words} mot(s)**`);
        }
      }
    }
    lines.push('');
  }

  lines.push(`**Total contenu des notions** : **${totalWords} mot(s)** sur ${totalNotions} notion(s).`);

  if (missingIntros > 0 || missingContent > 0) {
    lines.push('');
    lines.push(
      `⚠️ ${missingIntros > 0 ? `${missingIntros} intro(s) vide(s). ` : ''}`
      + `${missingContent > 0 ? `${missingContent} notion(s) sans contenu suffisant.` : ''}`
      + ' Relancez l\'agent ou complétez via le mode Chat.'
    );
  }

  return lines.join('\n').trim();
}

/** Arbre final après création (legacy — préférer formatCourseCreatedSummary) */
export function formatStructureTree(actions: AIAction[]): string {
  return formatCourseCreatedSummary(actions);
}

export function formatAgentLiveMessage(steps: string[]): string {
  return steps.join('\n');
}
