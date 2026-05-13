import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { DiscoveryHintView } from './Views/DiscoveryHintView';

export const DiscoveryHint = Node.create({
    name: 'discoveryhint',

    group: 'block',

    content: 'block+',

    defining: true,

    addAttributes() {
        return {
            title: {
                default: 'Afficher l\'indice',
            },
            isOpen: {
                default: false,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="discovery-hint"]',
                getAttrs: (element) => ({
                    title: (element as HTMLElement).getAttribute('data-title'),
                    isOpen: (element as HTMLElement).getAttribute('data-open') === 'true',
                }),
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        const { title, isOpen } = node.attrs;

        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'discovery-hint',
                'data-title': title,
                'data-open': isOpen,
                class: `discovery-hint ${isOpen ? 'is-open' : 'is-closed'}`,
            }),
            [
                'div',
                { class: 'discovery-hint-header' },
                ['span', { class: 'discovery-hint-icon' }, isOpen ? '📖' : '📘'],
                ['span', { class: 'discovery-hint-title' }, title],
                ['span', { class: 'discovery-hint-toggle' }, isOpen ? 'Cacher' : 'Découvrir'],
            ],
            ['div', { class: 'discovery-hint-content' }, 0],
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(DiscoveryHintView);
    },

    addCommands() {
        return {
            setDiscoveryHint:
                () =>
                    ({ commands }: any) => {
                        return commands.insertContent({
                            type: 'discoveryhint',
                            content: [
                                {
                                    type: 'paragraph',
                                    content: [{ type: 'text', text: 'Contenu caché à découvrir...' }],
                                },
                            ],
                        });
                    },
            toggleDiscoveryHint:
                () =>
                    ({ commands, editor }: any) => {
                        const { selection } = editor.state;
                        const { $from } = selection;
                        const node = $from.node($from.depth);

                        if (node.type.name === 'discoveryhint') {
                            return commands.updateAttributes('discoveryhint', {
                                isOpen: !node.attrs.isOpen,
                            });
                        }
                        return false;
                    },
        } as any;
    },
});
