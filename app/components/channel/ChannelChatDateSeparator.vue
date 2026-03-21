<template>
  <div class="sticky top-10 z-10 flex items-center p-4">
    <span class="h-px flex-1 bg-border" />
    <Badge variant="outline" class="min-w-sm bg-background px-3 py-1 text-xs font-medium">
      {{ label }}
    </Badge>
    <span class="h-px flex-1 bg-border" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string;
}

defineProps<Props>();
</script>
