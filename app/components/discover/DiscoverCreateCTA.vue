<template>
  <div
    class="mt-16 relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-card/50 to-primary/5 border border-primary/20 p-10"
  >
    <div class="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
    <div class="relative flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="text-center md:text-left">
        <h3 class="text-2xl font-bold mb-2">Can't find what you're looking for?</h3>
        <p class="text-muted-foreground">Create your own community and invite others to join.</p>
      </div>
      <Button size="lg" class="gap-2 shrink-0" as-child>
        <NuxtLink to="/community/create">
          <Plus class="size-5" />
          Create Community
        </NuxtLink>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from "lucide-vue-next";
</script>
