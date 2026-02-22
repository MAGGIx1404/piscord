<template>
  <div class="group relative my-1">
    <!-- Reply Reference (if replying) -->
    <div
      v-if="message.isReply && replyMessage"
      class="flex items-center gap-2 ml-14 mb-1 text-xs text-muted-foreground"
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
      <span class="truncate max-w-xs opacity-70">
        {{ replyMessage.content || "Message deleted" }}
      </span>
    </div>

    <!-- AI Message Card -->
    <div class="relative mx-2 px-4 py-3 rounded-lg" :class="{ 'mt-0': stacked }">
      <div class="flex items-start gap-3">
        <!-- Avatar -->
        <div class="shrink-0">
          <template v-if="!stacked">
            <div class="relative">
              <Avatar class="size-9 ring-1 ring-violet-500/30">
                <AvatarImage :src="message.author.avatar" :alt="message.author.name" />
                <AvatarFallback class="bg-violet-600 text-white text-xs">
                  <Bot class="size-4" />
                </AvatarFallback>
              </Avatar>
              <!-- AI indicator dot -->
              <div
                class="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-violet-500 ring-2 ring-background flex items-center justify-center"
              >
                <Sparkles class="size-1.5 text-white" />
              </div>
            </div>
          </template>
          <template v-else>
            <span
              class="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity w-9 block text-center pt-0.5"
            >
              {{ formattedTime }}
            </span>
          </template>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0 space-y-1">
          <!-- Header -->
          <div v-if="!stacked" class="flex items-center gap-2">
            <span class="font-semibold text-sm text-violet-400">
              {{ message.author.name }}
            </span>
            <Badge variant="outline" class="border-violet-500/40 text-violet-400 bg-violet-500/10">
              <Bot class="size-2.5 mr-0.5" />
              AI
            </Badge>
            <span class="text-xs text-muted-foreground">
              {{ formattedTime }}
            </span>
          </div>

          <!-- Message -->
          <p class="text-sm leading-relaxed text-foreground">{{ message.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CornerUpRight, Sparkles, Bot } from "lucide-vue-next";
import { computed } from "vue";

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

defineEmits<{
  feedback: [payload: { message: Message; type: "positive" | "negative" }];
}>();

const formattedTime = computed(() => {
  return new Date(props.message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
});
</script>
