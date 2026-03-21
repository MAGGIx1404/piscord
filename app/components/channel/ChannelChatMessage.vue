<template>
  <div class="group relative">
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

    <!-- Message Content -->
    <div
      class="mx-2 flex items-start gap-3 rounded-lg px-4 py-2 transition-colors hover:bg-accent/30"
      :class="{ 'mt-0': stacked }"
    >
      <!-- Avatar (hide if stacked) -->
      <div class="w-10 shrink-0">
        <template v-if="!stacked">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Avatar
                class="size-10 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary"
              >
                <AvatarImage :src="message.author.avatar" :alt="message.author.name" />
                <AvatarFallback class="text-sm">{{ message.author.name.charAt(0) }}</AvatarFallback>
              </Avatar>
            </HoverCardTrigger>
            <HoverCardContent class="w-80" side="right">
              <div class="flex items-start gap-4">
                <div class="relative">
                  <Avatar class="size-16 ring-4 ring-card">
                    <AvatarImage :src="message.author.avatar" :alt="message.author.name" />
                    <AvatarFallback class="text-xl">{{
                      message.author.name.charAt(0)
                    }}</AvatarFallback>
                  </Avatar>
                  <span
                    class="absolute right-0 bottom-0 size-4 rounded-full bg-green-500 ring-2 ring-card"
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
                  <div class="flex items-center gap-2 pt-2">
                    <Button size="sm" class="flex-1" @click="$emit('message', message.author)">
                      <MessageCircle class="size-4" />
                      Message
                    </Button>
                    <Button variant="outline" @click="$emit('addFriend', message.author)">
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
            class="block pt-1 text-center text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          >
            {{ formattedTime }}
          </span>
        </template>
      </div>

      <!-- Message Body -->
      <div class="min-w-0 flex-1">
        <!-- Author & Time (hide if stacked) -->
        <div v-if="!stacked" class="mb-1 flex items-center gap-2">
          <span class="cursor-pointer text-sm font-semibold hover:underline">
            {{ message.author.name }}
          </span>
          <span class="text-xs text-muted-foreground">
            {{ formattedTime }}
          </span>
        </div>

        <!-- Message Text -->
        <p class="text-sm leading-relaxed wrap-break-word">{{ message.content }}</p>

        <!-- Workspace Cards -->
        <div v-if="message.workspaces?.length" class="grid w-full grid-cols-4 gap-2.5">
          <ChannelWorkspaceCard v-for="ws in message.workspaces" :key="ws.id" :workspace="ws" />
        </div>

        <!-- Reactions -->
        <div v-if="message.reactions?.length" class="mt-2 flex items-center gap-1.5">
          <button
            v-for="reaction in message.reactions"
            :key="reaction.emoji"
            class="flex items-center gap-1 rounded-full bg-accent/50 px-2 py-0.5 text-xs transition-colors hover:bg-accent"
            :class="{ 'bg-primary/10 ring-1 ring-primary': reaction.reacted }"
            @click="$emit('react', { message, reaction })"
          >
            <span>{{ reaction.emoji }}</span>
            <span class="text-muted-foreground">{{ reaction.count }}</span>
          </button>
        </div>
      </div>

      <!-- Action Buttons (show on hover) -->
      <div
        class="absolute -top-3 right-4 flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
      >
        <TooltipProvider>
          <!-- Emoji Reaction Picker -->
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" class="size-7">
                    <SmilePlus class="size-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">Add Reaction</TooltipContent>
            </Tooltip>
            <PopoverContent class="w-auto p-2" side="top" align="start">
              <div class="grid grid-cols-6 gap-1">
                <button
                  v-for="emoji in quickEmojis"
                  :key="emoji"
                  class="flex size-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-accent"
                  @click="
                    $emit('react', { message, reaction: { emoji, count: 0, reacted: false } })
                  "
                >
                  {{ emoji }}
                </button>
              </div>
            </PopoverContent>
          </Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" class="size-7" @click="$emit('reply', message)">
                <Reply class="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Reply</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" class="size-7" @click="$emit('pin', message)">
                <Pin class="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Pin Message</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" class="size-7">
              <MoreHorizontal class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="$emit('edit', message)">
              <Edit class="size-4" />
              Edit Message
            </DropdownMenuItem>
            <DropdownMenuItem @click="$emit('copy', message)">
              <Copy class="size-4" />
              Copy Text
            </DropdownMenuItem>
            <DropdownMenuItem @click="$emit('forward', message)">
              <Forward class="size-4" />
              Forward
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-destructive" @click="$emit('delete', message)">
              <Trash2 class="size-4" />
              Delete Message
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
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
import { computed } from "vue";
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
  message: Message;
  replyMessage?: Message | null;
  stacked?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  replyMessage: null,
  stacked: false
});

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
}>();

const formattedTime = computed(() => {
  return new Date(props.message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
});

const quickEmojis = [
  "👍",
  "👎",
  "❤️",
  "😂",
  "😮",
  "😢",
  "🔥",
  "🎉",
  "👀",
  "💯",
  "✅",
  "❌",
  "🚀",
  "💡",
  "⭐",
  "🙏",
  "👏",
  "🤔"
];
</script>
