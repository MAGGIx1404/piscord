<template>
  <div class="w-full flex flex-col">
    <template v-for="group in groups" :key="group.key">
      <!-- Date Separator -->
      <div class="flex items-center py-4 sticky top-8 z-10">
        <span class="flex-1 h-px bg-border" />
        <Badge variant="outline" class="px-3 py-1 min-w-sm text-xs font-medium bg-background">
          {{ group.label }}
        </Badge>
        <span class="flex-1 h-px bg-border" />
      </div>

      <!-- Messages -->
      <div v-for="(message, index) in group.items" :key="message.id" class="group relative">
        <!-- Reply Reference (if replying) -->
        <div
          v-if="message.isReply"
          class="flex items-center gap-2 ml-14 mb-1 text-xs text-muted-foreground"
        >
          <div class="flex items-center gap-1">
            <CornerUpRight class="size-3" />
            <Avatar class="size-4">
              <AvatarImage
                :src="getReplyMessage(message.messageId)?.author.avatar"
                :alt="getReplyMessage(message.messageId)?.author.name"
              />
            </Avatar>
            <span class="font-medium text-foreground/70">
              {{ getReplyMessage(message.messageId)?.author.name }}
            </span>
          </div>
          <span class="truncate max-w-xs opacity-70">
            {{ getReplyMessage(message.messageId)?.content || "Message deleted" }}
          </span>
        </div>

        <!-- Message Content -->
        <div
          class="flex items-start gap-3 px-4 py-2 hover:bg-accent/30 transition-colors rounded-lg mx-2"
          :class="{ 'mt-0': shouldStackMessage(group.items, index) }"
        >
          <!-- Avatar (hide if stacked) -->
          <div class="w-10 shrink-0">
            <template v-if="!shouldStackMessage(group.items, index)">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Avatar
                    class="size-10 cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all"
                  >
                    <AvatarImage :src="message.author.avatar" :alt="message.author.name" />
                    <AvatarFallback class="text-sm">{{
                      message.author.name.charAt(0)
                    }}</AvatarFallback>
                  </Avatar>
                </HoverCardTrigger>
                <HoverCardContent class="w-80" side="right">
                  <div class="flex gap-4">
                    <div class="relative">
                      <Avatar class="size-16 ring-4 ring-card">
                        <AvatarImage :src="message.author.avatar" :alt="message.author.name" />
                        <AvatarFallback class="text-xl">{{
                          message.author.name.charAt(0)
                        }}</AvatarFallback>
                      </Avatar>
                      <span
                        class="absolute bottom-0 right-0 size-4 bg-green-500 rounded-full ring-2 ring-card"
                      />
                    </div>
                    <div class="flex-1 space-y-2">
                      <div>
                        <h4 class="font-semibold">{{ message.author.name }}</h4>
                        <p class="text-sm text-muted-foreground">
                          @{{ message.author.name.toLowerCase() }}
                        </p>
                      </div>
                      <p class="text-sm text-muted-foreground">
                        A passionate member of our community. Always ready to help!
                      </p>
                      <div class="flex items-center gap-4 pt-2">
                        <Button size="sm" class="flex-1">
                          <MessageCircle class="size-4" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <UserPlus class="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </template>
            <template v-else>
              <span
                class="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pt-1 block text-center"
              >
                {{ formatTime(message.createdAt) }}
              </span>
            </template>
          </div>

          <!-- Message Body -->
          <div class="flex-1 min-w-0">
            <!-- Author & Time (hide if stacked) -->
            <div
              v-if="!shouldStackMessage(group.items, index)"
              class="flex items-center gap-2 mb-1"
            >
              <span class="font-semibold text-sm hover:underline cursor-pointer">
                {{ message.author.name }}
              </span>
              <span class="text-xs text-muted-foreground">
                {{ formatTime(message.createdAt) }}
              </span>
            </div>

            <!-- Message Text -->
            <p class="text-sm leading-relaxed wrap-break-word">{{ message.content }}</p>

            <!-- Reactions (mock) -->
            <div v-if="message.reactions?.length" class="flex items-center gap-1.5 mt-2">
              <button
                v-for="reaction in message.reactions"
                :key="reaction.emoji"
                class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/50 hover:bg-accent text-xs transition-colors"
                :class="{ 'ring-1 ring-primary bg-primary/10': reaction.reacted }"
              >
                <span>{{ reaction.emoji }}</span>
                <span class="text-muted-foreground">{{ reaction.count }}</span>
              </button>
            </div>
          </div>

          <!-- Action Buttons (show on hover) -->
          <div
            class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-card border border-border rounded-lg p-0.5 shadow-lg absolute right-4 -top-3"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" class="size-7">
                  <SmilePlus class="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Add Reaction</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" class="size-7">
                  <Reply class="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Reply</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" class="size-7">
                  <Pin class="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Pin Message</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" class="size-7">
                  <MoreHorizontal class="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit class="size-4" />
                  Edit Message
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy class="size-4" />
                  Copy Text
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Forward class="size-4" />
                  Forward
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="text-destructive">
                  <Trash2 class="size-4" />
                  Delete Message
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  CornerUpRight,
  MessageCircle,
  UserPlus,
  SmilePlus,
  Reply,
  Pin,
  MoreHorizontal,
  Edit,
  Copy,
  Forward,
  Trash2
} from "lucide-vue-next";

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

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
};

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
</script>
