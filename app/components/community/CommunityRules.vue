<template>
  <Card class="gap-4">
    <h3 class="font-semibold flex items-center gap-2">
      <ScrollText class="size-4" />
      Community Rules
    </h3>
    <div class="space-y-2">
      <div
        v-for="(rule, index) in rules"
        :key="index"
        class="flex gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <span
          class="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium shrink-0"
        >
          {{ index + 1 }}
        </span>
        <span class="text-muted-foreground">{{ rule }}</span>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ScrollText } from "lucide-vue-next";

interface Props {
  rules: string[];
}

defineProps<Props>();
</script>
