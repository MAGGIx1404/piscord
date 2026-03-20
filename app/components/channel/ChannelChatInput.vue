<template>
  <div class="sticky bottom-0 left-0 z-10 -mb-4 flex w-full flex-col gap-2 bg-background p-4">
    <Textarea
      ref="textarea"
      v-model="text"
      placeholder="Type a message… Use @ to mention"
      class="min-h-20 resize-none"
      @input="onInput"
      @keydown.down.prevent="next"
      @keydown.up.prevent="prev"
      @keydown.enter.prevent="onEnter"
      @keydown.escape="closePanel"
      @click="onCursorMove"
      @blur="onBlur"
    />

    <div class="ml-auto space-x-2">
      <Button class="h-9 text-sm" @click="submitMessage">
        <Send class="size-4" />
        Send
      </Button>
    </div>

    <!-- Mention autocomplete panel -->
    <div
      v-if="open"
      ref="panelRef"
      class="absolute bottom-full left-2 z-50 mb-2 w-64 rounded-md border bg-popover shadow-md"
    >
      <!-- AI Agent option -->
      <div
        v-if="showAiOption"
        class="flex cursor-pointer items-center gap-2 border-b px-3 py-2 text-sm hover:bg-accent"
        :class="{ 'bg-accent': index === 0 && aiAgentInList }"
        @mousedown.prevent="insertAiMention"
      >
        <div class="relative">
          <img v-if="aiAgent?.avatar" :src="aiAgent.avatar" class="size-6 rounded-full" />
          <div v-else class="flex size-6 items-center justify-center rounded-full bg-violet-600">
            <Bot class="size-3 text-white" />
          </div>
          <Sparkles class="absolute -right-0.5 -bottom-0.5 size-2.5 text-violet-400" />
        </div>
        <div class="flex flex-col">
          <span class="font-medium text-violet-400">{{ aiAgent?.name || "AI Agent" }}</span>
          <span class="text-xs text-muted-foreground">AI Assistant</span>
        </div>
      </div>

      <!-- User list -->
      <div
        v-for="(user, i) in filteredUsers"
        :key="user.id"
        class="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
        :class="{ 'bg-accent': i + (aiAgentInList ? 1 : 0) === index }"
        @mousedown.prevent="insertUser(user)"
      >
        <img :src="user.avatar_url || '/images/avatar/default.png'" class="size-6 rounded-full" />
        <span>{{ user.username }}</span>
      </div>

      <div
        v-if="filteredUsers.length === 0 && !showAiOption"
        class="px-3 py-3 text-center text-sm text-muted-foreground"
      >
        No users found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Send, Bot, Sparkles } from "lucide-vue-next";
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import type { ChannelMember, AIAgent } from "~/composables/useChannelChat";

interface Props {
  members: ChannelMember[];
  aiAgent: AIAgent | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  send: [content: string];
  typing: [];
}>();

const textarea = ref<HTMLTextAreaElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const text = ref("");
const open = ref(false);
const query = ref("");
const index = ref(0);

function getTextarea(): HTMLTextAreaElement | null {
  const el = textarea.value as unknown;
  if (!el) return null;
  // shadcn Textarea wraps a native textarea — try $el first
  if (typeof el === "object" && el !== null && "$el" in el) {
    return (el as { $el: HTMLTextAreaElement }).$el;
  }
  return el as HTMLTextAreaElement;
}

/* Filter users */
const filteredUsers = computed(() =>
  props.members.filter((u) => u.username.toLowerCase().startsWith(query.value.toLowerCase()))
);

/* Check if AI agent matches query */
const showAiOption = computed(() => {
  if (!props.aiAgent?.name) return false;
  if (!query.value) return true;
  return props.aiAgent.name.toLowerCase().startsWith(query.value.toLowerCase());
});

const aiAgentInList = computed(() => showAiOption.value);

const totalItems = computed(() => filteredUsers.value.length + (aiAgentInList.value ? 1 : 0));

function onInput() {
  emit("typing");
  const ta = getTextarea();
  if (!ta) return;
  const cursor = ta.selectionStart;
  const before = text.value.slice(0, cursor);

  const userMatch = before.match(/@(\w*)$/);
  if (userMatch) {
    query.value = userMatch[1] ?? "";
    open.value = true;
    index.value = 0;
    return;
  }

  open.value = false;
}

function insertMentionText(name: string) {
  const ta = getTextarea();
  if (!ta) return;
  const cursor = ta.selectionStart;
  const full = text.value;
  const atIndex = full.lastIndexOf("@", cursor - 1);

  if (atIndex !== -1) {
    let end = atIndex + 1;
    while (end < full.length && /[\w]/.test(full.charAt(end))) end++;

    const before = full.slice(0, atIndex);
    const after = full.slice(end);
    const inserted = `@${name} `;

    text.value = before + inserted + after;
    open.value = false;

    nextTick(() => {
      const pos = before.length + inserted.length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
    return;
  }

  text.value = full + ` @${name} `;
  open.value = false;
  nextTick(() => {
    ta.focus();
    const pos = text.value.length;
    ta.setSelectionRange(pos, pos);
  });
}

function insertUser(user: ChannelMember) {
  insertMentionText(user.username);
}

function insertAiMention() {
  if (!props.aiAgent?.name) return;
  insertMentionText(props.aiAgent.name);
}

function next() {
  if (!open.value || totalItems.value === 0) return;
  index.value = (index.value + 1) % totalItems.value;
}

function prev() {
  if (!open.value || totalItems.value === 0) return;
  index.value = (index.value - 1 + totalItems.value) % totalItems.value;
}

function selectItem() {
  if (!open.value || totalItems.value === 0) return;

  if (aiAgentInList.value && index.value === 0) {
    insertAiMention();
    return;
  }

  const userIndex = index.value - (aiAgentInList.value ? 1 : 0);
  const user = filteredUsers.value[userIndex];
  if (user) insertUser(user);
}

function onEnter(e: KeyboardEvent) {
  if (open.value && totalItems.value > 0) {
    selectItem();
    return;
  }

  // Shift+Enter for newline
  if (e.shiftKey) {
    const ta = getTextarea();
    if (!ta) return;
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

function closePanel() {
  open.value = false;
}

function onBlur() {
  setTimeout(() => {
    if (!panelRef.value?.contains(document.activeElement)) {
      open.value = false;
    }
  }, 100);
}

function onCursorMove() {
  const ta = getTextarea();
  if (!ta) return;
  const cursor = ta.selectionStart;
  const before = text.value.slice(0, cursor);

  const userMatch = before.match(/@(\w*)$/);
  if (userMatch) {
    query.value = userMatch[1] ?? "";
    open.value = true;
    index.value = 0;
    return;
  }

  open.value = false;
}

function onClickOutside(e: MouseEvent) {
  if (!open.value) return;
  const panel = panelRef.value;
  const ta = getTextarea();
  if (panel && !panel.contains(e.target as Node) && ta && !ta.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => {
  document.addEventListener("mousedown", onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", onClickOutside);
});
</script>
