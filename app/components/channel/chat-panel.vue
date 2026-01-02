<template>
  <div class="w-full flex flex-col">
    <template v-for="group in groups" :key="group.key">
      <!-- date separator -->
      <div class="flex items-center text-xs text-muted-foreground my-1">
        <span class="flex-1 h-px bg-border"></span>
        <span class="px-3">{{ group.label }}</span>
        <span class="flex-1 h-px bg-border"></span>
      </div>

      <!-- Chat -->
      <div
        v-for="message in group.items"
        :key="message.id"
        class="flex items-start gap-3 p-4 hover:bg-accent/50 rounded-md relative"
      >
        <Avatar class="size-12">
          <AvatarImage :src="message.author.avatar" :alt="message.author.name" />
          <AvatarFallback>{{ message.author.name.charAt(0) }}</AvatarFallback>
        </Avatar>

        <div class="flex-1 space-y-1">
          <div class="flex items-center gap-2">
            <HoverCard>
              <HoverCardTrigger as-child>
                <Button variant="link" size="link" class="font-medium tracking-wide">
                  {{ message.author.name }}
                </Button>
              </HoverCardTrigger>
              <HoverCardContent class="w-md">
                <div class="flex justify-between space-x-4">
                  <Avatar class="size-12">
                    <AvatarImage :src="message.author.avatar" :alt="message.author.name" />
                    <AvatarFallback>{{ message.author.name.charAt(0) }}</AvatarFallback>
                  </Avatar>
                  <div class="space-y-1">
                    <h4 class="text-base font-medium tracking-wide">@{{ message.author.name }}</h4>
                    <p class="text-sm">
                      This is a brief user bio. More details about the user can go here.
                    </p>
                    <div class="flex items-center pt-2">
                      <CalendarDaysIcon class="mr-2 h-4 w-4 opacity-70" />
                      <span class="text-xs text-muted-foreground"> Joined December 2021 </span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            <span class="text-xs text-muted-foreground">
              {{
                new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })
              }}</span
            >
          </div>
          <p class="text-sm">{{ message.content }}</p>

          <!-- Reply -->
          <div
            v-if="message.isReply"
            class="mt-4 border-l-4 border-primary pl-4 bg-secondary p-2 rounded-md space-y-1"
          >
            <span class="text-sm text-muted-foreground">
              Replying to {{ message.author.name }}'s message :
            </span>
            <p class="text-sm">
              {{
                messages.find((m) => m.id === message.messageId)?.content ||
                "Original message not found."
              }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { CalendarDaysIcon } from "lucide-vue-next";

const messages = ref([
  {
    id: "msg_1",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Started working on the chat UI today.",
    createdAt: "2025-12-27T09:10:00Z",
    isReply: false
  },
  {
    id: "msg_2",
    author: { id: "u2", name: "Bob", avatar: "/images/avatar/2.png" },
    content: "Nice! Are you using virtual scrolling?",
    createdAt: "2025-12-27T09:12:00Z",
    isReply: true,
    messageId: "msg_1"
  },
  {
    id: "msg_3",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Not yet, planning to add it later.",
    createdAt: "2025-12-27T09:13:30Z",
    isReply: true,
    messageId: "msg_1"
  },
  {
    id: "msg_4",
    author: { id: "u3", name: "Charlie", avatar: "/images/avatar/3.png" },
    content: "Virtual scroll helps a lot after 100+ messages.",
    createdAt: "2025-12-27T09:15:00Z",
    isReply: false
  },
  {
    id: "msg_5",
    author: { id: "u4", name: "Daisy", avatar: "/images/avatar/4.png" },
    content: "Agreed, especially for mobile.",
    createdAt: "2025-12-27T09:16:10Z",
    isReply: true,
    messageId: "msg_4"
  },

  {
    id: "msg_6",
    author: { id: "u5", name: "Ethan", avatar: "/images/avatar/5.png" },
    content: "How are you storing messages?",
    createdAt: "2025-12-28T10:00:00Z",
    isReply: false
  },
  {
    id: "msg_7",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "PostgreSQL with Prisma.",
    createdAt: "2025-12-28T10:01:10Z",
    isReply: true,
    messageId: "msg_6"
  },
  {
    id: "msg_8",
    author: { id: "u2", name: "Bob", avatar: "/images/avatar/2.png" },
    content: "Flat table + parentMessageId?",
    createdAt: "2025-12-28T10:02:00Z",
    isReply: true,
    messageId: "msg_6"
  },
  {
    id: "msg_9",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Exactly that 👍",
    createdAt: "2025-12-28T10:02:40Z",
    isReply: true,
    messageId: "msg_6"
  },

  {
    id: "msg_10",
    author: { id: "u3", name: "Charlie", avatar: "/images/avatar/3.png" },
    content: "Are replies nested or just one level?",
    createdAt: "2025-12-29T11:30:00Z",
    isReply: false
  },
  {
    id: "msg_11",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "One level for now.",
    createdAt: "2025-12-29T11:31:00Z",
    isReply: true,
    messageId: "msg_10"
  },
  {
    id: "msg_12",
    author: { id: "u4", name: "Daisy", avatar: "/images/avatar/4.png" },
    content: "Smart choice, deep nesting gets messy.",
    createdAt: "2025-12-29T11:32:10Z",
    isReply: true,
    messageId: "msg_10"
  },

  {
    id: "msg_13",
    author: { id: "u5", name: "Ethan", avatar: "/images/avatar/5.png" },
    content: "Any plan for message reactions?",
    createdAt: "2025-12-30T14:00:00Z",
    isReply: false
  },
  {
    id: "msg_14",
    author: { id: "u2", name: "Bob", avatar: "/images/avatar/2.png" },
    content: "Emoji + userId mapping works well.",
    createdAt: "2025-12-30T14:01:20Z",
    isReply: true,
    messageId: "msg_13"
  },
  {
    id: "msg_15",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Yes, reactions are next.",
    createdAt: "2025-12-30T14:02:00Z",
    isReply: true,
    messageId: "msg_13"
  },

  {
    id: "msg_16",
    author: { id: "u3", name: "Charlie", avatar: "/images/avatar/3.png" },
    content: "Do you allow message editing?",
    createdAt: "2025-12-31T09:00:00Z",
    isReply: false
  },
  {
    id: "msg_17",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Within 5 minutes only.",
    createdAt: "2025-12-31T09:01:00Z",
    isReply: true,
    messageId: "msg_16"
  },
  {
    id: "msg_18",
    author: { id: "u4", name: "Daisy", avatar: "/images/avatar/4.png" },
    content: "That’s a good balance.",
    createdAt: "2025-12-31T09:01:40Z",
    isReply: true,
    messageId: "msg_16"
  },

  {
    id: "msg_19",
    author: { id: "u5", name: "Ethan", avatar: "/images/avatar/5.png" },
    content: "Realtime via socket.io?",
    createdAt: "2026-01-01T08:30:00Z",
    isReply: false
  },
  {
    id: "msg_20",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Yes, with Redis adapter.",
    createdAt: "2026-01-01T08:31:10Z",
    isReply: true,
    messageId: "msg_19"
  },
  {
    id: "msg_21",
    author: { id: "u2", name: "Bob", avatar: "/images/avatar/2.png" },
    content: "Perfect for scaling.",
    createdAt: "2026-01-01T08:32:00Z",
    isReply: true,
    messageId: "msg_19"
  },

  {
    id: "msg_22",
    author: { id: "u3", name: "Charlie", avatar: "/images/avatar/3.png" },
    content: "How about file uploads?",
    createdAt: "2026-01-01T12:00:00Z",
    isReply: false
  },
  {
    id: "msg_23",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "MinIO locally, S3 in prod.",
    createdAt: "2026-01-01T12:01:20Z",
    isReply: true,
    messageId: "msg_22"
  },
  {
    id: "msg_24",
    author: { id: "u4", name: "Daisy", avatar: "/images/avatar/4.png" },
    content: "Store only URLs in DB.",
    createdAt: "2026-01-01T12:02:00Z",
    isReply: true,
    messageId: "msg_22"
  },

  {
    id: "msg_25",
    author: { id: "u5", name: "Ethan", avatar: "/images/avatar/5.png" },
    content: "Chat feels really smooth now.",
    createdAt: "2026-01-02T09:00:00Z",
    isReply: false
  },
  {
    id: "msg_26",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Thanks! Still optimizing.",
    createdAt: "2026-01-02T09:01:00Z",
    isReply: true,
    messageId: "msg_25"
  },
  {
    id: "msg_27",
    author: { id: "u2", name: "Bob", avatar: "/images/avatar/2.png" },
    content: "UI polish makes a huge difference.",
    createdAt: "2026-01-02T09:02:00Z",
    isReply: true,
    messageId: "msg_25"
  },

  {
    id: "msg_28",
    author: { id: "u3", name: "Charlie", avatar: "/images/avatar/3.png" },
    content: "Any plan for typing indicators?",
    createdAt: "2026-01-02T11:00:00Z",
    isReply: false
  },
  {
    id: "msg_29",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Yes, socket event only (not stored).",
    createdAt: "2026-01-02T11:01:00Z",
    isReply: true,
    messageId: "msg_28"
  },

  {
    id: "msg_30",
    author: { id: "u4", name: "Daisy", avatar: "/images/avatar/4.png" },
    content: "Smart, no DB pollution.",
    createdAt: "2026-01-02T11:02:00Z",
    isReply: true,
    messageId: "msg_28"
  },

  {
    id: "msg_31",
    author: { id: "u5", name: "Ethan", avatar: "/images/avatar/5.png" },
    content: "This structure is very clean.",
    createdAt: "2026-01-02T15:00:00Z",
    isReply: false
  },
  {
    id: "msg_32",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Glad it helps!",
    createdAt: "2026-01-02T15:01:00Z",
    isReply: true,
    messageId: "msg_31"
  },

  {
    id: "msg_33",
    author: { id: "u2", name: "Bob", avatar: "/images/avatar/2.png" },
    content: "Ready to add reactions next?",
    createdAt: "2026-01-02T16:00:00Z",
    isReply: false
  },
  {
    id: "msg_34",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Yep, starting tomorrow.",
    createdAt: "2026-01-02T16:01:00Z",
    isReply: true,
    messageId: "msg_33"
  },

  {
    id: "msg_35",
    author: { id: "u3", name: "Charlie", avatar: "/images/avatar/3.png" },
    content: "Good luck 🚀",
    createdAt: "2026-01-02T16:02:00Z",
    isReply: true,
    messageId: "msg_33"
  },

  {
    id: "msg_36",
    author: { id: "u4", name: "Daisy", avatar: "/images/avatar/4.png" },
    content: "This chat is almost production-ready.",
    createdAt: "2026-01-02T18:00:00Z",
    isReply: false
  },
  {
    id: "msg_37",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Still some edge cases 😅",
    createdAt: "2026-01-02T18:01:00Z",
    isReply: true,
    messageId: "msg_36"
  },

  {
    id: "msg_38",
    author: { id: "u5", name: "Ethan", avatar: "/images/avatar/5.png" },
    content: "Edge cases never end.",
    createdAt: "2026-01-02T18:02:00Z",
    isReply: true,
    messageId: "msg_36"
  },

  {
    id: "msg_39",
    author: { id: "u2", name: "Bob", avatar: "/images/avatar/2.png" },
    content: "Welcome to software 😄",
    createdAt: "2026-01-02T18:03:00Z",
    isReply: true,
    messageId: "msg_36"
  },

  {
    id: "msg_40",
    author: { id: "u3", name: "Charlie", avatar: "/images/avatar/3.png" },
    content: "Great work overall.",
    createdAt: "2026-01-02T20:00:00Z",
    isReply: false
  },
  {
    id: "msg_41",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Thanks everyone 🙌",
    createdAt: "2026-01-02T20:01:00Z",
    isReply: true,
    messageId: "msg_40"
  },

  {
    id: "msg_42",
    author: { id: "u4", name: "Daisy", avatar: "/images/avatar/4.png" },
    content: "Let’s test this with 1000 messages next.",
    createdAt: "2026-01-02T21:00:00Z",
    isReply: false
  },
  {
    id: "msg_43",
    author: { id: "u2", name: "Bob", avatar: "/images/avatar/2.png" },
    content: "That’ll reveal everything 😁",
    createdAt: "2026-01-02T21:01:00Z",
    isReply: true,
    messageId: "msg_42"
  },

  {
    id: "msg_44",
    author: { id: "u5", name: "Ethan", avatar: "/images/avatar/5.png" },
    content: "Performance test time.",
    createdAt: "2026-01-02T21:02:00Z",
    isReply: true,
    messageId: "msg_42"
  },

  {
    id: "msg_45",
    author: { id: "u3", name: "Charlie", avatar: "/images/avatar/3.png" },
    content: "This dataset should already help a lot.",
    createdAt: "2026-01-02T22:00:00Z",
    isReply: false
  },
  {
    id: "msg_46",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Absolutely.",
    createdAt: "2026-01-02T22:01:00Z",
    isReply: true,
    messageId: "msg_45"
  },

  {
    id: "msg_47",
    author: { id: "u2", name: "Bob", avatar: "/images/avatar/2.png" },
    content: "Looks production-like.",
    createdAt: "2026-01-02T22:02:00Z",
    isReply: true,
    messageId: "msg_45"
  },

  {
    id: "msg_48",
    author: { id: "u4", name: "Daisy", avatar: "/images/avatar/4.png" },
    content: "Nice work team.",
    createdAt: "2026-01-02T22:03:00Z",
    isReply: true,
    messageId: "msg_45"
  },

  {
    id: "msg_49",
    author: { id: "u5", name: "Ethan", avatar: "/images/avatar/5.png" },
    content: "Let’s ship it 🚢",
    createdAt: "2026-01-02T23:00:00Z",
    isReply: false
  },
  {
    id: "msg_50",
    author: { id: "u1", name: "Alice", avatar: "/images/avatar/1.png" },
    content: "Almost there!",
    createdAt: "2026-01-02T23:01:00Z",
    isReply: true,
    messageId: "msg_49"
  }
]);

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "long",
  year: "numeric"
});

const groups = computed(() => {
  const out = [];
  for (const m of messages.value) {
    const d = new Date(m.createdAt);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD key (timezone-consistent)
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
