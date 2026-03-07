<template>
  <main class="w-full h-full relative overflow-hidden flex flex-col">
    <!-- Full Page Background -->
    <div
      class="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none rounded-xl"
    />
    <div class="absolute top-20 -left-32 size-96 bg-primary/20 rounded-full blur-3xl opacity-40" />
    <div class="absolute top-1/3 right-0 size-80 bg-primary/15 rounded-full blur-3xl opacity-30" />
    <div
      class="absolute bottom-20 left-1/4 size-64 bg-blue-500/10 rounded-full blur-3xl opacity-40"
    />
    <div
      class="absolute -bottom-20 -right-20 size-96 bg-primary/10 rounded-full blur-3xl opacity-50"
    />

    <!-- Main Content - Centered -->
    <div class="relative flex-1 flex items-center justify-center px-6">
      <div class="max-w-2xl w-full text-center space-y-10">
        <!-- Hero Text -->
        <div class="space-y-5">
          <div
            class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium"
          >
            <Zap class="size-3.5" />
            Ready to connect
          </div>

          <h1 class="text-4xl md:text-6xl font-bold tracking-tight">
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

          <p class="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Build communities, spark conversations, and bring people together.
          </p>
        </div>

        <!-- Invite Link Input -->
        <div class="max-w-md mx-auto">
          <div class="flex gap-2 p-1.5 rounded-lg bg-card/60 backdrop-blur-sm border border-border">
            <div class="flex-1 flex items-center gap-3 px-4">
              <Link2 class="size-4 text-muted-foreground shrink-0" />
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
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="outline" size="lg" as-child>
            <NuxtLink to="/discover">
              <Compass class="size-4 text-primary" />
              Explore Communities
              <Badge variant="secondary" class="text-[10px] px-1.5 py-0">2.4k+</Badge>
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

definePageMeta({
  layout: "entry"
});
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
