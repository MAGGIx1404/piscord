<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="flex items-center gap-3 border-b border-border/60 px-4 py-3">
      <div class="relative shrink-0">
        <Avatar class="size-9 rounded-full">
          <AvatarImage :src="friend.avatar_url ?? ''" />
          <AvatarFallback class="text-sm font-semibold">
            {{ friend.username.charAt(0).toUpperCase() }}
          </AvatarFallback>
        </Avatar>
        <span
          class="absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-background"
          :class="friend.is_online ? 'bg-green-500' : 'bg-muted-foreground/40'"
        />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="truncate text-sm font-semibold">{{ friend.username }}</h3>
        <p class="text-xs text-muted-foreground">
          {{ friend.is_online ? "Online" : "Offline" }}
        </p>
      </div>
      <div class="flex items-center gap-1 text-xs text-muted-foreground">
        <div class="size-2 rounded-full" :class="connected ? 'bg-green-500' : 'bg-red-500'" />
        {{ connected ? "Connected" : "Reconnecting..." }}
      </div>
    </div>

    <!-- Messages Area -->
    <div ref="scrollContainer" class="flex-1 overflow-y-auto">
      <!-- Load More -->
      <div v-if="hasMore" class="flex justify-center py-4">
        <Button variant="ghost" size="sm" @click="$emit('loadMore')">Load older messages</Button>
      </div>

      <!-- Empty State -->
      <div
        v-if="!loading && messages.length === 0"
        class="flex flex-1 flex-col items-center justify-center px-4 py-20"
      >
        <div class="flex size-20 items-center justify-center rounded-2xl bg-muted/50">
          <MessageSquare class="size-10 text-muted-foreground/40" />
        </div>
        <h3 class="mt-5 text-lg font-semibold">Start a conversation</h3>
        <p class="mt-1.5 max-w-sm text-center text-sm text-muted-foreground">
          Say hi to {{ friend.username }}! This is the beginning of your direct messages.
        </p>
      </div>

      <!-- Messages -->
      <div v-else class="space-y-0.5 px-4 py-4">
        <template v-for="(msg, i) in messages" :key="msg.id">
          <!-- Date separator -->
          <div
            v-if="i === 0 || !isSameDay(messages[i - 1]!.created_at, msg.created_at)"
            class="my-4 flex items-center gap-3"
          >
            <div class="h-px flex-1 bg-border/60" />
            <span class="text-[11px] font-medium text-muted-foreground">
              {{ formatDate(msg.created_at) }}
            </span>
            <div class="h-px flex-1 bg-border/60" />
          </div>

          <!-- Message -->
          <div
            class="group flex items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-accent/30"
            :class="isCompact(i) ? 'pl-[52px]' : ''"
          >
            <template v-if="!isCompact(i)">
              <Avatar class="mt-0.5 size-9 shrink-0 rounded-full">
                <AvatarImage :src="msg.sender.avatar_url ?? ''" />
                <AvatarFallback class="text-xs font-semibold">
                  {{ msg.sender.username.charAt(0).toUpperCase() }}
                </AvatarFallback>
              </Avatar>
            </template>
            <div class="min-w-0 flex-1">
              <div v-if="!isCompact(i)" class="flex items-baseline gap-2">
                <span class="text-sm font-semibold">{{ msg.sender.username }}</span>
                <span class="text-[11px] text-muted-foreground">
                  {{ formatTime(msg.created_at) }}
                </span>
              </div>
              <p class="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">
                {{ msg.content }}
              </p>
            </div>
          </div>
        </template>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="space-y-6 px-4 py-8">
        <div v-for="n in 5" :key="n" class="flex items-start gap-3">
          <div class="size-9 shrink-0 animate-pulse rounded-full bg-muted" />
          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-2">
              <div class="h-3 w-24 animate-pulse rounded bg-muted" />
              <div class="h-2.5 w-12 animate-pulse rounded bg-muted" />
            </div>
            <div
              class="h-3 animate-pulse rounded bg-muted"
              :style="{ width: `${40 + ((n * 13) % 50)}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Typing indicator -->
    <div v-if="friendTyping" class="px-4 py-1">
      <span class="text-xs text-muted-foreground italic"> {{ friend.username }} is typing... </span>
    </div>

    <!-- Input -->
    <div class="sticky bottom-0 left-0 z-10 flex w-full flex-col gap-2 border-t bg-background p-4">
      <Textarea
        ref="textarea"
        v-model="text"
        :placeholder="`Message ${friend.username}...`"
        class="min-h-16 resize-none"
        @input="$emit('typing')"
        @keydown.enter.prevent="onEnter"
      />
      <div class="ml-auto">
        <Button class="h-9 text-sm" @click="submitMessage">
          <Send class="size-4" />
          Send
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Send, MessageSquare } from "lucide-vue-next";
import type { Friend } from "~/composables/useFriends";
import type { DmChatMessage } from "~/composables/useDmChat";

const props = defineProps<{
  friend: Friend;
  messages: DmChatMessage[];
  loading: boolean;
  hasMore: boolean;
  connected: boolean;
  friendTyping: boolean;
}>();

const emit = defineEmits<{
  send: [content: string];
  typing: [];
  loadMore: [];
}>();

const scrollContainer = ref<HTMLElement>();
const text = ref("");

function onEnter(e: KeyboardEvent) {
  if (e.shiftKey) {
    // Insert newline
    const ta = e.target as HTMLTextAreaElement;
    const cursor = ta.selectionStart;
    text.value = text.value.slice(0, cursor) + "\n" + text.value.slice(cursor);
    nextTick(() => {
      ta.setSelectionRange(cursor + 1, cursor + 1);
    });
    return;
  }
  submitMessage();
}

function submitMessage() {
  const content = text.value.trim();
  if (!content) return;
  emit("send", content);
  text.value = "";
}

// Auto-scroll on new messages
watch(
  () => props.messages.length,
  () => {
    nextTick(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
      }
    });
  }
);

// Helpers
function isCompact(index: number): boolean {
  if (index === 0) return false;
  const prev = props.messages[index - 1]!;
  const curr = props.messages[index]!;
  if (prev.sender.id !== curr.sender.id) return false;
  const diff = new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime();
  return diff < 5 * 60 * 1000; // 5 minutes
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(iso, today.toISOString())) return "Today";
  if (isSameDay(iso, yesterday.toISOString())) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}
</script>
