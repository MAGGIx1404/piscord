<template>
  <div class="flex h-full flex-col overflow-hidden">
    <!-- Header -->
    <div class="flex items-center gap-2 border-b border-border/50 px-4 py-3 pt-6">
      <Lightbulb class="size-3.5 text-amber-500" />
      <h3 class="text-xs font-semibold">Thoughts</h3>
      <Badge v-if="thoughts.length" variant="secondary" class="h-4 min-w-4 px-1 text-[9px]">
        {{ thoughts.length }}
      </Badge>
    </div>

    <!-- AI Quick Actions -->
    <div class="border-b border-border/50 px-3 py-2.5">
      <p class="mb-1.5 text-[9px] font-semibold tracking-wider text-muted-foreground/50 uppercase">
        AI Assist
      </p>
      <div class="flex flex-wrap gap-1">
        <TooltipProvider :delay-duration="200">
          <Tooltip v-for="action in aiActions" :key="action.id">
            <TooltipTrigger as-child>
              <button
                class="flex items-center gap-1 rounded-md border border-border/30 px-2 py-1 text-[11px] text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground disabled:opacity-40"
                :disabled="aiLoading"
                @click="$emit('aiAction', action.id)"
              >
                <component :is="action.icon" class="size-3" />
                {{ action.label }}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" :side-offset="4" class="text-xs">
              {{ action.description }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>

    <!-- Add thought input -->
    <div class="border-b border-border/50 px-3 py-2.5">
      <textarea
        ref="inputRef"
        v-model="newThought"
        placeholder="Jot down a thought..."
        rows="2"
        class="w-full resize-none rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-xs leading-relaxed transition-colors outline-none placeholder:text-muted-foreground/30 focus:border-primary/40 focus:bg-background"
        @keydown.meta.enter="addThought"
        @keydown.ctrl.enter="addThought"
      />
      <div class="mt-1.5 flex items-center justify-between">
        <span class="text-[9px] text-muted-foreground/30">⌘ Enter to add</span>
        <Button
          size="sm"
          :disabled="!newThought.trim()"
          class="h-6 gap-1 px-2 text-[10px]"
          @click="addThought"
        >
          <Plus class="size-3" />
          Add
        </Button>
      </div>
    </div>

    <!-- Thoughts list -->
    <div class="flex-1 overflow-y-auto">
      <!-- AI thinking indicator -->
      <div v-if="aiLoading" class="border-b border-violet-500/10 px-3 py-1">
        <AIThinkingLoader label="Generating thought" />
      </div>

      <TransitionGroup name="thought" tag="div" class="space-y-0 p-2">
        <div
          v-for="thought in thoughts"
          :key="thought.id"
          class="group rounded-lg border border-transparent p-2.5 transition-all hover:border-border/30 hover:bg-card/40"
          :class="{
            'border-violet-500/20 bg-violet-500/5': thought.animate && typingId === thought.id
          }"
        >
          <!-- Typewriter display for AI-generated thoughts -->
          <div
            v-if="thought.animate && typingId === thought.id"
            class="prose-xs prose max-w-none text-xs leading-relaxed text-foreground/80 dark:prose-invert"
          >
            <span v-html="renderMarkdown(typedContent)" />
            <span class="inline-block h-3 w-0.5 animate-pulse bg-violet-400" />
          </div>
          <!-- Static display for regular thoughts -->
          <div
            v-else
            class="prose-xs prose max-w-none text-xs leading-relaxed text-foreground/80 dark:prose-invert"
            v-html="renderMarkdown(thought.content)"
          />
          <div class="mt-1.5 flex items-center justify-between">
            <span class="text-[9px] text-muted-foreground/30">{{
              formatTime(thought.createdAt)
            }}</span>
            <div class="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <TooltipProvider :delay-duration="200">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <button
                      class="rounded p-1 text-muted-foreground/60 transition-colors hover:bg-primary/10 hover:text-primary"
                      @click="$emit('addToDocument', thought.content)"
                    >
                      <FileInput class="size-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" class="text-xs">Add to document</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <button
                      class="rounded p-1 text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      @click="$emit('deleteThought', thought.id)"
                    >
                      <X class="size-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" class="text-xs">Delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <div
        v-if="!thoughts.length"
        class="flex h-40 flex-col items-center justify-center gap-2 px-4"
      >
        <div class="rounded-full bg-amber-500/5 p-3">
          <Lightbulb class="size-5 text-amber-500/30" />
        </div>
        <p class="text-[11px] font-medium text-muted-foreground/40">No thoughts yet</p>
        <p class="text-center text-[10px] leading-relaxed text-muted-foreground/25">
          Capture ideas, brainstorm concepts, then add them to your document
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Lightbulb,
  Plus,
  X,
  FileInput,
  RefreshCw,
  Sparkles,
  BookOpen,
  Expand
} from "lucide-vue-next";
import { marked } from "marked";
import DOMPurify from "dompurify";

export interface Thought {
  id: string;
  content: string;
  createdAt: Date;
  animate?: boolean;
}

const props = defineProps<{
  thoughts: Thought[];
  aiLoading: boolean;
}>();

const emit = defineEmits<{
  addThought: [content: string];
  deleteThought: [id: string];
  addToDocument: [content: string];
  aiAction: [action: string];
}>();

const newThought = ref("");
const inputRef = ref<HTMLTextAreaElement | null>(null);

// Typewriter state for AI-generated thoughts
const typingId = ref<string | null>(null);
const typedContent = ref("");

watch(
  () => props.thoughts,
  (newThoughts) => {
    const animatable = newThoughts.find((t) => t.animate && t.id !== typingId.value);
    if (animatable) {
      startTypewriter(animatable);
    }
  },
  { deep: true }
);

async function startTypewriter(thought: Thought) {
  typingId.value = thought.id;
  typedContent.value = "";
  const chars = thought.content;
  for (let i = 0; i < chars.length; i++) {
    typedContent.value += chars[i];
    await new Promise((r) => setTimeout(r, 14));
  }
  // Mark done — remove animate flag
  thought.animate = false;
  typingId.value = null;
}

const aiActions = [
  {
    id: "brainstorm",
    label: "Brainstorm",
    icon: Sparkles,
    description: "Generate ideas from your document"
  },
  { id: "continue", label: "Continue", icon: Expand, description: "Suggest what to write next" },
  { id: "rewrite", label: "Rewrite", icon: RefreshCw, description: "Rephrase your document" },
  { id: "summarize", label: "Summarize", icon: BookOpen, description: "Summarize your document" }
];

function addThought() {
  if (!newThought.value.trim()) return;
  emit("addThought", newThought.value.trim());
  newThought.value = "";
  inputRef.value?.focus();
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function renderMarkdown(content: string): string {
  return DOMPurify.sanitize(marked.parse(content) as string);
}
</script>

<style scoped>
.thought-enter-active {
  transition: all 0.2s ease-out;
}
.thought-leave-active {
  transition: all 0.15s ease-in;
}
.thought-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.thought-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
.thought-move {
  transition: transform 0.2s ease;
}
</style>
