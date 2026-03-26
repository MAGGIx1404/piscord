<template>
  <Dialog v-model:open="open">
    <DialogContent class="flex h-[85vh] max-w-2xl flex-col gap-0 p-0" @interact-outside.prevent>
      <!-- Header -->
      <div class="flex items-center gap-3 border-b border-border/50 px-5 py-4">
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
        <Badge v-if="node?.latency" variant="outline" class="text-[10px] tabular-nums">
          {{ node.latency }}ms
        </Badge>
      </div>

      <!-- Messages -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto px-5 py-4">
        <div v-if="loading" class="space-y-4">
          <Skeleton v-for="n in 4" :key="n" class="h-16 w-full rounded-lg" />
        </div>
        <div v-else-if="messages.length" class="space-y-4">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="flex gap-3"
            :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[80%] rounded-xl px-4 py-3"
              :class="
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border/40 bg-muted/30'
              "
            >
              <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ msg.content }}</p>
              <p
                class="mt-1.5 text-[10px]"
                :class="
                  msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground/50'
                "
              >
                {{ new Date(msg.created_at).toLocaleTimeString() }}
              </p>
            </div>
          </div>
          <!-- Running indicator -->
          <div v-if="node?.status === 'running'" class="flex gap-3">
            <div class="rounded-xl border border-border/40 bg-muted/30 px-4 py-3">
              <div class="flex items-center gap-2">
                <Loader2 class="size-3.5 animate-spin text-blue-500" />
                <span class="text-sm text-muted-foreground">Generating...</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex h-full flex-col items-center justify-center gap-2">
          <MessageSquare class="size-8 text-muted-foreground/20" />
          <p class="text-sm text-muted-foreground/50">No messages yet. Send a prompt to start.</p>
        </div>
      </div>

      <!-- Input -->
      <div class="border-t border-border/50 px-5 py-4">
        <div class="flex gap-2">
          <input
            ref="inputRef"
            v-model="prompt"
            type="text"
            placeholder="Type a message..."
            class="min-w-0 flex-1 rounded-lg border border-border/50 bg-muted/30 px-4 py-2.5 text-sm transition-colors outline-none focus:border-primary/50"
            :disabled="node?.status === 'running'"
            @keydown.enter="handleSend"
          />
          <Button
            size="icon"
            class="size-10 shrink-0"
            :disabled="!prompt.trim() || node?.status === 'running'"
            @click="handleSend"
          >
            <Loader2 v-if="node?.status === 'running'" class="size-4 animate-spin" />
            <Send v-else class="size-4" />
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Send, X, Loader2, MessageSquare } from "lucide-vue-next";
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
}>();

const prompt = ref("");
const messagesContainer = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

watch(
  () => props.messages.length,
  () => scrollToBottom()
);

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
}
</script>
