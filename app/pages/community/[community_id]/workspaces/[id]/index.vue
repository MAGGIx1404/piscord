<template>
  <main class="flex h-[calc(100vh-6rem)] w-full overflow-hidden rounded-xl border border-border/50">
    <!-- Editor area -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
        <div class="flex items-center gap-2.5">
          <NuxtLink
            :to="`/community/${communityId}/workspaces`"
            class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <ArrowLeft class="size-4" />
          </NuxtLink>

          <!-- Editable title -->
          <div class="flex items-center gap-2">
            <span v-if="workspaceEmoji" class="text-base">{{ workspaceEmoji }}</span>
            <input
              v-model="workspaceName"
              class="bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground/40 focus:underline focus:decoration-primary/40 focus:underline-offset-4"
              placeholder="Untitled"
              @blur="saveTitle"
              @keydown.enter="($event.target as HTMLInputElement).blur()"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Online collaborators -->
          <div v-if="collab.onlineUsers.value.length > 0" class="flex items-center">
            <div class="flex -space-x-1.5">
              <TooltipProvider :delay-duration="200">
                <Tooltip v-for="user in collab.onlineUsers.value.slice(0, 5)" :key="user.userId">
                  <TooltipTrigger as-child>
                    <Avatar class="size-6 ring-2 ring-background">
                      <AvatarImage :src="user.avatar_url ?? ''" :alt="user.username" />
                      <AvatarFallback class="text-[9px]">
                        {{ user.username?.slice(0, 2).toUpperCase() }}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" :side-offset="4" class="text-xs">
                    {{ user.username }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span
              v-if="collab.onlineUsers.value.length > 5"
              class="ml-1 text-[10px] text-muted-foreground"
            >
              +{{ collab.onlineUsers.value.length - 5 }}
            </span>
          </div>

          <!-- Connection indicator -->
          <TooltipProvider :delay-duration="200">
            <Tooltip>
              <TooltipTrigger as-child>
                <div class="flex items-center gap-1 rounded-lg px-2 py-1">
                  <span
                    class="size-1.5 rounded-full"
                    :class="
                      collab.connected.value ? 'bg-emerald-500' : 'animate-pulse bg-amber-500'
                    "
                  />
                  <span class="text-[10px] text-muted-foreground">
                    {{ collab.connected.value ? "Live" : "Connecting..." }}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" :side-offset="4" class="text-xs">
                {{ collab.connected.value ? "Real-time sync active" : "Reconnecting..." }}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div class="mx-1 h-4 w-px bg-border/30" />

          <!-- Thoughts toggle -->
          <TooltipProvider :delay-duration="200">
            <Tooltip>
              <TooltipTrigger as-child>
                <button
                  class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all"
                  :class="
                    showThoughts
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  "
                  @click="showThoughts = !showThoughts"
                >
                  <Lightbulb class="size-3.5" />
                  <span class="hidden sm:inline">Thoughts</span>
                  <Badge
                    v-if="thoughts.length"
                    variant="secondary"
                    class="ml-0.5 h-4 min-w-4 px-1 text-[9px]"
                  >
                    {{ thoughts.length }}
                  </Badge>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" :side-offset="4" class="text-xs">
                Toggle thoughts panel
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <!-- Toolbar -->
      <WorkspaceEditorToolbar :editor="editor" />

      <!-- Editor -->
      <div class="relative flex-1 overflow-y-auto bg-background/50" @click="focusEditor">
        <!-- Loading skeleton -->
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
          class="mx-auto prose h-full max-w-3xl px-12 py-8 prose-neutral dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-primary [&_.ProseMirror]:min-h-full [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground/30 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
        />
      </div>

      <!-- Status bar -->
      <div
        class="flex items-center justify-between border-t border-border/50 bg-card/30 px-4 py-1.5"
      >
        <div class="flex items-center gap-3 text-[10px] text-muted-foreground/60">
          <span>{{ wordCount }} words</span>
          <span class="text-muted-foreground/20">|</span>
          <span>{{ charCount }} characters</span>
          <span v-if="readingTime > 0" class="text-muted-foreground/20">|</span>
          <span v-if="readingTime > 0">~{{ readingTime }} min read</span>
        </div>

        <div class="flex items-center gap-2 text-[10px]">
          <!-- Save status -->
          <Transition
            enter-active-class="transition-opacity duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
          >
            <div
              v-if="collab.saving.value"
              class="flex items-center gap-1 text-muted-foreground/60"
            >
              <Loader2 class="size-3 animate-spin" />
              <span>Saving...</span>
            </div>
            <div
              v-else-if="collab.saveError.value"
              class="flex items-center gap-1 text-destructive/70"
            >
              <AlertCircle class="size-3" />
              <span>Save failed</span>
            </div>
            <div
              v-else-if="collab.lastSavedAt.value"
              class="flex items-center gap-1 text-muted-foreground/50"
            >
              <Check class="size-3" />
              <span>Saved {{ timeAgo(collab.lastSavedAt.value) }}</span>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- AI Bubble (floating on selection) -->
    <WorkspaceAIBubble
      :visible="bubbleVisible"
      :position="bubblePosition"
      :loading="aiLoading"
      @action="handleBubbleAction"
    />

    <!-- Thoughts sidebar -->
    <Transition
      enter-active-class="transition-[width,opacity] duration-200 ease-out"
      enter-from-class="w-0 opacity-0"
      enter-to-class="w-80 opacity-100"
      leave-active-class="transition-[width,opacity] duration-150 ease-in"
      leave-from-class="w-80 opacity-100"
      leave-to-class="w-0 opacity-0"
    >
      <WorkspaceThoughts
        v-if="showThoughts"
        :thoughts="thoughts"
        :ai-loading="aiLoading"
        @close="showThoughts = false"
        @add-thought="addThought"
        @delete-thought="deleteThought"
        @add-to-document="addToDocument"
        @ai-action="handleSidebarAIAction"
      />
    </Transition>
  </main>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { ArrowLeft, Lightbulb, Loader2, AlertCircle, Check } from "lucide-vue-next";
import type { AIAction } from "~/composables/useLocalAI";
import type { Thought } from "~/components/workspace/Thoughts.vue";

const route = useRoute();
const communityId = route.params.community_id as string;
const workspaceId = route.params.id as string;

const workspaceName = ref("Untitled Workspace");
const workspaceEmoji = ref<string | null>(null);
const showThoughts = ref(false);
const thoughts = ref<Thought[]>([]);
const loadingContent = ref(true);
let skipNextUpdate = false;

const { loading: aiLoading, runAIAction } = useLocalAI();

// Collaboration
const collab = useWorkspaceCollab(communityId, workspaceId);

// Bubble menu state
const bubbleVisible = ref(false);
const bubblePosition = ref({ top: 0, left: 0 });
let selectedText = "";

// Tiptap editor
const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: "Start writing something amazing..." }),
    Underline,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Highlight,
    Typography
  ],
  editorProps: {
    attributes: {
      class: "min-h-full outline-none"
    }
  },
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

    // Broadcast cursor position
    collab.broadcastCursor(from, to);
  }
});

// Word/char count
const wordCount = computed(() => {
  if (!editor.value) return 0;
  const text = editor.value.state.doc.textContent;
  return text.trim() ? text.trim().split(/\s+/).length : 0;
});

const charCount = computed(() => {
  if (!editor.value) return 0;
  return editor.value.state.doc.textContent.length;
});

const readingTime = computed(() => {
  return Math.max(0, Math.ceil(wordCount.value / 200));
});

// Bubble positioning
function showBubble(view: any) {
  const { from, to } = view.state.selection;
  const start = view.coordsAtPos(from);
  const end = view.coordsAtPos(to);

  bubblePosition.value = {
    top: start.top - 48,
    left: (start.left + end.left) / 2
  };
  bubbleVisible.value = true;
}

function focusEditor() {
  editor.value?.chain().focus().run();
}

// AI action from bubble
async function handleBubbleAction(action: AIAction) {
  if (!selectedText || !editor.value) return;

  const result = await runAIAction(selectedText, action);

  const { from, to } = editor.value.state.selection;
  editor.value
    .chain()
    .focus()
    .deleteRange({ from, to })
    .insertContentAt(from, result.content)
    .run();

  bubbleVisible.value = false;
  selectedText = "";
}

// AI action from sidebar
async function handleSidebarAIAction(action: string) {
  if (!editor.value) return;

  const docText = editor.value.state.doc.textContent;
  if (!docText.trim()) return;

  const result = await runAIAction(docText, action as AIAction);
  addThought(result.content);
}

// Thoughts management
function addThought(content: string) {
  thoughts.value.unshift({
    id: crypto.randomUUID(),
    content,
    createdAt: new Date()
  });
}

function deleteThought(id: string) {
  thoughts.value = thoughts.value.filter((t: Thought) => t.id !== id);
}

function addToDocument(content: string) {
  if (!editor.value) return;
  editor.value.chain().focus().insertContent(`<p>${content}</p>`).run();
}

// Title save
async function saveTitle() {
  try {
    const api = useApi();
    await (api as any)(`/api/communities/${communityId}/workspaces/${workspaceId}`, {
      method: "PATCH",
      body: { name: workspaceName.value }
    });
  } catch {
    // silent fail for title save
  }
}

// Close bubble on outside click
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest("[data-bubble-menu]")) {
    bubbleVisible.value = false;
  }
}

// Time ago helper
function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

// Keep "time ago" reactive
const now = ref(Date.now());
let tickTimer: ReturnType<typeof setInterval> | null = null;

// Load workspace metadata + content
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
  } catch {
    // start with empty doc
  } finally {
    loadingContent.value = false;
  }
}

// Listen for remote updates
collab.onRemoteUpdate((content: any, _userId: string) => {
  if (!editor.value) return;
  // Preserve local cursor position
  const { from, to } = editor.value.state.selection;
  skipNextUpdate = true;
  editor.value.commands.setContent(content);
  // Restore cursor (clamped to doc size)
  const docSize = editor.value.state.doc.content.size;
  const safeFrom = Math.min(from, docSize);
  const safeTo = Math.min(to, docSize);
  editor.value.commands.setTextSelection({ from: safeFrom, to: safeTo });
});

onMounted(async () => {
  document.addEventListener("mousedown", handleClickOutside);
  tickTimer = setInterval(() => {
    now.value = Date.now();
  }, 10000);

  await loadWorkspace();
  collab.connect();
  await loadContent();
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  if (tickTimer) clearInterval(tickTimer);
  collab.disconnect();
  editor.value?.destroy();
});
</script>
