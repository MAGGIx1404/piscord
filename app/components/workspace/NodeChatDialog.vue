<template>
  <Sheet v-model:open="open">
    <SheetContent side="left" class="flex w-[480px] flex-col gap-0 p-0 sm:max-w-[480px]">
      <!-- Header -->
      <div class="shrink-0 border-b border-border/50 px-5 py-4">
        <div class="flex items-center gap-3">
          <div
            class="size-2.5 shrink-0 rounded-full"
            :class="{
              'bg-muted-foreground/40': node?.status === 'idle',
              'animate-pulse bg-blue-500': node?.status === 'running',
              'bg-emerald-500': node?.status === 'completed',
              'bg-red-500': node?.status === 'error'
            }"
          />
          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-semibold">{{ node?.title }}</h3>
            <p class="text-xs text-muted-foreground">{{ node?.model }}</p>
          </div>
          <Badge v-if="node?.latency" variant="outline" class="shrink-0 text-[10px] tabular-nums">
            {{ node.latency }}ms
          </Badge>
        </div>
      </div>

      <!-- Messages -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto">
        <div v-if="loading" class="space-y-4 p-5">
          <Skeleton v-for="n in 4" :key="n" class="h-16 w-full rounded-lg" />
        </div>

        <div v-else-if="messages.length" class="space-y-1 p-4">
          <template v-for="(msg, i) in messages" :key="msg.id">
            <!-- Date separator -->
            <div
              v-if="i === 0 || !isSameDay(msg.created_at, messages[i - 1].created_at)"
              class="flex items-center gap-3 py-3"
            >
              <div class="h-px flex-1 bg-border/40" />
              <span class="text-[10px] text-muted-foreground/50">{{ formatDate(msg.created_at) }}</span>
              <div class="h-px flex-1 bg-border/40" />
            </div>

            <!-- User message -->
            <div v-if="msg.role === 'user'" class="flex justify-end">
              <div class="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5">
                <p class="text-sm leading-relaxed text-primary-foreground">{{ msg.content }}</p>
                <p class="mt-1 text-right text-[10px] text-primary-foreground/50">
                  {{ formatTime(msg.created_at) }}
                </p>
              </div>
            </div>

            <!-- AI message -->
            <div v-else class="flex gap-2.5">
              <div class="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
                <Bot class="size-3.5 text-muted-foreground" />
              </div>
              <div class="min-w-0 max-w-[85%]">
                <div class="rounded-2xl rounded-tl-md border border-border/30 bg-muted/20 px-4 py-2.5">
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div class="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed" v-html="renderMarkdown(msg.content)" />
                </div>
                <div class="mt-0.5 flex items-center gap-2 px-1">
                  <p class="text-[10px] text-muted-foreground/40">
                    {{ formatTime(msg.created_at) }}
                  </p>
                  <button
                    class="text-[10px] text-muted-foreground/30 transition-colors hover:text-primary"
                    @click="emit('saveToMemory', msg.content)"
                  >
                    Save to memory
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- Typing indicator -->
          <div v-if="node?.status === 'running'" class="flex gap-2.5">
            <div class="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
              <Bot class="size-3.5 text-muted-foreground" />
            </div>
            <div class="rounded-2xl rounded-tl-md border border-border/30 bg-muted/20 px-4 py-3">
              <div class="flex items-center gap-1.5">
                <span class="size-1.5 animate-bounce rounded-full bg-muted-foreground/40" style="animation-delay: 0ms" />
                <span class="size-1.5 animate-bounce rounded-full bg-muted-foreground/40" style="animation-delay: 150ms" />
                <span class="size-1.5 animate-bounce rounded-full bg-muted-foreground/40" style="animation-delay: 300ms" />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="flex h-full flex-col items-center justify-center gap-3 p-5">
          <div class="flex size-12 items-center justify-center rounded-full bg-muted/50">
            <MessageSquare class="size-6 text-muted-foreground/30" />
          </div>
          <div class="text-center">
            <p class="text-sm font-medium text-muted-foreground/60">Start a conversation</p>
            <p class="mt-0.5 text-xs text-muted-foreground/40">Send a message to chat with {{ node?.model }}</p>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="shrink-0 border-t border-border/50 p-4">
        <div class="flex gap-2">
          <div class="min-w-0 flex-1">
            <textarea
              ref="inputRef"
              v-model="prompt"
              placeholder="Type a message..."
              rows="1"
              class="w-full resize-none rounded-xl border border-border/50 bg-muted/20 px-4 py-2.5 text-sm transition-colors outline-none placeholder:text-muted-foreground/40 focus:border-primary/50"
              :disabled="node?.status === 'running'"
              @keydown.enter.exact="handleSend"
              @input="autoResize"
            />
          </div>
          <Button
            size="icon"
            class="size-10 shrink-0 self-end rounded-xl"
            :disabled="!prompt.trim() || node?.status === 'running'"
            @click="handleSend"
          >
            <Loader2 v-if="node?.status === 'running'" class="size-4 animate-spin" />
            <Send v-else class="size-4" />
          </Button>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { Send, Loader2, MessageSquare, Bot } from "lucide-vue-next";
import { marked } from "marked";
import type { CanvasNode } from "~/stores/workspace";

interface Message {
  id: string;
  node_id: string;
  role: string;
  content: string;
  created_at: Date;
}

const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
  node: CanvasNode | null;
  messages: Message[];
  loading: boolean;
}>();

const emit = defineEmits<{
  send: [nodeId: string, prompt: string];
  saveToMemory: [content: string];
}>();

const prompt = ref("");
const messagesContainer = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLTextAreaElement | null>(null);

// Configure marked
marked.setOptions({ breaks: true, gfm: true });

function renderMarkdown(content: string): string {
  return marked.parse(content, { async: false }) as string;
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date) {
  const d = new Date(date);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function isSameDay(a: Date, b: Date) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

function autoResize() {
  const el = inputRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

watch(() => props.messages.length, () => scrollToBottom());

watch(open, (val) => {
  if (val) {
    scrollToBottom();
    nextTick(() => inputRef.value?.focus());
  }
});

function handleSend() {
  if (!prompt.value.trim() || !props.node || props.node.status === "running") return;
  emit("send", props.node.id, prompt.value.trim());
  prompt.value = "";
  if (inputRef.value) {
    inputRef.value.style.height = "auto";
  }
}
</script>

<style>
.prose pre {
  border-radius: 0.5rem;
  background: hsl(var(--muted) / 0.5);
  padding: 0.75rem;
  font-size: 0.75rem;
}
.prose code {
  border-radius: 0.25rem;
  background: hsl(var(--muted) / 0.5);
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
}
.prose pre code {
  background: transparent;
  padding: 0;
}
.prose p {
  margin: 0.375rem 0;
}
.prose ul,
.prose ol {
  margin: 0.375rem 0;
  padding-left: 1rem;
}
.prose h1,
.prose h2,
.prose h3 {
  margin-top: 0.75rem;
  margin-bottom: 0.375rem;
  font-weight: 600;
}
.prose blockquote {
  border-left: 2px solid hsl(var(--primary) / 0.3);
  padding-left: 0.75rem;
  font-style: italic;
  color: hsl(var(--muted-foreground));
}
</style>
