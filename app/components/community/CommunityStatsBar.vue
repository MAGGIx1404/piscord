<template>
  <div class="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-xl">
    <div class="px-8 py-4 flex items-center justify-between">
      <div class="flex items-center gap-8">
        <div v-for="stat in stats" :key="stat.label" class="flex items-center gap-2 text-sm">
          <component :is="stat.icon" class="size-4 text-muted-foreground" />
          <span class="font-semibold">{{ stat.value }}</span>
          <span class="text-muted-foreground">{{ stat.label }}</span>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <Button
          v-for="tab in tabs"
          :key="tab"
          variant="ghost"
          size="sm"
          class="text-muted-foreground"
          :class="activeTab === tab ? 'text-foreground bg-muted/50' : ''"
          @click="$emit('update:activeTab', tab)"
        >
          {{ tab }}
        </Button>
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
  tabs?: string[];
  activeTab?: string;
}

withDefaults(defineProps<Props>(), {
  tabs: () => ["Overview", "Channels", "Members", "Settings"],
  activeTab: "Overview"
});

defineEmits<{
  "update:activeTab": [tab: string];
}>();
</script>
