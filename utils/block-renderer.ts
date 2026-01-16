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

    // Handle NoteBlocks and other pedagogical blocks if they are missing classes
    const noteNodes = div.querySelectorAll('[data-type="note-block"], .note-block');
    noteNodes.forEach(node => {
        const el = node as HTMLElement;
        el.classList.add('note-block');
        el.style.background = '#fdf2f4';
        el.style.borderLeft = '4px solid #99334C';
        el.style.padding = '1.5rem';
        el.style.margin = '2rem 0';
        el.style.borderRadius = '4px';
    });

    return div.innerHTML;
}
