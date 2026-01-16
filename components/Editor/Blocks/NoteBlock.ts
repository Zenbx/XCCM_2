import { Node, mergeAttributes } from '@tiptap/core';

export const NoteBlock = Node.create({
    name: 'noteblock',

    group: 'block',

    content: 'block+',

    defining: true,

    parseHTML() {
        return [
            {
                tag: 'div[data-type="note-block"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'note-block',
                class: 'note-block',
            }),
            [
                'div',
                { class: 'note-header' },
                ['span', { class: 'note-icon' }, '📝'],
                ['span', { class: 'note-title' }, 'Note'],
            ],
            ['div', { class: 'note-content' }, 0],
        ];
    },

    addCommands() {
        return {
            setNoteBlock:
                () =>
                    ({ commands }: any) => {
                        return commands.insertContent({
                            type: 'noteblock',
                            content: [
                                {
                                    type: 'paragraph',
                                    content: [{ type: 'text', text: 'Tapez votre note ici...' }],
                                },
                            ],
                        });
                    },
            toggleNoteBlock:
                () =>
                    ({ commands }: any) => {
                        return commands.toggleNode('noteblock', 'paragraph');
                    },
        } as any;
    },
});
