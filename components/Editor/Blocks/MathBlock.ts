import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MathBlockView } from './Views/MathBlockView';
import 'katex/dist/katex.min.css';

export const MathBlock = Node.create({
    name: 'mathblock',

    group: 'block',

    atom: true,

    addAttributes() {
        return {
            tex: {
                default: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
            },
            inline: {
                default: false,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="math-block"]',
                getAttrs: element => ({
                    tex: (element as HTMLElement).getAttribute('data-tex'),
                    inline: false,
                }),
            },
            {
                tag: 'span[data-type="math-inline"]',
                getAttrs: element => ({
                    tex: (element as HTMLElement).getAttribute('data-tex'),
                    inline: true,
                }),
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        const { tex, inline } = node.attrs;
        return [
            inline ? 'span' : 'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': inline ? 'math-inline' : 'math-block',
                'data-tex': tex,
                class: inline ? 'math-inline' : 'math-block',
            }),
            ['span', { class: 'math-render' }, tex],
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(MathBlockView);
    },

    addCommands() {
        return {
            setMathBlock:
                (tex: string = '') =>
                    ({ commands }: any) => {
                        return commands.insertContent({
                            type: 'mathblock',
                            attrs: { tex: tex || 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', inline: false },
                        });
                    },
            setMathInline:
                (tex: string = '') =>
                    ({ commands }: any) => {
                        return commands.insertContent({
                            type: 'mathblock',
                            attrs: { tex: tex || 'a^2 + b^2 = c^2', inline: true },
                        });
                    },
        } as any;
    },
});

export default MathBlock;
