<template>
  <button
    type="button"
    class="grid size-7 place-items-center rounded-md text-muted-foreground/70 transition-all hover:bg-muted/50 hover:text-foreground"
    :class="{ 'bg-muted/70 text-foreground': active }"
    :title="title"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  active?: boolean;
  title?: string;
}>();

defineEmits<{
  click: [];
}>();
</script>
