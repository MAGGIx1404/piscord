<template>
  <div class="w-full flex flex-col">
    <template v-for="group in groups" :key="group.key">
      <!-- Date Separator -->
      <ChannelChatDateSeparator :label="group.label" />

      <!-- Messages -->
      <ChannelChatMessage
        v-for="(message, index) in group.items"
        :key="message.id"
        :message="message"
        :reply-message="getReplyMessage(message.messageId)"
        :stacked="shouldStackMessage(group.items, index)"
        @reply="handleReply"
        @react="handleReact"
        @add-reaction="handleAddReaction"
        @pin="handlePin"
        @edit="handleEdit"
        @copy="handleCopy"
        @forward="handleForward"
        @delete="handleDelete"
        @message="handleMessage"
        @add-friend="handleAddFriend"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
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
  reactions?: Reaction[];
}

const messages = ref<Message[]>([
  {
    id: "msg_1",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Started working on the chat UI today. Super excited to see how it turns out! 🎨",
    createdAt: "2025-12-27T09:10:00Z",
    isReply: false,
    reactions: [
      { emoji: "🔥", count: 3, reacted: true },
      { emoji: "👍", count: 2, reacted: false }
    ]
  },
  {
    id: "msg_2",
    author: { id: "u2", name: "Bob", avatar: "/images/avatar/2.png" },
    content: "Nice! Are you using virtual scrolling for performance?",
    createdAt: "2025-12-27T09:12:00Z",
    isReply: true,
    messageId: "msg_1"
  },
  {
    id: "msg_3",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Not yet, planning to add it later when we have more messages.",
    createdAt: "2025-12-27T09:13:30Z",
    isReply: true,
    messageId: "msg_1"
  },
  {
    id: "msg_4",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "It should help with 100+ messages in a channel.",
    createdAt: "2025-12-27T09:13:45Z",
    isReply: false
  },
  {
    id: "msg_5",
    author: { id: "u3", name: "Charlie", avatar: "/images/avatar/3.png" },
    content: "Virtual scroll helps a lot after 100+ messages. We used it in our last project.",
    createdAt: "2025-12-27T09:15:00Z",
    isReply: false,
    reactions: [{ emoji: "💯", count: 1, reacted: false }]
  },
  {
    id: "msg_6",
    author: { id: "u4", name: "Daisy", avatar: "/images/avatar/4.png" },
    content: "Agreed, especially for mobile where memory is limited.",
    createdAt: "2025-12-27T09:16:10Z",
    isReply: true,
    messageId: "msg_5"
  },
  {
    id: "msg_7",
    author: { id: "u5", name: "Ethan", avatar: "/images/avatar/5.png" },
    content: "How are you storing messages? SQL or NoSQL?",
    createdAt: "2025-12-28T10:00:00Z",
    isReply: false
  },
  {
    id: "msg_8",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "PostgreSQL with Prisma ORM. Works great for our use case!",
    createdAt: "2025-12-28T10:01:10Z",
    isReply: true,
    messageId: "msg_7",
    reactions: [{ emoji: "✨", count: 2, reacted: true }]
  },
  {
    id: "msg_9",
    author: { id: "u2", name: "Bob", avatar: "/images/avatar/2.png" },
    content: "Flat table with parentMessageId for replies?",
    createdAt: "2025-12-28T10:02:00Z",
    isReply: true,
    messageId: "msg_7"
  },
  {
    id: "msg_10",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Exactly that 👍",
    createdAt: "2025-12-28T10:02:40Z",
    isReply: false
  },
  {
    id: "msg_11",
    author: { id: "u3", name: "Charlie", avatar: "/images/avatar/3.png" },
    content: "Are replies nested or just one level deep?",
    createdAt: "2025-12-29T11:30:00Z",
    isReply: false
  },
  {
    id: "msg_12",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "One level for now. Keeps the UI clean.",
    createdAt: "2025-12-29T11:31:00Z",
    isReply: true,
    messageId: "msg_11"
  },
  {
    id: "msg_13",
    author: { id: "u4", name: "Daisy", avatar: "/images/avatar/4.png" },
    content: "Smart choice, deep nesting gets messy fast. Discord does the same.",
    createdAt: "2025-12-29T11:32:10Z",
    isReply: true,
    messageId: "msg_11",
    reactions: [
      { emoji: "👆", count: 1, reacted: false },
      { emoji: "💡", count: 2, reacted: true }
    ]
  },
  {
    id: "msg_14",
    author: { id: "u5", name: "Ethan", avatar: "/images/avatar/5.png" },
    content: "Any plan for message reactions? Would be cool to have emoji reactions.",
    createdAt: "2025-12-30T14:00:00Z",
    isReply: false
  },
  {
    id: "msg_15",
    author: { id: "u2", name: "Bob", avatar: "/images/avatar/2.png" },
    content: "Emoji + userId mapping works well. Simple join table.",
    createdAt: "2025-12-30T14:01:20Z",
    isReply: true,
    messageId: "msg_14"
  },
  {
    id: "msg_16",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Yes, reactions are on the roadmap! Should land in v2.",
    createdAt: "2025-12-30T14:02:00Z",
    isReply: true,
    messageId: "msg_14",
    reactions: [
      { emoji: "🎉", count: 4, reacted: true },
      { emoji: "🚀", count: 2, reacted: false }
    ]
  },
  {
    id: "msg_17",
    author: { id: "u3", name: "Charlie", avatar: "/images/avatar/3.png" },
    content: "Can't wait! This is looking really good so far.",
    createdAt: "2026-01-02T22:00:00Z",
    isReply: false
  },
  {
    id: "msg_18",
    author: { id: "u5", name: "Ethan", avatar: "/images/avatar/5.png" },
    content: "Let's ship it! 🚢",
    createdAt: "2026-01-02T23:00:00Z",
    isReply: false,
    reactions: [{ emoji: "🚀", count: 5, reacted: true }]
  },
  {
    id: "msg_19",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Almost there! Just a few more tweaks.",
    createdAt: "2026-01-02T23:01:00Z",
    isReply: true,
    messageId: "msg_18"
  }
]);

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

const getReplyMessage = (messageId?: string) => {
  if (!messageId) return null;
  return messages.value.find((m) => m.id === messageId);
};

// Stack messages from same author within 5 minutes
const shouldStackMessage = (items: Message[], index: number) => {
  if (index === 0) return false;
  const current = items[index];
  const previous = items[index - 1];

  if (current.author.id !== previous.author.id) return false;
  if (current.isReply) return false;

  const currentTime = new Date(current.createdAt).getTime();
  const previousTime = new Date(previous.createdAt).getTime();
  const diffMinutes = (currentTime - previousTime) / (1000 * 60);

  return diffMinutes < 5;
};

const groups = computed(() => {
  const out: { key: string; label: string; items: Message[] }[] = [];
  for (const m of messages.value) {
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

// Event handlers
function handleReply(message: Message) {
  console.log("Reply to:", message);
}

function handleReact(payload: { message: Message; reaction: Reaction }) {
  console.log("React:", payload);
}

function handleAddReaction(message: Message) {
  console.log("Add reaction to:", message);
}

function handlePin(message: Message) {
  console.log("Pin:", message);
}

function handleEdit(message: Message) {
  console.log("Edit:", message);
}

function handleCopy(message: Message) {
  navigator.clipboard.writeText(message.content);
}

function handleForward(message: Message) {
  console.log("Forward:", message);
}

function handleDelete(message: Message) {
  console.log("Delete:", message);
}

function handleMessage(author: Author) {
  console.log("Message user:", author);
}

function handleAddFriend(author: Author) {
  console.log("Add friend:", author);
}
</script>
