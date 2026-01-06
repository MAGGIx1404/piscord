<template>
  <div class="flex items-center p-4 sticky top-8 z-10">
    <span class="flex-1 h-px bg-border" />
    <Badge variant="outline" class="px-3 py-1 min-w-sm text-xs font-medium bg-background">
      {{ label }}
    </Badge>
    <span class="flex-1 h-px bg-border" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string;
}

defineProps<Props>();
</script>
