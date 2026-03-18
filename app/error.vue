<template>
  <div
    class="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4"
  >
    <!-- Animated background orbs -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <!-- Grid overlay -->
      <div
        class="absolute inset-0"
        style="
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 60px 60px;
        "
      />
    </div>

    <!-- Content -->
    <div class="relative z-10 flex max-w-xl flex-col items-center text-center">
      <!-- Big rounded figure -->
      <div
        class="relative mb-8 flex size-60 items-center justify-center overflow-hidden rounded-2xl"
      >
        <video
          src="/video/error.mp4"
          autoPlay
          loop
          muted
          playsinline
          class="size-full object-cover"
        ></video>

        <!-- Error reason -->
        <div
          class="absolute bottom-4 left-1/2 inline-flex w-max -translate-x-1/2 items-center gap-2 rounded-full border border-border/50 bg-card px-4 py-2"
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
      </div>

      <!-- Status code -->
      <h1
        class="relative mb-4 rounded-xl px-6 py-2 text-4xl font-bold tracking-tighter text-black"
        :class="error?.statusCode === 404 ? 'bg-primary' : 'bg-destructive'"
      >
        {{ error?.statusCode || 500 }}
      </h1>

      <!-- Heading -->
      <h1 class="mb-3 text-3xl font-bold tracking-tight">
        {{ heading }}
      </h1>

      <!-- Description -->
      <p class="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {{ description }}
      </p>

      <!-- Navigation buttons -->
      <Button size="lg" @click="goHome">
        <Home class="size-4" />
        Take Me Home
      </Button>

      <!-- Error details (dev) -->
      <p
        v-if="error?.message && error.message !== error.statusMessage"
        class="mt-6 max-w-sm rounded-lg border border-border/30 bg-card/30 px-4 py-2.5 text-[11px] text-muted-foreground/60 backdrop-blur-sm"
      >
        {{ error.message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Home, SearchX, ShieldAlert, ServerCrash, Ban } from "lucide-vue-next";
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

const heading = computed(() => {
  switch (props.error?.statusCode) {
    case 404:
      return "Lost in the void";
    case 403:
      return "No access here";
    case 401:
      return "Who are you?";
    case 500:
      return "Something broke";
    default:
      return "Oops, an error";
  }
});

const description = computed(() => {
  switch (props.error?.statusCode) {
    case 404:
      return "The page you're looking for doesn't exist or has been moved. Double-check the URL or head back home.";
    case 403:
      return "You don't have permission to access this page. Contact an admin if you think this is a mistake.";
    case 401:
      return "You need to be logged in to view this page. Sign in and try again.";
    case 500:
      return "Our server ran into an unexpected issue. We're on it — please try again in a moment.";
    default:
      return "Something unexpected happened. Try refreshing the page or heading back home.";
  }
});

function goBack() {
  clearError({ redirect: undefined });
  if (window.history.length > 1) {
    window.history.back();
  } else {
    clearError({ redirect: "/" });
  }
}

function goHome() {
  clearError({ redirect: "/" });
}
</script>

<style scoped>
@keyframes float-slow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes float-delayed {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.animate-float-slow {
  animation: float-slow 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 8s ease-in-out 2s infinite;
}
</style>
