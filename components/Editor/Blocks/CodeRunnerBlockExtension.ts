import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CodeRunnerBlockView } from './Views/CodeRunnerBlockView';

export const CodeRunnerBlock = Node.create({
    name: 'coderunnerblock',

    group: 'block',

    atom: true,

    addAttributes() {
        return {
            code: {
                default: '// Tapez votre code ici...\nconsole.log("Hello World!");',
            },
            language: {
                default: 'javascript',
            },
            output: {
                default: '',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="code-runner-block"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'code-runner-block' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(CodeRunnerBlockView);
    },

    addCommands() {
        return {
            setCoderunnerBlock:
                () =>
                    ({ commands }: any) => {
                        return commands.insertContent({ type: 'coderunnerblock' });
                    },
        } as any;
    },
});
