<template>
  <div class="group relative my-1">
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

    <!-- AI Message Card -->
    <div class="relative mx-2 rounded-lg px-4 py-3" :class="{ 'mt-0': stacked }">
      <div class="flex items-start gap-3">
        <!-- Avatar -->
        <div class="shrink-0">
          <template v-if="!stacked">
            <div class="relative">
              <Avatar class="size-9 ring-1 ring-violet-500/30">
                <AvatarImage :src="message.author.avatar" :alt="message.author.name" />
                <AvatarFallback class="bg-violet-600 text-xs text-white">
                  <Bot class="size-4" />
                </AvatarFallback>
              </Avatar>
              <!-- AI indicator dot -->
              <div
                class="absolute -right-0.5 -bottom-0.5 flex size-3 items-center justify-center rounded-full bg-violet-500 ring-2 ring-background"
              >
                <Sparkles class="size-1.5 text-white" />
              </div>
            </div>
          </template>
          <template v-else>
            <span
              class="block w-9 pt-0.5 text-center text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            >
              {{ formattedTime }}
            </span>
          </template>
        </div>

        <!-- Content -->
        <div class="min-w-0 flex-1 space-y-1">
          <!-- Header -->
          <div v-if="!stacked" class="flex items-center gap-2">
            <span class="text-sm font-semibold text-violet-400">
              {{ message.author.name }}
            </span>
            <Badge variant="outline" class="border-violet-500/40 bg-violet-500/10 text-violet-400">
              <Bot class="mr-0.5 size-2.5" />
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
