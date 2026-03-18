<template>
  <div class="relative flex h-screen items-center justify-center overflow-hidden bg-background">
    <Card class="relative z-3 max-w-5xl">
      <video
        src="/video/error.mp4"
        autoPlay
        loop
        muted
        playsinline
        class="size-full rounded-lg object-cover"
      ></video>

      <!-- Error reason -->
      <div
        class="absolute bottom-8 left-1/2 inline-flex w-max -translate-x-1/2 items-center gap-2 rounded-full border border-border/50 bg-card px-4 py-2"
      >
        <component
          :is="statusIcon"
          class="size-5"
          :class="error?.statusCode === 404 ? 'text-primary' : 'text-destructive'"
        />
        <span class="text-lg font-medium text-muted-foreground">
          {{ statusLabel }}
        </span>
      </div>
    </Card>

    <!-- Background -->
    <div class="fixed top-0 left-0 z-0 size-full opacity-0 dark:opacity-15">
      <div
        class="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#3ecf8e_100%)]"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SearchX, ShieldAlert, ServerCrash, Ban } from "lucide-vue-next";
import type { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError;
}>();

const statusIcon = computed(() => {
  switch (props.error?.statusCode) {
    case 404:
      return SearchX;
    case 403:
      return Ban;
    case 401:
      return ShieldAlert;
    default:
      return ServerCrash;
  }
});

const statusLabel = computed(() => {
  switch (props.error?.statusCode) {
    case 404:
      return "Page Not Found";
    case 403:
      return "Access Forbidden";
    case 401:
      return "Unauthorized";
    case 500:
      return "Internal Server Error";
    default:
      return props.error?.statusMessage || "Something Went Wrong";
  }
});
</script>
