import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface SocraticHighlight {
    id: string;
    from: number;
    to: number;
    color: 'yellow' | 'orange' | 'red';
    severity: 'info' | 'warning' | 'error';
    comment: string;
}

export interface SocraticExtensionOptions {
    highlights: SocraticHighlight[];
    onHighlightClick: (id: string, event: Event) => void;
}

export const SocraticExtension = Extension.create<SocraticExtensionOptions>({
    name: 'socraticReviewer',

    addOptions() {
        return {
            highlights: [],
            onHighlightClick: () => { },
        };
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('socratic-highlights'),

                props: {
                    decorations: (state) => {
                        const { highlights } = this.options;
                        const decorations: Decoration[] = [];

                        highlights.forEach((highlight) => {
                            if (highlight.to <= state.doc.content.size) { // Safety check
                                decorations.push(
                                    Decoration.inline(highlight.from, highlight.to, {
                                        class: `socratic-highlight socratic-${highlight.color}`,
                                        'data-id': highlight.id,
                                        'data-severity': highlight.severity,
                                        'data-comment': highlight.comment,
                                    })
                                );
                            }
                        });

                        return DecorationSet.create(state.doc, decorations);
                    },

                    handleClick: (view, pos, event) => {
                        const { highlights, onHighlightClick } = this.options;
                        // Check if clicked inside a decoration
                        // NOTE: Tiptap doesn't give direct access to clicked decorations easily in handleClick props without checking DOM or ranges
                        // But we can check if the target has our class
                        const target = event.target as HTMLElement;
                        if (target && target.classList.contains('socratic-highlight')) {
                            const id = target.getAttribute('data-id');
                            if (id) {
                                onHighlightClick(id, event);
                                return true; // We handled the click
                            }
                        }
                        return false;
                    }
                },
            }),
        ];
    },
});
