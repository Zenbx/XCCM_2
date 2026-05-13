import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { DiagramBlockView } from './Views/DiagramBlockView';

export const DiagramBlock = Node.create({
    name: 'diagramblock',

    group: 'block',

    atom: true,

    selectable: true,

    draggable: true,

    addAttributes() {
        return {
            code: {
                default: 'graph TD\n    A[Début] --> B{Décision}\n    B -->|Oui| C[Action A]\n    B -->|Non| D[Action B]\n    C --> E[Fin]\n    D --> E',
            },
            theme: {
                default: 'default',
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-type="diagram-block"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'diagram-block' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(DiagramBlockView);
    },

    addCommands() {
        return {
            setDiagramBlock:
                () =>
                    ({ commands }: any) => {
                        return commands.insertContent({ type: 'diagramblock' });
                    },
        } as any;
    },
});
