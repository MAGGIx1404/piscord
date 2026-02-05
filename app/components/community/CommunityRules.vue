<template>
  <div class="p-5 rounded-2xl bg-card/50 border border-border/50 space-y-4">
    <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Rules</h3>
    <ol class="space-y-2">
      <li v-for="(rule, i) in rules" :key="i" class="flex gap-3 text-sm">
        <span
          class="size-5 shrink-0 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground"
        >
          {{ i + 1 }}
        </span>
        <span class="text-muted-foreground">{{ rule }}</span>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rules: string[];
}

defineProps<Props>();
</script>
