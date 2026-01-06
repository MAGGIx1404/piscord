<template>
  <div class="w-full relative">
    <div
      class="relative h-60 overflow-hidden rounded-lg bg-linear-to-r from-primary/20 via-purple-500/20 to-pink-500/20"
    >
      <div
        class="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent"
      />
    </div>

    <!-- Page Header -->
    <div class="w-full -mt-24 relative z-10 px-6">
      <Card class="p-6 backdrop-blur-xl bg-card/90 shadow-2xl">
        <div class="flex items-center gap-4">
          <div class="size-16 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles class="size-8 text-primary" />
          </div>
          <div>
            <h1 class="text-2xl font-bold">{{ title }}</h1>
            <p class="text-muted-foreground">
              {{ description }}
            </p>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sparkles } from "lucide-vue-next";

interface Props {
  title?: string;
  description?: string;
}

withDefaults(defineProps<Props>(), {
  title: "Create Your Community",
  description: "Build a space for your community to connect, share, and grow together."
});
</script>
