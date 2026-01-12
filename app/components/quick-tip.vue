<script setup lang="ts">
import { Lightbulb } from "lucide-vue-next";
</script>

<template>
  <Card class="p-6 bg-muted/30">
    <div class="flex items-start gap-4">
      <div class="size-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
        <Lightbulb class="size-5 text-amber-500" />
      </div>
      <div class="space-y-1">
        <h3 class="font-medium">Quick Tip</h3>
        <p class="text-sm text-muted-foreground">
          Not sure where to start? Browse our
          <NuxtLink to="/discover" class="text-primary hover:underline">Discover page</NuxtLink>
          to find popular communities in gaming, technology, art, music, and more. You can join
          public communities instantly or request to join private ones.
        </p>
      </div>
    </div>
  </Card>
</template>
