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

        // Try to extract quiz data from data attributes or text content
        let question = el.getAttribute('data-question') || el.getAttribute('question') || 'Question sans titre';
        let options: string[] = [];
        let correctIndex = -1;

        try {
            const optionsAttr = el.getAttribute('data-options') || el.getAttribute('options');
            if (optionsAttr) {
                options = JSON.parse(optionsAttr);
            }
        } catch {
            // If parsing fails, check for default options
            options = ['Option A', 'Option B', 'Option C', 'Option D'];
        }

        try {
            const correctAttr = el.getAttribute('data-correct-index') || el.getAttribute('correctindex');
            if (correctAttr) {
                correctIndex = parseInt(correctAttr, 10);
            }
        } catch {
            // Default to -1 if no correct answer is specified
        }

        el.style.background = '#ffffff';
        el.style.border = '1px solid #e2e8f0';
        el.style.borderRadius = '12px';
        el.style.margin = '2rem 0';
        el.style.padding = '1.5rem';

        let optionsHtml = '';
        if (options.length > 0) {
            optionsHtml = options.map((opt, idx) => {
                const isCorrect = idx === correctIndex;
                const bgColor = isCorrect ? '#dcfce7' : '#f9fafb';
                const borderColor = isCorrect ? '#86efac' : '#e5e7eb';
                const icon = isCorrect ? '✓' : String.fromCharCode(65 + idx); // A, B, C, D...

                return `
                    <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px; margin-bottom: 0.5rem;">
                        <span style="width: 24px; height: 24px; border-radius: 50%; background: white; border: 2px solid ${borderColor}; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.75rem; color: #374151;">${icon}</span>
                        <span style="flex: 1; color: #1f2937;">${opt}</span>
                        ${isCorrect ? '<span style="font-size: 0.7rem; color: #059669; font-weight: bold;">BONNE RÉPONSE</span>' : ''}
                    </div>
                `;
            }).join('');
        } else {
            optionsHtml = '<div style="color: #9ca3af; font-style: italic; text-align: center; padding: 1rem;">Aucune option définie</div>';
        }

        el.innerHTML = `
            <div style="font-weight: bold; color: #99334C; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.2rem;">❓</span> Question de Quiz
            </div>
            <div style="font-size: 1.1rem; font-weight: 500; margin-bottom: 1.25rem; color: #111827;">${question}</div>
            <div style="margin-top: 1rem;">
                ${optionsHtml}
            </div>
            <div style="border-top: 1px solid #f1f5f9; margin-top: 1rem; padding-top: 0.75rem; color: #64748b; font-style: italic; font-size: 0.75rem; text-align: center;">
                (Version statique - Dans la version interactive, l'utilisateur peut sélectionner une réponse)
            </div>
        `;
    });

    // Handle CodeRunner blocks
    const codeNodes = div.querySelectorAll('[data-type="code-runner-block"]');
    codeNodes.forEach(node => {
        const el = node as HTMLElement;

        // Try to extract code from data attributes or text content
        let code = el.getAttribute('data-code') || el.getAttribute('code') || el.textContent?.trim() || '// Aucun code défini...';
        let lang = el.getAttribute('data-language') || el.getAttribute('language') || 'javascript';
        let output = el.getAttribute('data-output') || el.getAttribute('output') || '';

        // Clean up code formatting
        code = code.replace(/\\n/g, '\n').replace(/\\t/g, '    ');

        el.style.background = '#1e293b';
        el.style.color = '#f8fafc';
        el.style.borderRadius = '8px';
        el.style.margin = '2rem 0';
        el.style.overflow = 'hidden';

        let outputHtml = '';
        if (output && output.trim()) {
            outputHtml = `
                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding: 1rem 1.5rem; background: rgba(0,0,0,0.2);">
                    <div style="font-size: 0.7rem; text-transform: uppercase; opacity: 0.6; margin-bottom: 0.5rem;">Sortie (dernière exécution) :</div>
                    <pre style="margin: 0; font-family: 'Fira Code', 'Courier New', monospace; font-size: 0.85rem; opacity: 0.9; white-space: pre-wrap;">${output}</pre>
                </div>
            `;
        }

        el.innerHTML = `
            <div style="background: rgba(255,255,255,0.1); padding: 0.5rem 1rem; font-size: 0.8rem; font-family: monospace; display: flex; justify-content: space-between; align-items: center;">
                <span>💻 CODE (${lang.toUpperCase()})</span>
                <span style="opacity: 0.6; font-size: 0.7rem;">[Version Statique]</span>
            </div>
            <div style="padding: 1.5rem; font-family: 'Fira Code', 'Courier New', monospace; font-size: 0.9rem; line-height: 1.6; white-space: pre-wrap; max-height: 400px; overflow-y: auto;">${code}</div>
            ${outputHtml}
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
