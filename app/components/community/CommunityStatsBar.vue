<template>
  <div class="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-xl">
    <div class="flex items-center justify-between px-8 py-4">
      <div class="flex items-center gap-8">
        <div v-for="stat in stats" :key="stat.label" class="flex items-center gap-2 text-sm">
          <component :is="stat.icon" class="size-4 text-muted-foreground" />
          <span class="font-semibold">{{ stat.value }}</span>
          <span class="text-muted-foreground">{{ stat.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";

interface Stat {
  icon: Component;
  value: string;
  label: string;
}

interface Props {
  stats: Stat[];
}

defineProps<Props>();
</script>
