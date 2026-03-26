<template>
  <div
    v-if="show"
    class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
  >
    <Bot class="size-10 text-muted-foreground/30" />
    <p class="text-sm text-muted-foreground/50">Add an AI node to get started</p>
  </div>
</template>

<script setup lang="ts">
import { Bot } from "lucide-vue-next";

defineProps<{ show: boolean }>();
</script>
