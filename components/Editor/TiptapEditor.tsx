"use client";

import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextAlign } from '@tiptap/extension-text-align';
import React, { useEffect } from 'react';
import { NoteBlock } from './Blocks/NoteBlock';
import { CaptureZoneBlock } from './Blocks/CaptureZoneBlock';
import { MathBlock } from './Blocks/MathBlock';
import { QuizBlock } from './Blocks/QuizBlockExtension';
import { DiscoveryHint } from './Blocks/DiscoveryHint';
import { CodeRunnerBlock } from './Blocks/CodeRunnerBlockExtension';
import 'katex/dist/katex.min.css';

// Extension d'image personnalisée
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        }
      },
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        }
      }
    };
  },
});

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
    setNoteBlock: () => ReturnType;
    toggleNoteBlock: () => ReturnType;
    setCaptureZoneBlock: () => ReturnType;
    setMathBlock: (tex?: string) => ReturnType;
    setMathInline: (tex?: string) => ReturnType;
    setQuizBlock: () => ReturnType;
    setDiscoveryHint: () => ReturnType;
    toggleDiscoveryHint: () => ReturnType;
    setCoderunnerBlock: () => ReturnType;
  }
}

// Extension personnalisée pour la taille de police (ajoute un attribut au mark textStyle)
const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace('pt', '') || null,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}pt`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  textFormat?: {
    font: string;
    fontSize: string;
  };
  onSelectionChange?: (editor: any) => void;
  onReady?: (editor: any) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onChange,
  placeholder = 'Commencez à écrire...',
  readOnly = false,
  className = '',
  textFormat,
  onSelectionChange,
  onReady
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      CustomImage.configure({
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'noteblock', 'discoveryhint'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      NoteBlock,
      CaptureZoneBlock,
      MathBlock,
      QuizBlock,
      DiscoveryHint,
      CodeRunnerBlock,
    ],
    content: content,
    editable: !readOnly,
    onCreate: ({ editor }) => {
      onReady?.(editor);
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      onSelectionChange?.(editor);
    },
    editorProps: {
      attributes: {
        class: `focus:outline-none min-h-[800px] ${className}`,
      },
    },
  });

  // Mettre à jour le contenu si prop change de l'extérieur
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Avoid "flushSync was called from inside a lifecycle method" error
      // by deferring the update to the next microtask/frame
      queueMicrotask(() => {
        if (editor && !editor.isDestroyed) {
          editor.commands.setContent(content, { emitUpdate: false });
        }
      });
    }
  }, [content, editor]);

  // Gérer le mode lecture seule
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  // Appliquer le formatage à la sélection quand textFormat change
  useEffect(() => {
    if (editor && textFormat && editor.isFocused) {
      const { font, fontSize } = textFormat;

      if (!editor.state.selection.empty) {
        editor.chain()
          .setFontFamily(font)
          .setFontSize(fontSize)
          .run();
      }
    }
  }, [textFormat, editor]);

  return (
    <div className="tiptap-wrapper w-full h-full">
      <EditorContent editor={editor} />

      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .tiptap {
          outline: none !important;
          font-family: Calibri, 'Segoe UI', sans-serif;
          font-size: 11pt;
        }
        .tiptap p {
            margin-bottom: 1rem;
        }
        .tiptap ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin: 1rem 0 !important;
        }
        .tiptap ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin: 1rem 0 !important;
        }
        .tiptap li {
          margin-bottom: 0.5rem !important;
        }
        .tiptap img {
          transition: all 0.2s ease;
          display: block;
          margin-left: auto;
          margin-right: auto;
          max-width: 100%;
          height: auto;
        }
        .tiptap img:hover {
          cursor: pointer;
        }
        .tiptap img.ProseMirror-selectednode {
          outline: 3px solid #99334C;
        }

        /* Styles pour les Blocs Pédagogiques */
        .note-block {
          background: #fdf2f4;
          border-left: 4px solid #99334C;
          padding: 1.5rem;
          margin: 2rem 0;
          border-radius: 4px;
          min-height: 100px;
          transition: all 0.2s ease;
        }
        .note-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-weight: bold;
          color: #99334C;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
        }
        .note-content {
          color: #4b5563;
        }

        .capture-zone-block {
          background: #f9fafb;
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 2rem;
          margin: 2rem 0;
          text-align: center;
          transition: all 0.2s ease;
        }
        .capture-zone-block:hover {
          border-color: #99334C;
          background: #fdf2f4;
        }
        .capture-zone-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: #6b7280;
          font-weight: 600;
        }
        .capture-zone-block.ProseMirror-selectednode {
            outline: 2px solid #99334C;
            border-style: solid;
        }
        .capture-instruction {
          font-size: 0.875rem;
          color: #9ca3af;
          margin: 0;
        }

        .math-block {
          margin: 1.5rem 0;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          display: flex;
          justify-content: center;
          transition: all 0.2s ease;
          min-height: 50px;
        }
        .math-block.ProseMirror-selectednode {
          background: #fdf2f4;
          border-color: #99334C33;
        }
        .math-node-wrapper.ProseMirror-selectednode > div {
          outline: 2px solid #99334C33;
          border-radius: 8px;
        }
        .math-inline {
          padding: 0 0.25rem;
          background: #f8fafc;
          border-radius: 4px;
        }
        .math-inline.ProseMirror-selectednode {
          background: #f1f5f9;
          outline: 1px solid #99334C;
        }
        .math-render {
            user-select: none;
        }

        /* Discovery Hint */
        .discovery-hint {
          margin: 2rem 0;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .discovery-hint-header {
          padding: 1rem 1.5rem;
          background: #f8fafc;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          user-select: none;
          border-bottom: 1px solid #e2e8f0;
        }
        .discovery-hint.is-closed .discovery-hint-header {
            background: #eff6ff;
            border-bottom: none;
        }
        .discovery-hint-title {
          flex: 1;
          font-weight: 600;
          color: #1e293b;
          font-size: 0.95rem;
        }
        .discovery-hint-toggle {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #2563eb;
          background: #dbeafe;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
        }
        .discovery-hint-content {
          padding: 1.5rem;
          background: white;
          transition: all 0.3s ease;
        }
        .discovery-hint.is-closed .discovery-hint-content {
          display: none;
        }
        .discovery-hint.ProseMirror-selectednode {
            outline: 2px solid #2563eb;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
        }
      `}</style>
    </div>
  );
};

export default TiptapEditor;
