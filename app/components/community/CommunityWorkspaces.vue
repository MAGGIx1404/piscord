<template>
  <div class="p-5 rounded-2xl bg-card/50 border border-border/50 space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Workspaces</h3>
      <span class="text-xs text-muted-foreground">{{ workspaces.length }}</span>
    </div>
    <div class="space-y-1">
      <button
        v-for="workspace in workspaces"
        :key="workspace.id"
        class="w-full flex items-center gap-3 p-2.5 -mx-0.5 rounded-xl hover:bg-muted/40 transition-colors group text-left"
        @click="$emit('select', workspace)"
      >
        <div
          class="size-9 rounded-lg flex items-center justify-center shrink-0"
          :class="workspace.color.replace('/20', '/15')"
        >
          <component :is="workspace.icon" class="size-4" :class="workspace.color.split(' ')[1]" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium group-hover:text-primary transition-colors truncate">
            {{ workspace.name }}
          </p>
          <p class="text-xs text-muted-foreground">{{ workspace.channelCount }} channels</p>
        </div>
        <ChevronRight
          class="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next";
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
