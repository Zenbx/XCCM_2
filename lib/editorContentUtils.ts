/** Utilitaires partagés pour détecter contenu vide vs substantiel dans l'éditeur HTML */

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function hasSubstantialHtml(html: string | null | undefined): boolean {
  if (!html) return false;
  const stripped = stripHtml(html);
  if (stripped.length < 10) return false;
  const lower = stripped.toLowerCase();
  if (lower.includes('contenu à compléter') || lower.includes('contenu a completer')) return false;
  return true;
}

/** Éditeur considéré comme vide (y compris placeholders TipTap) */
export function isEmptyEditorHtml(html: string | null | undefined): boolean {
  if (!html) return true;
  const stripped = stripHtml(html);
  if (stripped.length === 0) return true;
  const normalized = html.replace(/\s/g, '').toLowerCase();
  if (normalized === '<p></p>' || normalized === '<p><br></p>' || normalized === '<p><br/></p>') {
    return true;
  }
  const lower = stripped.toLowerCase();
  return lower.includes('contenu à compléter') || lower.includes('contenu a completer');
}

/** Contenu HTML persisté en base pour le granule courant */
export function lookupDbHtmlForContext(
  structure: Array<{
    part_id?: string;
    part_title?: string;
    part_intro?: string | null;
    chapters?: Array<{
      chapter_id?: string;
      chapter_title?: string;
      chapter_intro?: string | null;
      paragraphs?: Array<{
        para_id?: string;
        para_name?: string;
        para_intro?: string | null;
        notions?: Array<{ notion_id?: string; notion_content?: string }>;
      }>;
    }>;
  }>,
  context: {
    type?: string;
    partTitle?: string;
    part?: { part_id?: string; part_intro?: string | null } | null;
    chapter?: { chapter_id?: string; chapter_intro?: string | null } | null;
    paragraph?: { para_id?: string; para_intro?: string | null } | null;
    notion?: { notion_id?: string; notion_content?: string | null } | null;
  } | null
): string | null {
  if (!context) return null;

  if (context.type === 'notion') {
    for (const part of structure) {
      for (const ch of part.chapters || []) {
        for (const para of ch.paragraphs || []) {
          const n = para.notions?.find((x) => x.notion_id === context.notion?.notion_id);
          if (n) return n.notion_content ?? null;
        }
      }
    }
    return context.notion?.notion_content ?? null;
  }

  if (context.type === 'part') {
    const part = structure.find((p) => p.part_id === context.part?.part_id);
    return part?.part_intro ?? context.part?.part_intro ?? null;
  }

  if (context.type === 'chapter') {
    for (const part of structure) {
      const ch = part.chapters?.find((c) => c.chapter_id === context.chapter?.chapter_id);
      if (ch) return ch.chapter_intro ?? null;
    }
    return context.chapter?.chapter_intro ?? null;
  }

  if (context.type === 'paragraph') {
    for (const part of structure) {
      for (const ch of part.chapters || []) {
        const para = ch.paragraphs?.find((p) => p.para_id === context.paragraph?.para_id);
        if (para) return para.para_intro ?? null;
      }
    }
    return context.paragraph?.para_intro ?? null;
  }

  return null;
}
