<template>
  <div class="flex items-center gap-3 py-2" :class="[$attrs.class]">
    <!-- Animated brain/sparkle icon -->
    <div class="relative flex size-8 items-center justify-center">
      <!-- Rotating ring -->
      <div
        class="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-violet-500/60"
        style="animation-duration: 1.5s"
      />
      <!-- Pulsing core -->
      <div class="absolute inset-1 animate-pulse rounded-full bg-violet-500/10" />
      <!-- Icon -->
      <Sparkles class="relative size-3.5 animate-pulse text-violet-400" />
    </div>

    <div class="flex flex-col gap-1">
      <!-- Thinking text with typewriter dots -->
      <div class="flex items-center gap-1.5">
        <span class="text-xs font-medium text-violet-400/90">{{ label }}</span>
        <span class="flex gap-0.5">
          <span
            class="size-1 animate-bounce rounded-full bg-violet-400/60"
            style="animation-delay: 0ms; animation-duration: 1s"
          />
          <span
            class="size-1 animate-bounce rounded-full bg-violet-400/60"
            style="animation-delay: 200ms; animation-duration: 1s"
          />
          <span
            class="size-1 animate-bounce rounded-full bg-violet-400/60"
            style="animation-delay: 400ms; animation-duration: 1s"
          />
        </span>
      </div>

      <!-- Animated shimmer bar -->
      <div class="h-1 w-32 overflow-hidden rounded-full bg-violet-500/10">
        <div
          class="ai-shimmer h-full w-1/2 rounded-full bg-linear-to-r from-transparent via-violet-500/40 to-transparent"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sparkles } from "lucide-vue-next";

withDefaults(
  defineProps<{
    label?: string;
  }>(),
  {
    label: "AI is thinking"
  }
);
</script>

<style scoped>
.ai-shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(300%);
  }
}
</style>
