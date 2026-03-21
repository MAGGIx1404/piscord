<template>
  <main class="w-full min-h-screen relative overflow-hidden bg-background">
    <!-- Full-screen animated background -->
    <div class="fixed inset-0 pointer-events-none">
      <!-- Gradient mesh -->
      <div
        class="absolute inset-0 bg-radial-[at_top_left] from-primary/10 via-transparent to-transparent"
      />
      <div
        class="absolute inset-0 bg-radial-[at_bottom_right] from-blue-500/10 via-transparent to-transparent"
      />

      <!-- Floating orbs -->
      <div
        class="absolute top-1/4 left-1/4 size-96 bg-primary/15 rounded-full blur-3xl animate-float-slow"
      />
      <div
        class="absolute bottom-1/4 right-1/3 size-64 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed"
      />
      <div
        class="absolute top-1/2 right-1/4 size-48 bg-violet-500/10 rounded-full blur-3xl animate-float-slow"
      />

      <!-- Grid pattern overlay -->
      <div
        class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
      />
    </div>

    <!-- Main content area -->
    <div class="min-h-screen flex items-center justify-center px-6 py-10">
      <div class="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <!-- Left - Branding & Social Proof -->
        <div class="hidden lg:flex flex-col space-y-8">
          <!-- Hero text -->
          <div class="space-y-4">
            <h1 class="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Where communities
              <span class="relative inline-block">
                <span class="text-primary">come alive</span>
                <svg class="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
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
            <p class="text-lg text-muted-foreground leading-relaxed max-w-md">
              Join millions building the future of online communities. Fast, secure, and endlessly
              customizable.
            </p>
          </div>

          <!-- Stats row -->
          <div class="flex gap-8">
            <div class="space-y-1">
              <p class="text-3xl font-bold">2.4M+</p>
              <p class="text-sm text-muted-foreground">Active users</p>
            </div>
            <div class="w-px bg-border/50" />
            <div class="space-y-1">
              <p class="text-3xl font-bold">50K+</p>
              <p class="text-sm text-muted-foreground">Communities</p>
            </div>
            <div class="w-px bg-border/50" />
            <div class="space-y-1">
              <p class="text-3xl font-bold">99.9%</p>
              <p class="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>

          <!-- Single Testimonial -->
          <div class="p-6 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/40">
            <div class="flex items-start gap-3">
              <div
                class="size-10 rounded-full bg-linear-to-br from-primary to-emerald-500 flex items-center justify-center text-white text-sm font-medium shrink-0"
              >
                SK
              </div>
              <div class="space-y-1">
                <p class="text-sm leading-relaxed">
                  "Piscord transformed how our team communicates. It's fast, intuitive, and just
                  works."
                </p>
                <div class="flex items-center gap-2">
                  <p class="text-xs text-muted-foreground">Sarah Kim</p>
                  <span class="text-muted-foreground/40">•</span>
                  <p class="text-xs text-muted-foreground/60">Design Lead at Vercel</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right - Form slot -->
        <div class="flex justify-center lg:justify-start">
          <slot />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="fixed bottom-0 left-0 right-0 px-6 py-4">
      <div
        class="max-w-7xl mx-auto flex items-center justify-between text-xs text-muted-foreground/60"
      >
        <p>© 2026 Piscord. All rights reserved.</p>
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="hover:text-muted-foreground transition-colors">Privacy</NuxtLink>
          <NuxtLink to="/" class="hover:text-muted-foreground transition-colors">Terms</NuxtLink>
          <NuxtLink to="/" class="hover:text-muted-foreground transition-colors">Help</NuxtLink>
        </div>
      </div>
    </footer>
  </main>
</template>

<style scoped>
@keyframes float-slow {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(20px, -20px) scale(1.05);
  }
}

@keyframes float-delayed {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-15px, 15px) scale(1.03);
  }
}

.animate-float-slow {
  animation: float-slow 15s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 18s ease-in-out infinite;
  animation-delay: -5s;
}
</style>
