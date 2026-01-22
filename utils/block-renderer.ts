import * as katex from 'katex';

/**
 * Renders Tiptap HTML content with KaTeX support for non-editor environments.
 * It searches for data-tex attributes or specific block tags and replaces them with rendered Math.
 */
export function renderBlockContent(html: string): string {
    if (typeof document === 'undefined') return html;

    const div = document.createElement('div');
    div.innerHTML = html;

    // Render MathBlocks and MathInlines
    // Tiptap might render them as spans or divs with data-type
    const mathNodes = div.querySelectorAll('[data-type="math-block"], [data-type="math-inline"], .math-block, .math-inline');

    mathNodes.forEach(node => {
        // Prefer data-tex, but fallback to textContent if Tiptap didn't serialize data-tex correctly in some cases
        let tex = node.getAttribute('data-tex');

        // If no data-tex, check if node content is just the TeX string
        if (!tex) {
            tex = node.textContent?.trim() || '';
        }

        const isInline = node.getAttribute('data-type') === 'math-inline' || node.classList.contains('math-inline');

        try {
            if (tex) {
                node.innerHTML = katex.renderToString(tex, {
                    throwOnError: false,
                    displayMode: !isInline,
                    output: 'html'
                });

                // Add some basic styling for rendered math
                if (!isInline) {
                    (node as HTMLElement).style.display = 'block';
                    (node as HTMLElement).style.margin = '1.5rem 0';
                    (node as HTMLElement).style.textAlign = 'center';
                } else {
                    (node as HTMLElement).style.display = 'inline-block';
                    (node as HTMLElement).style.padding = '0 0.25rem';
                }
            }
        } catch (e) {
            console.error('KaTeX rendering error:', e);
        }
    });

    // Handle DiscoveryHint Blocks
    const discoveryNodes = div.querySelectorAll('[data-type="discovery-hint"], .discovery-hint');
    discoveryNodes.forEach(node => {
        const el = node as HTMLElement;
        const title = el.getAttribute('data-title') || 'Indice de découverte';

        const header = document.createElement('div');
        header.className = 'discovery-hint-header';
        header.style.background = '#f8fafc';
        header.style.padding = '0.75rem 1rem';
        header.style.fontWeight = 'bold';
        header.style.color = '#475569';
        header.style.fontSize = '0.9rem';
        header.style.borderBottom = '1px solid #e2e8f0';
        header.innerHTML = `📘 ${title} <span style="float: right; font-size: 0.7rem; color: #94a3b8;">[Version Statique]</span>`;

        el.prepend(header);
        el.style.border = '1px solid #e2e8f0';
        el.style.borderRadius = '8px';
        el.style.margin = '2rem 0';
        el.style.overflow = 'hidden';
    });

    // Handle Capture zones
    const captureNodes = div.querySelectorAll('[data-type="capture-zone"], .capture-zone-block');
    captureNodes.forEach(node => {
        const el = node as HTMLElement;
        el.style.background = '#f9fafb';
        el.style.border = '2px dashed #d1d5db';
        el.style.borderRadius = '12px';
        el.style.padding = '2rem';
        el.style.margin = '2rem 0';
        el.style.textAlign = 'center';
        el.style.color = '#6b7280';
        el.innerHTML = `<div style="font-weight: 600;">📷 Zone de capture</div><div style="font-size: 0.8rem; opacity: 0.7;">(Réservé au cours interactif)</div>`;
    });

    // Handle Quiz blocks
    const quizNodes = div.querySelectorAll('[data-type="quiz-block"]');
    quizNodes.forEach(node => {
        const el = node as HTMLElement;
        const question = el.getAttribute('question') || 'Question sans titre';

        el.style.background = '#ffffff';
        el.style.border = '1px solid #e2e8f0';
        el.style.borderRadius = '12px';
        el.style.margin = '2rem 0';
        el.style.padding = '1.5rem';
        el.innerHTML = `
            <div style="font-weight: bold; color: #99334C; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.2rem;">❓</span> Question de Quiz
            </div>
            <div style="font-size: 1.1rem; font-weight: 500; margin-bottom: 1rem;">${question}</div>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 1rem; color: #64748b; font-style: italic; font-size: 0.9rem;">
                (Les options de réponse sont disponibles uniquement dans la version interactive)
            </div>
        `;
    });

    // Handle CodeRunner blocks
    const codeNodes = div.querySelectorAll('[data-type="code-runner-block"]');
    codeNodes.forEach(node => {
        const el = node as HTMLElement;
        const lang = el.getAttribute('language') || 'javascript';

        el.style.background = '#1e293b';
        el.style.color = '#f8fafc';
        el.style.borderRadius = '8px';
        el.style.margin = '2rem 0';
        el.style.overflow = 'hidden';
        el.innerHTML = `
            <div style="background: rgba(255,255,255,0.1); padding: 0.5rem 1rem; font-size: 0.8rem; font-family: monospace; display: flex; justify-content: space-between;">
                <span>💻 CODE (${lang})</span>
                <span style="opacity: 0.6;">[Version Statique]</span>
            </div>
            <div style="padding: 1.5rem; font-family: 'Fira Code', 'Courier New', monospace; font-size: 0.9rem; line-height: 1.6; white-space: pre-wrap;">
                // Le code s'affiche ici dans la version interactive...
            </div>
        `;
    });

    // Handle NoteBlocks
    const noteNodes = div.querySelectorAll('[data-type="note-block"], .note-block');
    noteNodes.forEach(node => {
        const el = node as HTMLElement;
        el.classList.add('note-block');
        el.style.background = '#fdf2f4';
        el.style.borderLeft = '4px solid #99334C';
        el.style.padding = '1.5rem';
        el.style.margin = '2rem 0';
        el.style.borderRadius = '0 4px 4px 0';

        // Add header if missing
        if (!el.querySelector('.note-block-header')) {
            const header = document.createElement('div');
            header.className = 'note-block-header';
            header.style.fontWeight = 'bold';
            header.style.color = '#99334C';
            header.style.fontSize = '0.8rem';
            header.style.textTransform = 'uppercase';
            header.style.marginBottom = '0.5rem';
            header.innerHTML = '📝 Note / Remarque';
            el.prepend(header);
        }
    });

    return div.innerHTML;
}
