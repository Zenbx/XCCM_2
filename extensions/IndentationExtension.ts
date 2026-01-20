import { Extension } from '@tiptap/core';

export interface IndentationOptions {
    types: string[];
    indentLevels: number[];
    defaultLevel: number;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        indentation: {
            indent: () => ReturnType;
            outdent: () => ReturnType;
        };
    }
}

export const IndentationExtension = Extension.create<IndentationOptions>({
    name: 'indentation',

    addOptions() {
        return {
            types: ['paragraph', 'heading', 'bulletList', 'orderedList'],
            indentLevels: [0, 20, 40, 60, 80, 100, 120, 140], // px
            defaultLevel: 0,
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    indent: {
                        default: this.options.defaultLevel,
                        parseHTML: element => {
                            const marginLeft = element.style.marginLeft;
                            return marginLeft ? parseInt(marginLeft, 10) : this.options.defaultLevel;
                        },
                        renderHTML: attributes => {
                            if (!attributes.indent || attributes.indent === 0) {
                                return {};
                            }
                            return {
                                style: `margin-left: ${attributes.indent}px`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            indent: () => ({ tr, state, dispatch }) => {
                const { selection } = state;
                const { from, to } = selection;

                tr.doc.nodesBetween(from, to, (node, pos) => {
                    if (this.options.types.includes(node.type.name)) {
                        const currentIndent = node.attrs.indent || 0;
                        const nextLevel = this.options.indentLevels.find(l => l > currentIndent) || currentIndent;

                        if (nextLevel !== currentIndent) {
                            if (dispatch) {
                                tr.setNodeMarkup(pos, undefined, {
                                    ...node.attrs,
                                    indent: nextLevel,
                                });
                            }
                        }
                    }
                });

                return true;
            },
            outdent: () => ({ tr, state, dispatch }) => {
                const { selection } = state;
                const { from, to } = selection;

                tr.doc.nodesBetween(from, to, (node, pos) => {
                    if (this.options.types.includes(node.type.name)) {
                        const currentIndent = node.attrs.indent || 0;
                        const prevLevel = [...this.options.indentLevels].reverse().find(l => l < currentIndent) || 0;

                        if (prevLevel !== currentIndent) {
                            if (dispatch) {
                                tr.setNodeMarkup(pos, undefined, {
                                    ...node.attrs,
                                    indent: prevLevel,
                                });
                            }
                        }
                    }
                });

                return true;
            },
        };
    },

    addKeyboardShortcuts() {
        return {
            'Tab': () => this.editor.commands.indent(),
            'Shift-Tab': () => this.editor.commands.outdent(),
        };
    },
});
