<template>
  <div class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
    <div v-if="banner" class="relative h-28 w-full overflow-hidden">
      <img :src="banner" :alt="name" class="h-full w-full object-cover" />
      <div
        class="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent"
      />
      <div class="absolute bottom-0 left-0 flex w-full items-end justify-between px-4 pb-2.5">
        <div class="flex items-center gap-2">
          <Hash class="size-5 text-white/80" />
          <h2 class="font-bold text-white drop-shadow-sm">{{ name }}</h2>
          <span v-if="topic" class="text-sm text-white/60"> — {{ topic }} </span>
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
          <div
            class="flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-xs text-white/80 backdrop-blur-sm"
          >
            <div class="size-2 rounded-full" :class="connected ? 'bg-green-400' : 'bg-red-400'" />
            {{ onlineCount }} online
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex items-center justify-between px-4 py-3">
      <div class="flex items-center gap-2">
        <Hash class="size-5 text-muted-foreground" />
        <h2 class="font-semibold">{{ name }}</h2>
        <span v-if="topic" class="text-sm text-muted-foreground"> — {{ topic }} </span>
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
          <div class="size-2 rounded-full" :class="connected ? 'bg-green-500' : 'bg-red-500'" />
          {{ onlineCount }} online
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Hash, Sparkles } from "lucide-vue-next";

defineProps<{
  name: string;
  topic: string;
  banner: string;
  aiAgent: {
    name: string | null;
    pet_name: string | null;
    avatar: string | null;
    description: string | null;
  } | null;
  canManage: boolean;
  connected: boolean;
  onlineCount: number;
}>();
</script>
