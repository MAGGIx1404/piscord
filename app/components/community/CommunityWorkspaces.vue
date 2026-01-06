<template>
  <Card class="gap-4">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold flex items-center gap-2">
        <Layers class="size-4" />
        Workspaces
      </h3>
      <Badge variant="secondary">{{ workspaces.length }}</Badge>
    </div>
    <div class="space-y-2">
      <div
        v-for="workspace in workspaces"
        :key="workspace.id"
        class="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
        @click="$emit('select', workspace)"
      >
        <div class="size-8 rounded-lg flex items-center justify-center" :class="workspace.color">
          <component :is="workspace.icon" class="size-4" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm truncate">{{ workspace.name }}</p>
          <p class="text-xs text-muted-foreground">{{ workspace.channelCount }} channels</p>
        </div>
        <ChevronRight
          class="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Layers, ChevronRight } from "lucide-vue-next";
import type { Component } from "vue";

interface Workspace {
  id: number | string;
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
