import Paragraph from "@tiptap/extension-paragraph";
import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";
import { BulletList, OrderedList, ListItem } from "@tiptap/extension-list";
import { UndoRedo, Dropcursor, Gapcursor, CharacterCount } from "@tiptap/extensions";
import Heading from "@tiptap/extension-heading";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Link from "@tiptap/extension-link";
import { Blockquote } from "@tiptap/extension-blockquote";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Youtube } from "@tiptap/extension-youtube";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import Image from "@tiptap/extension-image";
import Code from "@tiptap/extension-code";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import { common, createLowlight } from "lowlight";
import type { TiptapExtensionOptions } from "./tiptap-types";
import type { Component } from "vue";

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

export const tiptapExtensions = (
  options?: Partial<TiptapExtensionOptions>,
  codeBlockComponent?: Component
) => {
  const tiptapExtension: TiptapExtensionOptions = {
    heading: {
      level: [1, 2, 3, 4, 5, 6]
    },
    dropCursor: {
      color: "#2563eb"
    },

    ...options
  };

  // Configure CodeBlockLowlight with optional Vue NodeView
  const codeBlockExtension = codeBlockComponent
    ? CodeBlockLowlight.extend({
        addNodeView() {
          return VueNodeViewRenderer(codeBlockComponent);
        }
      }).configure({
        lowlight,
        defaultLanguage: "plaintext"
      })
    : CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "plaintext"
      });

  return [
    Paragraph,
    Document,
    Text,
    UndoRedo,
    Heading.configure({
      levels: tiptapExtension.heading.level
    }),
    Bold,
    Italic,
    Underline,
    Strike,
    ListItem,
    BulletList,
    OrderedList,
    Link.configure({
      openOnClick: false
    }),
    HardBreak,
    Blockquote,
    CharacterCount,
    Youtube,
    Dropcursor.configure({
      width: 2,
      color: tiptapExtension.dropCursor.color
    }),
    HorizontalRule,
    Table.configure({
      resizable: false,
      allowTableNodeSelection: true
    }),
    TableRow,
    TableHeader,
    TableCell,
    Gapcursor,
    Image,
    Code,
    codeBlockExtension,
    TextStyle,
    Color
  ];
};
