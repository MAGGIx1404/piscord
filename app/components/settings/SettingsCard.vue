<template>
  <div class="rounded-xl border bg-card p-5 shadow-sm" :class="$attrs.class">
    <div class="mb-4">
      <h3 class="text-sm font-semibold">{{ title }}</h3>
      <p v-if="description" class="mt-0.5 text-xs text-muted-foreground">{{ description }}</p>
    </div>
    <Separator class="mb-5" />
    <div class="space-y-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>
