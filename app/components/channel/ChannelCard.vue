<template>
  <div
    class="group cursor-pointer overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-2 transition-all hover:border-border hover:shadow-lg hover:shadow-black/5"
    @click="$emit('select', channel)"
  >
    <!-- Poster image placeholder -->
    <div class="relative h-44 w-full overflow-hidden rounded-xl" :class="posterBg">
      <div class="absolute inset-0 flex items-center justify-center">
        <component :is="icon" class="size-10" :class="iconColor" />
      </div>

      <!-- Private badge -->
      <div
        v-if="channel.is_private"
        class="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm"
      >
        <Lock class="size-2.5" />
        Private
      </div>
    </div>

    <!-- Card content -->
    <div class="px-3 pt-3 pb-3">
      <!-- Title row -->
      <div class="flex items-center justify-between">
        <div class="flex min-w-0 items-center gap-1.5">
          <span class="text-xs text-muted-foreground/50">#</span>
          <h4 class="truncate text-sm font-semibold transition-colors group-hover:text-primary">
            {{ channel.name }}
          </h4>
        </div>
        <button
          class="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground/40 opacity-0 transition-all group-hover:opacity-100 hover:bg-accent hover:text-foreground"
          @click.stop
        >
          <MoreVertical class="size-3.5" />
        </button>
      </div>

      <!-- Description -->
      <p
        v-if="channel.topic"
        class="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground"
      >
        {{ channel.topic }}
      </p>
      <p v-else class="mt-1.5 text-xs text-muted-foreground/30">No topic set</p>

      <!-- Bottom row: avatars + messages -->
      <div class="mt-3 flex items-center justify-between">
        <!-- Avatar stack placeholder -->
        <div class="flex -space-x-1.5">
          <div
            v-for="i in 3"
            :key="i"
            class="size-6 rounded-full border-2 border-card"
            :class="[
              i === 1 ? 'bg-primary/20' : '',
              i === 2 ? 'bg-blue-500/20' : '',
              i === 3 ? 'bg-amber-500/20' : ''
            ]"
          />
        </div>
        <!-- Message count -->
        <div class="flex items-center gap-1 text-muted-foreground/50">
          <MessageSquare class="size-3.5" />
          <span class="text-[11px] font-medium">--</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lock, MoreVertical, MessageSquare } from "lucide-vue-next";
import type { Component } from "vue";

export interface ChannelCardItem {
  id: string;
  name: string;
  type: string;
  topic: string | null;
  position: number;
  is_private: boolean;
  parent_id: string | null;
  last_message_at: string | null;
  created_at: string;
}

defineProps<{
  channel: ChannelCardItem;
  icon: Component;
  iconColor: string;
  posterBg: string;
}>();

defineEmits<{
  select: [channel: ChannelCardItem];
}>();
</script>
