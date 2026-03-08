<template>
  <main class="relative flex h-[calc(100vh-32px)] w-full flex-col overflow-hidden">
    <!-- Full Page Background -->
    <div
      class="pointer-events-none absolute inset-0 rounded-xl bg-linear-to-br from-primary/5 via-transparent to-primary/10"
    />
    <div class="absolute top-20 -left-32 size-96 rounded-full bg-primary/20 opacity-40 blur-3xl" />
    <div class="absolute top-1/3 right-0 size-80 rounded-full bg-primary/15 opacity-30 blur-3xl" />
    <div
      class="absolute bottom-20 left-1/4 size-64 rounded-full bg-blue-500/10 opacity-40 blur-3xl"
    />
    <div
      class="absolute -right-20 -bottom-20 size-96 rounded-full bg-primary/10 opacity-50 blur-3xl"
    />

    <!-- Main Content - Centered -->
    <div class="relative flex flex-1 items-center justify-center px-6">
      <div class="w-full max-w-2xl space-y-10 text-center">
        <!-- Hero Text -->
        <div class="space-y-5">
          <div
            class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
          >
            <Zap class="size-3.5" />
            Ready to connect
          </div>

          <h1 class="text-4xl font-bold tracking-tight md:text-6xl">
            Your space to
            <span class="relative">
              <span class="text-primary">connect</span>
              <svg class="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path
                  d="M2 6c50-4 100-4 196 0"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  class="text-primary/40"
                />
              </svg>
            </span>
          </h1>

          <p class="mx-auto max-w-md text-lg leading-relaxed text-muted-foreground">
            Build communities, spark conversations, and bring people together.
          </p>
        </div>

        <!-- Invite Link Input -->
        <div class="mx-auto max-w-md">
          <div class="flex gap-2 rounded-lg border border-border bg-card/60 p-1.5 backdrop-blur-sm">
            <div class="flex flex-1 items-center gap-3 px-4">
              <Link2 class="size-4 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Paste invite link..."
                class="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
              />
            </div>
            <Button class="px-5">
              Join
              <ArrowRight class="size-4" />
            </Button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="outline" size="lg" as-child>
            <NuxtLink to="/discover">
              <Compass class="size-4 text-primary" />
              Explore Communities
              <Badge variant="secondary" class="px-1.5 py-0 text-[10px]">2.4k+</Badge>
            </NuxtLink>
          </Button>

          <Button variant="outline" size="lg" as-child>
            <NuxtLink to="/community/create">
              <Plus class="size-4 text-primary" />
              Create Community
            </NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { Plus, Link2, ArrowRight, Compass, Zap } from "lucide-vue-next";
import NotificationModal from "~/components/NotificationModal.vue";
import NavUser from "~/components/nav/user.vue";
</script>

<style scoped>
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
.animate-marquee {
  animation: marquee 25s linear infinite;
}
</style>
