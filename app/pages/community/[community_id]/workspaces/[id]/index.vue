<template>
  <main class="flex h-[calc(100vh-6rem)] w-full overflow-hidden rounded-xl border border-border/50">
    <div class="flex flex-1 flex-col overflow-hidden">
      <WorkspaceHeader
        v-model:name="workspaceName"
        v-model:show-thoughts="showThoughts"
        :community-id="communityId"
        :emoji="workspaceEmoji"
        :online-users="collab.onlineUsers.value"
        :connected="collab.connected.value"
        :thoughts-count="thoughts.length"
        @save-title="saveTitle"
      />

      <WorkspaceEditorToolbar :editor="editor" @open-media="openMediaDialog" />

      <div class="relative flex-1 overflow-y-auto bg-background/50" @click="focusEditor">
        <div v-if="loadingContent" class="mx-auto max-w-3xl space-y-4 px-12 py-10">
          <div class="h-8 w-64 animate-pulse rounded-lg bg-muted/40" />
          <div class="h-4 w-full animate-pulse rounded bg-muted/30" />
          <div class="h-4 w-5/6 animate-pulse rounded bg-muted/30" />
          <div class="h-4 w-4/6 animate-pulse rounded bg-muted/30" />
          <div class="mt-6 h-4 w-full animate-pulse rounded bg-muted/30" />
          <div class="h-4 w-3/4 animate-pulse rounded bg-muted/30" />
        </div>

        <EditorContent
          v-else-if="editor"
          :editor="editor"
          class="editor-area mx-auto prose h-full max-w-3xl px-12 py-8 prose-neutral dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-primary prose-img:rounded-lg prose-img:shadow-md"
        />
      </div>

      <WorkspaceStatusBar
        :word-count="wordCount"
        :char-count="charCount"
        :reading-time="readingTime"
        :saving="collab.saving.value"
        :save-error="!!collab.saveError.value"
        :last-saved-at="collab.lastSavedAt.value"
        @download-pdf="downloadPdf"
        @download-md="downloadMd"
        @share-embed="shareEmbed"
        @copy-link="copyLink"
      />
    </div>

    <WorkspaceAIBubble
      :visible="bubbleVisible"
      :position="bubblePosition"
      :loading="aiLoading"
      @action="handleBubbleAction"
    />

    <!-- Floating AI thinking overlay -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="aiLoading"
        class="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-violet-500/20 bg-popover/95 px-4 py-2 shadow-lg shadow-violet-500/5 backdrop-blur-xl"
      >
        <LazyAIThinkingLoader label="AI is writing" />
      </div>
    </Transition>

    <Sheet v-model:open="showThoughts">
      <SheetContent side="right" class="max-w-80 p-0 sm:max-w-140">
        <SheetHeader class="sr-only">
          <SheetTitle>Thoughts</SheetTitle>
          <SheetDescription>Capture ideas and notes</SheetDescription>
        </SheetHeader>
        <LazyWorkspaceThoughts
          :thoughts="thoughts"
          :ai-loading="aiLoading"
          @add-thought="addThought"
          @delete-thought="deleteThought"
          @add-to-document="ejectThought"
          @ai-action="handleSidebarAIAction"
          @thought-animated="onThoughtAnimated"
        />
      </SheetContent>
    </Sheet>

    <LazyWorkspaceMediaInsertDialog
      v-model:open="showMediaDialog"
      @insert-image="handleInsertImage"
    />
  </main>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Image from "@tiptap/extension-image";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { toast } from "vue-sonner";
import type { AIAction } from "~/composables/useLocalAI";
import type { Thought } from "~/components/workspace/Thoughts.vue";
import type { RemoteCursor } from "~/extensions/remoteCursors";

const route = useRoute();
const communityId = route.params.community_id as string;
const workspaceId = route.params.id as string;
const currentUserId = computed(() => useUserStore().user?.id ?? "");

const workspaceName = ref("Untitled Workspace");
const workspaceEmoji = ref<string | null>(null);
const showThoughts = ref(false);
const showMediaDialog = ref(false);
const thoughts = ref<Thought[]>([]);
const loadingContent = ref(true);
const activeCursors = ref<RemoteCursor[]>([]);
let skipNextUpdate = false;

// Client-only: load ProseMirror cursor extension (crashes during SSR)
let RemoteCursors: any = null;
let getUserColor = (_: string) => "#3b82f6";
let remoteCursorsPluginKey: any = null;

if (import.meta.client) {
  const mod = await import("~/extensions/remoteCursors");
  RemoteCursors = mod.RemoteCursors;
  getUserColor = mod.getUserColor;
  remoteCursorsPluginKey = mod.remoteCursorsPluginKey;
}

const { loading: aiLoading, runAIAction } = useLocalAI();
const { typewrite: typewriteEditor } = useTypewriter();
const collab = useWorkspaceCollab(communityId, workspaceId);

// --- Bubble menu ---
const bubbleVisible = ref(false);
const bubblePosition = ref({ top: 0, left: 0 });
let selectedText = "";

function showBubble(view: any) {
  const { from, to } = view.state.selection;
  const start = view.coordsAtPos(from);
  const end = view.coordsAtPos(to);
  bubblePosition.value = { top: start.top - 48, left: (start.left + end.left) / 2 };
  bubbleVisible.value = true;
}

function dismissBubble(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest("[data-bubble-menu]")) {
    bubbleVisible.value = false;
  }
}

// --- Editor ---
const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: "Start writing something amazing..." }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Highlight,
    Typography,
    Image.configure({ inline: false, allowBase64: true }),
    ...(RemoteCursors ? [RemoteCursors] : [])
  ],
  editorProps: { attributes: { class: "min-h-full outline-none" } },
  onUpdate({ editor: ed }) {
    if (skipNextUpdate) {
      skipNextUpdate = false;
      return;
    }
    const json = ed.getJSON();
    collab.broadcastUpdate(json);
    collab.debouncedSave(json);
  },
  onSelectionUpdate({ editor: ed }) {
    const { from, to } = ed.state.selection;
    const text = ed.state.doc.textBetween(from, to, " ");

    if (text.trim().length > 2) {
      selectedText = text;
      showBubble(ed.view);
    } else {
      bubbleVisible.value = false;
      selectedText = "";
    }

    collab.broadcastCursor(from, to);
  }
});

const wordCount = computed(() => {
  const text = editor.value?.state.doc.textContent ?? "";
  return text.trim() ? text.trim().split(/\s+/).length : 0;
});

const charCount = computed(() => editor.value?.state.doc.textContent.length ?? 0);
const readingTime = computed(() => Math.max(0, Math.ceil(wordCount.value / 200)));

function focusEditor() {
  editor.value?.chain().focus().run();
}

// --- Markdown helpers ---
async function markdownToHtml(md: string) {
  return DOMPurify.sanitize(await marked.parse(md));
}

// --- AI actions ---
async function handleBubbleAction(action: AIAction) {
  if (!selectedText || !editor.value) return;

  const result = await runAIAction(selectedText, action);
  const html = await markdownToHtml(result.content);
  const { from, to } = editor.value.state.selection;

  // Clear selected text, then typewrite the AI result
  editor.value.chain().focus().deleteRange({ from, to }).run();
  bubbleVisible.value = false;
  selectedText = "";

  await typewriteEditor(html, 12, (token) => {
    if (editor.value) {
      editor.value
        .chain()
        .focus()
        .insertContent(token, { parseOptions: { preserveWhitespace: false } })
        .run();
    }
  });
}

async function handleSidebarAIAction(action: string) {
  if (!editor.value) return;
  const docText = editor.value.state.doc.textContent;
  if (!docText.trim()) return;

  const result = await runAIAction(docText, action as AIAction);
  // Add thought with typewriter animation handled by the Thoughts component
  addThought(result.content, true);
}

// --- Thoughts ---
function addThought(content: string, animate = false) {
  thoughts.value.unshift({ id: crypto.randomUUID(), content, createdAt: new Date(), animate });
}

function deleteThought(id: string) {
  thoughts.value = thoughts.value.filter((t) => t.id !== id);
}

function onThoughtAnimated(id: string) {
  const t = thoughts.value.find((th) => th.id === id);
  if (t) t.animate = false;
}

async function addToDocument(content: string) {
  if (!editor.value) return;
  const html = await markdownToHtml(content);
  editor.value
    .chain()
    .focus()
    .insertContent(html, { parseOptions: { preserveWhitespace: false } })
    .run();
}

async function ejectThought(id: string, content: string) {
  await addToDocument(content);
  deleteThought(id);
}

// --- Document export / share ---
function downloadPdf() {
  if (!editor.value) return;
  const html = editor.value.getHTML();
  const printWin = window.open("", "_blank");
  if (!printWin) return;
  printWin.document.write(`
    <!DOCTYPE html>
    <html><head><title>${workspaceName.value}</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; color: #1a1a1a; line-height: 1.7; }
      h1,h2,h3 { margin-top: 1.5em; }
      ul,ol { padding-left: 1.5em; }
      code { background: #f3f4f6; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; }
      pre { background: #f3f4f6; padding: 1em; border-radius: 8px; overflow-x: auto; }
      blockquote { border-left: 3px solid #d1d5db; margin-left: 0; padding-left: 1em; color: #6b7280; }
    </style></head><body>${html}</body></html>
  `);
  printWin.document.close();
  printWin.print();
  toast.success("PDF export ready", { description: "Use the print dialog to save as PDF" });
}

function downloadMd() {
  if (!editor.value) return;
  const text = editor.value.state.doc.textContent;
  const blob = new Blob([text], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${workspaceName.value || "document"}.md`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Markdown downloaded");
}

function shareEmbed() {
  const embedUrl = `${window.location.origin}/embed/workspace/${workspaceId}`;
  const iframe = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" style="border-radius:12px;border:1px solid #e5e7eb"></iframe>`;
  navigator.clipboard.writeText(iframe);
  toast.success("Embed code copied!", { description: "Paste the iframe snippet in any website" });
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  toast.success("Link copied to clipboard");
}

// --- Media insert ---
function openMediaDialog() {
  showMediaDialog.value = true;
}

function handleInsertImage(src: string) {
  editor.value?.chain().focus().setImage({ src }).run();
}

// --- Title ---
async function saveTitle() {
  try {
    const api = useApi();
    await (api as any)(`/api/communities/${communityId}/workspaces/${workspaceId}`, {
      method: "PATCH",
      body: { name: workspaceName.value }
    });
  } catch {
    // silent
  }
}

// --- Data loading ---
async function loadWorkspace() {
  try {
    const api = useApi();
    const data = (await api(`/api/communities/${communityId}/workspaces/${workspaceId}`)) as any;
    if (data?.name) workspaceName.value = data.name;
    if (data?.emoji) workspaceEmoji.value = data.emoji;
  } catch {
    // keep defaults
  }
}

async function loadContent() {
  loadingContent.value = true;
  try {
    const content = await collab.loadContent();
    if (content && editor.value) {
      skipNextUpdate = true;
      editor.value.commands.setContent(content);
    }
  } finally {
    loadingContent.value = false;
  }
}

// --- Remote collaboration ---
collab.onRemoteUpdate((content: any) => {
  if (!editor.value) return;
  const { from, to } = editor.value.state.selection;
  skipNextUpdate = true;
  editor.value.commands.setContent(content);
  const docSize = editor.value.state.doc.content.size;
  editor.value.commands.setTextSelection({
    from: Math.min(from, docSize),
    to: Math.min(to, docSize)
  });
});

function dispatchCursors() {
  if (!editor.value || !remoteCursorsPluginKey) return;
  const tr = editor.value.state.tr.setMeta(remoteCursorsPluginKey, activeCursors.value);
  editor.value.view.dispatch(tr);
}

collab.onRemoteCursor((cursor) => {
  if (!editor.value || cursor.userId === currentUserId.value) return;

  const user = collab.onlineUsers.value.find((u) => u.userId === cursor.userId);
  const remoteCursor: RemoteCursor = {
    userId: cursor.userId,
    username: user?.username ?? "User",
    color: getUserColor(cursor.userId),
    from: cursor.from,
    to: cursor.to
  };

  const idx = activeCursors.value.findIndex((c) => c.userId === cursor.userId);
  if (idx >= 0) activeCursors.value[idx] = remoteCursor;
  else activeCursors.value.push(remoteCursor);
  activeCursors.value = [...activeCursors.value];
  dispatchCursors();
});

watch(
  () => collab.onlineUsers.value,
  (users) => {
    if (!editor.value) return;
    const onlineIds = new Set(users.map((u) => u.userId));
    const before = activeCursors.value.length;
    activeCursors.value = activeCursors.value.filter((c) => onlineIds.has(c.userId));
    if (activeCursors.value.length !== before) dispatchCursors();
  }
);

// --- Lifecycle ---
onMounted(async () => {
  document.addEventListener("mousedown", dismissBubble);
  await loadWorkspace();
  collab.connect();
  await loadContent();
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", dismissBubble);
  collab.disconnect();
  editor.value?.destroy();
});
</script>

<style scoped>
.editor-area :deep(.ProseMirror) {
  min-height: 100%;
  outline: none;
}

.editor-area :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: hsl(var(--muted-foreground) / 0.3);
}
</style>
