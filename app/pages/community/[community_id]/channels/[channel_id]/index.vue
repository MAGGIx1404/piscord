<template>
  <main class="flex h-full w-full flex-col">
    <!-- Loading State: Skeleton -->
    <div v-if="loading" class="flex h-full flex-col">
      <!-- Skeleton header -->
      <div class="border-b px-4 py-3">
        <div class="flex items-center gap-3">
          <div class="size-5 animate-pulse rounded bg-muted" />
          <div class="h-4 w-32 animate-pulse rounded bg-muted" />
          <div class="h-3 w-48 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <!-- Skeleton messages -->
      <div class="flex-1 space-y-6 px-4 pt-8">
        <div v-for="i in 5" :key="i" class="flex items-start gap-3">
          <div class="size-9 shrink-0 animate-pulse rounded-full bg-muted" />
          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-2">
              <div class="h-3 w-24 animate-pulse rounded bg-muted" />
              <div class="h-2.5 w-12 animate-pulse rounded bg-muted" />
            </div>
            <div
              class="h-3 animate-pulse rounded bg-muted"
              :style="{ width: `${40 + ((i * 13) % 50)}%` }"
            />
            <div
              v-if="i % 2 === 0"
              class="h-3 animate-pulse rounded bg-muted"
              :style="{ width: `${25 + ((i * 7) % 30)}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Skeleton input -->
      <div class="border-t px-4 py-3">
        <div class="h-10 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>

    <template v-else>
      <!-- Channel Header -->
      <div class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <!-- Banner header -->
        <div v-if="channelBanner" class="relative h-28 w-full overflow-hidden">
          <img
            :src="channelBanner"
            :alt="channelName"
            class="h-full w-full object-cover"
          />
          <div class="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" />

          <div class="absolute bottom-0 left-0 flex w-full items-end justify-between px-4 pb-2.5">
            <div class="flex items-center gap-2">
              <Hash class="size-5 text-white/80" />
              <h2 class="font-bold text-white drop-shadow-sm">{{ channelName }}</h2>
              <span v-if="channelTopic" class="text-sm text-white/60">
                — {{ channelTopic }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <Popover v-if="aiAgent?.name">
                <PopoverTrigger as-child>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-7 gap-1.5 border border-white/20 bg-black/30 px-2.5 text-white/90 backdrop-blur-sm hover:bg-black/50 hover:text-white"
                  >
                    <Sparkles class="size-3.5" />
                    <span class="text-xs font-medium">{{ aiAgent.name }}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" class="w-80 p-0">
                  <ChannelAIHelp :ai-agent="aiAgent" :can-manage="canManage" />
                </PopoverContent>
              </Popover>

              <div class="flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-xs text-white/80 backdrop-blur-sm">
                <div
                  class="size-2 rounded-full"
                  :class="connected ? 'bg-green-400' : 'bg-red-400'"
                />
                {{ onlineUsers.length }} online
              </div>
            </div>
          </div>
        </div>

        <!-- No-banner header -->
        <div v-else class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-2">
            <Hash class="size-5 text-muted-foreground" />
            <h2 class="font-semibold">{{ channelName }}</h2>
            <span v-if="channelTopic" class="text-sm text-muted-foreground">
              — {{ channelTopic }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <Popover v-if="aiAgent?.name">
              <PopoverTrigger as-child>
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-7 gap-1.5 border border-violet-500/20 bg-violet-500/5 px-2.5 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300"
                >
                  <Sparkles class="size-3.5" />
                  <span class="text-xs font-medium">{{ aiAgent.name }}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" class="w-80 p-0">
                <ChannelAIHelp :ai-agent="aiAgent" :can-manage="canManage" />
              </PopoverContent>
            </Popover>

            <div class="flex items-center gap-1 text-xs text-muted-foreground">
              <div
                class="size-2 rounded-full"
                :class="connected ? 'bg-green-500' : 'bg-red-500'"
              />
              {{ onlineUsers.length }} online
            </div>
          </div>
        </div>
      </div>

      <!-- Messages Area -->
      <div ref="scrollContainer" class="flex-1 overflow-y-auto">
        <!-- Load More -->
        <div v-if="hasMore" class="flex justify-center py-4">
          <Button variant="ghost" size="sm" @click="loadMore">Load older messages</Button>
        </div>

        <!-- Empty State (no messages) -->
        <div
          v-if="messages.length === 0"
          class="flex flex-1 flex-col items-center justify-center px-4 py-20"
        >
          <div class="flex size-20 items-center justify-center rounded-2xl bg-muted/50">
            <Hash class="size-10 text-muted-foreground/40" />
          </div>
          <h3 class="mt-5 text-lg font-semibold">Welcome to #{{ channelName }}</h3>
          <p class="mt-1.5 max-w-sm text-center text-sm text-muted-foreground">
            {{
              channelDescription ||
              "This is the very beginning of this channel. Start the conversation!"
            }}
          </p>
          <div class="mt-6 flex items-center gap-2 text-xs text-muted-foreground/60">
            <MessageSquareIcon class="size-3.5" />
            <span>Type a message below to get started</span>
          </div>
        </div>

        <!-- Messages list -->
        <template v-else>
          <ChannelIntro
            :name="channelName"
            :description="channelDescription || 'This is the start of your conversation.'"
            :type="channelType"
            :show-actions="false"
          />

          <ChannelChatPanel
            :messages="formattedMessages"
            @reply="handleReply"
            @react="handleReact"
            @add-reaction="handleAddReaction"
            @copy="handleCopy"
          />
        </template>
      </div>

      <!-- Typing Indicator -->
      <div v-if="typingUsernames.length || aiProcessing" class="px-4 py-1">
        <span class="text-xs text-muted-foreground italic">
          <template v-if="aiProcessing">
            {{ aiAgent?.name || "AI" }} is thinking...
          </template>
          <template v-else>
            {{ typingLabel }}
          </template>
        </span>
      </div>

      <!-- Reply Preview -->
      <div v-if="replyingTo" class="flex items-center gap-2 border-t bg-accent/30 px-4 py-2">
        <CornerUpRight class="size-4 text-muted-foreground" />
        <span class="text-sm text-muted-foreground">
          Replying to
          <strong>{{ replyingTo.author.username }}</strong>
        </span>
        <span class="max-w-xs truncate text-sm text-muted-foreground/70">
          {{ replyingTo.content }}
        </span>
        <Button variant="ghost" size="icon" class="ml-auto size-6" @click="cancelReply">
          <X class="size-3" />
        </Button>
      </div>

      <!-- Chat Input -->
      <ChannelChatInput
        :members="members"
        :ai-agent="aiAgent"
        @send="handleSend"
        @typing="handleTyping"
      />
    </template>
  </main>
</template>

<script setup lang="ts">
import {
  Hash,
  CornerUpRight,
  X,
  Sparkles,
  MessageSquare as MessageSquareIcon
} from "lucide-vue-next";
import { ref, computed, onMounted, nextTick, watch } from "vue";

const route = useRoute();
const api = useApi();

const channelId = computed(() => route.params.channel_id as string);
const communityId = computed(() => route.params.community_id as string);

// Channel info
const channelName = ref("");
const channelTopic = ref("");
const channelDescription = ref("");
const channelBanner = ref("");
const channelType = ref<"text" | "voice" | "announcement">("text");

// Chat composable
const {
  messages,
  members,
  aiAgent,
  canManage,
  onlineUsers,
  typingUsers,
  loading,
  hasMore,
  connected,
  replyingTo,
  init,
  sendMessage,
  toggleReaction,
  loadMore,
  startTyping,
  setReplyTo
} = useChannelChat(channelId);

// AI Agent composable
const { processing: aiProcessing, handleAIMention } = useAIAgent();

// Scroll container ref
const scrollContainer = ref<HTMLElement>();

// Fetch channel details
async function fetchChannelInfo() {
  const data = await api<{
    channels: Array<{
      id: string;
      name: string;
      topic: string | null;
      description: string | null;
      banner_url: string | null;
      type: string;
    }>;
  }>(`/api/communities/${communityId.value}/channels`);

  const channel = data.channels.find((c) => c.id === channelId.value);
  if (channel) {
    channelName.value = channel.name;
    channelTopic.value = channel.topic ?? "";
    channelDescription.value = channel.description ?? "";
    channelBanner.value = channel.banner_url ?? "";
    channelType.value = channel.type as "text" | "voice" | "announcement";
  }
}

// Format messages for the chat panel
interface FormattedMessage {
  id: string;
  author: { id: string; name: string; avatar: string };
  content: string;
  createdAt: string;
  isReply: boolean;
  messageId?: string;
  reactions: { emoji: string; count: number; reacted: boolean }[];
  isBot: boolean;
}

const formattedMessages = computed<FormattedMessage[]>(() => {
  return messages.value.map((m) => ({
    id: m.id,
    author: {
      id: m.author.id,
      name: m.author.username,
      avatar: m.author.avatar_url || "/images/avatar/default.png"
    },
    content: m.content ?? "",
    createdAt: m.created_at,
    isReply: !!m.reply_to_id,
    messageId: m.reply_to_id ?? undefined,
    reactions: m.reactions,
    isBot: m.type === "ai"
  }));
});

// Typing label
const typingUsernames = computed(() => {
  return typingUsers.value
    .map((id) => members.value.find((m) => m.id === id)?.username)
    .filter(Boolean) as string[];
});

const typingLabel = computed(() => {
  const names = typingUsernames.value;
  if (names.length === 0) return "";
  if (names.length === 1) return `${names[0]} is typing...`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
  return `${names[0]} and ${names.length - 1} others are typing...`;
});

// Event handlers
async function handleSend(content: string) {
  const msg = await sendMessage(content, replyingTo.value?.id);

  // Check for AI mention
  if (aiAgent.value?.name) {
    const aiName = aiAgent.value.name.toLowerCase();
    if (content.toLowerCase().includes(`@${aiName}`)) {
      handleAIMention(
        msg,
        aiAgent.value,
        channelId.value,
        communityId.value,
        canManage.value,
        (aiMsg) => {
          if (!messages.value.find((m) => m.id === aiMsg.id)) {
            messages.value.push(aiMsg);
          }
        }
      );
    }
  }

  await nextTick();
  scrollToBottom();
}

function handleReply(message: FormattedMessage) {
  const original = messages.value.find((m) => m.id === message.id);
  if (original) setReplyTo(original);
}

async function handleReact(payload: { message: FormattedMessage; reaction: { emoji: string } }) {
  await toggleReaction(payload.message.id, payload.reaction.emoji);
}

async function handleAddReaction(message: FormattedMessage) {
  const emojis = ["👍", "❤️", "😂", "🎉", "🔥", "👀"];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]!;
  await toggleReaction(message.id, randomEmoji);
}

function handleCopy(message: FormattedMessage) {
  navigator.clipboard.writeText(message.content);
}

function cancelReply() {
  setReplyTo(null);
}

function handleTyping() {
  startTyping();
}

function scrollToBottom() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
}

// Auto-scroll when new messages arrive
watch(
  () => messages.value.length,
  () => {
    nextTick(scrollToBottom);
  }
);

// Init
onMounted(async () => {
  await fetchChannelInfo();
  await init();
  await nextTick();
  scrollToBottom();
});
</script>
