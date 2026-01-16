import * as katex from 'katex';

/**
 * Renders Tiptap HTML content with KaTeX support for non-editor environments.
 * It searches for data-tex attributes or specific block tags and replaces them with rendered Math.
 */
export function renderBlockContent(html: string): string {
    if (typeof document === 'undefined') return html;

    const div = document.createElement('div');
    div.innerHTML = html;

    // Render MathBlocks
    const mathNodes = div.querySelectorAll('[data-type="math-block"], [data-type="math-inline"], .math-block, .math-inline');
    mathNodes.forEach(node => {
        const tex = node.getAttribute('data-tex') || node.textContent || '';
        const inline = node.getAttribute('data-type') === 'math-inline' || node.classList.contains('math-inline');

        try {
            node.innerHTML = katex.renderToString(tex, {
                throwOnError: false,
                displayMode: !inline
            });
        } catch (e) {
            console.error('KaTeX rendering error:', e);
        }
    });

    // Handle NoteBlocks (if structure is raw HTML)
    const noteNodes = div.querySelectorAll('noteblock, .note-block');
    noteNodes.forEach(node => {
        node.classList.add('note-block');
        if (!node.querySelector('.note-block-header')) {
            const header = document.createElement('div');
            header.className = 'note-block-header';
            header.textContent = 'Note';
            node.prepend(header);
        }
    });

    return div.innerHTML;
}
