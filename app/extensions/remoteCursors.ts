import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, type Transaction, type EditorState } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface RemoteCursor {
  userId: string;
  username: string;
  color: string;
  from: number;
  to: number;
}

const CURSOR_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#a855f7", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316" // orange
];

export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length]!;
}

export const remoteCursorsPluginKey = new PluginKey("remoteCursors");

function buildDecorations(cursors: RemoteCursor[], docSize: number): Decoration[] {
  const decorations: Decoration[] = [];

  for (const cursor of cursors) {
    const from = Math.max(0, Math.min(cursor.from, docSize));
    const to = Math.max(0, Math.min(cursor.to, docSize));

    // Caret widget
    const caretWidget = document.createElement("span");
    caretWidget.className = "remote-cursor-caret";
    caretWidget.style.borderLeftColor = cursor.color;

    const label = document.createElement("span");
    label.className = "remote-cursor-label";
    label.style.backgroundColor = cursor.color;
    label.textContent = cursor.username;
    caretWidget.appendChild(label);

    if (from !== to) {
      // Selection highlight
      decorations.push(
        Decoration.inline(from, to, {
          class: "remote-cursor-selection",
          style: `background-color: ${cursor.color}20; border-bottom: 2px solid ${cursor.color}40;`
        })
      );
    }

    decorations.push(
      Decoration.widget(from === to ? from : to, caretWidget, {
        side: 1,
        key: `cursor-${cursor.userId}`
      })
    );
  }

  return decorations;
}

export const RemoteCursors = Extension.create({
  name: "remoteCursors",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: remoteCursorsPluginKey,
        state: {
          init() {
            return { cursors: [] as RemoteCursor[] };
          },
          apply(tr: Transaction, value: { cursors: RemoteCursor[] }) {
            const meta = tr.getMeta(remoteCursorsPluginKey);
            if (meta) return { cursors: meta as RemoteCursor[] };
            return value;
          }
        },
        props: {
          decorations(state: EditorState) {
            const pluginState = remoteCursorsPluginKey.getState(state);
            const cursors = pluginState?.cursors ?? [];
            if (!cursors.length) return DecorationSet.empty;
            const docSize = state.doc.content.size;
            return DecorationSet.create(state.doc, buildDecorations(cursors, docSize));
          }
        }
      })
    ];
  }
});
