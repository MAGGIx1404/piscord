<template>
  <div
    v-if="workspaces.length"
    class="space-y-3 rounded-2xl border border-border/50 bg-card/50 p-5"
  >
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium tracking-wider text-muted-foreground uppercase">Workspaces</h3>
      <span class="text-xs text-muted-foreground">{{ workspaces.length }}</span>
    </div>

    <!-- List -->
    <div class="space-y-1">
      <button
        v-for="workspace in workspaces"
        :key="workspace.id"
        class="group -mx-0.5 flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-muted/40"
        @click="$emit('select', workspace)"
      >
        <div
          class="flex size-9 shrink-0 items-center justify-center rounded-lg"
          :class="workspace.color.replace('/20', '/15')"
        >
          <component :is="workspace.icon" class="size-4" :class="workspace.color.split(' ')[1]" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium transition-colors group-hover:text-primary">
            {{ workspace.name }}
          </p>
          <p class="text-xs text-muted-foreground">{{ workspace.channelCount }} channels</p>
        </div>
        <ChevronRight
          class="size-4 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground"
        />
      </button>
    </div>
  </div>

  <!-- Empty state -->
  <div
    v-else
    class="relative overflow-hidden rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-6"
  >
    <!-- Floating grid dots decoration -->
    <div class="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
      <div
        v-for="i in 12"
        :key="i"
        class="absolute size-1 rounded-full bg-primary/40"
        :style="{
          top: `${(i % 4) * 28 + 8}%`,
          left: `${Math.floor(i / 4) * 34 + 6}%`,
          animationDelay: `${i * 0.18}s`
        }"
      />
    </div>

    <!-- Icon stack -->
    <div class="relative mb-4 flex justify-center">
      <div class="relative">
        <!-- Back card -->
        <div
          class="absolute -top-1 left-2 size-10 -rotate-6 rounded-xl border border-border/50 bg-card/80"
        />
        <!-- Mid card -->
        <div
          class="absolute -top-0.5 left-1 size-10 rotate-2 rounded-xl border border-border/50 bg-card/90"
        />
        <!-- Front card -->
        <div
          class="relative flex size-10 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/20"
        >
          <Layers class="size-5 text-primary" />
        </div>
      </div>
    </div>

    <p class="relative text-center text-sm font-medium text-foreground/80">No workspaces yet</p>
    <p class="relative mt-1 text-center text-xs leading-relaxed text-muted-foreground">
      Workspaces group your channels.<br />They'll appear here once created.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Layers } from "lucide-vue-next";
import type { Component } from "vue";

interface Workspace {
  id: string | number;
  name: string;
  icon: Component;
  color: string;
  channelCount: number;
}

interface Props {
  workspaces: Workspace[];
}

defineProps<Props>();

defineEmits<{
  select: [workspace: Workspace];
}>();
</script>
