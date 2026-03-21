<template>
  <div class="w-full flex flex-col">
    <template v-for="group in groups" :key="group.key">
      <!-- Date Separator -->
      <ChannelChatDateSeparator :label="group.label" />

      <!-- Messages -->
      <template v-for="(message, index) in group.items" :key="message.id">
        <!-- AI Bot Message -->
        <ChannelAIChatMessage
          v-if="message.isBot"
          :message="message"
          :reply-message="getReplyMessage(message.messageId)"
          :stacked="shouldStackMessage(group.items, index)"
          @reply="$emit('reply', message)"
          @copy="$emit('copy', message)"
          @regenerate="$emit('regenerate', message)"
          @feedback="(type) => $emit('feedback', { message, type })"
        />

        <!-- Regular User Message -->
        <ChannelChatMessage
          v-else
          :message="message"
          :reply-message="getReplyMessage(message.messageId)"
          :stacked="shouldStackMessage(group.items, index)"
          @reply="$emit('reply', message)"
          @react="(payload) => $emit('react', payload)"
          @add-reaction="$emit('addReaction', message)"
          @pin="$emit('pin', message)"
          @edit="$emit('edit', message)"
          @copy="$emit('copy', message)"
          @forward="$emit('forward', message)"
          @delete="$emit('delete', message)"
          @message="(author) => $emit('message', author)"
          @add-friend="(author) => $emit('addFriend', author)"
        />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ChatWorkspace } from "./ChannelWorkspaceCard.vue";

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
  workspaces?: ChatWorkspace[];
}

interface Props {
  messages: Message[];
}

const props = defineProps<Props>();

defineEmits<{
  reply: [message: Message];
  react: [payload: { message: Message; reaction: Reaction }];
  addReaction: [message: Message];
  pin: [message: Message];
  edit: [message: Message];
  copy: [message: Message];
  forward: [message: Message];
  delete: [message: Message];
  message: [author: Author];
  addFriend: [author: Author];
  regenerate: [message: Message];
  feedback: [payload: { message: Message; type: "positive" | "negative" }];
}>();

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

const getReplyMessage = (messageId?: string) => {
  if (!messageId) return null;
  return props.messages.find((m) => m.id === messageId) ?? null;
};

// Stack messages from same author within 5 minutes
const shouldStackMessage = (items: Message[], index: number) => {
  if (index === 0) return false;
  const current = items[index];
  const previous = items[index - 1];

  if (!current || !previous) return false;
  if (current.author.id !== previous.author.id) return false;
  if (current.isReply) return false;

  const currentTime = new Date(current.createdAt).getTime();
  const previousTime = new Date(previous.createdAt).getTime();
  const diffMinutes = (currentTime - previousTime) / (1000 * 60);

  return diffMinutes < 5;
};

const groups = computed(() => {
  const out: { key: string; label: string; items: Message[] }[] = [];
  for (const m of props.messages) {
    const d = new Date(m.createdAt);
    const key = d.toISOString().slice(0, 10);
    let g = out.find((x) => x.key === key);
    if (!g) {
      g = { key, label: dateFormatter.format(d), items: [] };
      out.push(g);
    }
    g.items.push(m);
  }
  return out;
});
</script>
