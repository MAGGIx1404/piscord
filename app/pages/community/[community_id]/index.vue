<template>
  <main class="w-full rounded-md">
    <div class="w-full flex flex-col -space-y-10">
      <!-- Poster -->
      <WidgetsImagePoster src="/images/servers/p-1.jpg" />

      <!-- Team card -->
      <Card class="w-md bg-card/10 relative z-2 ml-8 backdrop-blur-md">
        <div class="flex items-center gap-4">
          <div
            class="flex aspect-square size-12 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
          >
            <AudioWaveform class="size-6" />
          </div>

          <div class="flex-1">
            <h2 class="text-2xl font-semibold">{{ team.name }}</h2>
            <p class="text-sm">Enterprise</p>
          </div>
        </div>
      </Card>
    </div>
  </main>
</template>

<script setup>
import { AudioWaveform } from "lucide-vue-next";

const team = {
  id: "orion_group",
  name: "Orion Group",
  icon: AudioWaveform
};
</script>
