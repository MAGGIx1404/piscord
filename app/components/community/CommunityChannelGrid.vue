<template>
  <div v-if="channels.length" class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold">Channels</h3>
      <Button variant="ghost" size="sm" class="text-muted-foreground" @click="$emit('create')">
        <Plus class="size-4" />
        New
      </Button>
    </div>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        v-for="channel in channels"
        :key="channel.id"
        class="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border/50 bg-card p-4 text-left transition-all hover:border-border hover:shadow-lg hover:shadow-black/5"
        @click="$emit('select', channel)"
      >
        <!-- Subtle gradient accent -->
        <div
          class="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
          :class="channel.iconBg.replace('/20', '/5')"
        />

        <div
          class="relative flex size-12 shrink-0 items-center justify-center rounded-xl"
          :class="channel.iconBg"
        >
          <component :is="channel.icon" class="size-6" :class="channel.iconColor" />
        </div>
        <div class="relative min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p class="font-medium transition-colors group-hover:text-primary">
              # {{ channel.name }}
            </p>
            <span
              v-if="channel.lastActivity === 'Live' || channel.lastActivity === 'Active'"
              class="flex items-center gap-1 text-[10px] font-medium text-green-500"
            >
              <span class="size-1.5 animate-pulse rounded-full bg-green-500" />
              {{ channel.lastActivity }}
            </span>
          </div>
          <p class="text-sm text-muted-foreground">{{ channel.messageCount }} messages</p>
        </div>
        <ChevronRight
          class="relative size-5 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground"
        />
      </button>
    </div>
  </div>

  <!-- Empty state -->
  <div
    v-else
    class="relative overflow-hidden rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-16"
  >
    <!-- Scattered hash decorations -->
    <div
      class="pointer-events-none absolute inset-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <span
        v-for="(pos, i) in hashPositions"
        :key="i"
        class="absolute font-mono font-bold text-primary/10"
        :style="{
          top: pos.top,
          left: pos.left,
          fontSize: pos.size,
          transform: `rotate(${pos.rot})`
        }"
        >#</span
      >
    </div>

    <!-- Icon cluster -->
    <div class="relative mb-5 flex justify-center">
      <div class="relative h-14 w-24">
        <!-- Floating pill cards -->
        <div
          class="absolute top-2 left-0 flex h-8 w-16 -rotate-6 items-center gap-1.5 rounded-lg border border-border/60 bg-card/90 px-2 shadow-sm"
        >
          <span class="size-2 rounded-sm bg-blue-400/70" />
          <span class="h-1.5 w-8 rounded-full bg-muted-foreground/20" />
        </div>
        <div
          class="absolute top-0 right-0 flex h-8 w-16 rotate-6 items-center gap-1.5 rounded-lg border border-border/60 bg-card/90 px-2 shadow-sm"
        >
          <span class="size-2 rounded-sm bg-purple-400/70" />
          <span class="h-1.5 w-8 rounded-full bg-muted-foreground/20" />
        </div>
        <!-- Center icon -->
        <div
          class="absolute inset-x-0 bottom-0 mx-auto flex size-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/20"
          style="left: 50%; transform: translateX(-50%)"
        >
          <Hash class="size-5 text-primary" />
        </div>
      </div>
    </div>

    <p class="relative text-center text-sm font-medium text-foreground/80">No channels yet</p>
    <p class="relative mt-1 text-center text-xs leading-relaxed text-muted-foreground">
      Channels are where conversations happen.<br />Create the first one to get started.
    </p>

    <div class="relative mt-5 flex justify-center">
      <Button
        size="sm"
        variant="outline"
        class="gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
        @click="$emit('create')"
      >
        <Plus class="size-3.5" />
        Create a channel
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, ChevronRight, Hash } from "lucide-vue-next";
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

const hashPositions = [
  { top: "8%", left: "4%", size: "2rem", rot: "-15deg" },
  { top: "12%", left: "80%", size: "1.4rem", rot: "10deg" },
  { top: "55%", left: "90%", size: "2.4rem", rot: "-8deg" },
  { top: "70%", left: "2%", size: "1.6rem", rot: "18deg" },
  { top: "85%", left: "50%", size: "1.2rem", rot: "-5deg" },
  { top: "35%", left: "88%", size: "1rem", rot: "25deg" }
];
</script>
