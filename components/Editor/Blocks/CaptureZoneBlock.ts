import { Node, mergeAttributes } from '@tiptap/core';

export const CaptureZoneBlock = Node.create({
    name: 'capturezoneblock',

    group: 'block',

    atom: true,

    selectable: true,

    draggable: true,

    parseHTML() {
        return [
            {
                tag: 'div[data-type="capture-zone"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'capture-zone',
                class: 'capture-zone-block',
                contenteditable: 'false',
            }),
            [
                'div',
                { class: 'capture-zone-header' },
                ['span', { class: 'capture-icon' }, '📸'],
                ['span', { class: 'capture-title' }, 'Zone de Capture'],
            ],
            [
                'div',
                { class: 'capture-zone-body' },
                ['p', { class: 'capture-instruction' }, 'Collez votre image ici (Ctrl+V) ou glissez-la'],
            ],
        ];
    },

    addCommands() {
        return {
            setCaptureZoneBlock:
                () =>
                    ({ commands }: any) => {
                        return commands.insertContent({ type: 'capturezoneblock' });
                    },
        } as any;
    },
});
