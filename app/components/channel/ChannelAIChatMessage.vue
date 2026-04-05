<template>
  <div class="group relative my-1">
    <!-- Reply Reference (if replying) -->
    <div
      v-if="message.isReply && replyMessage"
      class="mb-1 ml-14 flex items-center gap-2 text-xs text-muted-foreground"
    >
      <div class="flex items-center gap-1">
        <CornerUpRight class="size-3" />
        <Avatar class="size-4">
          <AvatarImage :src="replyMessage.author.avatar" :alt="replyMessage.author.name" />
        </Avatar>
        <span class="font-medium text-foreground/70">
          {{ replyMessage.author.name }}
        </span>
      </div>
      <span class="max-w-xs truncate opacity-70">
        {{ replyMessage.content || "Message deleted" }}
      </span>
    </div>

    <!-- AI Message Card -->
    <div class="relative mx-2 rounded-lg px-4 py-3" :class="{ 'mt-0': stacked }">
      <div class="flex items-start gap-3">
        <!-- Avatar -->
        <div class="shrink-0">
          <template v-if="!stacked">
            <div class="relative">
              <Avatar class="size-9 ring-1 ring-violet-500/30">
                <AvatarImage :src="message.author.avatar" :alt="message.author.name" />
                <AvatarFallback class="bg-violet-600 text-xs text-white">
                  <Bot class="size-4" />
                </AvatarFallback>
              </Avatar>
              <!-- AI indicator dot -->
              <div
                class="absolute -right-0.5 -bottom-0.5 flex size-3 items-center justify-center rounded-full bg-violet-500 ring-2 ring-background"
              >
                <Sparkles class="size-1.5 text-white" />
              </div>
            </div>
          </template>
          <template v-else>
            <span
              class="block w-9 pt-0.5 text-center text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            >
              {{ formattedTime }}
            </span>
          </template>
        </div>

        <!-- Content -->
        <div class="min-w-0 flex-1 space-y-1">
          <!-- Header -->
          <div v-if="!stacked" class="flex items-center gap-2">
            <span class="text-sm font-semibold text-violet-400">
              {{ message.author.name }}
            </span>
            <Badge variant="outline" class="border-violet-500/40 bg-violet-500/10 text-violet-400">
              <Bot class="mr-0.5 size-2.5" />
              AI
            </Badge>
            <span class="text-xs text-muted-foreground">
              {{ formattedTime }}
            </span>
          </div>

          <!-- Message (rendered as markdown with typewriter) -->
          <div v-if="isAnimating" class="ai-prose text-sm leading-relaxed text-foreground">
            <span v-html="animatedHtml" />
            <span class="inline-block h-3.5 w-0.5 translate-y-0.5 animate-pulse bg-violet-400" />
          </div>
          <div
            v-else
            class="ai-prose text-sm leading-relaxed text-foreground"
            v-html="renderedContent"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CornerUpRight, Sparkles, Bot } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

const isAnimating = ref(false);
const animatedHtml = ref("");

interface Author {
  id: string;
  name: string;
  avatar: string;
}

interface Reaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface Message {
  id: string;
  author: Author;
  content: string;
  createdAt: string;
  isReply: boolean;
  messageId?: string;
  reactions: Reaction[];
  isBot: boolean;
}

interface Props {
  message: Message;
  replyMessage?: Message | null;
  stacked?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  replyMessage: null,
  stacked: false
});

const formattedTime = computed(() => {
  return new Date(props.message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
});

const renderedContent = computed(() => {
  if (!props.message.content) return "";
  const html = marked.parse(props.message.content, { breaks: true, gfm: true }) as string;
  return DOMPurify.sanitize(html);
});

// Typewriter animation for freshly received AI messages
onMounted(() => {
  // Only animate messages received within the last 3 seconds (i.e., new ones)
  const messageAge = Date.now() - new Date(props.message.createdAt).getTime();
  if (messageAge < 3000 && props.message.content) {
    runTypewriter();
  }
});

async function runTypewriter() {
  const fullHtml = renderedContent.value;
  isAnimating.value = true;
  animatedHtml.value = "";

  let i = 0;
  while (i < fullHtml.length) {
    // Insert full HTML tags instantly
    if (fullHtml[i] === "<") {
      const end = fullHtml.indexOf(">", i);
      if (end !== -1) {
        animatedHtml.value += fullHtml.slice(i, end + 1);
        i = end + 1;
        continue;
      }
    }
    animatedHtml.value += fullHtml[i];
    i++;
    await new Promise((r) => setTimeout(r, 14));
  }

  isAnimating.value = false;
}
</script>

<style scoped>
.ai-prose :deep(p) {
  margin: 0.25rem 0;
}

.ai-prose :deep(p:first-child) {
  margin-top: 0;
}

.ai-prose :deep(p:last-child) {
  margin-bottom: 0;
}

.ai-prose :deep(pre) {
  margin: 0.5rem 0;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background-color: var(--accent);
  overflow-x: auto;
  font-size: 0.8125rem;
  line-height: 1.5;
}

.ai-prose :deep(pre code) {
  background: transparent;
  padding: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--foreground);
  white-space: pre;
}

.ai-prose :deep(:not(pre) > code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8125rem;
  padding: 0.125rem 0.35rem;
  border-radius: 0.25rem;
  background-color: var(--accent);
  color: var(--foreground);
}

.ai-prose :deep(ul),
.ai-prose :deep(ol) {
  margin: 0.25rem 0;
  padding-left: 1.25rem;
}

.ai-prose :deep(ul) {
  list-style-type: disc;
}

.ai-prose :deep(ol) {
  list-style-type: decimal;
}

.ai-prose :deep(li) {
  margin: 0.125rem 0;
}

.ai-prose :deep(h1),
.ai-prose :deep(h2),
.ai-prose :deep(h3),
.ai-prose :deep(h4) {
  font-weight: 600;
  margin: 0.5rem 0 0.25rem;
}

.ai-prose :deep(h1) {
  font-size: 1.125rem;
}

.ai-prose :deep(h2) {
  font-size: 1rem;
}

.ai-prose :deep(h3) {
  font-size: 0.9375rem;
}

.ai-prose :deep(blockquote) {
  border-left: 3px solid var(--border);
  padding-left: 0.75rem;
  margin: 0.375rem 0;
  color: var(--muted-foreground);
}

.ai-prose :deep(a) {
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.ai-prose :deep(strong) {
  font-weight: 600;
  color: var(--foreground);
}

.ai-prose :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.5rem 0;
  font-size: 0.8125rem;
}

.ai-prose :deep(th),
.ai-prose :deep(td) {
  border: 1px solid var(--border);
  padding: 0.375rem 0.625rem;
  text-align: left;
}

.ai-prose :deep(th) {
  background-color: var(--muted);
  font-weight: 600;
}

.ai-prose :deep(hr) {
  border-color: var(--border);
  margin: 0.5rem 0;
}
</style>
