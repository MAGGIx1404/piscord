<template>
  <Card
    class="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
    @click="$emit('viewProfile')"
  >
    <div class="flex items-center gap-3">
      <!-- Avatar with AI glow -->
      <div class="relative">
        <div
          class="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full opacity-60 blur-sm"
        />
        <Avatar class="relative size-12 ring-2 ring-violet-500/50">
          <AvatarImage :src="agent.avatar" :alt="agent.name" />
          <AvatarFallback class="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <Bot class="size-5" />
          </AvatarFallback>
        </Avatar>
      </div>

      <!-- Name & Badge -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5">
          <Sparkles class="size-3.5 text-violet-400" />
          <span class="font-semibold text-sm">{{ agent.name }}</span>
        </div>
        <Badge
          variant="secondary"
          class="mt-1 px-2 py-0.5 text-[10px] bg-violet-500/20 text-violet-400 border-violet-500/30"
        >
          {{ agent.petName }}
        </Badge>
      </div>

      <ChevronRight class="size-4 text-muted-foreground" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Bot, Sparkles, ChevronRight } from "lucide-vue-next";

interface AIAgent {
  id: string;
  name: string;
  petName: string;
  avatar: string;
}

interface Props {
  agent: AIAgent;
}

defineProps<Props>();

defineEmits<{
  viewProfile: [];
}>();
</script>
