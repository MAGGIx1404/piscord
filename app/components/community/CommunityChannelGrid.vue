<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold">Channels</h3>
      <Button variant="ghost" size="sm" class="text-muted-foreground" @click="$emit('create')">
        <Plus class="size-4" />
        New
      </Button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        v-for="channel in channels"
        :key="channel.id"
        class="relative flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-lg hover:shadow-black/5 transition-all group text-left overflow-hidden"
        @click="$emit('select', channel)"
      >
        <!-- Subtle gradient accent -->
        <div
          class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          :class="channel.iconBg.replace('/20', '/5')"
        />

        <div
          class="relative size-12 rounded-xl flex items-center justify-center shrink-0"
          :class="channel.iconBg"
        >
          <component :is="channel.icon" class="size-6" :class="channel.iconColor" />
        </div>
        <div class="relative flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="font-medium group-hover:text-primary transition-colors">
              # {{ channel.name }}
            </p>
            <span
              v-if="channel.lastActivity === 'Live' || channel.lastActivity === 'Active'"
              class="flex items-center gap-1 text-[10px] text-green-500 font-medium"
            >
              <span class="size-1.5 rounded-full bg-green-500 animate-pulse" />
              {{ channel.lastActivity }}
            </span>
          </div>
          <p class="text-sm text-muted-foreground">{{ channel.messageCount }} messages</p>
        </div>
        <ChevronRight
          class="relative size-5 text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, ChevronRight } from "lucide-vue-next";
import type { Component } from "vue";

interface Channel {
  id: string | number;
  name: string;
  icon: Component;
  iconBg: string;
  iconColor: string;
  lastActivity: string;
  messageCount: string;
}

interface Props {
  channels: Channel[];
}

defineProps<Props>();

defineEmits<{
  create: [];
  select: [channel: Channel];
}>();
</script>
