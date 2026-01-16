import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { QuizBlockView } from './Views/QuizBlockView';

export const QuizBlock = Node.create({
    name: 'quizblock',

    group: 'block',

    atom: true,

    addAttributes() {
        return {
            question: {
                default: 'Quelle est la capitale de la France ?',
            },
            options: {
                default: ['Paris', 'Lyon', 'Marseille', 'Bordeaux'],
            },
            correctIndex: {
                default: 0,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="quiz-block"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'quiz-block' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(QuizBlockView);
    },

    addCommands() {
        return {
            setQuizBlock:
                () =>
                    ({ commands }: any) => {
                        return commands.insertContent({ type: 'quizblock' });
                    },
        } as any;
    },
});
